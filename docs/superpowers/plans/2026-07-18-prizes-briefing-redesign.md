# Prizes Odometer + Briefing Portal Orbit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prizes gets a scrub-driven digit-reel odometer with tightened pacing; Briefing becomes three orbiting portal cards with live 3D worlds inside (MeshPortalMaterial) and hover look-inside.

**Architecture:** Prizes stays DOM+GSAP — each pool digit becomes a 10-item vertical reel whose resting CSS state is the final digit (no-JS safe), rolled by the existing pinned timeline (shortened to +=150%). Briefing is rewritten around a section-scoped R3F Canvas: three rounded ShapeGeometry portals on a 120° ring, group rotation scrubbed through plateaued stops by a pinned ScrollTrigger via `progressRef`; card text is drei `<Html transform>` DOM; hover eases a damped `peek` that dollies the camera and parallaxes the world. A shared `useParkedFrameloop` hook (extracted from PortalTunnel) parks both canvases offscreen.

**Tech Stack:** React 18, GSAP 3 + ScrollTrigger, @react-three/fiber 8, @react-three/drei 9 (`MeshPortalMaterial`, `Html`), three 0.184.

## Global Constraints

- NEVER run dev/build/preview/deploy; dev server runs at `http://localhost:3000`. `npm run lint` free to run.
- No new dependencies; no maath import (hand-built `THREE.Shape` rounded plane); no drei `Environment` presets (external fetch).
- Downstream sections and section order unchanged. `id="briefing"`, `data-lens="briefing"`, `id="prizes"`, `data-lens="prizes"` preserved.
- Reduced motion / no-WebGL: Prizes shows the finished board (existing pattern); Briefing renders a stacked DOM column, no canvas, no pin.
- Copy (each fact once): Expect = "30 hours — 24 build, 6 eval" / "20 curated teams — builders, not attendees"; Mentors = "Technical founders in the room" / "Real 1:1s at your table"; Rules = "Teams of 3–4" / "All code written inside the window" / "Ship something deployable — slides don't count".
- Perf: at most one meaningfully-populated portal world at a time (proximity-gated contents), DPR ≤ 1.5, fps-checked on the dev GPU.

---

### Task 1: Prizes odometer + pacing

**Files:**
- Modify: `src/components/Prizes.jsx`

**Interfaces:**
- Produces: unchanged `Prizes` default export. New internal `Reel` component and `pz-reel` GSAP hook class.

- [ ] **Step 1: Add the Reel and rewire the pool heading**

Replace the `₹2,00,000` text node with static `₹`/commas + one `Reel` per digit. Reel column lists the 9 digits after the target (mod 10) then the target last; the resting Tailwind class `-translate-y-[90%]` shows the target (no-JS/reduced-motion safe); GSAP rolls `yPercent` 0 → −90.

```jsx
// a slot-machine digit: nine decoys then the real digit; the resting CSS
// transform already shows the real one, GSAP rolls to it from the top
const Reel = ({ digit }) => {
  const d = Number(digit);
  const column = Array.from({ length: 10 }, (_, k) => (d + 1 + k) % 10);
  return (
    <span className="inline-block h-[1em] overflow-hidden align-baseline">
      <span className="pz-reel block -translate-y-[90%]">
        {column.map((n, k) => (
          <span key={k} className="block h-[1em] leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
};

const POOL = "2,00,000";
```

Heading JSX:

```jsx
<h2 className="font-display text-[clamp(2.9rem,9vw,7rem)] font-extrabold leading-[0.95] tracking-[-0.02em] text-lime [font-variant-numeric:tabular-nums]">
  ₹
  {POOL.split("").map((ch, i) =>
    ch === "," ? <span key={i}>,</span> : <Reel key={i} digit={ch} />
  )}
</h2>
```

- [ ] **Step 2: Retime the desktop timeline**

Replace the desktop timeline body (keep trigger/pin structure, change `end` to `+=150%`):

```js
gsap.set(q(".pz-reel"), { yPercent: 0 });
// board draws fast, reels roll through most of the pin, rows slam in
// while the counter is still moving, stats land with the last digit
tl.to(q(".pz-rule"), { scaleX: 1, duration: 0.5, stagger: 0.06, ease: "power2.inOut" }, 0);
tl.to(q(".pz-fade"), { autoAlpha: 1, duration: 0.35 }, 0.05);
tl.to(q(".pz-l-pool"), { yPercent: 0, duration: 0.45 }, 0.1);
tl.to(q(".pz-reel"), { yPercent: -90, duration: 1.7, stagger: 0.12, ease: "power2.out" }, 0.25);
tl.to(q(".pz-l-03"), { yPercent: 0, duration: 0.4 }, 0.7);
tl.to(q(".pz-l-02"), { yPercent: 0, duration: 0.4 }, 1.0);
tl.to(q(".pz-l-01"), { yPercent: 0, duration: 0.4 }, 1.3);
tl.to(q(".pz-stats"), { autoAlpha: 1, y: 0, duration: 0.4 }, 1.8);
tl.to({}, { duration: 0.25 });
```

(The rewind `gsap.set` block gains `pz-reel → yPercent: 0` alongside the existing sets.)

- [ ] **Step 3: Mobile once-through roll**

In the mobile branch add, after the pool line reveal:

```js
tl.fromTo(
  q(".pz-reel"),
  { yPercent: 0 },
  { yPercent: -90, duration: 1.2, stagger: 0.08, ease: "power2.out" },
  0.15
);
```

- [ ] **Step 4: Verify in browser + lint**

Puppeteer 1440×900: scroll into the prizes pin at ~25% / 60% / 95% — digits mid-roll at 25% (mixed numerals visible), rows land while rolling, finished board with stats at 95%; mobile 375×812 natural-scroll entry shows the roll once. `npm run lint` — only pre-existing issues.

- [ ] **Step 5: Commit**

```bash
git add src/components/Prizes.jsx
git commit -m "feat: prizes odometer — scrub-rolled digit reels, tightened pin"
```

---

### Task 2: Shared frameloop hook + Briefing portal orbit

**Files:**
- Create: `src/lib/useParkedFrameloop.js`
- Modify: `src/components/PortalTunnel.jsx` (swap inline IO for the hook)
- Modify: `src/components/Briefing.jsx` (full rewrite)

**Interfaces:**
- Produces: `useParkedFrameloop(wrapRef) → "always" | "never"` — the hardened offscreen-parking state; `Briefing` default export unchanged for MainPage.

- [ ] **Step 1: Extract the hook**

`src/lib/useParkedFrameloop.js`:

```js
import { useEffect, useState } from "react";

// "always" while the wrapper is on screen, "never" when it is not — with
// two defenses learned in PortalTunnel: GSAP's pin re-parent can feed the
// observer one stale "not intersecting" record and go quiet, so a bare
// false is double-checked against the live rect, and a one-shot recheck
// runs after the pin has settled.
export default function useParkedFrameloop(wrapRef) {
  const [frameloop, setFrameloop] = useState("always");
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const onScreen = (r) => r.bottom > 0 && r.top < window.innerHeight;
    const io = new IntersectionObserver(([entry]) => {
      setFrameloop(
        entry.isIntersecting || onScreen(el.getBoundingClientRect())
          ? "always"
          : "never"
      );
    });
    io.observe(el);
    const settle = setTimeout(() => {
      if (onScreen(el.getBoundingClientRect())) setFrameloop("always");
    }, 400);
    return () => {
      io.disconnect();
      clearTimeout(settle);
    };
  }, [wrapRef]);
  return frameloop;
}
```

PortalTunnel: delete its inline IO effect + `frameloop` state, `const frameloop = useParkedFrameloop(wrapRef);`.

- [ ] **Step 2: Rewrite Briefing.jsx**

Complete file (structure; exact numbers are the tuning knobs):

```jsx
/* eslint-disable react/no-unknown-property -- r3f elements take three.js
   props, not DOM attributes */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshPortalMaterial, Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useParkedFrameloop from "../lib/useParkedFrameloop";

gsap.registerPlugin(ScrollTrigger);

// The briefing: three portal cards on a ring, each a window into its own
// small tinted space (enter-portals). The pinned section scrubs the ring
// through three stops; hovering the front card dollies in for a look
// inside. Text is real DOM (drei Html) so it stays crisp and selectable.

const CARDS = [
  {
    id: "expect",
    title: "What to expect",
    tint: "#0b0e05",
    geo: "torus",
    lines: [
      ["30 hours", "24 build, 6 eval"],
      ["20 curated teams", "builders, not attendees"],
    ],
  },
  {
    id: "mentors",
    title: "Mentors",
    tint: "#060910",
    geo: "icosa",
    lines: [
      ["Technical founders", "in the room"],
      ["Real 1:1s", "at your table"],
    ],
  },
  {
    id: "rules",
    title: "Rules",
    tint: "#0a0708",
    geo: "octa",
    lines: [
      ["Teams of 3–4", ""],
      ["All code written inside the window", ""],
      ["Ship something deployable", "slides don't count"],
    ],
  },
];

const RING_R = 4.2;
const CAM_Z = 9.4; // desktop; portrait uses 11.6
const STEP = (Math.PI * 2) / 3;

const makeRoundedPlane = (w, h, r) => { /* THREE.Shape rounded rect →
  ShapeGeometry(s, 12) — full code in component file */ };

// plateaued stop easing: p ∈ [0,1] → 0..2 with holds at 0/1/2
const stopEase = (p) => {
  const t = Math.min(1.9999, Math.max(0, p * 2));
  const seg = Math.floor(t);
  const local = t - seg;
  const s = THREE.MathUtils.smoothstep(local, 0.25, 0.75);
  return seg + s;
};

const World = ({ tint, geo, nearRef }) => { /* <color attach="background">,
  <fog>, slowly rotating wireframe primitive + ~40 dust points inside a
  group whose visible = nearRef.current — full code in file */ };

const PortalCard = ({ index, card, geometry, progressRef, peekRef, hoverHandlers, portrait }) => {
  /* group at ring angle; mesh with MeshPortalMaterial (DoubleSide) whose
     children = <World>; dark rounded back-plane behind; Html transform
     panel anchored to the lower third with title + lines; world contents
     gated by |stopEase(p) − index| < 0.75 via a ref the World reads */
};

const OrbitRig = ({ progressRef, peekRef, pointerRef }) => {
  /* useFrame: ringGroup.rotation.y = -stopEase(p) * STEP;
     camera.position.z = camZ − peek * 2.4; camera.lookAt(0,0,RING_R);
     peek damped toward peekTarget; pointer feeds world parallax refs */
};

const Briefing = () => {
  /* webgl + reduced checks (same helpers as Hero);
     - fallback: stacked DOM cards (title + lines, bezel styling), no pin
     - live: <section> → pinned h-dvh stage div with:
         top-left mono indicator "0N / title" (state from stop index),
         <Canvas flat dpr={[1,1.5]} frameloop={useParkedFrameloop(wrapRef)}>
           scene fog #050505, ring group with 3 PortalCards, OrbitRig
         </Canvas>
     - ScrollTrigger: trigger section, start "top top", end "+=200%",
       scrub, pin, onUpdate → progressRef + setActive(round(stopEase(p)))
       (state change only when the index actually changes)
     - hover: portal mesh + Html panel onPointerOver/Out → peekTarget 1/0,
       skipped when (hover:none) */
};

export default Briefing;
```

- [ ] **Step 3: Verify in browser**

Desktop 1440×900: stop 1 shows Expect card front with its world visible through the portal; mid-scrub shows the ring turning with card backs in fog; stops 2/3 land Mentors/Rules; `puppeteer_hover` over the front card dollies in (screenshot before/after); text crisp/selectable. Mobile 375×812: card fits the frame at each stop, no overflow. Confirm at most one populated world (screenshot during transition shows the incoming world only when within the gate window).

- [ ] **Step 4: Lint + commit**

```bash
npm run lint   # only pre-existing issues
git add src/lib/useParkedFrameloop.js src/components/PortalTunnel.jsx src/components/Briefing.jsx
git commit -m "feat: briefing portal orbit — MeshPortalMaterial worlds, hover peek"
```

---

### Task 3: Full-page sweep

- [ ] Hero → Prizes → Briefing scroll-through at 1440×900 and 375×812 (seams, pacing, no horizontal overflow at any stop).
- [ ] fps sample inside Briefing pin and at the Prizes/Briefing boundary (target ≥ 45 headless).
- [ ] Downstream (VideoCards, StudentHook, Contact, Footer) vs baselines — unchanged.
- [ ] Hero regression: canvas still parks after its pin (hook refactor), first video still plays.
- [ ] `npm run lint`; commit any tuning as `polish:`; update auto-memory.

## Self-review notes

- Spec coverage: odometer + pacing (T1), portal worlds + hover peek + trimmed copy (T2), fallbacks (T2 fallback branch), one-live-world gating (T2), shared parking hook (T2.1), verification (T1.4/T2.3/T3).
- The Briefing file is the one place where full code lands at implementation time; the plan pins its structure, constants, and every behavioral contract (stops, gate window 0.75, peek dolly 2.4, plateau smoothstep 0.25–0.75) so the implementer has no open decisions.
