# vietdoo / bento-portfolio

Personal portfolio website built with Astro, SolidJS, Svelte, and Three.js.

[Live Site](https://vndo.vn) · [Repository](https://github.com/vietdoo/bento-portfolio)

## Overview

A bento-grid personal portfolio featuring interactive 3D elements, client-side mini-apps, and a dynamic server-rendered architecture.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Framework** | Astro 7 (Server Output) |
| **UI Components** | SolidJS, Svelte, UnoCSS |
| **3D & Animation** | Three.js, Cannon.es, Motion |
| **Database** | Astro DB (LibSQL / Turso) |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation & Run

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev

# Build for production
pnpm build
```

## Project Structure

```text
src/
├── assets/         # Static assets and typography
├── components/     # Astro, SolidJS, and Svelte UI components
├── layouts/        # Layout wrappers
├── pages/          # Astro routes and API endpoints
└── lib/            # Helpers, database client, and configurations
```

## License

[MIT](LICENSE) © [Đỗ Quốc Việt](https://vndo.vn)
