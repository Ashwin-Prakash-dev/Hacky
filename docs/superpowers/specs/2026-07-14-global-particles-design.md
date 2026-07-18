# Global Particle System — Design

**Date:** 2026-07-14
**Status:** Approved (architecture A; all sections specced, single implementation may be phased)

## Goal

Promote the hero's particle system (`src/components/HeroParticles.jsx`) to a single site-wide
system on the main page. Particles persist for the whole visit and the flock is finite — it
lives in exactly one section at a time. The hero movie plays as today; when ownership moves to
another section the whole flock migrates there, pouring through a narrow vertical stream before
fanning into the new section's formation. Each section has a bespoke interaction — most
importantly the sponsor cards, where the flock rushes to and orbits whichever card is hovered.
(Revised 2026-07-14: the stream is transit-only — it exists during section handoffs, not as a
constant ambient river.)

## Decisions made

- **Scope:** every section on `MainPage` gets bespoke behavior, specced now in one document.
- **Architecture:** one fixed full-viewport canvas + per-frame director (option A).
- **Hero movie on scroll-away:** abandon into stream; scrolling back up shows the settled
  "Startathon." wordmark (movie does not resume).
- **Mobile:** hero movie only (flock rests in the cloud past the hero); hover-driven behaviors
  and formations disabled.
- **Perf priority:** smoothness first — 3200 particles desktop / 1400 mobile, adaptive DPR.

## Architecture

### Canvas placement

`GlobalParticles` is rendered once in `MainPage`, as a `position: fixed; inset: 0;
pointer-events: none` layer: above section backgrounds, below `NavBar`, `CustomCursor`,
`ScrollProgress`. The canvas is transparent (`alpha: true`) — the opaque `#050505` background
moves from the canvas style to the Hero section's own background. `frameloop="always"`
(the canvas is always on-screen); the existing hero `IntersectionObserver` gating is removed.

### Coordinate bridge

Because the canvas is fixed, world space maps 1:1 to screen space via the existing r3f
`viewport` math: `world = (screenNdc) * viewport/2`. A helper `rectToWorld(domRect)` converts
`getBoundingClientRect()` output to world-space center/size. Scrolling moves DOM targets
through the fixed canvas naturally — no scroll offset bookkeeping inside behaviors.

### Target registry (`registry.js`)

A plain module (no React context, no re-renders):

- `registerTarget(id, ref, meta)` / `unregisterTarget(id)` — sections register interactive
  DOM elements (sponsor cards, stat digits, timeline nodes, CTA button, terminal box, FAQ items).
- `setHovered(id | null)`, `setOpen(id, bool)` (FAQ), `emit(event)` (e.g. `access-granted`).
- Rects are read from refs and cached once per scroll tick (Lenis `scroll` event) plus on
  `resize`, never per frame.

Sections integrate via a small hook, `useParticleTarget(id, meta)`, that registers a ref and
returns hover/open setters (~3 lines per call site).

### Director

A per-frame state machine inside the r3f render loop:

1. Reads scroll position (ScrollTrigger/Lenis) and the registry's hover/event state.
2. Determines the owning behavior: the section whose bounds contain the viewport's vertical
   center (ties broken by page order), else the default **stream**. Exactly one section behavior + the stream are active
   at a time.
3. Calls the behavior's target-generator: for each particle index it may claim the particle and
   return a target `(x, y, z)` plus urgency; unclaimed particles rest in a loose drifting cloud
   around the active section.
4. Existing per-particle machinery is reused unchanged: spring/wake physics, ambient breathing,
   `rands`-based stagger, `easeOutCubic` morphs, toon material, instanced mesh.

**Transitions (the stream):** on ownership change, every particle's target pinches into a
narrow vertical column for ~1.6s (staggered per particle) with capped travel speed, so the
finite flock visibly streams from the old section to the new one, then fans out into the new
formation. Once settled there is no ambient stream.

### Behaviors are target generators

Each behavior is one function `(ctx) => claims` of ~30–60 lines. Shared primitives in
`primitives.js`:

- `racetrack(rect, t)` — orbit a rect's border in a loop.
- `silhouette(text | draw)` — rasterized shape sampling (existing `samplePoints` machinery).
- `underline(rect, t)` — thin line beneath an element.
- `burst(center, t)` — outward explosion with decay.
(The transit stream is engine-level, not a primitive: target pinching during handoffs.)

## Behavior catalog

| Section | Behavior |
|---|---|
| **Transit stream** (handoff only) | When section ownership changes, all particles pinch into a narrow vertical column and pour to the new section at capped speed, then fan out. No constant ambient stream — settled particles rest in a loose cloud around the active section. |
| **Hero** | Current movie unchanged (KEYS timeline, analytic walk/table scenes, static rasterized scenes). Scroll-away streams the flock to the next section; return forms resting "Startathon." wordmark. |
| **Sponsors** | Idle: thin halo drifting around all three cards. Hover: flock rushes to the hovered card, orbits its border (racetrack); switching cards re-rushes. Touch: skipped. |
| **VideoCards** | Marching-ants racetrack border around the hovered builder card — frames, never covers the video. |
| **Stats** | As counters tick, particles condense into the digits' silhouettes, then burst outward when each counter lands. |
| **StudentHook** | Particle underline traces beneath the active outcome row as it enters view, 01 → 02 → 03. |
| **Marquee** | Horizontal "wind" gust — particles caught sideways as the section passes, then back to stream. |
| **TerminalBridge** | Blinking block cursor beside the terminal; confetti burst on the `ACCESS GRANTED` line. |
| **Timeline** | Particles trace the timeline spine, pooling briefly at each node as it enters the viewport. |
| **FAQ** | Particles form `?`; morphs to `!` while any item is open. |
| **Contact** | Particles form `@` near the CTA; hovering the main button tightens them into a racetrack around it. |
| **Footer** | Stream drains into a small final "S." — bookending the hero. |

## Performance

- Single instanced-mesh pool: 3200 desktop / 1400 mobile. No per-section allocation.
- Adaptive DPR + `PerformanceMonitor` kept exactly as today.
- One behavior active per frame; unclaimed particles cost only the resting-cloud math.
- DOM rect reads cached per scroll tick and resize, not per frame.
- Silhouette shapes (digits, `?`, `!`, `@`, `S.`) rasterized once at startup alongside the
  existing hero shapes; no runtime canvas sampling during scroll.

## Mobile & fallbacks

- **Mobile** (`max-width: 767px`): hero movie only; past the hero the flock rests in the
  drifting cloud. All hover/formation behaviors off.
- **Reduced motion / no WebGL** (`canUseParticles()` false): `StaticHeroBackground` gradient in
  the hero, nothing elsewhere. `CanvasErrorBoundary` wraps the canvas with the same fallback.

## File structure

`src/components/HeroParticles.jsx` splits into `src/components/particles/`:

- `GlobalParticles.jsx` — canvas, director, particle pool, transit-stream integration.
- `behaviors.js` — one target generator per section (single module).
- `primitives.js` — racetrack, glyph formation, underline, burst helpers.
- `registry.js` — DOM scan + hover delegation + event state.
- `shapes.js` — existing rasterizer, analytic walk/table scenes, `buildTargets` (moved,
  unchanged) + glyph rasterizer.

Sections integrate via data attributes (`data-particles`, `data-particle-target`,
`data-particle-hover`) scanned by the registry — no per-section hook needed; FAQ and
TerminalBridge additionally call the registry's `faqDelta`/`emit` directly.
`Hero.jsx` loses its canvas (keeps the static gradient backdrop); `MainPage.jsx` renders
`<GlobalParticles started={introComplete} />` behind `<main>`.

## Testing

- Generalize the `?heroT=` debug param to `?pstate=<behavior>[-hover]` to force any behavior
  instantly (e.g. `?pstate=sponsors-hover`).
- Visual verification per section on desktop + mobile viewport; frame-rate spot check while
  scrolling fast through the whole page.
- `npm run lint` clean.

## Out of scope

- Other routes (`/apply`, `/team`, …) — main page only.
- Tap-triggered mobile equivalents of hover behaviors (possible later phase).
- Any change to section content/layout beyond registering refs.
