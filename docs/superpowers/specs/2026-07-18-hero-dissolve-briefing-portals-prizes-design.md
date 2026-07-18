# Hero Dissolve + Briefing Portal-Orbit + Prizes Odometer — Design

**Date:** 2026-07-18
**Branch:** `hero`
**Status:** Approved by user (directions chosen via Q&A; supersedes the
portal-tunnel hero from `2026-07-18-portal-tunnel-hero-design.md`)

## A. Hero — single video, pixel disintegration

The three-portal tunnel "doesn't work well" (user). Replace with:

- **One full-background video**: `/videos/hero-1.webm` (launch/founders
  montage), cover-cropped, muted loop, playing while the hero is on screen.
- **Scroll effect**: hero pins for `+=100%`. Scrubbing disintegrates the
  video **bottom → top in large pixels**: cells (~28 columns) mosaic-quantize,
  flicker briefly, shrink and vanish with per-cell random stagger along a
  rising front, revealing the fogged atmosphere + lime dust behind. Fully
  reversible. Atmosphere tint eases to `#050505` by p=1 (invisible seam
  into Sponsors).
- **Copy changes**: the tunnel fact lines (30 hours / 20 teams / Ship
  something real) are DELETED. The top-left positioning line "Kerala's
  most curated hackathon." is DELETED (sr-only copy in the h1 keeps the
  long-form description). Wordmark, "Not everyone gets in.", CTAs,
  date/venue facts, and the badge disc stay, persist through the whole
  pin, and scroll out with the section.
- **Implementation**: `PortalTunnel.jsx` is replaced by `HeroDissolve.jsx`
  — fullscreen quad + custom ShaderMaterial (video texture, cover-crop in
  shader, cell hash, death threshold = cellY-weighted + jitter, mosaic →
  shrink → transparent), Dust points behind, static camera. `progressRef`
  drives the dissolve uniform. Canvas parks offscreen (hardened IO
  pattern). Reduced motion: no pin, video paused as a still background.
  No WebGL: StaticHeroBackground gradient.

## B. Briefing — orbiting portal cards (enter-portals style)

Replaces the three hairline tables ("shittiest component").

- **Structure**: section pins for `+=200%`; a full-viewport R3F canvas
  holds three rounded portal cards at 120° on a Y-orbit (radius ≈ 3.2).
  Scrub rotates the orbit through three stops — Expect → Mentors → Rules —
  each card swinging to face the camera.
- **Portal worlds**: each card is a rounded-rect ShapeGeometry +
  `MeshPortalMaterial`; inside is a real 3D space — per-card tinted fog,
  lime dust, and one slow-tumbling lime wireframe solid (icosahedron /
  torus-knot / octahedron respectively). Hover tilts the card a few
  degrees toward the pointer so the world's parallax reads ("look
  inside"), per the pmndrs enter-portals reference.
- **Content in front**: drei `<Html transform>` panel anchored to each
  card — heading + lines in real DOM (crisp, selectable). Front-facing
  card full opacity; others dim via CSS transition keyed to the active
  stop.
- **Copy trim (12 rows → 7 lines)**:
  - Expect — "30 hours: 24 build, 6 eval" · "20 curated teams — builders,
    not attendees"
  - Mentors — "Technical founders in the room" · "Real 1:1s at your table"
  - Rules — "Teams of 3–4" · "All code written inside the window" ·
    "Ship something deployable — slides don't count"
- **Fallbacks**: reduced motion or no WebGL → no pin, no canvas; the three
  cards render as a plain stacked DOM column with the same copy. Mobile
  keeps the orbit (scroll-driven works on touch), card + type sized for
  375px. Canvas parks offscreen.
- **Files**: `Briefing.jsx` (shell, copy data, DOM fallback) +
  `BriefingPortals.jsx` (canvas). The old table markup and `.bf-*`
  animations are deleted.

## C. Prizes — odometer vault

Keeps the editorial board; fixes pacing and flatness.

- **Odometer**: each digit of ₹2,00,000 is a vertical reel in an
  overflow-hidden slot (`tabular-nums`); the scrub rolls reels
  left-to-right through a digit column that ENDS on the target digit at
  transform 0 — so no-JS/reduced-motion users see the correct finished
  figure by default. ₹ and commas are static.
- **Pacing**: pin drops `+=230%` → `+=150%`, scrub 0.6. Hairlines sweep in
  the first beat; ladder rows slam in with short overlapping windows while
  the reels are still rolling; the 30·24·6 strip lands with the last
  digit; the long tail hold is cut to a beat (~0.2).
- **Mobile**: natural scroll (no pin); entering the viewport triggers a
  once-through time-based roll (~1.2s, staggered) + row stagger.
- Ladder amounts, copy, and the existing masked-line grammar stay.

## Global constraints (unchanged from previous spec)

Downstream sections (Sponsors, VideoCards, StudentHook, Contact, Footer)
stay pixel-identical. No new dependencies. Brand system tokens only.
Transitions must be meaningful — every effect encodes something true
(video gives way to the void the page lives in; the briefing worlds are
literally inside the cards; the pool figure is mechanically assembled).
Verification: puppeteer matrix at 375 / 768 / 1440 across scroll
positions + `npm run lint`.
