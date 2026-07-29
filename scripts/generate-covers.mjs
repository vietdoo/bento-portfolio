import fs from 'node:fs';
import path from 'node:path';

const books = [
  {
    id: "ddia",
    titleLine1: "Designing Data-Intensive",
    titleLine2: "Applications",
    author: "Martin Kleppmann",
    category: "DATA SYSTEMS & ARCHITECTURE",
    bg1: "#1e1b4b", bg2: "#0f172a", accent: "#38bdf8", border: "#60a5fa",
    icon: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#38bdf8" stroke-width="2" fill="none"/>`
  },
  {
    id: "clean-code",
    titleLine1: "Clean Code",
    titleLine2: "Handbook of Craftsmanship",
    author: "Robert C. Martin",
    category: "SOFTWARE ENGINEERING",
    bg1: "#064e3b", bg2: "#022c22", accent: "#34d399", border: "#10b981",
    icon: `<path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" fill="none"/>`
  },
  {
    id: "system-design",
    titleLine1: "System Design",
    titleLine2: "Interview (Vol 1 & 2)",
    author: "Alex Xu",
    category: "DISTRIBUTED SYSTEMS",
    bg1: "#1e293b", bg2: "#0f172a", accent: "#60a5fa", border: "#3b82f6",
    icon: `<rect x="3" y="3" width="7" height="7" rx="1" stroke="#60a5fa" stroke-width="2" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#60a5fa" stroke-width="2" fill="none"/><rect x="8" y="14" width="8" height="7" rx="1" stroke="#60a5fa" stroke-width="2" fill="none"/>`
  },
  {
    id: "microservices",
    titleLine1: "Building Microservices",
    titleLine2: "Fine-Grained Systems",
    author: "Sam Newman",
    category: "CLOUD ARCHITECTURE",
    bg1: "#312e81", bg2: "#1e1b4b", accent: "#a78bfa", border: "#8b5cf6",
    icon: `<circle cx="12" cy="6" r="3" stroke="#a78bfa" stroke-width="2" fill="none"/><circle cx="6" cy="17" r="3" stroke="#a78bfa" stroke-width="2" fill="none"/><circle cx="18" cy="17" r="3" stroke="#a78bfa" stroke-width="2" fill="none"/>`
  },
  {
    id: "database-internals",
    titleLine1: "Database Internals",
    titleLine2: "Storage & Distributed Data",
    author: "Alex Petrov",
    category: "STORAGE ENGINES",
    bg1: "#451a03", bg2: "#1c1917", accent: "#fb923c", border: "#f97316",
    icon: `<ellipse cx="12" cy="6" rx="8" ry="3" stroke="#fb923c" stroke-width="2" fill="none"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="#fb923c" stroke-width="2" fill="none"/>`
  },
  {
    id: "pragmatic-programmer",
    titleLine1: "The Pragmatic",
    titleLine2: "Programmer",
    author: "Andrew Hunt & David Thomas",
    category: "SOFTWARE MASTERY",
    bg1: "#172554", bg2: "#0b1329", accent: "#38bdf8", border: "#0284c7",
    icon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" fill="none"/>`
  },
  {
    id: "staff-engineer",
    titleLine1: "Staff Engineer",
    titleLine2: "Technical Leadership",
    author: "Will Larson",
    category: "CAREER & LEADERSHIP",
    bg1: "#3b0764", bg2: "#1e1b4b", accent: "#c084fc", border: "#a855f7",
    icon: `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#c084fc" stroke-width="2" fill="none"/>`
  },
  {
    id: "atomic-habits",
    titleLine1: "Atomic Habits",
    titleLine2: "Tiny Changes, Remarkable Results",
    author: "James Clear",
    category: "SELF-HELP & HABITS",
    bg1: "#78350f", bg2: "#451a03", accent: "#f59e0b", border: "#d97706",
    icon: `<circle cx="12" cy="12" r="9" stroke="#f59e0b" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" fill="#f59e0b"/>`
  },
  {
    id: "deep-work",
    titleLine1: "Deep Work",
    titleLine2: "Focused Success in a Distracted World",
    author: "Cal Newport",
    category: "FOCUS & PRODUCTIVITY",
    bg1: "#0f172a", bg2: "#020617", accent: "#f43f5e", border: "#e11d48",
    icon: `<circle cx="12" cy="12" r="9" stroke="#f43f5e" stroke-width="2" fill="none"/><path d="M12 7v5l3 3" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>`
  },
  {
    id: "psychology-money",
    titleLine1: "The Psychology",
    titleLine2: "of Money",
    author: "Morgan Housel",
    category: "FINANCE & MINDSET",
    bg1: "#065f46", bg2: "#022c22", accent: "#10b981", border: "#059669",
    icon: `<circle cx="12" cy="12" r="9" stroke="#10b981" stroke-width="2" fill="none"/><path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>`
  },
  {
    id: "show-your-work",
    titleLine1: "Show Your Work!",
    titleLine2: "10 Ways to Share Creativity",
    author: "Austin Kleon",
    category: "CREATIVITY & BRAND",
    bg1: "#854d0e", bg2: "#3f2c06", accent: "#eab308", border: "#ca8a04",
    icon: `<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="#eab308" stroke-width="2" fill="none"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="#eab308" stroke-width="2" fill="none"/>`
  },
  {
    id: "make-time",
    titleLine1: "Make Time",
    titleLine2: "Focus on What Matters",
    author: "Jake Knapp & John Zeratsky",
    category: "TIME MANAGEMENT",
    bg1: "#1e3a8a", bg2: "#172554", accent: "#3b82f6", border: "#2563eb",
    icon: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round" fill="none"/>`
  }
];

function generateSVG(book) {
  const { id, titleLine1, titleLine2, author, category, bg1, bg2, accent, border, icon } = book;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
  <defs>
    <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}" />
      <stop offset="100%" stop-color="${bg2}" />
    </linearGradient>
    <linearGradient id="spine-${id}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="300" height="450" rx="8" fill="url(#bg-${id})" />

  <!-- Classic Double Gold Frame -->
  <rect x="14" y="14" width="272" height="422" rx="6" fill="none" stroke="${accent}" stroke-opacity="0.5" stroke-width="1.5" />
  <rect x="18" y="18" width="264" height="414" rx="4" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="1" stroke-dasharray="4,2" />

  <!-- Top Category Ribbon -->
  <rect x="35" y="32" width="230" height="22" rx="3" fill="${bg2}" stroke="${accent}" stroke-opacity="0.6" stroke-width="1" />
  <text x="150" y="47" font-family="Georgia, 'Times New Roman', serif" font-size="9" font-weight="700" fill="${accent}" text-anchor="middle" letter-spacing="1.5">${category}</text>

  <!-- Central Emblem Ornament -->
  <circle cx="150" cy="140" r="42" fill="${bg2}" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.6" />
  <circle cx="150" cy="140" r="37" fill="none" stroke="${accent}" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="3,2" />
  <g transform="translate(133, 123) scale(1.4)">
    ${icon}
  </g>

  <!-- Divider Ribbon -->
  <line x1="40" y1="210" x2="260" y2="210" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.6" />
  <polygon points="150,205 154,210 150,215 146,210" fill="${accent}" />

  <!-- Title Text -->
  <text x="150" y="248" font-family="Georgia, 'Times New Roman', serif" font-size="19" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="-0.3">${titleLine1}</text>
  <text x="150" y="276" font-family="Georgia, 'Times New Roman', serif" font-size="17" font-weight="700" fill="#fef3c7" text-anchor="middle" letter-spacing="-0.2">${titleLine2}</text>

  <!-- Author Banner -->
  <line x1="70" y1="330" x2="230" y2="330" stroke="${accent}" stroke-width="1" stroke-opacity="0.3" />
  <text x="150" y="365" font-family="Georgia, 'Times New Roman', serif" font-size="14" font-weight="600" fill="${accent}" text-anchor="middle">${author}</text>
  <text x="150" y="388" font-family="'Satoshi', sans-serif" font-size="9" font-weight="500" fill="#94a3b8" text-anchor="middle" letter-spacing="2">CLASSIC EDITION</text>

  <!-- Book Spine 3D Shadow -->
  <rect x="0" y="0" width="16" height="450" fill="url(#spine-${id})" />
  <line x1="16" y1="0" x2="16" y2="450" stroke="#000000" stroke-opacity="0.3" stroke-width="1" />

  <!-- Outer Border -->
  <rect x="0.5" y="0.5" width="299" height="449" rx="7.5" fill="none" stroke="${border}" stroke-opacity="0.4" />
</svg>`;
}

const dir = path.join(process.cwd(), 'public', 'books');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

for (const book of books) {
  const svgContent = generateSVG(book);
  const svgPath = path.join(dir, `${book.id}.jpg`);
  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  console.log(`Generated classic cover for ${book.id}`);
}
