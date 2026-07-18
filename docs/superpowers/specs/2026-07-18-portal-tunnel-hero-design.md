# Portal Tunnel Hero — Design

**Date:** 2026-07-18
**Branch:** `hero`
**Status:** Approved by user (with constraints, see Non-Goals)

## Goal

Replace the current hero (MercuryField raymarched metaball shader + wordmark overlay)
with a scroll-driven **nested portal tunnel**: three rounded video portals the camera
dives through, ending in the normal page flow. Mobile-first is the top priority.
Reference genre: pmndrs `enter-portals` (chained), with `lamina`-style gradient
atmospheres and `cards-with-border-radius`-style rounded frames.

## Non-Goals / Constraints

- **Do not degrade the rest of the page.** SponsorsSection, VideoCards, StudentHook,
  Contact, Footer are liked as-is and must render/behave identically after the change.
  The hero's exit must hand off cleanly into SponsorsSection.
- **Every transition must be meaningful to the user**, not just technically neat.
  Each dive advances the pitch (a new fact + new footage), the tunnel is scrubbed
  (user controls it, can reverse), and it never blocks reading or trapping scroll.
- No scroll-jacking beyond Lenis. No new dependencies without asking
  (`@react-three/fiber`, `drei`, `gsap`, `lenis` already present; `lamina` is NOT
  installed — gradient atmospheres are hand-rolled shader/vertex-color backdrops).
- Existing brand system: Cabinet Grotesk display, lime `#C8FF00` on `#050505`,
  cta-pill, badge disc, LiquidLens cursor blob all stay.

## Experience

1. **First screen (must hold at 375px):** `Startathon.` wordmark, positioning line
   ("Kerala's most curated hackathon."), "Not everyone gets in.", Apply Now CTA —
   all above the fold. Portal #1 (rounded-rect window playing `hero-1.webm`) floats
   center-stage behind/among the copy. Badge disc docked bottom-right (unchanged).
2. **The tunnel:** hero pins for ~3 viewport-heights, scrub-driven. Camera moves
   through portal #1 → inside is portal #2 (`hero-2.webm`) → portal #3
   (`hero-3.webm`). Atmosphere (gradient backdrop) shifts per stage within the
   lime/near-black palette. Wordmark + CTA fade up/out during the first dive.
3. **Fact per threshold**, HTML synced to scroll progress:
   `30 hours` → `20 teams` → `₹2L prize pool`. One fact on screen at a time,
   each stated exactly once in the hero.
4. **Exit:** portal #3 fills the frame, hero unpins, SponsorsSection scrolls in
   normally. No layout shift at the seam.

## Architecture

- `src/components/PortalTunnel.jsx` — new; the single `<Canvas>` scene.
  Replaces `MercuryField.jsx`, which is **deleted** (no dead code).
- `Hero.jsx` — rewritten: mounts PortalTunnel, owns the pinned ScrollTrigger,
  the HTML overlay (wordmark, copy, CTA, facts), and keeps the badge disc code.
- Portals: rounded video cards (plane + canvas-generated rounded alphaMap +
  lime rim plane) at real depth (z = 0 / −10 / −20) in one fogged scene — NOT
  `MeshPortalMaterial` FBOs. The camera dollies through them; each card is
  opaque on approach, fills the frame at its crossing, and dissolves as the
  camera passes, revealing the next portal in the fog. Identical experience,
  zero render-target passes — the mobile-first choice.
- One ScrollTrigger with scrub drives: camera z, per-portal `blend`, HTML fact
  opacity. Pointer/touch adds small damped parallax (±2°).
- Canvas mounts once; `frameloop="demand"` + `invalidate()` from the scroll/pointer
  handlers.

## Mobile-first performance budget

- DPR capped at 1.5; portal FBO resolution capped (~1024).
- Only the active stage's world visible/rendered; at most 2 during a threshold
  crossing.
- Only the active stage's `<video>` plays; others paused on first frame
  (`preload="metadata"`, `muted`, `playsinline`, `loop`).
- Videos already in `public/videos` (hero-1/2/3, ~4.2 MB total). Known risk:
  WebM/VP9 does not decode on iOS Safari < 17.4 — fallback behavior below covers
  it; H.264 fallbacks are a separate follow-up if needed.

## Fallbacks

- `prefers-reduced-motion`: no pin, no dive — static composition of the three
  rounded frames (poster/first frames), page scrolls normally.
- WebGL unavailable or video error: same static fallback.

## Verification (puppeteer + lint)

Against the already-running dev server (never start it ourselves):

- Screenshots at 375×812, 768×1024, 1440×900 at scroll positions: top,
  mid-stage-1, each threshold, exit seam into Sponsors.
- Assert: CTA above fold at 375px; no horizontal overflow; no console errors;
  Sponsors/VideoCards/StudentHook/Contact/Footer visually unchanged.
- `npm run lint` passes.
