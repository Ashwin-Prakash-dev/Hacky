# Hero Pixel-Dissolve + Briefing Portal-Orbit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hero's portal tunnel with one fullscreen video that disintegrates bottom-up in large mosaic pixels on scroll; rebuild Briefing as three orbiting portal cards, each a real 3D world (MeshPortalMaterial) you can peek inside on hover. Prizes odometer is already complete at HEAD (commit `1f9f235`) — this plan only re-verifies it.

**Architecture:** Hero's `PortalTunnel.jsx` is deleted and replaced by `HeroDissolve.jsx` — a single fullscreen quad running a custom `ShaderMaterial` that cover-crops a video texture, quantizes the screen into a coarse grid, and kills cells bottom-to-top as a scroll-driven `uProgress` uniform rises, with an ascending-edge smoothstep and a small per-cell death jitter so the front reads as an organic mosaic wipe, not a hard line. `Hero.jsx` drops the fact-line/scrim machinery, shortens its pin, and removes the "Kerala's most curated hackathon" line. Briefing gets a section-scoped R3F canvas: three rounded portal cards on a 120° ring; a pinned ScrollTrigger scrubs the ring through three plateaued stops; each portal's `MeshPortalMaterial` reveals a small tinted 3D world (fog + a slow wireframe primitive + dust) on hover-peek; card copy is real DOM via drei `Html transform`.

**Tech Stack:** React 18, GSAP 3 + ScrollTrigger + `@gsap/react`, @react-three/fiber 8, @react-three/drei 9 (`useVideoTexture`, `MeshPortalMaterial`, `Html`), three 0.184.

## Global Constraints

- NEVER run `npm run dev`/`build`/`preview`/`deploy`; the dev server is already running at `http://localhost:3000`. `npm run lint` is free to run after each task.
- No new dependencies. No `lamina`. Do not touch `src/index.css`'s `--font-display`/`@font-face` block or `src/lib/wordmark.js` — both must stay exactly as they are at HEAD (Cabinet Grotesk); a prior stray edit briefly broke this and was reverted, do not reintroduce it.
- Downstream sections (Sponsors, VideoCards, StudentHook, Contact, Footer) stay pixel-identical. Section ids/`data-lens` attributes preserved (`id="prizes"`, `data-lens="prizes"`, `id="briefing"`, `data-lens="briefing"`).
- GLSL landmines already paid for in this repo (do not re-pay): backticks inside a shader comment terminate the JS template literal; `smoothstep` must use ASCENDING edges only (never descending); guard any radius/threshold uniform that can hit 0 before using it as a `smoothstep`/`fwidth` edge.
- Reduced motion / no-WebGL: Hero shows a static (unpinned, undissolved) frame; Briefing shows a plain stacked DOM column, no canvas, no pin. Both patterns already exist elsewhere in the codebase (Hero's own `reduced`/`webgl` checks; Prizes' `gsap.matchMedia`) — follow them.
- Copy (each fact said once): Briefing trims 12 rows to 7 lines — Expect: "30 hours — 24 build, 6 eval" / "20 curated teams — builders, not attendees"; Mentors: "Technical founders in the room" / "Real 1:1s at your table"; Rules: "Teams of 3–4" / "All code written inside the window" / "Ship something deployable — slides don't count".
- Perf: at most one meaningfully-rendered thing per canvas beyond the frame it's in (Hero: one video pass; Briefing: gate a portal world's contents to whichever card is within ~0.75 of the current stop). DPR capped at `[1, 1.5]` on both canvases. Canvases park (`frameloop: "never"`) when their wrapper is offscreen, using the same hardened IntersectionObserver pattern already in the repo (confirm-against-live-rect + one settle recheck ~400ms after mount — do not trust a bare `isIntersecting: false`, GSAP's pin re-parent can produce one stale record).
- No test runner in this repo — verification is puppeteer MCP + `npm run lint`.

---

### Task 1: `HeroDissolve.jsx` — fullscreen video, bottom-up pixel dissolve

**Files:**
- Create: `src/components/HeroDissolve.jsx`
- Delete: `src/components/PortalTunnel.jsx`
- Modify: `src/components/Hero.jsx`

**Interfaces:**
- Produces: `export default HeroDissolve`, props `{ progressRef, staticMode = false }` — same contract `PortalTunnel` had, so `Hero.jsx`'s existing `progressRef`/`staticMode` wiring barely changes.

- [ ] **Step 1: Write `src/components/HeroDissolve.jsx`**

```jsx
/* eslint-disable react/no-unknown-property -- r3f elements take three.js
   props, not DOM attributes */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad, useVideoTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// The hero's centerpiece: one fullscreen video, cover-cropped, that comes
// apart bottom-up in large mosaic pixels as the hero's pin is scrubbed —
// each grid cell gets a random death threshold biased by its row (low
// near the bottom, high near the top) so the wipe reads as an organic
// front, not a hard line. Dead cells go fully transparent, letting the
// DOM StaticHeroBackground gradient (painted beneath this canvas in
// Hero.jsx) stand in as the "atmosphere" — no second color system to
// keep in sync. Static camera; the only motion is the dissolve itself.

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uVideoRes;
  uniform float uProgress;
  uniform float uCols;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
  }

  vec2 coverUv(vec2 uv) {
    float screenA = uRes.x / uRes.y;
    float videoA = uVideoRes.x / uVideoRes.y;
    vec2 c = uv;
    if (screenA > videoA) {
      float s = videoA / screenA;
      c.y = (uv.y - 0.5) * s + 0.5;
    } else {
      float s = screenA / videoA;
      c.x = (uv.x - 0.5) * s + 0.5;
    }
    return c;
  }

  void main() {
    float rows = max(1.0, floor(uCols * (uRes.y / uRes.x)));
    vec2 grid = vec2(uCols, rows);
    vec2 cell = floor(vUv * grid);
    vec2 cellUv = fract(vUv * grid);
    vec2 cellCenter = (cell + 0.5) / grid;

    // bottom (y=0) dies early, top (y=1) dies late; jitter keeps the
    // front from reading as a ruled line
    float rnd = hash(cell);
    float threshold = 0.08 + cellCenter.y * 0.80 + rnd * 0.06;

    // ascending edges only — descending smoothstep edges are undefined
    // on this project's target GPUs
    float band = 0.045;
    float dead = smoothstep(threshold - band, threshold + band, uProgress);
    float alive = 1.0 - dead;
    if (alive < 0.003) discard;

    vec2 sampleUv = clamp(coverUv(cellCenter), 0.001, 0.999);
    vec3 vcol = texture2D(uTex, sampleUv).rgb;

    // block shrink + lime spark just before a cell dies
    float nearDeath = smoothstep(threshold - band * 2.0, threshold, uProgress) * alive;
    vec2 local = cellUv - 0.5;
    float inset = nearDeath * 0.5;
    float blockMask = step(abs(local.x), 0.5 - inset) * step(abs(local.y), 0.5 - inset);
    vec3 spark = vec3(0.78, 1.0, 0.0) * nearDeath * 0.55;

    gl_FragColor = vec4(vcol + spark, alive * blockMask);
  }
`;

const DissolvePlane = ({ progressRef, staticMode }) => {
  const matRef = useRef(null);
  const { size } = useThree();
  const texture = useVideoTexture("/videos/hero-1.webm", {
    muted: true,
    loop: true,
    playsInline: true,
    start: !staticMode,
  });

  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uRes: { value: new THREE.Vector2(size.width, size.height) },
      uVideoRes: { value: new THREE.Vector2(16, 9) },
      uProgress: { value: 0 },
      uCols: { value: 26 },
    }),
    [texture]
  );

  useEffect(() => {
    const video = texture.image;
    const onMeta = () => {
      uniforms.uVideoRes.value.set(video.videoWidth, video.videoHeight);
    };
    if (video.videoWidth) onMeta();
    else video.addEventListener("loadedmetadata", onMeta);
    return () => video.removeEventListener("loadedmetadata", onMeta);
  }, [texture, uniforms]);

  useEffect(() => {
    uniforms.uRes.value.set(size.width, size.height);
  }, [size, uniforms]);

  useFrame(() => {
    uniforms.uProgress.value = staticMode ? 0 : progressRef.current;
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  );
};

const Dust = () => {
  const positions = useMemo(() => {
    const arr = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2;
      arr[i * 3 + 2] = -1 - Math.random() * 2;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={50}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#C8FF00"
        transparent
        opacity={0.28}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

const HeroDissolve = ({ progressRef, staticMode = false }) => {
  const wrapRef = useRef(null);
  const [frameloop, setFrameloop] = useState("always");

  // park the canvas whenever the hero is offscreen. GSAP's pin re-parent
  // can feed the observer one stale "not intersecting" record and then
  // go quiet — never trust a bare false: confirm against the live rect,
  // and recheck once ~400ms after mount, after the pin has settled.
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
  }, []);

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
        gl={{ powerPreference: "high-performance", antialias: false }}
        orthographic
      >
        <Dust />
        <DissolvePlane progressRef={progressRef} staticMode={staticMode} />
      </Canvas>
    </div>
  );
};

export default HeroDissolve;
```

- [ ] **Step 2: Delete the tunnel component**

```bash
git rm src/components/PortalTunnel.jsx
```

- [ ] **Step 3: Rewrite `src/components/Hero.jsx`**

Apply these changes to the current (HEAD) file:

1. Swap the import: `import PortalTunnel from "./PortalTunnel";` → `import HeroDissolve from "./HeroDissolve";`, and update the two JSX usages (`<PortalTunnel .../>` → `<HeroDissolve .../>`).
2. Delete the `scrimRef` ref, its `gsap.set`/`tl.to` lines in `useGSAP`, and the scrim `<div>` in the JSX (video contrast no longer needs a DOM scrim — the shader's own transparency and the existing `.hero-heading` text-shadow carry legibility).
3. Delete `FACTS`, `FACT_WINDOWS`, `factRefs`, the `FACT_WINDOWS.forEach(...)` block inside `useGSAP`, and the fact-line JSX block (`{webgl && !reduced && FACTS.map(...)}`).
4. Change the ScrollTrigger `end` from `"+=300%"` (or whatever value is currently at HEAD) to `"+=100%"`. Remove the final `tl.to({}, { duration: 0.001 }, 1);` padding line — it existed to keep the fact timeline in bounds and is no longer needed. The `overlay` (`overlayRef`) drops its GSAP fade-out entirely — it stays visible for the full pin and scrolls away naturally when the pin releases.
5. Delete the top-band positioning-line paragraph:
   ```jsx
   <p className="hero-rise max-w-60 font-display text-xl leading-snug text-blue-50/80 sm:text-2xl">
     Kerala&rsquo;s most curated hackathon
     <span className="text-[#C8FF00]">.</span>
   </p>
   ```
   Change the top-band wrapper from `className="flex w-full items-start justify-between gap-6"` to `className="flex w-full items-start justify-end gap-6"` (only the date/venue facts remain there now).
6. Add a text-shadow to "Not everyone gets in." for legibility over the video (it previously sat over a calmer background): change
   ```jsx
   <p className="hero-sub mb-4 max-w-sm font-general text-lg font-medium text-blue-50">
   ```
   to
   ```jsx
   <p className="hero-sub mb-4 max-w-sm font-general text-lg font-medium text-blue-50 [text-shadow:0_2px_16px_rgba(0,0,0,0.8)]">
   ```
7. Update the file's top comment block to describe the new section (one fullscreen video that dissolves bottom-up on scroll; no fact lines; badge disc + lens survive as before).

The `sr-only` long-form description inside the `h1`, the badge disc, `progressRef`, `reduced`/`webgl` checks, and the `createPortal`-to-`body` disc wiring are unchanged.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no new errors/warnings from `HeroDissolve.jsx` or `Hero.jsx` (repo's pre-existing ~122 errors elsewhere are unaffected).

- [ ] **Step 5: Browser-verify**

Puppeteer against `http://localhost:3000` (bypass intro via `sessionStorage.setItem("startathon:intro-seen","1")` + reload):

1. 1440×900, scroll 0 → screenshot. Expect: `hero-1.webm` fills the frame, wordmark + CTA + date/venue readable, no positioning-line paragraph, no fact-line text anywhere.
2. Scroll to ~35% of the pin (`window.innerHeight * 0.35`) → screenshot. Expect: bottom third of the video visibly broken into large mosaic blocks with lime sparks at the wipe front, top two-thirds still intact video, wordmark/CTA still visible.
3. Scroll to ~90% of the pin → screenshot. Expect: only a sliver of video (if any) remains near the top, most of the frame is the DOM atmosphere gradient with dust points.
4. Scroll just past the pin's end → screenshot. Expect: clean, seamless handoff into Sponsors (no flash, no residual video frame).
5. Scroll back to 0 → confirm the video re-forms (the effect is fully reversible, driven by scrub).
6. `document.documentElement.scrollWidth <= window.innerWidth` → expect `true` at each position.
7. Repeat steps 1–4 at 375×812 (mobile) — video must cover-crop correctly in portrait, text stays legible, no horizontal overflow.

Fix any tuning issues (grid column count, threshold spread, band width) directly in the shader constants before moving on.

- [ ] **Step 6: Commit**

```bash
git add src/components/HeroDissolve.jsx src/components/Hero.jsx
git rm src/components/PortalTunnel.jsx 2>/dev/null || true
git commit -m "feat: hero pixel-dissolve — one video disintegrates bottom-up on scroll

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Briefing portal-orbit rewrite

**Files:**
- Create: `src/components/BriefingPortals.jsx`
- Modify: `src/components/Briefing.jsx` (full rewrite)

**Interfaces:**
- Produces: `Briefing` default export unchanged for `MainPage.jsx` (no caller changes needed). `BriefingPortals` default export, props `{ progressRef, activeIndex, onHoverChange }` — internal to `Briefing.jsx`, not consumed elsewhere.

- [ ] **Step 1: Write `src/components/BriefingPortals.jsx`**

```jsx
/* eslint-disable react/no-unknown-property -- r3f elements take three.js
   props, not DOM attributes */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshPortalMaterial, Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Three briefing cards on a ring, each a portal (MeshPortalMaterial) into
// its own small tinted world — a slow wireframe primitive + dust, in the
// spirit of pmndrs' enter-portals. A pinned scroll scrubs the ring
// through three plateaued stops (Expect / Mentors / Rules); the front
// card's world is what's populated (others are hidden, not just dim, to
// keep the frame budget to one live world). Hovering the front card
// dollies the camera in a little and tilts the card toward the pointer,
// so the portal reads as "look inside," not just a lit window.

const RING_R = 4.2;
const STEP = (Math.PI * 2) / 3;
const CAM_Z_DESKTOP = 9.4;
const CAM_Z_PORTRAIT = 11.6;

const roundedGeometry = (() => {
  const w = 2.4;
  const h = 3.1;
  const r = 0.22;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return new THREE.ShapeGeometry(shape, 12);
})();

// plateaued-stop easing: p in [0,1] -> 0..2 with holds near each integer
const stopEase = (p) => {
  const t = THREE.MathUtils.clamp(p, 0, 1) * 2;
  const seg = Math.min(2, Math.floor(t));
  const local = THREE.MathUtils.clamp(t - seg, 0, 1);
  return Math.min(2, seg + THREE.MathUtils.smoothstep(local, 0.25, 0.75));
};

const World = ({ tint, geo, active }) => (
  <>
    <color attach="background" args={[tint]} />
    <fog attach="fog" args={[tint, 2, 7]} />
    <ambientLight intensity={0.6} />
    <pointLight position={[2, 2, 2]} intensity={12} color="#C8FF00" />
    {active && (
      <mesh rotation={[0.6, 0.4, 0]}>
        {geo === "torus" && <torusGeometry args={[0.9, 0.32, 16, 48]} />}
        {geo === "icosa" && <icosahedronGeometry args={[1.05, 0]} />}
        {geo === "octa" && <octahedronGeometry args={[1.15, 0]} />}
        <meshBasicMaterial color="#C8FF00" wireframe />
      </mesh>
    )}
  </>
);

const CARDS = [
  {
    id: "expect",
    title: "What to expect",
    tint: "#0b0e05",
    geo: "torus",
    lines: ["30 hours — 24 build, 6 eval", "20 curated teams — builders, not attendees"],
  },
  {
    id: "mentors",
    title: "Mentors",
    tint: "#060910",
    geo: "icosa",
    lines: ["Technical founders in the room", "Real 1:1s at your table"],
  },
  {
    id: "rules",
    title: "Rules",
    tint: "#0a0708",
    geo: "octa",
    lines: ["Teams of 3–4", "All code written inside the window", "Ship something deployable — slides don't count"],
  },
];

const PortalCard = ({ index, card, activeStopRef, peekRef, onHoverChange }) => {
  const groupRef = useRef(null);
  const portalMatRef = useRef(null);
  const angle = index * STEP;

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const dist = Math.abs(activeStopRef.current - index);
    const near = dist < 0.75;
    g.visible = near || dist < 1.05; // keep the outgoing/incoming card visible through the crossfade
    const frontness = THREE.MathUtils.clamp(1 - dist, 0, 1);
    const isFront = dist < 0.05;
    const peek = isFront ? peekRef.current : 0;
    g.rotation.y = -angle + peek.x * 0.18;
    g.rotation.x = peek.y * 0.1;
    if (portalMatRef.current) {
      portalMatRef.current.opacity = THREE.MathUtils.clamp(frontness * 1.6, 0, 1);
    }
  });

  return (
    <group ref={groupRef} position={[Math.sin(angle) * RING_R, 0, Math.cos(angle) * RING_R]}>
      <group rotation={[0, angle, 0]}>
        <mesh
          geometry={roundedGeometry}
          onPointerOver={() => onHoverChange(index, true)}
          onPointerOut={() => onHoverChange(index, false)}
        >
          <MeshPortalMaterial ref={portalMatRef} side={THREE.DoubleSide} transparent>
            <World tint={card.tint} geo={card.geo} active />
          </MeshPortalMaterial>
        </mesh>
        {/* hairline lime rim, matching the hero's portal language */}
        <mesh geometry={roundedGeometry} position={[0, 0, -0.01]} scale={1.02}>
          <meshBasicMaterial color="#C8FF00" transparent opacity={0.5} />
        </mesh>
        <Html
          transform
          position={[0, -0.95, 0.02]}
          center
          distanceFactor={4.2}
          className="pointer-events-none w-[220px] select-none"
        >
          <div className="rounded-xl bg-[#050505]/70 p-3 backdrop-blur-sm">
            <h3 className="mb-1.5 font-display text-sm font-extrabold uppercase tracking-[0.01em] text-white">
              {card.title}
            </h3>
            <ul className="space-y-1 font-general text-[0.7rem] leading-snug text-white/70">
              {card.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </Html>
      </group>
    </group>
  );
};

const OrbitRig = ({ progressRef, activeStopRef, camZ }) => {
  useFrame(({ camera }) => {
    const stop = stopEase(progressRef.current);
    activeStopRef.current = stop;
    camera.position.set(0, 0, camZ);
    camera.lookAt(0, 0, 0);
  });
  return null;
};

const BriefingPortals = ({ progressRef, onActiveChange }) => {
  const activeStopRef = useRef(0);
  const peekRef = useRef({ x: 0, y: 0 });
  const peekTargetRef = useRef({ x: 0, y: 0 });
  const wrapRef = useRef(null);
  const [frameloop, setFrameloop] = useState("always");
  const [portrait, setPortrait] = useState(
    () => window.innerWidth / window.innerHeight < 0.8
  );

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
  }, []);

  useEffect(() => {
    const onResize = () => setPortrait(window.innerWidth / window.innerHeight < 0.8);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleHoverChange = (index, hovering) => {
    peekTargetRef.current = hovering ? { x: 1, y: 1 } : { x: 0, y: 0 };
  };

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = peekRef.current;
      const t = peekTargetRef.current;
      p.x += (t.x - p.x) * 0.08;
      p.y += (t.y - p.y) * 0.08;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // report the current stop's rounded index to the DOM indicator
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      onActiveChange(Math.round(activeStopRef.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onActiveChange]);

  return (
    <div ref={wrapRef} className="absolute left-0 top-0 size-full" aria-hidden="true">
      <Canvas
        flat
        dpr={[1, 1.5]}
        frameloop={frameloop}
        camera={{ fov: 45, near: 0.1, far: 30, position: [0, 0, CAM_Z_DESKTOP] }}
        gl={{ powerPreference: "high-performance", antialias: true }}
      >
        <OrbitRig
          progressRef={progressRef}
          activeStopRef={activeStopRef}
          camZ={portrait ? CAM_Z_PORTRAIT : CAM_Z_DESKTOP}
        />
        {CARDS.map((card, i) => (
          <PortalCard
            key={card.id}
            index={i}
            card={card}
            activeStopRef={activeStopRef}
            peekRef={peekRef}
            onHoverChange={handleHoverChange}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default BriefingPortals;
```

- [ ] **Step 2: Rewrite `src/components/Briefing.jsx`**

```jsx
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BriefingPortals from "./BriefingPortals";

gsap.registerPlugin(ScrollTrigger);

const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

const CARDS = [
  {
    id: "expect",
    title: "What to expect",
    lines: ["30 hours — 24 build, 6 eval", "20 curated teams — builders, not attendees"],
  },
  {
    id: "mentors",
    title: "Mentors",
    lines: ["Technical founders in the room", "Real 1:1s at your table"],
  },
  {
    id: "rules",
    title: "Rules",
    lines: ["Teams of 3–4", "All code written inside the window", "Ship something deployable — slides don't count"],
  },
];

// The briefing: three portal cards orbiting in a pinned stage — What to
// Expect / Mentors / Rules, each a small 3D world you can peek inside on
// hover. Reduced motion / no WebGL fall back to a plain stacked column
// with the same trimmed copy, no canvas, no pin.
const Briefing = () => {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const webgl = useMemo(supportsWebGL, []);

  useEffect(() => {
    if (reduced || !webgl) return undefined;
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=200%",
      scrub: true,
      pin: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });
    return () => st.kill();
  }, [reduced, webgl]);

  if (reduced || !webgl) {
    return (
      <section
        id="briefing"
        data-lens="briefing"
        className="w-full bg-[#050505] pb-36 pt-24"
      >
        <div className="container mx-auto flex flex-col gap-12 px-5 md:px-10">
          {CARDS.map((card) => (
            <div key={card.id} className="rounded-xl bg-white/[0.03] p-6">
              <h3 className="mb-2 font-display text-xl font-extrabold uppercase text-white">
                {card.title}
              </h3>
              <ul className="space-y-1 font-general text-sm text-white/70">
                {card.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="briefing"
      data-lens="briefing"
      className="relative h-dvh w-full overflow-hidden bg-[#050505]"
    >
      <BriefingPortals progressRef={progressRef} onActiveChange={setActiveIndex} />
      <div className="pointer-events-none absolute left-5 top-24 z-10 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/45 sm:left-10">
        {String(activeIndex + 1).padStart(2, "0")} / {CARDS[activeIndex]?.title}
      </div>
    </section>
  );
};

export default Briefing;
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors/warnings from `BriefingPortals.jsx` or `Briefing.jsx`.

- [ ] **Step 4: Browser-verify**

Puppeteer, 1440×900:

1. Scroll into the Briefing pin at ~5% → screenshot. Expect: "Expect" card front-and-center, its wireframe torus visible inside the portal, title + 2 lines legible, top-left indicator reads "01 / What to expect".
2. Scroll to ~50% → screenshot. Expect: ring mid-turn, cards visibly turning (not a hard cut).
3. Scroll to ~50%+ landing near stop 2 (~55-60%) → screenshot. Expect: "Mentors" card front, icosahedron visible, indicator "02 / Mentors".
4. Scroll to ~95% → screenshot. Expect: "Rules" card front, octahedron visible, indicator "03 / Rules", 3 lines.
5. `puppeteer_hover` over the front card at stop 1 → screenshot before/after. Expect: a small camera dolly/tilt shift (the world reads slightly different from the same scroll position).
6. Confirm text is selectable: `puppeteer_evaluate` reading `document.querySelector('h3')?.textContent` returns real text.
7. Repeat 1440×900 with `Array.from(document.querySelectorAll('canvas')).length` before/after entering Hero+Briefing — confirm only one canvas has `frameloop` effectively active at a time (spot-check via a quick fps sample at the Hero→Briefing scroll boundary, target ≥45fps headless).
8. 375×812: card fits the frame at each stop, indicator readable, no horizontal overflow.

- [ ] **Step 5: Commit**

```bash
git add src/components/BriefingPortals.jsx src/components/Briefing.jsx
git commit -m "feat: briefing portal orbit — MeshPortalMaterial worlds, hover peek

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Full-page sweep + polish

**Files:**
- Modify (tuning only, as needed): `src/components/HeroDissolve.jsx`, `src/components/Hero.jsx`, `src/components/BriefingPortals.jsx`, `src/components/Briefing.jsx`, `src/components/Prizes.jsx`

- [ ] **Step 1: Confirm Prizes odometer survived the reset**

Puppeteer, 1440×900: scroll into the Prizes pin at ~40%. Expect: digit reels mid-roll (mixed numerals), ladder rows landing, matching the already-committed `1f9f235` behavior. This is a verify-only step — do not re-implement.

- [ ] **Step 2: Hero → Prizes → Briefing → Sponsors scroll-through**

At 1440×900 and 375×812: scroll from the very top through Hero's dissolve, into Prizes, into Briefing, and into Sponsors, screenshotting each seam. Check: no horizontal overflow at any point (`document.documentElement.scrollWidth <= window.innerWidth`), no visual gap/flash at any pin release, pacing feels intentional (nothing drags, nothing snaps too hard).

- [ ] **Step 3: Downstream sections unchanged**

Screenshot Sponsors, VideoCards, StudentHook, Contact, Footer at 1440×900 and diff by eye against the last known-good baselines from the original hero build (same layout, same copy, same hover-independent rendering). These sections were not touched by this plan — any difference is a regression to fix.

- [ ] **Step 4: fps sanity**

`puppeteer_evaluate` the same frame-counting snippet used earlier in this project (count `requestAnimationFrame` calls over 2s) at: mid-Hero-dissolve, mid-Briefing-orbit. Target ≥45fps headless. If low, first suspects: `HeroDissolve`'s `uCols` (fewer columns = fewer discards) or `BriefingPortals`' antialiasing/DPR.

- [ ] **Step 5: Final lint + commit**

Run: `npm run lint` — expect only the repo's pre-existing issues.

```bash
git add -A src/
git commit -m "polish: tune hero dissolve and briefing orbit after full-page sweep

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Skip this commit if the sweep found nothing to tune.)

- [ ] **Step 6: Update auto-memory**

Update `startathon-design-system.md` in the memory directory: replace the portal-tunnel hero entry with the pixel-dissolve description, add the Briefing portal-orbit entry, note the font/odometer regression-and-revert as a cautionary note (uncommitted working-tree state is not trustworthy source of truth — always diff against HEAD before trusting it).

## Self-review notes

- Spec coverage: single video (T1.1 `useVideoTexture("/videos/hero-1.webm")`), bottom-up large-pixel dissolve (T1.1 shader `threshold`/`blockMask`), atmosphere reveal via the existing DOM gradient (T1.1 comment + transparent shader output), no fact lines (T1.3.3), no positioning line (T1.3.5), short ~1-viewport pin (T1.3.4, `+=100%`), Briefing portals-inside-orbiting-cards (T2.1 `MeshPortalMaterial` + ring), hover-to-peek (T2.1 `onHoverChange`/`peekRef`), trimmed 7-line copy (T2.1/T2.2 `CARDS`), Prizes odometer already done (T3.1 verify-only).
- Type consistency: `HeroDissolve`/`BriefingPortals` both take `progressRef` (a ref object) — matches `Hero.jsx`'s existing `progressRef` pattern from the tunnel build, no caller-side type change needed for Hero; Briefing's `progressRef` is newly created inside `Briefing.jsx` itself (not passed in from `MainPage`), consistent with `onActiveChange(index: number)` being the only new prop surface.
