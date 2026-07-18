# CLAUDE.md

## Critical Rules

- **Never run `npm run dev`, `npm run build`, `npm run preview`, or `npm run deploy` unless the user explicitly asks.** Assume a dev server is already running.
- Never introduce new dependencies, fonts, or colors without asking first.
- Prefer editing existing components over creating new ones. Never leave dead code or unused components behind.

## Project Overview

React + Vite landing page, deployed via Cloudflare Pages (wrangler).

**Stack:** React 18, Three.js (`@react-three/fiber` + `drei`), GSAP + ScrollTrigger, Lenis smooth scroll, Tailwind CSS.

## Structure

- `src/App.jsx` — root component / routing
- `src/main.jsx` — entry point
- `src/components/` — all page sections and UI components
- `src/index.css` — global styles / design tokens
- `public/` — static assets

## Scripts

`dev`, `build`, `preview` (CF), `deploy`, `lint` — all via `npm run`. See Critical Rules before running any of them.

## Design Rules — read before touching any UI

This is a design-led landing page. Every visual change must look intentional, not generated. Before changing UI, read the surrounding components and `src/index.css` to absorb the existing palette, type scale, and spacing rhythm — then extend that system. Never bolt on a parallel one.

### Banned (these read as AI-generated)

- Purple/blue gradients, gradient text, gradient buttons, `bg-gradient-to-*` as decoration.
- Emoji in UI copy. Emoji as icons.
- The stock AI palettes: cream background + serif + terracotta accent; near-black + single acid-green accent. If the site already uses something close, fine — but don't drift toward these defaults on your own.
- Numbered section markers (01 / 02 / 03), "eyebrow" labels, and dividers used as decoration. Only use structural devices when they encode something true about the content (a real sequence, a real taxonomy).
- Card grids of three with icon + heading + blurb as the default answer to any content problem.
- Glassmorphism, random `backdrop-blur`, drop shadows on everything, `rounded-2xl` applied uniformly.
- Centered-everything layouts. Use the grid; asymmetry is allowed and often better.
- Marketing filler copy: "Elevate your…", "Unlock…", "Seamless…", "Empower…". Copy must be specific to this product, plain-verb, active voice, sentence case.

### Required

- **One system.** All colors, spacing, and type sizes come from Tailwind theme tokens (`tailwind.config`) or existing CSS variables. No one-off hex values or arbitrary `[13px]`-style values scattered in components. If a token is missing, add it to the config once.
- **Typography is the personality.** Respect the established display/body pairing and type scale. Don't add font weights or sizes ad hoc.
- **Restraint.** One signature moment per section at most. If a change adds a second competing effect, cut one. Before finishing, remove one decoration (Chanel rule).
- **Real content.** Never ship lorem ipsum or placeholder headings. If copy is needed, write specific copy grounded in the product and flag it for review.
- **Quality floor:** responsive down to 375px, visible keyboard focus states, semantic HTML, `alt` text, and `prefers-reduced-motion` respected.

## Motion Rules (GSAP + ScrollTrigger + Lenis)

- Lenis drives scroll; ScrollTrigger must stay in sync. The established pattern (do not duplicate it per-component):
  ```js
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  ```
- Register plugins once (`gsap.registerPlugin(ScrollTrigger)`), at module scope, not inside components.
- All GSAP work inside components goes through `useGSAP()` (or `gsap.context()` + cleanup in `useEffect` return). Never create tweens/ScrollTriggers without cleanup — they leak across HMR and route changes.
- Animate `transform` and `opacity` only. Never animate `top/left/width/height` or trigger layout.
- Scroll animations must be scrubbed or short (< 0.8s), eased with intent (`power2.out`-family, not `elastic`/`bounce`), and never block reading. No scroll-jacking beyond what Lenis provides.
- Gate all non-essential motion behind `prefers-reduced-motion` (use `gsap.matchMedia()`).
- One orchestrated moment beats five scattered effects. Don't add hover/scroll effects to elements just because you touched them.

## Three.js / R3F Rules

- Keep the scene cheap: this is a landing page, not a game. Target 60fps on mid-range mobile.
- Use `frameloop="demand"` + `invalidate()` when the scene is static or only animates on scroll/interaction.
- Dispose of geometries, materials, and textures on unmount; prefer `drei` helpers (`useGLTF`, `useTexture`) which handle caching.
- Compress assets: draco/meshopt for models, KTX2/basis or sized WebP for textures. No multi-MB payloads in `public/`.
- `<Canvas>` mounts once. Don't unmount/remount it on scroll; toggle visibility or use `invalidate`.
- Wrap async scene content in `<Suspense>` with a non-jarring fallback (no spinner flash).

## Code Conventions

- Functional components, hooks, no class components.
- Components do one job. Page sections live in `src/components/`, named by what they are (`Hero.jsx`, not `Section1.jsx`).
- **Tailwind-first, always.** Style everything with Tailwind utility classes in JSX. Do not write new CSS files, do not add component-scoped CSS, and do not grow `index.css` — it exists only for design tokens (CSS variables, `@theme`/config), `@keyframes` that Tailwind can't express, and base resets. If you're about to write a CSS rule, find the Tailwind equivalent instead.
- No inline `style={}` except for values that are truly dynamic (GSAP-driven, measured at runtime). Static styling in `style={}` is never acceptable — convert it to Tailwind classes.
- When refactoring or touching a component that has stray CSS or inline styles, migrate them to Tailwind classes as part of the change.
- Run `npm run lint` after non-trivial changes (this is the one script you may run freely).

## Self-Review Before Finishing

1. Does this look like it belongs to *this* site, or to any AI-generated landing page? If the latter, redo it.
2. Did I add any banned pattern from the list above?
3. Did I introduce any hardcoded color/size outside the token system, any new CSS file, or any static inline styles? Convert to Tailwind classes.
4. Do all animations clean up, respect reduced motion, and stay off the layout thread?
5. Can I remove one thing and lose nothing? Then remove it.
