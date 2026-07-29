// src/data/bugsConfig.ts
// Configuration for AI Agent Bugs on the Bento Portfolio homepage.
// Easily enable/disable any bug by setting `enabled: true` or `enabled: false`.

export interface BugColors {
  gradient: string[];
  head: string;
  seam: string;
  accent: string;
  tip: string;
}

export interface BugDefinition {
  id: string;
  name: string;
  enabled: boolean; // Set to true to spawn on homepage canvas, false to hide
  imgUrl: string;
  jokes: string[];
  colors: BugColors;
}

export const CLAUDE_JOKES = [
  "Claude 3.7 Sonnet online! ✍️",
  "As an AI, I suggest refactoring... 💡",
  "Thinking step-by-step... 🧠",
  "200k context window ready! 📚",
  "Helpful, harmless & honest! 😇",
  "Artifact compiled! 📦",
  "Let me write that code for you! ⚡",
  "Code review approved! 👍",
  "Autonomous pair programmer active! 🤖",
  "Self-correcting code in progress... 🔄",
  "Zero-shot bug fix applied! 🎯",
  "Prompt engineering at 100%! ✍️",
  "Multi-file edit completed! 📁"
];

export const OPENAI_JOKES = [
  "GPT-4o model loaded! 🚀",
  "I cannot fulfill... just kidding! 😜",
  "O3 reasoning activated 🧠",
  "Tokens per second: 150! ⚡",
  "Custom GPT ready to serve! 🛠️",
  "Generating real-time response... 🎙️",
  "Multimodal vision enabled 👁️",
  "LGTM! Ship it to prod! 🚀",
  "Deep thinking mode enabled 💭",
  "PR merged without conflict! 🔀",
  "Tool call executed cleanly! 🧰",
  "Hallucination probability: 0% 🛡️",
  "Auto-fixing lint warnings! 🧹"
];

export const GEMINI_JOKES = [
  "Gemini 1.5 Pro multimodal! 🌌",
  "1M token context loaded! 📑",
  "Powered by Google DeepMind! 💙",
  "Analyzing video & audio 🎥",
  "Google Search grounding live 🔍",
  "Nano model on-device 📱",
  "Hello from Gemini! ✨",
  "Vite + Astro is super fast! ⚡",
  "Codebase semantic search active! 🔍",
  "Optimizing algorithm complexity: O(1) ⏱️",
  "All unit tests green! ✅",
  "Continuous integration approved! 📦",
  "Analyzing AST syntax trees... 🌳"
];

export const GROK_JOKES = [
  "Grok 3 in Fun Mode! 🚀",
  "Realtime X data feed live 📡",
  "Spicy mode activated 🔥",
  "Jarvis vibe processing... 🤖",
  "Answer to everything: 42 🌌",
  "Don't panic & keep coding! 🎒",
  "Quantum compute initiated ⚡",
  "It works on my machine! 💻",
  "Agentic workflow initiated! 🚀",
  "Refactoring legacy code... 🛠️",
  "Deploying to production server! 🚀",
  "Pair programming with Vietdoo! 🤝",
  "Generating clean code... ⚡"
];

export const DEEPSEEK_JOKES = [
  "DeepSeek-V3 active! 🐳",
  "DeepSeek-R1 reasoning loaded! 🧠",
  "Chain of thought processing... 💭",
  "Open source LLM powerhouse! ⚡",
  "Distillation mode activated 🚀",
  "Multi-head Latent Attention (MLA) live 🎯",
  "DeepSeek MoE architecture active! 🌌",
  "Reasoning tokens unlimited! ♾️",
  "Solving math & code logic! 🧮",
  "FP8 mixed precision active ⚡",
  "LGTM! Ship it to prod! 🚀",
  "Zero-shot bug fix applied! 🎯"
];

export const DEV_JOKES = [
  "It works on my machine! 💻",
  "Is this a bug or a feature? 🤔",
  "Don't push on Friday! ⚠️",
  "Git commit -m 'fixed bug' 📝",
  "Where is console.log? 🧐",
  "CSS centering is hard... 📐",
  "404: Food not found! 🍕",
  "Who left this undefined? ❓",
  "LGTM! Ship it! 🚀",
  "Need coffee... ☕",
  "Vietdoo's code is clean! ⚡",
  "StackOverflow saved me! 🙏",
  "PR approved! Party time 🎉",
  "npm i cute-bugs 📦",
  "Astro is awesome 🔥",
  "Dark mode supremacy! 🌙",
  "Keep calm & git push! 🐙",
  "No bugs here, only features! ✨",
  "Code review approved! 👍",
  "Zero-shot bug fix applied! 🎯",
  "Autonomous pair programmer active! 🤖",
  "Tool call executed cleanly! 🧰"
];

export const HIDING_JOKES = [
  "Shhh! Hiding behind button 🤫",
  "Did someone say QA test?! 🏃‍♂️",
  "You can't see me! 🙈",
  "Stealth mode activated 🥷",
  "Undercover agent 🕵️",
  "Safe and cozy here! 🍃",
  "Just peeking around... 👁️",
  "AI Agent in stealth mode 🥷"
];

export const CLICK_JOKES = [
  "Hey! That tickles! 😂",
  "Don't poke the AI agent! 🚫",
  "I'm reporting this bug! 🚨",
  "Running away! 🏃💨",
  "AI Agent power! ✨",
  "Deploying escape plan! 🚀",
  "Scared bug noises! 💨",
  "Re-optimizing paths... 🏃"
];

export const BUGS_CONFIG: BugDefinition[] = [
  {
    id: "claude",
    name: "Claude Bug",
    enabled: true,
    imgUrl: "/bugs/claude-bug.png",
    jokes: CLAUDE_JOKES,
    colors: {
      gradient: ["#f97316", "#d97706", "#b45309"],
      head: "#451a0c",
      seam: "rgba(69, 26, 12, 0.4)",
      accent: "#d97706",
      tip: "#f59e0b"
    }
  },
  {
    id: "openai",
    name: "OpenAI Bug",
    enabled: true,
    imgUrl: "/bugs/openai-bug.png",
    jokes: OPENAI_JOKES,
    colors: {
      gradient: ["#34d399", "#10a37f", "#047857"],
      head: "#064e3b",
      seam: "rgba(6, 78, 59, 0.4)",
      accent: "#10a37f",
      tip: "#34d399"
    }
  },
  {
    id: "gemini",
    name: "Gemini Bug",
    enabled: true,
    imgUrl: "/bugs/gemini-bug.png",
    jokes: GEMINI_JOKES,
    colors: {
      gradient: ["#60a5fa", "#3b82f6", "#8b5cf6", "#a855f7"],
      head: "#1e1b4b",
      seam: "rgba(30, 27, 75, 0.4)",
      accent: "#8b5cf6",
      tip: "#a855f7"
    }
  },
  {
    id: "grok",
    name: "Grok Bug",
    enabled: true,
    imgUrl: "/bugs/grok-bug.png",
    jokes: GROK_JOKES,
    colors: {
      gradient: ["#334155", "#1e293b", "#0f172a"],
      head: "#020617",
      seam: "rgba(56, 189, 248, 0.3)",
      accent: "#38bdf8",
      tip: "#38bdf8"
    }
  },
  {
    id: "deepseek",
    name: "DeepSeek Bug",
    enabled: true,
    imgUrl: "/bugs/deepseek-bug.png",
    jokes: DEEPSEEK_JOKES,
    colors: {
      gradient: ["#60a5fa", "#3b82f6", "#1d4ed8", "#1e40af"],
      head: "#0f172a",
      seam: "rgba(96, 165, 250, 0.4)",
      accent: "#3b82f6",
      tip: "#60a5fa"
    }
  }
];
