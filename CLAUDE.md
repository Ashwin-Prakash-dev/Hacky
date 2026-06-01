# CLAUDE.md

## Critical Rules

**Do NOT run the dev server (`npm run dev`) or build the project (`npm run build`, `npm run preview`, `npm run deploy`) unless the user explicitly asks.**

## Project Overview

React + Vite landing page. Deployed via Cloudflare Pages (wrangler).

**Stack:** React 18, Three.js (`@react-three/fiber`/`drei`), GSAP (with ScrollTrigger), Lenis smooth scroll, Tailwind CSS.

## Key Scripts

| Script | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Preview (CF) | `npm run preview` |
| Deploy | `npm run deploy` |
| Lint | `npm run lint` |

## Structure

- `src/App.jsx` — root component / routing
- `src/main.jsx` — entry point
- `src/components/` — all page sections and UI components
- `src/index.css` — global styles
- `public/` — static assets
