/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props */
import { useEffect, useMemo, useRef, useState, Component } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ~7.5s choreography on an InstancedMesh of toon-shaded spheres:
//   0.0s – 3.2s  cubes drift in from depth, swirling in a slow vortex
//   3.2s – 7.5s  staggered convergence: each sphere peels off the vortex and
//                locks into its glyph position spelling STARTATHON
//   7.5s –  ∞    idle: slow tumble, spring-physics cursor repulsion, and
//                the whole word tilts parallax-style with the pointer

const WORD = "STARTATHON";
const TWO_PI = Math.PI * 2;

// The Zentry display font ships in /public/fonts but has no CSS @font-face;
// load it directly for the offscreen rasterization, falling back to the
// body font if the load fails.
async function loadDisplayFont() {
  try {
    const font = new FontFace("zentry", 'url(/fonts/zentry-regular.woff2)');
    await font.load();
    document.fonts.add(font);
    return { family: '"zentry", sans-serif', weight: 400 };
  } catch {
    try {
      await document.fonts.ready;
    } catch {
      /* sample with whatever is available */
    }
    return { family: '"Open Sauce Sans", sans-serif', weight: 900 };
  }
}

// Rasterize the word offscreen and return `count` normalized target
// positions (x in [-0.5, 0.5], y aspect-correct, slight z jitter),
// evenly spread across the glyphs.
async function sampleWordTargets(count) {
  const { family, weight } = await loadDisplayFont();
  const W = 1800;
  const H = 460;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let px = 330;
  ctx.font = `${weight} ${px}px ${family}`;
  const w = ctx.measureText(WORD).width;
  if (w > W * 0.97) {
    px = Math.floor((px * W * 0.97) / w);
    ctx.font = `${weight} ${px}px ${family}`;
  }
  ctx.fillText(WORD, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts = [];
  for (let y = 0; y < H; y += 3) {
    for (let x = 0; x < W; x += 3) {
      if (data[(y * W + x) * 4 + 3] > 128) pts.push(x, y);
    }
  }
  const n = pts.length / 2;
  if (n === 0) return null;

  // Fisher–Yates shuffle of point indices, then take `count` evenly
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const targets = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const j = order[i % n];
    targets[i * 3] = (pts[j * 2] - W / 2) / W + (Math.random() - 0.5) * 0.003;
    targets[i * 3 + 1] = -(pts[j * 2 + 1] - H / 2) / W + (Math.random() - 0.5) * 0.003;
    targets[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }
  return targets;
}

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

function VoxelWord({ started, count }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const timeRef = useRef(0);
  const pointer = useRef(new THREE.Vector2(999, 999));
  const pointerTarget = useRef(new THREE.Vector2(999, 999));
  const pointerNdc = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();
  const [targets, setTargets] = useState(null);

  useEffect(() => {
    let alive = true;
    sampleWordTargets(count).then((t) => alive && setTargets(t));
    return () => {
      alive = false;
    };
  }, [count]);

  // Per-instance state: scatter start, randomness, spring offset + velocity
  const inst = useMemo(() => {
    const starts = new Float32Array(count * 3);
    const rands = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const th = Math.random() * TWO_PI;
      const rad = 4 + Math.random() * 7;
      starts[i * 3] = Math.cos(th) * rad;
      starts[i * 3 + 1] = (Math.random() - 0.5) * 8;
      starts[i * 3 + 2] = Math.sin(th) * rad - 3;
      rands[i] = Math.random();
    }
    return {
      starts,
      rands,
      offsets: new Float32Array(count * 2),
      vels: new Float32Array(count * 2),
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

  // Per-instance flat colors: moss → lime range, a few near-white accents
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
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [viewport.width, viewport.height]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh || !targets) return;
    const dt = Math.min(delta, 0.05);
    if (started) timeRef.current += dt;
    const t = timeRef.current;

    pointer.current.lerp(pointerTarget.current, 0.12);
    const px = pointer.current.x;
    const py = pointer.current.y;

    // parallax tilt of the whole word toward the cursor
    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (pointerNdc.current.x * 0.16 - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x +=
        (-pointerNdc.current.y * 0.10 - groupRef.current.rotation.x) * 0.04;
    }

    const scale = Math.min(viewport.width * 1.02, 18);
    const repulseR = scale * 0.16;
    const baseSize = scale * 0.013;
    const { starts, rands, offsets, vels, dummy } = inst;
    const shrink = 1 - Math.min(t / 4, 1) * 0.5;

    for (let i = 0; i < count; i++) {
      const r = rands[i];
      const p = easeOutCubic(Math.min(Math.max((t - 3.2 - r * 1.8) / 2.5, 0), 1));

      // vortex drift
      const ang = t * (0.18 + r * 0.25) + r * TWO_PI;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const sx0 = starts[i * 3];
      const sy0 = starts[i * 3 + 1];
      const sz0 = starts[i * 3 + 2];
      const sx = (ca * sx0 + sa * sz0) * shrink;
      const sy = (sy0 + Math.sin(t * 0.6 + r * 12) * 0.4 * (1 - p)) * shrink;
      const sz = (-sa * sx0 + ca * sz0) * shrink;

      let x = sx + (targets[i * 3] * scale - sx) * p;
      let y = sy + (targets[i * 3 + 1] * scale - sy) * p;
      const z = sz + (targets[i * 3 + 2] * scale - sz) * p;

      // spring-physics cursor repulsion (only once converged)
      let ox = offsets[i * 2];
      let oy = offsets[i * 2 + 1];
      let vx = vels[i * 2];
      let vy = vels[i * 2 + 1];
      const dx = x + ox - px;
      const dy = y + oy - py;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1e-4;
      if (dist < repulseR && p > 0.5) {
        const f = ((repulseR - dist) / repulseR) * 30 * p;
        vx += (dx / dist) * f * dt;
        vy += (dy / dist) * f * dt;
      }
      // spring back to rest + damping
      vx += -ox * 14 * dt;
      vy += -oy * 14 * dt;
      vx *= 1 - Math.min(4.5 * dt, 0.9);
      vy *= 1 - Math.min(4.5 * dt, 0.9);
      ox += vx * dt;
      oy += vy * dt;
      offsets[i * 2] = ox;
      offsets[i * 2 + 1] = oy;
      vels[i * 2] = vx;
      vels[i * 2 + 1] = vy;
      x += ox;
      y += oy;

      // tumble: slow idle spin, faster while displaced by the cursor
      const agitation = Math.min(Math.sqrt(ox * ox + oy * oy) * 3, 2);
      const spin = t * (0.3 + r * 0.7) + r * 10 + agitation * 2;
      dummy.position.set(x, y, z);
      dummy.rotation.set(spin, spin * 0.8, 0);
      dummy.scale.setScalar(baseSize * (0.7 + r * 0.9));
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
          <VoxelWord started={started} count={isMobile ? 500 : 1000} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default HeroParticles;
