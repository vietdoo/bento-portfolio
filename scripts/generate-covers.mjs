import fs from 'node:fs';
import path from 'node:path';

const books = [
  {
    id: "ddia",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    category: "Tech & Architecture",
    theme: { bg1: "#1e1b4b", bg2: "#0f172a", accent: "#38bdf8", tag: "SYSTEMS" },
    icon: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#38bdf8" stroke-width="2" fill="none"/>`
  },
  {
    id: "clean-code",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Software Craftsmanship",
    theme: { bg1: "#064e3b", bg2: "#022c22", accent: "#34d399", tag: "CRAFT" },
    icon: `<path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" fill="none"/>`
  },
  {
    id: "system-design",
    title: "System Design Interview",
    author: "Alex Xu",
    category: "Distributed Systems",
    theme: { bg1: "#1e293b", bg2: "#0f172a", accent: "#60a5fa", tag: "GUIDE" },
    icon: `<rect x="3" y="3" width="7" height="7" rx="1" stroke="#60a5fa" stroke-width="2" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#60a5fa" stroke-width="2" fill="none"/><rect x="8" y="14" width="8" height="7" rx="1" stroke="#60a5fa" stroke-width="2" fill="none"/>`
  },
  {
    id: "microservices",
    title: "Building Microservices",
    author: "Sam Newman",
    category: "Cloud Architecture",
    theme: { bg1: "#312e81", bg2: "#1e1b4b", accent: "#a78bfa", tag: "ARCHITECTURE" },
    icon: `<circle cx="12" cy="6" r="3" stroke="#a78bfa" stroke-width="2" fill="none"/><circle cx="6" cy="17" r="3" stroke="#a78bfa" stroke-width="2" fill="none"/><circle cx="18" cy="17" r="3" stroke="#a78bfa" stroke-width="2" fill="none"/>`
  },
  {
    id: "database-internals",
    title: "Database Internals",
    author: "Alex Petrov",
    category: "Storage Engines",
    theme: { bg1: "#451a03", bg2: "#1c1917", accent: "#fb923c", tag: "STORAGE" },
    icon: `<ellipse cx="12" cy="6" rx="8" ry="3" stroke="#fb923c" stroke-width="2" fill="none"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="#fb923c" stroke-width="2" fill="none"/>`
  },
  {
    id: "pragmatic-programmer",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    category: "Software Mastery",
    theme: { bg1: "#172554", bg2: "#0b1329", accent: "#38bdf8", tag: "MASTERY" },
    icon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" fill="none"/>`
  },
  {
    id: "staff-engineer",
    title: "Staff Engineer",
    author: "Will Larson",
    category: "Technical Leadership",
    theme: { bg1: "#3b0764", bg2: "#1e1b4b", accent: "#c084fc", tag: "LEADERSHIP" },
    icon: `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#c084fc" stroke-width="2" fill="none"/>`
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Help & Habits",
    theme: { bg1: "#78350f", bg2: "#451a03", accent: "#f59e0b", tag: "HABITS" },
    icon: `<circle cx="12" cy="12" r="9" stroke="#f59e0b" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" fill="#f59e0b"/>`
  },
  {
    id: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Focus & Performance",
    theme: { bg1: "#0f172a", bg2: "#020617", accent: "#f43f5e", tag: "FOCUS" },
    icon: `<circle cx="12" cy="12" r="9" stroke="#f43f5e" stroke-width="2" fill="none"/><path d="M12 7v5l3 3" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>`
  },
  {
    id: "psychology-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Finance & Mindset",
    theme: { bg1: "#065f46", bg2: "#022c22", accent: "#10b981", tag: "FINANCE" },
    icon: `<circle cx="12" cy="12" r="9" stroke="#10b981" stroke-width="2" fill="none"/><path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>`
  },
  {
    id: "show-your-work",
    title: "Show Your Work!",
    author: "Austin Kleon",
    category: "Creativity & Brand",
    theme: { bg1: "#854d0e", bg2: "#3f2c06", accent: "#eab308", tag: "CREATIVITY" },
    icon: `<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="#eab308" stroke-width="2" fill="none"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="#eab308" stroke-width="2" fill="none"/>`
  },
  {
    id: "make-time",
    title: "Make Time",
    author: "Jake Knapp & John Zeratsky",
    category: "Time Management",
    theme: { bg1: "#1e3a8a", bg2: "#172554", accent: "#3b82f6", tag: "PRODUCTIVITY" },
    icon: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round" fill="none"/>`
  }
];

function generateSVG(book) {
  const { title, author, category, theme, icon } = book;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
  <defs>
    <linearGradient id="bg-${book.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}" />
      <stop offset="100%" stop-color="${theme.bg2}" />
    </linearGradient>
    <linearGradient id="sp-${book.id}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" rx="8" fill="url(#bg-${book.id})" />
  <rect x="20" y="24" width="100" height="20" rx="4" fill="${theme.accent}" fill-opacity="0.2" stroke="${theme.accent}" stroke-width="1"/>
  <text x="28" y="38" font-family="sans-serif" font-size="9" font-weight="700" fill="${theme.accent}">${theme.tag}</text>
  <text x="20" y="70" font-family="sans-serif" font-size="10" font-weight="600" fill="#94a3b8">${category.toUpperCase()}</text>
  <g transform="translate(115, 110) scale(1.4)">${icon}</g>
  <rect x="20" y="200" width="260" height="2" fill="${theme.accent}" opacity="0.6"/>
  <foreignObject x="20" y="215" width="260" height="150">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:#fff;font-family:sans-serif;font-weight:800;font-size:20px;line-height:1.3;">${title}</div>
  </foreignObject>
  <text x="20" y="400" font-family="sans-serif" font-size="13" font-weight="600" fill="${theme.accent}">${author}</text>
  <rect x="0" y="0" width="12" height="450" fill="url(#sp-${book.id})" />
  <rect x="0.5" y="0.5" width="299" height="449" rx="7.5" fill="none" stroke="#ffffff" stroke-opacity="0.15" />
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
  console.log(`Generated cover for ${book.id}`);
}
