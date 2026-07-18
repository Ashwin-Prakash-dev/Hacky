# Portal Tunnel Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the MercuryField hero with a scroll-scrubbed portal tunnel — three rounded video cards at real depth the camera dives through — mobile-first, verified with puppeteer.

**Architecture:** One R3F `<Canvas>` (`PortalTunnel.jsx`) holds three rounded video cards at z = 0 / −10 / −20 in a fogged near-black atmosphere. `Hero.jsx` pins for +300% and scrubs a ScrollTrigger whose progress drives the camera dolly (via a shared `progressRef`), the HTML overlay fade, and three fact lines. Each card is opaque on approach, fills the viewport at its crossing (p ≈ 0.10 / 0.44 / 0.77), and dissolves as the camera passes. No FBOs, no MeshPortalMaterial.

**Tech Stack:** React 18, @react-three/fiber 8, @react-three/drei 9 (`useVideoTexture`), three 0.184, GSAP 3 + ScrollTrigger + @gsap/react, Lenis (already wired in MainPage), Tailwind.

## Global Constraints

- NEVER run `npm run dev` / `build` / `preview` / `deploy` — dev server is already running at `http://localhost:3000`. If unreachable, STOP and ask the user to start it.
- `npm run lint` is the only script you may run freely; run it after each task.
- No new dependencies. `lamina` is NOT installed — do not import it.
- Downstream sections (SponsorsSection, VideoCards, StudentHook, Contact, Footer) must be pixel-identical after the change. Do not touch their files.
- Brand system stays: lime `#C8FF00` on `#050505`, `font-display` (Cabinet Grotesk), `.cta-pill`, `.hero-heading`, badge disc, LiquidLens.
- Tailwind-first: no new CSS files, no static inline `style={}`. WebGL scene colors in JS are fine (same as MercuryField did).
- All GSAP inside components via `useGSAP` with scope; animate transform/opacity only; scrub everything scroll-driven; `prefers-reduced-motion` gets the static composition (no pin, no dive).
- Videos: `/videos/hero-1.webm`, `/videos/hero-2.webm`, `/videos/hero-3.webm` (already in `public/`). Only the active stage's video plays.
- Copy dedup rule (each fact said once in the hero): wordmark tagline ("30 hours · 20 teams · ship something real") is REMOVED; the tunnel fact lines say `30 hours` → `20 teams` → `Ship something real`; the badge disc keeps `2L+ PRIZE POOL · LIMITED TEAMS ONLY`; date/venue stay in the corner facts.
- No test runner exists in this repo — verification is puppeteer MCP + `npm run lint` (do not add a test framework).

---

### Task 1: Baseline screenshots + `PortalTunnel.jsx`

**Files:**
- Create: `src/components/PortalTunnel.jsx`
- Baseline screenshots only (no code changes elsewhere yet)

**Interfaces:**
- Produces: `export default PortalTunnel`, props `{ progressRef, staticMode = false }`. `progressRef` is a plain React ref object; `progressRef.current` ∈ [0,1] is read every frame. `staticMode: true` renders the reduced-motion composition (camera fixed, three cards scattered, videos paused).

- [ ] **Step 1: Capture the downstream baseline**

Using puppeteer MCP tools:

1. `puppeteer_navigate` → `http://localhost:3000`. If this fails, STOP and ask the user to start the dev server.
2. `puppeteer_evaluate`: `sessionStorage.setItem("startathon:intro-seen", "1"); location.reload();` (skips the Intro overlay), wait for reload.
3. For each of Sponsors, VideoCards, StudentHook, Contact, Footer: `puppeteer_evaluate` `document.querySelector("footer, #contact, ...")?.scrollIntoView()` — practical approach: `window.scrollTo(0, y)` for y = a sweep (e.g. 1500, 4000, 7000, 9500, 12000), waiting ~1.2s after each for Lenis to settle, then `puppeteer_screenshot` (name them `baseline-<y>`, width 1440, height 900).
4. Also capture `baseline-hero-mobile` at width 375 height 812, scroll 0.

These are the comparison references for Task 3.

- [ ] **Step 2: Write `src/components/PortalTunnel.jsx`**

Complete file:

```jsx
/* eslint-disable react/no-unknown-property -- r3f elements take three.js
   props, not DOM attributes */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// The hero's portal tunnel: three rounded video cards hang at increasing
// depth in a fogged near-black atmosphere. The pinned hero scrubs the
// camera straight down -z: each card grows until it fills the frame (its
// fullscreen moment), dissolves as the camera crosses its plane, and the
// next portal emerges from the fog. Real depth, one draw per card, no
// render targets — cheap enough for mid-range phones. Lime dust specks
// exist only to make the dolly's speed legible between cards.

const STAGE_GAP = 10;
const CAM_START = 6;
const CAM_END = -(STAGE_GAP * 2) - 4; // 4 units past the last card
const CAM_TRAVEL = CAM_START - CAM_END; // 30

// per-stage atmosphere tints (scene background + fog); the exit tint is
// the page ground so the unpin seam into Sponsors is invisible
const STAGES = [
  { src: "/videos/hero-1.webm", tint: "#0b0e05" },
  { src: "/videos/hero-2.webm", tint: "#060910" },
  { src: "/videos/hero-3.webm", tint: "#0a0a08" },
];
const EXIT_TINT = "#050505";
const TINT_STOPS = [0, 0.44, 0.77, 1];

// lateral drift per card so the dive isn't a dead-straight corridor
const CARD_OFFSETS = [
  [0, -0.05],
  [0.55, -0.25],
  [-0.45, 0.2],
];
// reduced-motion composition: all three cards at rest, no dolly
const STATIC_POSES = [
  [0, 0.15, 0],
  [-2.1, -1.25, -3],
  [2.2, -1.4, -4],
];

const makeRoundedAlpha = (aspect) => {
  const W = 512;
  const H = Math.round(512 / aspect);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(2, 2, W - 4, H - 4, 46);
  ctx.fill();
  return new THREE.CanvasTexture(c);
};

// crop the video like CSS object-fit: cover
const coverCrop = (tex, planeAspect) => {
  const v = tex.image;
  const va = v && v.videoWidth ? v.videoWidth / v.videoHeight : 16 / 9;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  if (va > planeAspect) {
    tex.repeat.set(planeAspect / va, 1);
    tex.offset.set((1 - planeAspect / va) / 2, 0);
  } else {
    tex.repeat.set(1, va / planeAspect);
    tex.offset.set(0, (1 - va / planeAspect) / 2);
  }
};

const PortalCard = ({
  index,
  src,
  planeW,
  planeH,
  alphaMap,
  staticMode,
  videosRef,
}) => {
  const groupRef = useRef(null);
  const videoMatRef = useRef(null);
  const rimMatRef = useRef(null);
  const invalidate = useThree((s) => s.invalidate);
  const texture = useVideoTexture(src, {
    start: false,
    muted: true,
    loop: true,
    playsInline: true,
  });

  useEffect(() => {
    coverCrop(texture, planeW / planeH);
    const video = texture.image;
    videosRef.current[index] = video;
    // nudge off t=0 so a paused element still yields a decoded frame
    const onSeeked = () => {
      texture.needsUpdate = true;
      invalidate();
    };
    video.addEventListener("seeked", onSeeked);
    try {
      video.currentTime = 0.01;
    } catch {
      /* not seekable yet — the play() path will paint instead */
    }
    return () => {
      video.removeEventListener("seeked", onSeeked);
      videosRef.current[index] = null;
    };
  }, [texture, index, planeW, planeH, videosRef, invalidate]);

  const frameZ = -index * STAGE_GAP;
  const pos = staticMode
    ? STATIC_POSES[index]
    : [CARD_OFFSETS[index][0], CARD_OFFSETS[index][1], frameZ];

  useFrame(({ camera }) => {
    if (staticMode) return;
    const d = camera.position.z - frameZ;
    // opaque on approach; dissolves in the last unit before the camera
    // crosses the card's plane (the card already over-fills the frame)
    const fade = THREE.MathUtils.clamp((d - 0.3) / 0.9, 0, 1);
    if (videoMatRef.current) videoMatRef.current.opacity = fade;
    if (rimMatRef.current) rimMatRef.current.opacity = fade * 0.9;
    if (groupRef.current) groupRef.current.visible = fade > 0.001;
  });

  return (
    <group
      ref={groupRef}
      position={pos}
      scale={staticMode && index > 0 ? 0.55 : 1}
    >
      {/* rim: a slightly larger lime rounded-rect behind the video reads
          as the portal's frame */}
      <mesh position-z={-0.03} scale={[1.045, 1.045, 1]}>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial
          ref={rimMatRef}
          color="#C8FF00"
          alphaMap={alphaMap}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial
          ref={videoMatRef}
          map={texture}
          alphaMap={alphaMap}
          transparent
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

const Atmosphere = ({ progressRef, staticMode }) => {
  const scene = useThree((s) => s.scene);
  const colors = useMemo(
    () => [
      ...STAGES.map((s) => new THREE.Color(s.tint)),
      new THREE.Color(EXIT_TINT),
    ],
    []
  );
  const bg = useMemo(() => colors[0].clone(), [colors]);

  useEffect(() => {
    scene.background = bg;
    scene.fog = new THREE.Fog(bg, 7, 24);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, bg]);

  useFrame(() => {
    const p = staticMode ? 0 : progressRef.current;
    let i = TINT_STOPS.length - 2;
    for (let k = 0; k < TINT_STOPS.length - 1; k += 1) {
      if (p <= TINT_STOPS[k + 1]) {
        i = k;
        break;
      }
    }
    const span = TINT_STOPS[i + 1] - TINT_STOPS[i];
    const t = THREE.MathUtils.clamp((p - TINT_STOPS[i]) / span, 0, 1);
    bg.copy(colors[i]).lerp(colors[i + 1], t);
  });

  return null;
};

const Dust = () => {
  const positions = useMemo(() => {
    const arr = new Float32Array(70 * 3);
    for (let i = 0; i < 70; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = 5 - Math.random() * 31;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={70}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#C8FF00"
        transparent
        opacity={0.3}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

const CameraRig = ({ progressRef, staticMode }) => {
  const pointer = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (staticMode) return undefined;
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [staticMode]);

  useFrame(({ camera }, delta) => {
    const p = staticMode ? 0 : progressRef.current;
    const z = CAM_START - CAM_TRAVEL * p;
    const k = 1 - Math.exp(-4 * delta);
    eased.current.x += (pointer.current.x - eased.current.x) * k;
    eased.current.y += (pointer.current.y - eased.current.y) * k;
    camera.position.set(eased.current.x * 0.35, -eased.current.y * 0.22, z);
    camera.lookAt(eased.current.x * 0.1, -eased.current.y * 0.06, z - 6);
  });

  return null;
};

// plays exactly one video — the stage the camera is inside
const VideoDirector = ({ progressRef, videosRef, staticMode }) => {
  const activeRef = useRef(-1);
  useFrame(() => {
    if (staticMode) return;
    const p = progressRef.current;
    const active = p < 0.2 ? 0 : p < 0.53 ? 1 : 2;
    if (active === activeRef.current) return;
    activeRef.current = active;
    videosRef.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else if (!v.paused) v.pause();
    });
  });
  return null;
};

const PortalTunnel = ({ progressRef, staticMode = false }) => {
  const wrapRef = useRef(null);
  const videosRef = useRef([]);
  const [frameloop, setFrameloop] = useState("always");
  const [portrait, setPortrait] = useState(
    () => window.innerWidth / window.innerHeight < 0.8
  );

  // park the canvas whenever the hero is offscreen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setFrameloop(entry.isIntersecting ? "always" : "never");
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () =>
      setPortrait(window.innerWidth / window.innerHeight < 0.8);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const planeW = portrait ? 2.3 : 4.4;
  const planeH = portrait ? 3.1 : 2.6;
  const alphaMap = useMemo(
    () => makeRoundedAlpha(planeW / planeH),
    [planeW, planeH]
  );

  return (
    <div
      ref={wrapRef}
      className="absolute left-0 top-0 size-full"
      aria-hidden="true"
    >
      <Canvas
        flat
        dpr={[1, 1.5]}
        frameloop={staticMode ? "demand" : frameloop}
        camera={{ fov: 50, near: 0.1, far: 40, position: [0, 0, CAM_START] }}
        gl={{ powerPreference: "high-performance", antialias: true }}
      >
        <Atmosphere progressRef={progressRef} staticMode={staticMode} />
        <Dust />
        <CameraRig progressRef={progressRef} staticMode={staticMode} />
        <VideoDirector
          progressRef={progressRef}
          videosRef={videosRef}
          staticMode={staticMode}
        />
        <Suspense fallback={null}>
          {STAGES.map((s, i) => (
            <PortalCard
              key={s.src}
              index={i}
              src={s.src}
              planeW={planeW}
              planeH={planeH}
              alphaMap={alphaMap}
              staticMode={staticMode}
              videosRef={videosRef}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default PortalTunnel;
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: passes (PortalTunnel.jsx is not imported yet, but must lint clean).

- [ ] **Step 4: Commit**

```bash
git add src/components/PortalTunnel.jsx
git commit -m "feat: add PortalTunnel scene — rounded video cards at depth

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Rewrite `Hero.jsx`, delete `MercuryField.jsx`

**Files:**
- Modify: `src/components/Hero.jsx` (full rewrite, keeping the badge-disc effect and overlay copy verbatim where noted)
- Delete: `src/components/MercuryField.jsx`

**Interfaces:**
- Consumes: `PortalTunnel` (`progressRef`, `staticMode`) from Task 1.
- Produces: `Hero` default export, same usage in `MainPage.jsx` (no MainPage change needed).

- [ ] **Step 1: Rewrite `src/components/Hero.jsx`**

Keep from the current file, verbatim: the `StaticHeroBackground` component, the entire badge-disc `useEffect` (refs `discRef`/`discSpinRef` and the SVG markup), the top-band / wordmark / baseline-band JSX. Changes:

1. Replace the `MercuryField` import with `import PortalTunnel from "./PortalTunnel";` and add `useMemo` to the react import.
2. Delete the `#video-frame` clip-path `gsap.set`/`gsap.from` block entirely (the pin replaces that transition).
3. Delete the wordmark tagline `<p>` ("30 hours · 20 teams · ship something real") — those facts move into the tunnel. Keep the `sr-only` span inside the `h1`.
4. Move the badge-disc `<div ref={discRef}>…</div>` OUT of the overlay container to be a direct child of the `<section>` (the overlay now fades out mid-tunnel; the disc must survive).
5. New top-level structure and scroll wiring:

```jsx
const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

const FACTS = ["30 hours", "20 teams", "Ship something real"];
// [in, out] scroll-progress windows — each fact sits on its stage's
// fullscreen moment (cards fill the frame at p ≈ 0.10 / 0.44 / 0.77)
const FACT_WINDOWS = [
  [0.1, 0.24],
  [0.42, 0.56],
  [0.75, 0.9],
];
```

Inside the component:

```jsx
const sectionRef = useRef(null);
const overlayRef = useRef(null);
const factRefs = useRef([]);
const progressRef = useRef(0);
const reduced = useMemo(
  () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  []
);
const webgl = useMemo(supportsWebGL, []);
```

```jsx
useGSAP(
  () => {
    if (!reduced) {
      gsap.from(".hero-rise", {
        yPercent: 32,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.09,
        delay: 0.2,
      });
    }
    if (reduced || !webgl) return;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=300%",
        scrub: true,
        pin: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      },
    });
    // the hero copy leaves during the first dive
    tl.to(overlayRef.current, { opacity: 0, yPercent: -5, duration: 0.1 }, 0.02);
    FACT_WINDOWS.forEach(([tIn, tOut], i) => {
      const el = factRefs.current[i];
      if (!el) return;
      tl.fromTo(
        el,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.045 },
        tIn
      ).to(el, { opacity: 0, duration: 0.045 }, tOut - 0.045);
    });
    tl.to({}, { duration: 0.001 }, 1); // pad the timeline to exactly p=1
  },
  { scope: sectionRef, dependencies: [reduced, webgl] }
);
```

Render (overlay content unchanged except the moved disc and removed tagline):

```jsx
return (
  <section
    ref={sectionRef}
    aria-label="Startathon — Kerala's most curated 30-hour hackathon"
    className="relative h-dvh w-screen overflow-hidden bg-[#050505]"
  >
    <div className="absolute left-0 top-0 size-full">
      <StaticHeroBackground />
      {webgl && (
        <PortalTunnel progressRef={progressRef} staticMode={reduced} />
      )}
      <div className="hero-vignette" />
    </div>

    {/* fact lines — one per portal crossing, scrubbed by the tunnel
        timeline; each hero fact is said exactly once */}
    {webgl &&
      !reduced &&
      FACTS.map((fact, i) => (
        <div
          key={fact}
          ref={(el) => {
            factRefs.current[i] = el;
          }}
          className="pointer-events-none absolute inset-0 z-[22] flex items-center justify-center opacity-0"
        >
          <p className="font-display text-5xl text-blue-50 [text-shadow:0_4px_40px_rgba(0,0,0,0.85)] sm:text-7xl">
            {fact}
            <span className="text-[#C8FF00]">.</span>
          </p>
        </div>
      ))}

    <div
      ref={overlayRef}
      className="absolute left-0 top-0 z-[21] flex size-full flex-col justify-between px-5 pb-8 pt-24 sm:px-10 sm:pb-12 sm:pt-28"
    >
      {/* top band, wordmark (no tagline), baseline band — verbatim from
          the current file */}
    </div>

    {/* badge disc — now a sibling of the overlay so it outlives the fade;
        markup + effect verbatim from the current file */}
  </section>
);
```

- [ ] **Step 2: Delete the dead component**

```bash
git rm src/components/MercuryField.jsx
```

Then run: `rg -n "MercuryField" src/` — Expected: no matches.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 4: Browser-verify the tunnel (desktop)**

Puppeteer (dev server already running; intro already bypassed via sessionStorage from Task 1, re-set it if the browser session is fresh):

1. Navigate `http://localhost:3000`, screenshot `hero-desktop-top` (1440×900). Expect: wordmark, positioning line, CTA, portal card 1 playing video, badge disc, no tagline under the wordmark.
2. `puppeteer_evaluate` `window.scrollTo(0, window.innerHeight * 0.45)`, wait ~1.5s, screenshot `hero-desktop-dive1`. Expect: card 1 near-fullscreen, hero copy faded, "30 hours." visible around this range.
3. Scroll to `innerHeight * 1.5`, wait, screenshot `hero-desktop-stage2` — card 2 approaching, "20 teams." near its crossing (`innerHeight * 1.35`–`1.7` range; adjust scroll to catch it).
4. Scroll to `innerHeight * 2.4`, wait, screenshot `hero-desktop-stage3` — card 3 / "Ship something real.".
5. Scroll to `innerHeight * 3.4`, wait, screenshot `hero-desktop-exit` — hero unpinned, Sponsors arriving over near-black. No white flash, no layout jump.
6. `puppeteer_evaluate` `document.documentElement.scrollWidth <= window.innerWidth` — Expect: `true`.
7. Scroll back to 0, confirm the hero copy returns (scrub is reversible).

Fix anything broken before committing (fact timing windows and card sizes are the expected tuning knobs).

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.jsx
git commit -m "feat: portal tunnel hero — pinned scrub dive through three video cards

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Mobile-first verification sweep + polish

**Files:**
- Modify (tuning only, as needed): `src/components/PortalTunnel.jsx`, `src/components/Hero.jsx`

**Interfaces:**
- Consumes: everything from Tasks 1–2. No new interfaces.

- [ ] **Step 1: Mobile fold check (375×812)**

Puppeteer screenshots at width 375, height 812:

1. Scroll 0 → `hero-mobile-top`. MUST show: positioning line, `Startathon.` wordmark, "Not everyone gets in.", Apply Now CTA, portrait portal card — all above the fold, nothing clipped, date/venue facts stacked above the CTA (mobile block).
2. `puppeteer_evaluate`: `JSON.stringify(document.querySelector('a[href="/apply"]').getBoundingClientRect())` — Expect: `bottom` < 812, `top` > 0.
3. Tunnel positions (scrolls ≈ 0.45×, 1.5×, 2.4× innerHeight): cards fill the portrait frame at crossings, fact lines legible, no text overflowing viewport.
4. `document.documentElement.scrollWidth <= window.innerWidth` — Expect: `true` at top and mid-tunnel.

- [ ] **Step 2: Tablet spot check (768×1024)**

Screenshot at scroll 0 and one mid-tunnel position. Cards should use the portrait sizing below aspect 0.8 (768/1024 = 0.75 → portrait) and look composed, not cramped.

- [ ] **Step 3: Downstream sections unchanged**

Repeat the Task 1 Step 1 scroll sweep at 1440×900 (offset scroll y by the hero's new +300% pin spacing — the sections are ~3×innerHeight further down). Compare against baselines: Sponsors, VideoCards, StudentHook, Contact, Footer must look identical (same layout, same hover-independent rendering).

- [ ] **Step 4: Reduced-motion + fallback check**

Puppeteer: emulate reduced motion via CDP is not exposed by the MCP tools — instead verify by code inspection that: `reduced` skips pin/timeline and passes `staticMode` (already Task 2 code), and `webgl === false` renders `StaticHeroBackground` only. Then do a quick manual sanity screenshot after `puppeteer_evaluate` forcing `matchMedia` is NOT feasible — code inspection + the static-pose codepath review is the accepted check here.

- [ ] **Step 5: Performance sanity**

`puppeteer_evaluate`:

```js
new Promise((res) => {
  let frames = 0;
  const t0 = performance.now();
  const loop = () => {
    frames += 1;
    if (performance.now() - t0 < 2000) requestAnimationFrame(loop);
    else res(frames / 2);
  };
  requestAnimationFrame(loop);
});
```

at scroll 0 and mid-tunnel (1440×900). Expect ≥ 50 fps headless. If materially lower, first suspect: antialias (set `antialias: false` at dpr > 1), dust count, or all three videos decoding (verify only one is unpaused: `Array.from(document.querySelectorAll("video")).map(v => v.paused)` → exactly one `false` — note VideoCards' videos exist further down the page; scope the check to paused-state of the three hero webms by `src`).

- [ ] **Step 6: Final lint + commit**

Run: `npm run lint` — Expected: passes.

```bash
git add -A src/
git commit -m "polish: tune portal tunnel sizing and fact timing for mobile

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Self-review notes

- Spec coverage: first-screen fold (T2 render + T3.1), tunnel + facts (T1/T2), exit seam (T2.4.5, EXIT_TINT), mobile budget (dpr cap, one video active, portrait sizing), reduced-motion + WebGL fallback (T2 code, T3.4), MercuryField deletion (T2.2), downstream sections untouched (T1.1 baseline vs T3.3), lint (every task).
- Known tuning knobs called out where verification may demand iteration: FACT_WINDOWS, card plane sizes, fade window constants.
