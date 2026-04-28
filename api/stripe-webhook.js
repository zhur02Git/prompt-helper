// ============================================================
// api/stripe-webhook.js
// Vercel Serverless Function — receives Stripe webhook events
// and upgrades the matching Firebase user to Pro
// ============================================================

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log("Stripe event received:", event.type);

  try {
    switch (event.type) {

      // ---- Subscription created or renewed ----
      case "customer.subscription.created":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;

        // Get customer email from Stripe
        const customerId = invoice.customer;
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer.email;

        if (!email) {
          console.warn("No email found for customer:", customerId);
          break;
        }

        // Find user in Firebase by email and set plan to pro
        await upgradeToPro(email);
        console.log(`✅ Upgraded to Pro: ${email}`);
        break;
      }

      // ---- Subscription cancelled or payment failed ----
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer.email;

        if (!email) break;

        await downgradToFree(email);
        console.log(`⬇️ Downgraded to Free: ${email}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (err) {
    console.error("Error processing webhook:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ---- Upgrade user to Pro by email ----
async function upgradeToPro(email) {
  const usersRef = db.collection("users");
  const snapshot = await usersRef.where("email", "==", email).get();

  if (snapshot.empty) {
    console.warn(`No Firebase user found with email: ${email}`);
    // User might not have logged into the extension yet
    // Store in a pending_upgrades collection to apply when they first log in
    await db.collection("pending_upgrades").doc(email).set({
      email,
      plan: "pro",
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  const batch = db.batch();
  snapshot.forEach((doc) => {
    batch.update(doc.ref, {
      plan: "pro",
      updatedAt: new Date().toISOString(),
    });
  });
  await batch.commit();
}

// ---- Downgrade user to Free by email ----
async function downgradToFree(email) {
  const usersRef = db.collection("users");
  const snapshot = await usersRef.where("email", "==", email).get();

  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.forEach((doc) => {
    batch.update(doc.ref, {
      plan: "free",
      updatedAt: new Date().toISOString(),
    });
  });
  await batch.commit();

  // Also remove from pending_upgrades if exists
  await db.collection("pending_upgrades").doc(email).delete().catch(() => {});
}
