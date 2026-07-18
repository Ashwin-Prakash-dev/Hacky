# Prizes Odometer + Briefing Portal Orbit — Design

**Date:** 2026-07-18
**Branch:** `hero`
**Status:** Approved by user (Prizes: "Odometer vault"; Briefing: "R3F card orbit"
with the follow-up "render some 3d space behind the content, inside these cards
… hover the card to 3d view inside" — the enter-portals mechanic).

## Goals

1. **Prizes** (`src/components/Prizes.jsx`): fix pacing (pin feels long, reveal
   flat next to the portal-tunnel hero) while keeping the editorial board.
2. **Briefing** (`src/components/Briefing.jsx`): replace the 12-row spec-sheet
   with three physical cards holding real 3D spaces inside (MeshPortalMaterial),
   orbiting in a fogged stage; trim content to ~7 lines.

## Prizes — Odometer vault

- Layout unchanged (eyebrow, pool figure, 3-row ladder, 30·24·6 strip).
- The ₹2,00,000 becomes a mechanical counter: each digit is a vertical 0–9
  reel inside an overflow-hidden slot; the scrub rolls reels into place
  left-to-right. ₹ and commas are static. `tabular-nums` keeps slots rigid.
- Pacing: pin shortened `+=230%` → `+=150%`; hairlines sweep in the first
  beat; ladder rows slam in short overlapping windows while the counter is
  still rolling; stats strip lands with the final digit; end-hold ~0.25.
- Mobile (<768px): natural scroll as today; the counter does a once-through
  time-based roll (~1.2s) when the board enters view.
- Reduced motion / no-JS: finished board (existing rewind-inside-matchMedia
  pattern; digit reels default to the final digit position in the DOM).

## Briefing — Portal-card orbit

- One R3F `<Canvas>` (section-scoped). Three rounded portal cards
  (`THREE.Shape` rounded-rect `ShapeGeometry` + drei `MeshPortalMaterial`)
  spaced 120° apart on a ring, orbiting a center the camera faces.
- **Worlds inside** (the "3d space behind the content"): per-topic tinted
  space — fog-colored backdrop, one slowly-rotating wireframe primitive,
  lime dust — no external assets, no Environment presets (network-blocked
  aesthetics anyway). Distinct tint per card within the near-black family.
- **Scroll**: section pins `+=200%`; scrub drives the orbit through three
  stops (Expect → Mentors → Rules), with eased plateaus so each card faces
  the camera in turn. Non-facing cards recede into fog; their portal worlds
  stop rendering (visible=false) — at most one live portal FBO at a time.
- **Hover = look inside** (enter-portals): hovering the front card eases a
  `peek` value → camera dollies toward the card so the portal dominates,
  and pointer movement parallaxes the view into the world. Leaving eases
  back. Touch devices skip peek (scroll-scrub remains the interaction).
- **Text**: drei `<Html transform>` glass panel anchored to each card's
  lower third (existing mono/display classes) — crisp, selectable DOM.
  Content trimmed to 7 lines:
  - Expect — "30 hours: 24 build, 6 eval" · "20 curated teams — builders,
    not attendees"
  - Mentors — "Technical founders in the room" · "Real 1:1s at your table"
  - Rules — "Teams of 3–4" · "All code written inside the window" ·
    "Ship something deployable — slides don't count"
- Canvas parks offscreen (hardened IntersectionObserver pattern from
  PortalTunnel: never trust a bare false, recheck after mount).
- Reduced motion / no WebGL: no pin, no canvas — the three cards render as
  a plain stacked DOM column with the same copy.
- `data-lens="briefing"` and `id="briefing"` stay on the section.

## Constraints

- No new dependencies (drei's `MeshPortalMaterial` ships in the installed
  9.122; rounded geometry hand-built with `THREE.Shape`, not maath).
- Downstream sections unchanged; the page's section order is unchanged.
- Perf: dev GPU is a GT 730; at most one portal FBO live; DPR cap 1.5;
  fps-check hero→prizes→briefing scroll-through in puppeteer.
- Every fact appears once: Prizes owns the amounts and 30/24/6; Briefing
  owns team size / rules / mentors (its old "30-Hour Build Sprint" and
  "Curated Teams Only" rows merge into the two Expect lines).

## Verification

Puppeteer against the running dev server: desktop (1440×900) and mobile
(375×812) sweeps of both sections at multiple scrub positions, hover peek
check via `puppeteer_hover`, overflow check, fps sample, downstream sections
(VideoCards onward) compared against existing baselines. `npm run lint`.
