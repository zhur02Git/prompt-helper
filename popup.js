// ============================================================
// popup.js - Firebase Compat + Chrome Identity API
// ============================================================
const elLoading    = document.getElementById("loading");
const elLoggedOut  = document.getElementById("logged-out");
const elLoggedIn   = document.getElementById("logged-in");
const elUserName   = document.getElementById("user-name");
const elUserEmail  = document.getElementById("user-email");
const elPlanBadge  = document.getElementById("plan-badge");
const elUsageText  = document.getElementById("usage-text");
const elUsageBar   = document.getElementById("usage-bar");
const elUsageSec   = document.getElementById("usage-section");
const elUpgradeSec = document.getElementById("upgrade-section");
const elProSec     = document.getElementById("pro-section");
const elAvatarWrap = document.getElementById("user-avatar-wrap");

function showState(state) {
  elLoading.classList.add("hidden");
  elLoggedOut.classList.add("hidden");
  elLoggedIn.classList.add("hidden");
  if (state === "loading") elLoading.classList.remove("hidden");
  if (state === "out")     elLoggedOut.classList.remove("hidden");
  if (state === "in")      elLoggedIn.classList.remove("hidden");
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

async function loadUserData(user) {
  const db = firebase.firestore();
  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.set({
      email: user.email,
      displayName: user.displayName,
      plan: "free",
      usageDate: todayStr(),
      usageCount: 0,
      createdAt: new Date().toISOString()
    });
    return { plan: "free", usageCount: 0, usageDate: todayStr() };
  }

  const data = snap.data();

  if (data.usageDate !== todayStr()) {
    await ref.set({ usageDate: todayStr(), usageCount: 0 }, { merge: true });
    return { ...data, usageCount: 0, usageDate: todayStr() };
  }

  return data;
}

function renderUserUI(user, userData) {
  elUserName.textContent = user.displayName || "User";
  elUserEmail.textContent = user.email;

  if (user.photoURL) {
    const img = document.createElement("img");
    img.src = user.photoURL;
    img.className = "user-avatar";
    elAvatarWrap.innerHTML = "";
    elAvatarWrap.appendChild(img);
  }

  const isPro = userData.plan === "pro";

  if (isPro) {
    elPlanBadge.textContent = "⚡ Pro";
    elPlanBadge.className = "plan-badge plan-pro";
    elUsageSec.classList.add("hidden");
    elUpgradeSec.classList.add("hidden");
    elProSec.classList.remove("hidden");
  } else {
    elPlanBadge.textContent = "Free Plan";
    elPlanBadge.className = "plan-badge plan-free";
    const count = userData.usageCount || 0;
 const pct = Math.min((count / FREE_DAILY_LIMIT) * 100, 100);
elUsageText.textContent = `${count} / ${FREE_DAILY_LIMIT}`;
    elUsageBar.style.width = `${pct}%`;
if (count >= FREE_DAILY_LIMIT) elUsageBar.classList.add("danger");
    elUsageSec.classList.remove("hidden");
    elUpgradeSec.classList.remove("hidden");
    elProSec.classList.add("hidden");
  }
}

async function main() {
  showState("loading");

  // Init Firebase
  firebase.initializeApp(FIREBASE_CONFIG);
  const auth = firebase.auth();

  // Watch auth state
auth.onAuthStateChanged(async (user) => {
    if (user) {
      showState("loading");
      try {
        const userData = await loadUserData(user);
        renderUserUI(user, userData);

        // Save user state to chrome.storage for content.js to read
        chrome.storage.local.set({
          userPlan: userData.plan || "free",
          usageCount: userData.usageCount || 0,
          usageDate: userData.usageDate || todayStr(),
          userId: user.uid,
          userEmail: user.email
        });

        showState("in");
      } catch (err) {
        console.error("Error loading user data:", err);
        showState("in");
      }
    } else {
      // Clear storage on logout
      chrome.storage.local.set({
        userPlan: "free",
        usageCount: 0,
        usageDate: todayStr(),
        userId: null,
        userEmail: null
      });
      showState("out");
    }
  });

  // Google login via Chrome Identity API
  document.getElementById("btn-google-login").addEventListener("click", () => {
    const clientId = "584530126594-9ik2jsj8hp3s0i7uhle7iit958khksrs.apps.googleusercontent.com";
    const redirectUri = chrome.identity.getRedirectURL();
    const scope = "email profile openid";

    const authUrl =
      `https://accounts.google.com/o/oauth2/auth` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}`;

    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (responseUrl) => {
        if (chrome.runtime.lastError || !responseUrl) {
          alert("Login failed: " + (chrome.runtime.lastError?.message || "Unknown error"));
          return;
        }

        const hash = new URL(responseUrl).hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");

        if (!accessToken) {
          alert("Login failed: No access token received");
          return;
        }

        try {
          const credential = firebase.auth.GoogleAuthProvider.credential(null, accessToken);
          await auth.signInWithCredential(credential);
        } catch (err) {
          console.error("Firebase sign-in error:", err);
          alert("Login failed: " + err.message);
        }
      }
    );
  });

  // Logout
  document.getElementById("btn-logout").addEventListener("click", async () => {
    await auth.signOut();
  });

  // Upgrade button
  document.getElementById("btn-upgrade").addEventListener("click", () => {
    chrome.tabs.create({
      url: "https://rui-ai.com/#pricing"
    });
  });
}

main();