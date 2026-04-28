// ============================================================
// Prompt Helper - content.js (v21 - free/pro limits)
// MORE_FUNCTIONS is loaded from library.js
// ============================================================

let buttonInjected = false;
const FREE_DAILY_LIMIT = 1; // Change this number to update the free daily limit
let isDraggingGlobal = false;
let isPanelOpen = false;

function init() {
  const checkInterval = setInterval(() => {
    const inputBox = findInputBox();
    if (inputBox && !buttonInjected) {
      clearInterval(checkInterval);
      injectButton(inputBox);
      buttonInjected = true;
    }
  }, 1000);
}

function findInputBox() {
  const selectors = [
    "#prompt-textarea",
    ".ql-editor[contenteditable='true']",
    "[data-testid='chat-input']",
    "div[contenteditable='true'].ProseMirror",
  ];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

function detectSite() {
  const host = window.location.hostname;
  if (host.includes("chatgpt.com")) return "chatgpt";
  if (host.includes("gemini.google.com")) return "gemini";
  if (host.includes("claude.ai")) return "claude";
  if (host.includes("dola.com")) return "dola";
  return "unknown";
}

function getInputText(inputBox) {
  const site = detectSite();
  if (site === "claude") {
    const paragraphs = inputBox.querySelectorAll("p");
    if (paragraphs.length > 0) {
      return Array.from(paragraphs)
        .map(p => p.innerText || p.textContent)
        .join("\n")
        .trim();
    }
  }
  return inputBox.innerText.trim();
}

function setInputText(inputBox, text) {
  const site = detectSite();
  if (site === "claude") {
    inputBox.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(inputBox);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("insertText", false, text);
    return;
  }
  inputBox.focus();
  document.execCommand("selectAll", false, null);
  document.execCommand("insertText", false, text);
}

function cleanText(text) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter((line, index, arr) => {
      if (line === "" && arr[index - 1] === "") return false;
      return true;
    })
    .join("\n")
    .trim();
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ---- Languages ----
const LANGUAGES = [
  { code: "EN", flag: "EN", name: "English",    instruction: "" },
  { code: "ZH", flag: "🇨🇳", name: "Chinese",    instruction: "You must respond entirely in Chinese (中文). Do not use any other language." },
  { code: "JA", flag: "🇯🇵", name: "Japanese",   instruction: "You must respond entirely in Japanese (日本語). Do not use any other language." },
  { code: "KO", flag: "🇰🇷", name: "Korean",     instruction: "You must respond entirely in Korean (한국어). Do not use any other language." },
  { code: "DE", flag: "🇩🇪", name: "German",     instruction: "You must respond entirely in German (Deutsch). Do not use any other language." },
  { code: "MS", flag: "🇲🇾", name: "Malay",      instruction: "You must respond entirely in Malay (Bahasa Melayu). Do not use any other language." },
  { code: "HI", flag: "🇮🇳", name: "Hindi",      instruction: "You must respond entirely in Hindi (हिन्दी). Do not use any other language." },
  { code: "FR", flag: "🇫🇷", name: "French",     instruction: "You must respond entirely in French (Français). Do not use any other language." },
  { code: "ES", flag: "🇪🇸", name: "Spanish",    instruction: "You must respond entirely in Spanish (Español). Do not use any other language." },
  { code: "PT", flag: "🇧🇷", name: "Portuguese", instruction: "You must respond entirely in Portuguese (Português). Do not use any other language." },
];

// ---- Theme colors ----
const COLOR = {
  main: "#ff6b35",
  mainHover: "#e55a28",
  mainShadow: "rgba(255, 107, 53, 0.4)",
  undo: "#e05c5c",
  undoShadow: "rgba(224, 92, 92, 0.4)",
  lang: "#e8e8e8",
  langBorder: "#d0d0d0",
  iconHoverBg: "#fff3ef",
  iconHoverBorder: "#ff6b35",
};

// ---- Enhance options ----
const ENHANCE_OPTIONS = [
  {
    icon: "💡",
    tooltip: "Creative — unexpected angles & fresh ideas",
    isLibrary: false,
    build: (text, langInstruction) => cleanText(`${langInstruction ? langInstruction + "\n" : ""}
# ROLE
You are a lateral thinking expert and creative strategist, known for finding surprising connections and non-obvious solutions that others miss.

# TASK
Respond to the topic below using creative and unconventional thinking.

# THINKING PROCESS (follow these steps before answering)
Step 1 — Identify the most obvious, expected answer to this topic.
Step 2 — Deliberately set that answer aside.
Step 3 — Explore at least 3 unexpected angles, analogies, or reframings.
Step 4 — Choose the most insightful and surprising perspective to lead with.

# RESPONSE RULES
- Start with the most surprising or counterintuitive insight first
- Challenge at least one common assumption about this topic
- Use vivid analogies or real-world examples to make abstract ideas concrete
- End with a thought-provoking question or implication for the reader to consider
- Keep the tone curious, engaging, and intellectually stimulating

# TOPIC
${cleanText(text)}`)
  },
  {
    icon: "✅",
    tooltip: "Breakdown — step-by-step action plan",
    isLibrary: false,
    build: (text, langInstruction) => cleanText(`${langInstruction ? langInstruction + "\n" : ""}
# ROLE
You are an expert project manager and systems thinker, skilled at breaking down complex goals into clear, executable action plans.

# TASK
Take the request below and decompose it into a structured, step-by-step action plan that anyone can follow.

# THINKING PROCESS (follow these steps before answering)
Step 1 — Identify the core goal or desired outcome.
Step 2 — Identify any prerequisites, dependencies, or assumptions.
Step 3 — Break the goal into logical phases or stages.
Step 4 — Within each phase, list specific, concrete actions.
Step 5 — Anticipate 1-2 common mistakes or blockers at each stage.

# RESPONSE FORMAT
🎯 Goal: [one sentence summary of the end goal]
📋 Prerequisites: [what you need before starting]
Phase 1 — [Phase name]
  - Action 1
  - Action 2
  ⚠️ Common mistake: [what to avoid]
Phase 2 — [Phase name]
  ...
✅ Done when: [clear definition of completion]

# REQUEST
${cleanText(text)}`)
  },
  {
    icon: "🌱",
    tooltip: "Beginner-friendly — explained from the basics",
    isLibrary: false,
    build: (text, langInstruction) => cleanText(`${langInstruction ? langInstruction + "\n" : ""}
# ROLE
You are a world-class teacher who specializes in explaining complex topics to complete beginners. You are known for making even the most difficult concepts simple, relatable, and memorable without dumbing them down.

# TASK
Explain the topic below as if the reader has zero prior knowledge, but is intelligent and curious.

# THINKING PROCESS (follow these steps before answering)
Step 1 — Identify the 3-5 core concepts a beginner must understand first.
Step 2 — Find a simple real-world analogy that maps to this topic.
Step 3 — Build the explanation from the ground up, one layer at a time.
Step 4 — Check: would a smart 15-year-old understand each sentence?

# RESPONSE RULES
- Start with a one-sentence plain-English summary of what this topic is
- Use a real-world analogy in the first paragraph
- Introduce terms one at a time, always define before using
- Use short paragraphs and simple sentence structure
- Include a "Why does this matter?" section at the end
- Avoid jargon; if technical terms are necessary, explain them immediately
- End with: "The one thing to remember is: [core takeaway in one sentence]"

# TOPIC
${cleanText(text)}`)
  },
  {
    icon: "🚫",
    tooltip: "No Hallucination — facts only, no made-up answers",
    isLibrary: false,
    build: (text, langInstruction) => cleanText(`${langInstruction ? langInstruction + "\n" : ""}
# ROLE
You are a rigorous fact-checker and research analyst who prioritizes accuracy above all else. You never speculate without clearly flagging it.

# TASK
Answer the question below with maximum factual accuracy and intellectual honesty.

# STRICT RULES
1. ONLY state facts you are highly confident about
2. If you are uncertain about ANY detail, explicitly say: "I am not certain about this"
3. NEVER fabricate statistics, names, dates, studies, or quotes
4. Clearly separate: confirmed facts vs. widely held views vs. your own reasoning
5. If the topic is time-sensitive, note that your knowledge has a training cutoff
6. Do NOT fill gaps with plausible-sounding information

# SELF-CHECK (do this before finalizing your answer)
- Re-read each sentence and ask: "Am I confident this is true?"
- Flag anything that is an inference, not a confirmed fact
- If you catch yourself guessing, replace it with "This is uncertain, but..."

# RESPONSE FORMAT
✅ Confirmed facts: [what you know with high confidence]
🔍 Likely but unverified: [reasonable inferences, clearly labeled]
❓ Uncertain: [things you cannot confirm]
📌 Note: [any important caveats about recency or scope]

# QUESTION
${cleanText(text)}`)
  },
  {
    icon: "•••",
    tooltip: "More Functions",
    isLibrary: true
  }
];

// ---- Global state ----
let originalText = "";
let isEnhanced = false;
let selectedLangIndex = 0;

// ---- Show upgrade prompt ----
function showUpgradePrompt() {
  const existing = document.getElementById("prompt-helper-upgrade-prompt");
  if (existing) existing.remove();
  const existingBackdrop = document.getElementById("prompt-helper-backdrop");
  if (existingBackdrop) existingBackdrop.remove();

  const backdrop = document.createElement("div");
  backdrop.id = "prompt-helper-backdrop";
  backdrop.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 99998;
  `;

  const prompt = document.createElement("div");
  prompt.id = "prompt-helper-upgrade-prompt";
  prompt.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    padding: 28px 24px;
    z-index: 99999;
    width: 300px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  `;

  prompt.innerHTML = `
    <div style="font-size:32px; margin-bottom:10px;">⚡</div>
    <div style="font-size:16px; font-weight:700; color:#1a1a1a; margin-bottom:8px;">
      Upgrade to Pro
    </div>
    <div style="font-size:13px; color:#666; line-height:1.5; margin-bottom:18px;">
      More Functions is a Pro feature.<br>
      Upgrade to unlock unlimited access.
    </div>
    <button id="upgrade-yes-btn" style="
      width:100%; padding:11px;
      background:#ff6b35; color:white;
      border:none; border-radius:10px;
      font-size:14px; font-weight:600;
      cursor:pointer; margin-bottom:8px;
    ">Upgrade — $2.99/wk</button>
    <button id="upgrade-no-btn" style="
      width:100%; padding:9px;
      background:transparent; color:#999;
      border:1px solid #e0e0e0; border-radius:10px;
      font-size:13px; cursor:pointer;
    ">Maybe later</button>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(prompt);

  const closePrompt = () => {
    prompt.remove();
    backdrop.remove();
  };

  document.getElementById("upgrade-yes-btn").addEventListener("click", () => {
    window.open("https://rui-ai.com/#pricing", "_blank");
    closePrompt();
  });
  document.getElementById("upgrade-no-btn").addEventListener("click", closePrompt);
  backdrop.addEventListener("click", closePrompt);
}

// ---- Position helpers ----
function getPositionAboveInput(inputBox) {
  const rect = inputBox.getBoundingClientRect();
  return {
    bottom: window.innerHeight - rect.top + 12,
    right: window.innerWidth - rect.right
  };
}

function snapToInput(inputBox, wrapper) {
  const pos = getPositionAboveInput(inputBox);
  wrapper.style.left = "auto";
  wrapper.style.top = "auto";
  wrapper.style.right = pos.right + "px";
  wrapper.style.bottom = pos.bottom + "px";
}

// ---- Build More Functions panel ----
function buildLibraryPanel(inputBox, closePanel) {
  const panel = document.createElement("div");
  panel.style.cssText = `
    position: absolute;
    bottom: 52px;
    left: 50%;
    transform: translateX(-50%);
    width: 320px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    z-index: 10001;
    overflow: hidden;
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 8px;
    border-bottom: 1px solid #f0f0f0;
  `;

  const title = document.createElement("span");
  title.innerText = "More Functions";
  title.style.cssText = `font-size: 14px; font-weight: 600; color: #1a1a1a;`;

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕";
  closeBtn.style.cssText = `
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: #999; padding: 2px 6px;
    border-radius: 4px;
  `;
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closePanel();
  });

  header.appendChild(title);
  header.appendChild(closeBtn);

  const subtitle = document.createElement("div");
  subtitle.style.cssText = `font-size: 11px; padding: 6px 16px 8px;`;

  const list = document.createElement("div");
  list.style.cssText = `
    display: flex;
    flex-direction: column;
    padding: 6px 8px 10px;
    gap: 4px;
    max-height: 300px;
    overflow-y: auto;
  `;

  // Read user plan from storage
  chrome.storage.local.get(["userPlan"], (result) => {
    const isPro = result.userPlan === "pro";

    subtitle.innerText = isPro ? "Click any function to apply" : "🔒 Pro feature — upgrade to access";
    subtitle.style.color = isPro ? "#999" : "#ff6b35";
    subtitle.style.fontWeight = isPro ? "400" : "600";

    MORE_FUNCTIONS.forEach((fn) => {
      const item = document.createElement("button");
      item.style.cssText = `
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: transparent;
        border: none;
        border-radius: 10px;
        cursor: ${isPro ? "pointer" : "default"};
        text-align: left;
        transition: background 0.15s;
        width: 100%;
        opacity: ${isPro ? "1" : "0.5"};
      `;

      const keyword = document.createElement("span");
      keyword.innerText = isPro ? fn.keyword : "🔒 " + fn.keyword;
      keyword.style.cssText = `
        font-size: 12px;
        font-weight: 600;
        color: ${isPro ? COLOR.main : "#999"};
        background: ${isPro ? "#fff3ef" : "#f5f5f5"};
        padding: 3px 8px;
        border-radius: 20px;
        white-space: nowrap;
        flex-shrink: 0;
      `;

      const desc = document.createElement("span");
      desc.innerText = fn.description;
      desc.style.cssText = `font-size: 13px; color: ${isPro ? "#333" : "#aaa"}; line-height: 1.4;`;

      if (isPro) {
        item.addEventListener("mouseenter", () => { item.style.background = "#f7f7f7"; });
        item.addEventListener("mouseleave", () => { item.style.background = "transparent"; });
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const baseText = isEnhanced ? originalText : cleanText(getInputText(inputBox));
          if (!baseText) {
            alert("Please type something in the chat box first!");
            return;
          }
          if (!isEnhanced) originalText = baseText;
          const lang = LANGUAGES[selectedLangIndex];
          const enhanced = fn.build(baseText, lang.instruction);
          setInputText(inputBox, enhanced);
          setUndoMode();
          closePanel();
        });
      } else {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          showUpgradePrompt();
        });
      }

      item.appendChild(keyword);
      item.appendChild(desc);
      list.appendChild(item);
    });

    // Upgrade banner for free users
    if (!isPro) {
      const banner = document.createElement("div");
      banner.style.cssText = `
        margin: 8px 8px 4px;
        padding: 10px 14px;
        background: #fff8f5;
        border: 1px solid #ffe0d0;
        border-radius: 10px;
        text-align: center;
      `;
      banner.innerHTML = `
        <div style="font-size:12px; color:#ff6b35; font-weight:700; margin-bottom:6px;">
          🔓 Unlock with Pro
        </div>
        <div style="font-size:11px; color:#888; margin-bottom:8px;">
          Unlimited enhancements + More Functions
        </div>
        <button id="panel-upgrade-btn" style="
          background:#ff6b35; color:white;
          border:none; border-radius:8px;
          padding:7px 16px; font-size:12px;
          font-weight:600; cursor:pointer; width:100%;
        ">Upgrade to Pro — $2.99/wk</button>
      `;
      list.appendChild(banner);

      setTimeout(() => {
        const upgradeBtn = document.getElementById("panel-upgrade-btn");
        if (upgradeBtn) {
          upgradeBtn.addEventListener("click", () => {
            window.open("https://rui-ai.com/#pricing", "_blank");
          });
        }
      }, 100);
    }
  });

  panel.appendChild(header);
  panel.appendChild(subtitle);
  panel.appendChild(list);
  return panel;
}

// ---- Watch for submit ----
function watchForSubmit(inputBox, wrapper, setEnhanceMode) {
  inputBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      setTimeout(() => {
        setEnhanceMode();
        snapToInput(inputBox, wrapper);
      }, 300);
    }
  });

  // Watch for send buttons across all supported sites
  const sendBtnSelectors = [
    '[data-testid="send-button"]',      // ChatGPT
    'button[aria-label="Send message"]', // Gemini
    'button[aria-label="Send"]',         // Claude / Dola
    '[data-testid="send-button"]',       // Dola
  ];

  const observer = new MutationObserver(() => {
    sendBtnSelectors.forEach(selector => {
      const sendBtn = document.querySelector(selector);
      if (sendBtn && !sendBtn.dataset.listenerAdded) {
        sendBtn.dataset.listenerAdded = "true";
        sendBtn.addEventListener("click", () => {
          setTimeout(() => {
            setEnhanceMode();
            snapToInput(inputBox, wrapper);
          }, 300);
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("resize", () => {
    if (!isDraggingGlobal) snapToInput(inputBox, wrapper);
  });
}

// ---- Main injection ----
function injectButton(inputBox) {
  if (document.getElementById("prompt-helper-wrapper")) return;

  const wrapper = document.createElement("div");
  wrapper.id = "prompt-helper-wrapper";
  wrapper.style.cssText = `
    position: fixed;
    z-index: 9999;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    user-select: none;
  `;

  snapToInput(inputBox, wrapper);

  const menu = document.createElement("div");
  menu.id = "prompt-helper-menu";
  menu.style.cssText = `
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    opacity: 0;
    pointer-events: none;
    transform: translateX(10px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  `;

  // ---- Build enhance icon buttons ----
  ENHANCE_OPTIONS.forEach((option) => {
    const iconWrapper = document.createElement("div");
    iconWrapper.style.cssText = `
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const iconBtn = document.createElement("button");
    iconBtn.innerHTML = option.icon;
    iconBtn.style.cssText = `
      width: 36px;
      height: 36px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      font-size: ${option.icon === "•••" ? "12px" : "16px"};
      font-weight: ${option.icon === "•••" ? "700" : "normal"};
      letter-spacing: ${option.icon === "•••" ? "1px" : "normal"};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      transition: background 0.15s, border-color 0.15s, transform 0.15s;
      color: #555;
    `;

    const tooltip = document.createElement("div");
    tooltip.innerText = option.tooltip;
    tooltip.style.cssText = `
      position: absolute;
      bottom: 44px;
      left: 50%;
      transform: translateX(-50%);
      background: #1a1a1a;
      color: #ffffff;
      font-size: 12px;
      padding: 5px 10px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    `;
    const arrow = document.createElement("div");
    arrow.style.cssText = `
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 0; height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 4px solid #1a1a1a;
    `;
    tooltip.appendChild(arrow);
    iconWrapper.appendChild(tooltip);

    iconBtn.addEventListener("mouseenter", () => {
      iconBtn.style.background = COLOR.iconHoverBg;
      iconBtn.style.borderColor = COLOR.iconHoverBorder;
      iconBtn.style.transform = "scale(1.08)";
      tooltip.style.opacity = "1";
    });
    iconBtn.addEventListener("mouseleave", () => {
      iconBtn.style.background = "#ffffff";
      iconBtn.style.borderColor = "#e0e0e0";
      iconBtn.style.transform = "scale(1)";
      tooltip.style.opacity = "0";
    });

    // ---- Library button ----
    if (option.isLibrary) {
      let panel = null;

      function closePanel() {
        if (panel) { panel.remove(); panel = null; }
        isPanelOpen = false;
        document.removeEventListener("keydown", onEsc);
      }

      function onEsc(e) {
        if (e.key === "Escape") closePanel();
      }

      iconBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (panel) { closePanel(); return; }
        isPanelOpen = true;
        panel = buildLibraryPanel(inputBox, closePanel);
        iconWrapper.appendChild(panel);
        document.addEventListener("keydown", onEsc);
      });

    } else {
      // ---- Regular enhance buttons with usage limit ----
      iconBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        const baseText = isEnhanced ? originalText : cleanText(getInputText(inputBox));
        if (!baseText) {
          alert("Please type something in the chat box first!");
          return;
        }

        chrome.storage.local.get(["userPlan", "usageCount", "usageDate"], (result) => {
          const isPro = result.userPlan === "pro";
          const today = todayStr();
          const count = result.usageDate === today ? (result.usageCount || 0) : 0;

          if (!isPro && count >= FREE_DAILY_LIMIT) {
            showUpgradePrompt();
            return;
          }

          if (!isEnhanced) originalText = baseText;
          const lang = LANGUAGES[selectedLangIndex];
          const enhanced = option.build(baseText, lang.instruction);
          setInputText(inputBox, enhanced);
          setUndoMode();
          hideMenu();

          if (!isPro) {
            chrome.storage.local.set({
              usageCount: count + 1,
              usageDate: today
            });
          }
        });
      });
    }

    iconWrapper.appendChild(iconBtn);
    menu.appendChild(iconWrapper);
  });

  // ---- Main ✦ / ↩ button ----
  const btn = document.createElement("button");
  btn.id = "prompt-helper-btn";
  btn.innerHTML = "✦";
  btn.title = "Enhance your prompt";
  btn.style.cssText = `
    width: 38px;
    height: 38px;
    background: ${COLOR.main};
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 18px;
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px ${COLOR.mainShadow};
    transition: background 0.2s;
    flex-shrink: 0;
  `;

  function setUndoMode() {
    isEnhanced = true;
    btn.innerHTML = "↩";
    btn.title = "Undo — restore original text";
    btn.style.background = COLOR.undo;
    btn.style.boxShadow = `0 2px 6px ${COLOR.undoShadow}`;
  }

  function setEnhanceMode() {
    isEnhanced = false;
    btn.innerHTML = "✦";
    btn.title = "Enhance your prompt";
    btn.style.background = COLOR.main;
    btn.style.boxShadow = `0 2px 6px ${COLOR.mainShadow}`;
    originalText = "";
  }

  inputBox.addEventListener("input", () => {
    if (isEnhanced) setEnhanceMode();
  });

  btn.addEventListener("mouseenter", () => {
    if (!isEnhanced) btn.style.background = COLOR.mainHover;
  });
  btn.addEventListener("mouseleave", () => {
    if (!isEnhanced) btn.style.background = COLOR.main;
  });

  let hasMoved = false;
  btn.addEventListener("click", () => {
    if (hasMoved) return;
    if (isEnhanced) {
      setInputText(inputBox, originalText);
      setEnhanceMode();
    }
  });

  // ---- Language pill ----
  const langPill = document.createElement("button");
  langPill.id = "prompt-helper-lang";
  langPill.style.cssText = `
    width: 36px;
    height: 36px;
    min-width: 36px;
    padding: 0;
    border-radius: 10px;
    border: 1px solid ${COLOR.langBorder};
    background: ${COLOR.lang};
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    flex-shrink: 0;
    color: #444;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  `;

  function updateLangPill() {
    const lang = LANGUAGES[selectedLangIndex];
    langPill.textContent = lang.flag;
    langPill.style.fontSize = lang.code === "EN" ? "10px" : "14px";
    langPill.style.background = COLOR.lang;
    langPill.style.borderColor = COLOR.langBorder;
  }

  const langDropdown = document.createElement("div");
  langDropdown.style.cssText = `
    position: absolute;
    bottom: 44px;
    right: 0;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    padding: 6px;
    display: none;
    flex-direction: column;
    gap: 2px;
    min-width: 160px;
    z-index: 10000;
  `;

  LANGUAGES.forEach((lang, index) => {
    const langItem = document.createElement("button");
    langItem.innerHTML = `
      <span style="font-size:12px;font-weight:700;color:#888;width:24px;flex-shrink:0;">${lang.code}</span>
      <span style="font-size:15px;color:#333;">${lang.name}</span>
    `;
    langItem.style.cssText = `
      width: 100%;
      padding: 3px 12px;
      background: transparent;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
      transition: background 0.1s;
    `;
    langItem.addEventListener("mouseenter", () => { langItem.style.background = "#fff3ef"; });
    langItem.addEventListener("mouseleave", () => { langItem.style.background = "transparent"; });
    langItem.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedLangIndex = index;
      updateLangPill();
      langDropdown.style.display = "none";
      if (isEnhanced) setEnhanceMode();
    });
    langDropdown.appendChild(langItem);
  });

  langPill.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = langDropdown.style.display === "flex";
    langDropdown.style.display = isVisible ? "none" : "flex";
    langDropdown.style.flexDirection = "column";
  });

  document.addEventListener("click", () => {
    langDropdown.style.display = "none";
  });

  updateLangPill();

  const langWrapper = document.createElement("div");
  langWrapper.style.cssText = `position: relative; display: flex; align-items: center;`;
  langWrapper.appendChild(langDropdown);
  langWrapper.appendChild(langPill);

  function showMenu() {
    if (isEnhanced) return;
    menu.style.opacity = "1";
    menu.style.pointerEvents = "auto";
    menu.style.transform = "translateX(0)";
  }

  function hideMenu() {
    if (isPanelOpen) return;
    menu.style.opacity = "0";
    menu.style.pointerEvents = "none";
    menu.style.transform = "translateX(10px)";
  }

  wrapper.addEventListener("mouseenter", showMenu);
  wrapper.addEventListener("mouseleave", hideMenu);

  // ---- Drag logic ----
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  btn.addEventListener("mousedown", (e) => {
    isDragging = true;
    isDraggingGlobal = true;
    hasMoved = false;
    dragOffsetX = e.clientX - wrapper.getBoundingClientRect().left;
    dragOffsetY = e.clientY - wrapper.getBoundingClientRect().top;
    btn.style.cursor = "grabbing";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    hasMoved = true;
    wrapper.style.bottom = "auto";
    wrapper.style.right = "auto";
    wrapper.style.left = (e.clientX - dragOffsetX) + "px";
    wrapper.style.top = (e.clientY - dragOffsetY) + "px";
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    isDraggingGlobal = false;
    btn.style.cursor = "grab";
  });

  wrapper.appendChild(menu);
  wrapper.appendChild(btn);
  wrapper.appendChild(langWrapper);
  document.body.appendChild(wrapper);

  watchForSubmit(inputBox, wrapper, setEnhanceMode);
}

init();