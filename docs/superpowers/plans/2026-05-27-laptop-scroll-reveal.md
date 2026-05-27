# Laptop Scroll Reveal — About Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the About section's clip-path image reveal with a scroll-driven 3D laptop animation — lid opens, zooms toward camera, screen fills viewport, then the canvas hides and the Features section takes over seamlessly.

**Architecture:** GSAP ScrollTrigger pins the About section and writes scroll progress (0→1) into a `progressRef`. A React Three Fiber `useFrame` loop reads that ref each tick to drive hinge rotation, idle float, and camera Z position — zero React re-renders during scroll. At progress=1, GSAP hides the canvas and the pin releases into the Features section.

**Tech Stack:** React 18, GSAP 3 + ScrollTrigger, Three.js, @react-three/fiber, @react-three/drei, Tailwind CSS, Vite

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Install | — | three, @react-three/fiber, @react-three/drei |
| Create | `src/components/ScreenContent.jsx` | `<Html>` overlay on laptop screen — single swap point for future texture version |
| Create | `src/components/LaptopModel.jsx` | GLB model + hinge + idle float, reads `progressRef` |
| Create | `src/components/LaptopReveal.jsx` | Canvas + GSAP ScrollTrigger bridge + canvas hide on complete |
| Modify | `src/components/About.jsx` | New copy, remove image section, mount `<LaptopReveal>` |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install Three.js packages**

```bash
cd G:/hacky
npm install three @react-three/fiber @react-three/drei
```

Expected output includes `added N packages` with no peer dep errors. If you see a React version peer warning, it is safe to ignore — R3F supports React 18.

- [ ] **Step 2: Verify install**

```bash
node -e "require('./node_modules/three/build/three.cjs.js'); console.log('three ok')"
```

Expected: `three ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add three, @react-three/fiber, @react-three/drei"
```

---

## Task 2: Create ScreenContent.jsx

This is the **single swap point** for the screen content. Currently uses `<Html>` from drei. To swap to a texture later: replace the `<Html>` block with a `<mesh>` using a `meshStandardMaterial` with a `map` prop.

**Files:**
- Create: `src/components/ScreenContent.jsx`

The screen lives inside the laptop model. Its world-space position (after the model's `rotation={[0, Math.PI, 0]}` wrapper) is approximately `[0, 1.56, -1.4]` with rotation `[-0.256, Math.PI, 0]`. Scale `0.135` maps 1px of HTML → ~0.135 Three.js units.

`FeaturesPreview` is a stripped-down version of the Features bento cards — just enough to show recognisable content through the screen.

- [ ] **Step 1: Create the file**

```jsx
// src/components/ScreenContent.jsx
import { Html } from "@react-three/drei";

/* ─── Mini preview of Features content shown on laptop screen ─── */
function FeaturesPreview() {
  return (
    <div
      style={{
        width: "900px",
        height: "580px",
        background: "#0a0a0a",
        borderRadius: "8px",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px",
        padding: "12px",
        fontFamily: "'Open Sauce One', sans-serif",
      }}
    >
      {/* Prizes card */}
      <div style={{ background: "#111", borderRadius: "4px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span style={{ fontSize: "8px", letterSpacing: "3px", color: "#C8FF00", textTransform: "uppercase" }}>Prize Pool</span>
        <div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#C8FF00", lineHeight: 1 }}>₹X.XL</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>cash + incubation</div>
        </div>
      </div>

      {/* What to expect card */}
      <div style={{ background: "#111", borderRadius: "4px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "8px", letterSpacing: "3px", color: "#C8FF00", textTransform: "uppercase" }}>Experience</span>
        {["30-Hour Build Sprint", "Expert Mentors", "Curated Teams Only", "Demo Day Pitching"].map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#00aa55", fontSize: "8px" }}>◈</span>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Timeline card */}
      <div style={{ background: "#111", borderRadius: "4px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span style={{ fontSize: "8px", letterSpacing: "3px", color: "#C8FF00", textTransform: "uppercase" }}>Schedule</span>
        <div style={{ fontSize: "32px", fontWeight: 900, color: "transparent", WebkitTextStroke: "1px rgba(200,255,0,0.3)", lineHeight: 1 }}>JUL 26</div>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>SCTCE · Thiruvananthapuram</div>
      </div>
    </div>
  );
}

/*
 * ScreenContent — mounts Html overlay on laptop screen.
 *
 * TO SWAP TO TEXTURE (future):
 *   1. Delete the <Html> block.
 *   2. Add: const texture = useLoader(THREE.TextureLoader, '/img/screen-preview.png')
 *   3. Return: <mesh position={...} rotation={...}><planeGeometry args={[2.1, 1.35]} /><meshStandardMaterial map={texture} /></mesh>
 */
export default function ScreenContent() {
  return (
    <Html
      transform
      occlude
      position={[0, 1.56, -1.4]}
      rotation={[-0.256, Math.PI, 0]}
      scale={0.135}
      zIndexRange={[1, 0]}
    >
      <FeaturesPreview />
    </Html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ScreenContent.jsx
git commit -m "feat: add ScreenContent with Html laptop screen overlay"
```

---

## Task 3: Create LaptopModel.jsx

Ported from the reference implementation. `react-spring` removed — hinge is driven by `hingeAngle` (a plain ref written by the scroll progress logic in LaptopReveal). Idle float activates only when `lidProgress > 0.5`.

**Files:**
- Create: `src/components/LaptopModel.jsx`

Node names and material names come directly from `mac-draco.glb`. Do not change them.

- [ ] **Step 1: Create the file**

```jsx
// src/components/LaptopModel.jsx
import * as THREE from "three";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import ScreenContent from "./ScreenContent";

/*
 * LaptopModel
 *
 * Props:
 *   progressRef  — React ref whose .current is scroll progress 0→1 (written by GSAP)
 *
 * Animation phases (mirrors LaptopReveal.jsx scroll phases):
 *   progress 0.00–0.35 → lid opens   (hinge 1.575 → -0.425)
 *   progress 0.35–1.00 → idle float  (gentle rotation + y oscillation)
 */
export default function LaptopModel({ progressRef, ...props }) {
  const group = useRef();
  const hingeGroupRef = useRef();

  const { nodes, materials } = useGLTF("/models/mac-draco.glb");

  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered]);

  useFrame((state) => {
    if (!group.current || !hingeGroupRef.current) return;

    const p = progressRef.current;
    const t = state.clock.getElapsedTime();

    // Phase 1: hinge — lid opens as scroll 0→0.35
    const lidProgress = Math.min(p / 0.35, 1);
    const targetHinge = THREE.MathUtils.lerp(1.575, -0.425, lidProgress);
    hingeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      hingeGroupRef.current.rotation.x,
      targetHinge,
      0.1
    );

    // Idle float — only active once lid is meaningfully open
    if (lidProgress > 0.5) {
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        Math.cos(t / 10) / 10 + 0.25,
        0.05
      );
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        Math.sin(t / 10) / 4,
        0.05
      );
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        Math.sin(t / 10) / 10,
        0.05
      );
      group.current.position.y = THREE.MathUtils.lerp(
        group.current.position.y,
        (-2 + Math.sin(t)) / 3,
        0.05
      );
    } else {
      // Closed: rest on ground
      group.current.position.y = THREE.MathUtils.lerp(
        group.current.position.y,
        -4.3,
        0.1
      );
    }
  });

  return (
    <group
      ref={group}
      {...props}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      dispose={null}
    >
      {/* Hinge group — rotation.x controlled above */}
      <group ref={hingeGroupRef} position={[0, -0.04, 0.41]}>
        <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={materials.aluminium} geometry={nodes["Cube008"].geometry} />
          <mesh material={materials["matte.001"]} geometry={nodes["Cube008_1"].geometry} />
          <mesh material={materials["screen.001"]} geometry={nodes["Cube008_2"].geometry} />
        </group>
      </group>

      {/* Screen HTML overlay */}
      <ScreenContent />

      {/* Base */}
      <mesh
        material={materials.keys}
        geometry={nodes.keyboard.geometry}
        position={[1.79, 0, 3.45]}
      />
      <group position={[0, -0.1, 3.39]}>
        <mesh material={materials.aluminium} geometry={nodes["Cube002"].geometry} />
        <mesh material={materials.trackpad} geometry={nodes["Cube002_1"].geometry} />
      </group>
      <mesh
        material={materials.touchbar}
        geometry={nodes.touchbar.geometry}
        position={[0, -0.03, 1.2]}
      />
    </group>
  );
}

useGLTF.preload("/models/mac-draco.glb");
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LaptopModel.jsx
git commit -m "feat: add LaptopModel with scroll-driven hinge + idle float"
```

---

## Task 4: Create LaptopReveal.jsx

Core of the feature. Owns:
1. GSAP ScrollTrigger → `progressRef` bridge
2. `CameraController` (inner component) reads `progressRef` in `useFrame` to move camera Z
3. Canvas with `LaptopModel`
4. Canvas hide (`autoAlpha: 0`) on scroll complete via `onLeave`

**Files:**
- Create: `src/components/LaptopReveal.jsx`

**Camera Z range:** Start `-30` (matches reference), end `1.5`. At `fov=35`, camera Z≈1.5 puts the camera close enough that the laptop screen (~2 units tall in model space) fills most of the viewport height. **Tune `CAMERA_END_Z` if the screen doesn't quite fill the viewport** — lower (more negative) = farther away, higher (more positive) = closer.

```
// Tuning reference:
// fov 35 → visible height at distance d = 2 * d * tan(17.5°) ≈ 0.63 * d
// screen is ~2 units tall → fills viewport when d ≈ 3.17
// camera at z=-30, screen at z≈0 → distance = 30 → CAMERA_END_Z = -30 + (30 - 3.17) ≈ -3.17
// But model has rotation [0,PI,0] so screen faces -Z, camera at -Z looks toward +Z
// Start empirically from 1.5 and adjust
```

- [ ] **Step 1: Create the file**

```jsx
// src/components/LaptopReveal.jsx
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import LaptopModel from "./LaptopModel";

gsap.registerPlugin(ScrollTrigger);

// Tune this if the screen doesn't fill the viewport at scroll end
const CAMERA_END_Z = 1.5;
const CAMERA_START_Z = -30;

/*
 * CameraController — lives inside the Canvas, reads progressRef each frame.
 * Phases:
 *   progress 0.35–1.0  camera moves from CAMERA_START_Z → CAMERA_END_Z
 */
function CameraController({ progressRef }) {
  useFrame((state) => {
    const p = progressRef.current;
    const camProgress = Math.max(0, Math.min((p - 0.35) / 0.65, 1));
    const targetZ = THREE.MathUtils.lerp(CAMERA_START_Z, CAMERA_END_Z, camProgress);
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      0.08
    );
  });
  return null;
}

export default function LaptopReveal() {
  const wrapperRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const progressRef = useRef(0);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top top",
      end: "+=2000",
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
      onLeave: () => {
        // Canvas hides — Features section takes over seamlessly
        gsap.set(canvasWrapRef.current, { autoAlpha: 0 });
      },
      onEnterBack: () => {
        // Restore canvas if user scrolls back up
        gsap.set(canvasWrapRef.current, { autoAlpha: 1 });
      },
    });
  }, { scope: wrapperRef });

  return (
    <div ref={wrapperRef} className="h-dvh w-screen">
      <div ref={canvasWrapRef} className="h-full w-full">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, CAMERA_START_Z], fov: 35 }}
        >
          <CameraController progressRef={progressRef} />

          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#f0f0f0" />

          <Suspense fallback={null}>
            <group rotation={[0, Math.PI, 0]}>
              <LaptopModel progressRef={progressRef} />
            </group>
            <Environment preset="city" />
          </Suspense>

          <ContactShadows
            position={[0, -4.5, 0]}
            opacity={0.4}
            scale={20}
            blur={1.75}
            far={4.5}
          />
        </Canvas>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LaptopReveal.jsx
git commit -m "feat: add LaptopReveal with GSAP ScrollTrigger → Three.js bridge"
```

---

## Task 5: Update About.jsx

Replace image section with `<LaptopReveal>`. New heading copy. Keep `AnimatedTitle`.

**Files:**
- Modify: `src/components/About.jsx`

- [ ] **Step 1: Replace About.jsx**

```jsx
// src/components/About.jsx
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import AnimatedTitle from "./AnimatedTitle";
import LaptopReveal from "./LaptopReveal";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  return (
    <div id="about" className="w-screen">
      {/* Text header */}
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general text-sm uppercase md:text-[10px]">
          Startathon 2026
        </p>

        <AnimatedTitle
          title="What's in it <br /> for you?"
          containerClass="mt-5 !text-white text-center"
        />

        <div className="about-subtext">
          <p>Prizes. Mentors. 30 hours. Kerala's most curated hackathon.</p>
        </div>
      </div>

      {/* 3D laptop scroll reveal */}
      <LaptopReveal />
    </div>
  );
};

export default About;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/About.jsx
git commit -m "feat: update About with new copy and LaptopReveal"
```

---

## Task 6: Visual QA + Camera Tuning

Run the dev server and verify scroll animation. This task is manual — no code to write until you see the result.

**Files:**
- Possibly modify: `src/components/LaptopReveal.jsx` (tune `CAMERA_END_Z`)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Navigate to the About section (scroll past Hero).

- [ ] **Step 2: Check Phase 1 — Lid opens**

Scroll slowly from the top of the About section. The laptop lid should start closed and open smoothly over the first ~33% of the 2000px pin distance.

**If lid opens too fast:** Increase `0.35` threshold in `LaptopModel.jsx` (e.g., `0.5`).
**If lid doesn't open at all:** Verify `progressRef` is being written — add `console.log(progressRef.current)` inside `onUpdate` temporarily.

- [ ] **Step 3: Check Phase 2 — Zoom in**

Continue scrolling. The laptop should float and grow as the camera approaches.

**If zoom starts too early:** Increase the `0.35` offset in `CameraController`'s `camProgress` calc.
**If zoom is too slow/fast:** Adjust the `0.08` lerp factor in `CameraController`.

- [ ] **Step 4: Tune CAMERA_END_Z**

At the end of the pin (progress=1), the laptop screen should fill most of the viewport.

In `src/components/LaptopReveal.jsx`:
```js
const CAMERA_END_Z = 1.5; // increase toward 3 if screen is too small, decrease if clipping
```

Adjust in 0.5 increments until the screen fills ~90% of viewport height.

- [ ] **Step 5: Check transition to Features**

Scroll past the pin. The canvas should instantly hide (no flash) and the Features section should be directly underneath.

**If there is a gap between About and Features:** Features section has `padding-top: 8rem` via `.py-32`. This is fine — it's normal document flow. No fix needed unless it looks jarring.

**If canvas flash visible:** Confirm `onLeave` fires. Check that `canvasWrapRef.current` is not null.

- [ ] **Step 6: Check scroll-back (onEnterBack)**

Scroll back up through Features into About. Canvas should reappear. Laptop should re-close as progress goes back toward 0.

- [ ] **Step 7: Commit final tuning**

```bash
git add src/components/LaptopReveal.jsx src/components/LaptopModel.jsx
git commit -m "fix: tune camera end Z and scroll phase thresholds"
```

---

## Task 7: Performance Check

- [ ] **Step 1: Check frame rate**

Open browser DevTools → Performance tab → record 5 seconds of scroll through the About section. Frame rate should stay above 45fps on a mid-range laptop.

**If frame rate drops below 30fps:**
1. Lower Canvas `dpr` to `[1, 1.5]` in `LaptopReveal.jsx`
2. Remove `ContactShadows` (expensive) — replace with `<mesh>` flat shadow plane
3. Reduce lerp factor in `CameraController` from `0.08` to `0.05` (less frequent position changes)

- [ ] **Step 2: Check mobile**

Resize to 375px width. Laptop should still be visible and animation should work. R3F Canvas is fully responsive by default.

**If model too large on mobile:** Add `scale` prop to the `<group>` in `LaptopReveal.jsx`:
```jsx
<group rotation={[0, Math.PI, 0]} scale={isMobile ? 0.7 : 1}>
```
Use `window.innerWidth < 768` in a `useMemo` to detect mobile.

- [ ] **Step 3: Commit any perf fixes**

```bash
git add src/components/LaptopReveal.jsx
git commit -m "perf: tune canvas dpr and shadow settings for scroll performance"
```

---

## Notes

**ScreenContent swap to texture (future):**
Open `src/components/ScreenContent.jsx`. Delete the `<Html>` block. Add:
```jsx
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

export default function ScreenContent() {
  const texture = useLoader(THREE.TextureLoader, "/img/screen-preview.png");
  return (
    <mesh position={[0, 1.56, -1.4]} rotation={[-0.256, Math.PI, 0]}>
      <planeGeometry args={[2.1, 1.35]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
```
No other files change.

**GLB node names:** If the model loads but renders wrong geometry, open `mac-draco.glb` in [gltf.report](https://gltf.report) and verify node names match: `Cube008`, `Cube008_1`, `Cube008_2`, `keyboard`, `Cube002`, `Cube002_1`, `touchbar`.
