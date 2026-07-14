/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props */
import { useEffect, useMemo, useRef, useState, Component } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Choreography on an InstancedMesh of toon-shaded spheres (~9s):
//   0.0s – 2.6s  spheres drift in from depth, swirling in a slow vortex
//   2.6s – 4.8s  staggered convergence into the "S." monogram
//   6.6s – 9.0s  the S. dissolves outward into "Startathon."
//   9.0s –  ∞    idle tumble; the white accent spheres detach and swarm
//                after the cursor, returning to their slots when it leaves
const WORD_FULL = "Startathon.";
const WORD_MONO = "S.";
const TWO_PI = Math.PI * 2;

// Open Sauce Sans 900 — the site's headline font, declared in index.css.
async function loadDisplayFont() {
  try {
    await document.fonts.load('900 330px "Open Sauce Sans"');
    await document.fonts.ready;
  } catch {
    /* sample with whatever is available */
  }
  return '900';
}

// Rasterize `text` offscreen and return `count` normalized target positions
// (x in [-0.5, 0.5], y aspect-correct, z = 0), evenly spread across glyphs.
function sampleTextTargets(ctx, W, H, text, px, count) {
  ctx.clearRect(0, 0, W, H);
  ctx.letterSpacing = "14px";
  ctx.font = `900 ${px}px "Open Sauce Sans", sans-serif`;
  const w = ctx.measureText(text).width;
  if (w > W * 0.97) {
    px = Math.floor((px * W * 0.97) / w);
    ctx.font = `900 ${px}px "Open Sauce Sans", sans-serif`;
  }
  ctx.fillText(text, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts = [];
  for (let y = 0; y < H; y += 3) {
    for (let x = 0; x < W; x += 3) {
      if (data[(y * W + x) * 4 + 3] > 128) pts.push(x, y);
    }
  }
  const n = pts.length / 2;
  if (n === 0) return null;

  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const targets = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const j = order[i % n];
    targets[i * 2] = (pts[j * 2] - W / 2) / W + (Math.random() - 0.5) * 0.003;
    targets[i * 2 + 1] = -(pts[j * 2 + 1] - H / 2) / W + (Math.random() - 0.5) * 0.003;
  }
  return targets;
}

async function buildTargets(count) {
  await loadDisplayFont();
  const W = 1800;
  const H = 520;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const mono = sampleTextTargets(ctx, W, H, WORD_MONO, 460, count);
  const full = sampleTextTargets(ctx, W, H, WORD_FULL, 330, count);
  if (!mono || !full) return null;
  return { mono, full };
}

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x) => Math.min(Math.max(x, 0), 1);

// Debug/testing hook: ?heroT=12 starts the choreography clock at 12s so a
// given phase can be inspected without waiting through the sequence.
function initialTime() {
  try {
    const v = parseFloat(new URLSearchParams(window.location.search).get("heroT"));
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

// Spheres with rand above this detach and follow the cursor (~4% — the
// same near-white accents colored "hot" below, so the swarm reads as the
// bright ones leaving the word).
const FOLLOWER_R = 0.955;
const FOLLOW_START = 9.0;

function VoxelWord({ started, count }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const timeRef = useRef(initialTime());
  const pointer = useRef(new THREE.Vector2(999, 999));
  const pointerTarget = useRef(new THREE.Vector2(999, 999));
  const pointerNdc = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();
  const [targets, setTargets] = useState(null);

  useEffect(() => {
    let alive = true;
    buildTargets(count).then((t) => alive && setTargets(t));
    return () => {
      alive = false;
    };
  }, [count]);

  // Per-instance state: scatter start, randomness, follower swarm state
  const inst = useMemo(() => {
    const starts = new Float32Array(count * 3);
    const rands = new Float32Array(count);
    const orbitR = new Float32Array(count);
    const orbitSpeed = new Float32Array(count);
    const orbitPhase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const th = Math.random() * TWO_PI;
      const rad = 4 + Math.random() * 7;
      starts[i * 3] = Math.cos(th) * rad;
      starts[i * 3 + 1] = (Math.random() - 0.5) * 8;
      starts[i * 3 + 2] = Math.sin(th) * rad - 3;
      rands[i] = Math.random();
      orbitR[i] = 0.25 + Math.random() * 0.6;
      orbitSpeed[i] = 1.2 + Math.random() * 2.2;
      orbitPhase[i] = Math.random() * TWO_PI;
    }
    return {
      starts,
      rands,
      orbitR,
      orbitSpeed,
      orbitPhase,
      // follower positions/velocities, lazily initialized (NaN = not yet)
      fpos: new Float32Array(count * 2).fill(NaN),
      fvel: new Float32Array(count * 2),
      dummy: new THREE.Object3D(),
    };
  }, [count]);

  // Flat 3-step toon ramp — hard bands, no glow
  const gradientMap = useMemo(() => {
    const tex = new THREE.DataTexture(
      new Uint8Array([70, 165, 255]),
      3,
      1,
      THREE.RedFormat
    );
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Per-instance flat colors: moss → lime range, near-white for followers
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !targets) return;
    const moss = new THREE.Color("#3d5c0a");
    const lime = new THREE.Color("#C8FF00");
    const hot = new THREE.Color("#f2ffd0");
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = inst.rands[i];
      if (r > 0.94) c.copy(hot);
      else c.copy(moss).lerp(lime, Math.min(1, r * 1.4));
      mesh.setColorAt(i, c);
    }
    mesh.instanceColor.needsUpdate = true;
  }, [targets, count, inst]);

  useEffect(() => {
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerNdc.current.set(nx, ny);
      pointerTarget.current.set(
        nx * (viewport.width / 2),
        ny * (viewport.height / 2)
      );
    };
    const onLeave = () => pointerTarget.current.set(999, 999);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [viewport.width, viewport.height]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh || !targets) return;
    const dt = Math.min(delta, 0.05);
    if (started) timeRef.current += dt;
    const t = timeRef.current;

    pointer.current.lerp(pointerTarget.current, 0.14);
    const px = pointer.current.x;
    const py = pointer.current.y;
    const pointerActive = pointerTarget.current.x < 900;

    // gentle parallax tilt of the whole word toward the cursor
    if (groupRef.current) {
      const tx = pointerActive ? pointerNdc.current.x : 0;
      const ty = pointerActive ? pointerNdc.current.y : 0;
      groupRef.current.rotation.y += (tx * 0.09 - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (-ty * 0.06 - groupRef.current.rotation.x) * 0.03;
    }

    const scale = Math.min(viewport.width * 0.92, 17);
    const baseSize = scale * 0.0055;
    const { starts, rands, orbitR, orbitSpeed, orbitPhase, fpos, fvel, dummy } = inst;
    const { mono, full } = targets;
    const shrink = 1 - Math.min(t / 4, 1) * 0.5;

    for (let i = 0; i < count; i++) {
      const r = rands[i];
      // phase 1: vortex → "S."   phase 2: "S." → "Startathon."
      const p1 = easeOutCubic(clamp01((t - 2.6 - r * 1.2) / 2.0));
      const p2 = easeOutCubic(clamp01((t - 6.6 - r * 1.0) / 1.8));

      // vortex drift
      const ang = t * (0.18 + r * 0.25) + r * TWO_PI;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const sx0 = starts[i * 3];
      const sy0 = starts[i * 3 + 1];
      const sz0 = starts[i * 3 + 2];
      const sx = (ca * sx0 + sa * sz0) * shrink;
      const sy = (sy0 + Math.sin(t * 0.6 + r * 12) * 0.4 * (1 - p1)) * shrink;
      const sz = (-sa * sx0 + ca * sz0) * shrink;

      // vortex → S. → word
      const mx = mono[i * 2] * scale;
      const my = mono[i * 2 + 1] * scale;
      let x = sx + (mx - sx) * p1;
      let y = sy + (my - sy) * p1;
      let z = sz * (1 - p1);
      x += (full[i * 2] * scale - x) * p2;
      y += (full[i * 2 + 1] * scale - y) * p2;

      let spin = t * (0.3 + r * 0.7) + r * 10;

      // follower swarm: the bright spheres chase the cursor once the word
      // has formed, and spring back to their slots when it leaves
      if (r > FOLLOWER_R && t > FOLLOW_START) {
        let fx = fpos[i * 2];
        let fy = fpos[i * 2 + 1];
        if (Number.isNaN(fx)) {
          fx = x;
          fy = y;
        }
        let dx;
        let dy;
        if (pointerActive) {
          const oa = t * orbitSpeed[i] + orbitPhase[i];
          dx = px + Math.cos(oa) * orbitR[i] - fx;
          dy = py + Math.sin(oa) * orbitR[i] * 0.7 - fy;
        } else {
          dx = x - fx;
          dy = y - fy;
        }
        let vx = fvel[i * 2] + dx * 14 * dt;
        let vy = fvel[i * 2 + 1] + dy * 14 * dt;
        const dmp = 1 - Math.min(3.2 * dt, 0.85);
        vx *= dmp;
        vy *= dmp;
        fx += vx * dt;
        fy += vy * dt;
        fpos[i * 2] = fx;
        fpos[i * 2 + 1] = fy;
        fvel[i * 2] = vx;
        fvel[i * 2 + 1] = vy;
        x = fx;
        y = fy;
        z = 0.6; // ride slightly in front of the word
        spin += Math.sqrt(vx * vx + vy * vy) * 0.6;
      }

      dummy.position.set(x, y, z);
      dummy.rotation.set(spin, spin * 0.8, 0);
      dummy.scale.setScalar(baseSize * (0.8 + r * 0.4));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // fade the whole system in over the first 1.2s
    mesh.material.opacity = Math.min(t * 0.85, 1);
  });

  if (!targets) return null;

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshToonMaterial gradientMap={gradientMap} transparent opacity={0} />
      </instancedMesh>
    </group>
  );
}

export function canUseParticles() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export const StaticHeroBackground = () => (
  <div
    aria-hidden="true"
    className="absolute left-0 top-0 size-full"
    style={{
      background:
        "radial-gradient(ellipse 80% 60% at 30% 25%, rgba(200,255,0,0.09), transparent 65%)," +
        "radial-gradient(ellipse 70% 55% at 75% 70%, rgba(200,255,0,0.05), transparent 60%)," +
        "#050505",
    }}
  />
);

const HeroParticles = ({ started = true }) => {
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(true);
  const isMobile = useMemo(
    () => window.matchMedia("(max-width: 767px)").matches,
    []
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" className="absolute left-0 top-0 size-full">
      <CanvasErrorBoundary fallback={<StaticHeroBackground />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
          dpr={isMobile ? 1 : [1, 1.5]}
          frameloop={inView ? "always" : "never"}
          style={{ position: "absolute", inset: 0, background: "#050505" }}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 8]} intensity={1.3} />
          <directionalLight position={[-6, -2, -4]} intensity={0.4} color="#C8FF00" />
          <VoxelWord started={started} count={isMobile ? 1400 : 3200} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default HeroParticles;
