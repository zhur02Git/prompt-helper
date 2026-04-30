from PIL import Image, ImageDraw, ImageFont, ImageFilter
import qrcode

# Generate QR code
qr = qrcode.QRCode(version=2, box_size=6, border=2)
qr.add_data('https://rui-ai.com')
qr.make(fit=True)
qr_img = qr.make_image(fill_color="#0a0a0a", back_color="white").convert("RGBA")
qr_img = qr_img.resize((110, 110), Image.LANCZOS)

W, H = 1280, 800
poster = Image.new("RGB", (W, H), "#0a0a0a")

# Subtle orange glow
glow = Image.new("RGB", (W, H), "#0a0a0a")
gd = ImageDraw.Draw(glow)
gd.ellipse([900, -100, 1380, 380], fill="#2e1200")
gd.ellipse([-80, 500, 380, 900], fill="#1e0e00")
glow = glow.filter(ImageFilter.GaussianBlur(100))
poster = Image.blend(poster, glow, 0.7)
draw = ImageDraw.Draw(poster)

# Fonts
try:
    fb64 = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 64)
    fb36 = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 36)
    fb24 = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)
    fb18 = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
    fb15 = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 15)
    fr16 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 16)
    fr14 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 14)
    fr13 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
    fr12 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 12)
    fi14 = ImageFont.truetype("C:/Windows/Fonts/ariali.ttf", 14)
except:
    fb64 = fb36 = fb24 = fb18 = fb15 = fr16 = fr14 = fr13 = fr12 = fi14 = ImageFont.load_default()

orange = "#f97316"
white  = "#ffffff"
gray   = "#666666"
lgray  = "#999999"
dark   = "#111111"
dark2  = "#1a1a1a"
green  = "#22c55e"

# ── LOGO + TAGLINE (top left) ──
draw.rounded_rectangle([48, 40, 90, 82], radius=11, fill=orange)
draw.text((69, 51), "P", font=fb24, fill=white, anchor="mt")
draw.text((102, 52), "Prompt Helper", font=fb18, fill=white)
draw.text((102, 76), "Write better AI prompts. One click.", font=fr13, fill=gray)

# ── HEADLINE (top center) ──
draw.text((640, 42), "Before & After", font=fb36, fill=white, anchor="mt")
draw.text((640, 88), "See what Prompt Helper does to your prompts", font=fr14, fill=gray, anchor="mt")

# ══════════════════════════════════════════════
# BEFORE CARD (left)
# ══════════════════════════════════════════════
bx, by, bw, bh = 48, 130, 490, 560
draw.rounded_rectangle([bx, by, bx+bw, by+bh], radius=20, fill=dark, outline="#2a2a2a")

# Label
draw.rounded_rectangle([bx+24, by+20, bx+110, by+48], radius=12, fill="#2a2a2a")
draw.text((bx+67, by+27), "BEFORE", font=fb13 if 'fb13' in dir() else fr12, fill=lgray, anchor="mt")

# User typing in ChatGPT
draw.text((bx+28, by+65), "User types into ChatGPT:", font=fr13, fill=gray)
draw.rounded_rectangle([bx+24, by+88, bx+466, by+168], radius=12, fill="#0f0f0f", outline="#333")
draw.text((bx+40, by+105), '"write email to boss', font=fi14, fill=lgray)
draw.text((bx+40, by+127), ' about project delay"', font=fi14, fill=lgray)

# Issues
draw.text((bx+28, by+192), "Problems with this prompt:", font=fr13, fill=gray)
issues = [
    ("✗", "Too vague — AI guesses the context"),
    ("✗", "No tone or format specified"),
    ("✗", "Missing key details → hallucination risk"),
    ("✗", "Generic output, needs re-prompting"),
]
for i, (icon, txt) in enumerate(issues):
    y = by + 220 + i * 42
    draw.text((bx+32, y), icon, font=fb15, fill="#ef4444")
    draw.text((bx+56, y), txt, font=fr14, fill="#888888")

# Sample bad output
draw.text((bx+28, by+408), "AI output (vague):", font=fr13, fill=gray)
draw.rounded_rectangle([bx+24, by+430, bx+466, by+530], radius=12, fill="#0f0f0f", outline="#2a2a2a")
draw.text((bx+40, by+448), "Hi [Name],", font=fr13, fill="#555")
draw.text((bx+40, by+468), "I wanted to let you know that the project", font=fr13, fill="#555")
draw.text((bx+40, by+488), "is delayed. Please let me know if you have", font=fr13, fill="#555")
draw.text((bx+40, by+508), "any questions. Best regards.", font=fr13, fill="#555")

# ══════════════════════════════════════════════
# ARROW (center)
# ══════════════════════════════════════════════
cx = 640
draw.rounded_rectangle([cx-54, 360, cx+54, 440], radius=28, fill=orange)
draw.text((cx, 385), "✦", font=fb24, fill=white, anchor="mt")
draw.text((cx, 414), "Enhance", font=fr12, fill=white, anchor="mt")

# ══════════════════════════════════════════════
# AFTER CARD (right)
# ══════════════════════════════════════════════
ax, ay, aw, ah = 742, 130, 490, 560
draw.rounded_rectangle([ax, ay, ax+aw, ay+ah], radius=20, fill="#0d1a0d", outline="#1a3a1a")

# Label
draw.rounded_rectangle([ax+24, ay+20, ax+110, ay+48], radius=12, fill="#1a3a1a")
draw.text((ax+67, ay+27), "AFTER", font=fr12, fill=green, anchor="mt")

# Enhanced prompt
draw.text((ax+28, ay+65), "Prompt Helper rewrites it to:", font=fr13, fill=gray)
draw.rounded_rectangle([ax+24, ay+88, ax+466, ay+208], radius=12, fill="#0a1a0a", outline="#1e3a1e")
enhanced_lines = [
    "Please review the situation: our [project name]",
    "is running approximately [X] days behind schedule",
    "due to [specific reason]. I want to flag this early",
    "so we can align on next steps. Could we schedule",
    "a brief sync this week? I'll bring a recovery plan.",
]
for i, line in enumerate(enhanced_lines):
    draw.text((ax+40, ay+104 + i*22), line, font=fr13, fill="#ccddcc")

# Benefits
draw.text((ax+28, ay+232), "Why it works:", font=fr13, fill=gray)
benefits = [
    ("✓", "Specific context → AI stays on topic"),
    ("✓", "Clear structure → no hallucination"),
    ("✓", "Professional tone pre-set"),
    ("✓", "Actionable output, first try"),
]
for i, (icon, txt) in enumerate(benefits):
    y = ay + 260 + i * 42
    draw.text((ax+32, y), icon, font=fb15, fill=green)
    draw.text((ax+56, y), txt, font=fr14, fill="#aaaaaa")

# Sample good output
draw.text((ax+28, ay+435), "AI output (precise):", font=fr13, fill=gray)
draw.rounded_rectangle([ax+24, ay+457, ax+466, ay+530], radius=12, fill="#0a1a0a", outline="#1a3a1a")
draw.text((ax+40, ay+470), "Hi Sarah, I wanted to flag early that the", font=fr13, fill="#88bb88")
draw.text((ax+40, ay+490), "redesign project is running 5 days behind.", font=fr13, fill="#88bb88")
draw.text((ax+40, ay+510), "Can we sync Thursday? I'll bring the plan.", font=fr13, fill="#88bb88")

# ══════════════════════════════════════════════
# BOTTOM BAR
# ══════════════════════════════════════════════
draw.rounded_rectangle([48, 716, 1232, 778], radius=16, fill="#111111", outline="#222222")

# Left: platforms
draw.text((72, 736), "Works on:", font=fr13, fill=gray)
for i, platform in enumerate(["ChatGPT", "Claude", "Gemini"]):
    px = 160 + i * 110
    draw.rounded_rectangle([px, 732, px+90, 758], radius=12, fill="#1a1a1a", outline="#333")
    draw.text((px+45, 739), platform, font=fr13, fill=white, anchor="mt")

# Center: URL
draw.text((640, 736), "rui-ai.com", font=fb18, fill=orange, anchor="mt")
draw.text((640, 760), "Free to install · No account needed", font=fr12, fill=gray, anchor="mt")

# Right: QR code
qr_x, qr_y = 1106, 722
draw.rounded_rectangle([qr_x-6, qr_y-6, qr_x+116, qr_y+116], radius=8, fill=white)
poster.paste(qr_img, (qr_x, qr_y), qr_img)

# Save
poster.save("poster-final.png", "PNG")
print("✅ Done! poster-final.png saved.")
