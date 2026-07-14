/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props */
import { useEffect, useMemo, useRef, useState, Component } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

// A particle "movie" on an InstancedMesh of toon-shaded spheres. The
// spheres drift in from a vortex, then morph through a sequence of
// keyframe silhouettes before settling on the wordmark:
//   S.  →  Startathon.  →  figure walking with a laptop  →  figure
//   opening the laptop  →  laptop open on a table  →  Startathon.
// Throughout, every sphere breathes on a small sine orbit and cursor
// motion drags nearby spheres along its path (a wake that springs back).
const WORD_FULL = "Startathon.";
const WORD_MONO = "S.";
const TWO_PI = Math.PI * 2;

// Morph timeline: shapes[k] forms at KEYS[k].at over KEYS[k].dur seconds
// (plus up to ~1s of per-particle stagger). Holds are the gaps between.
const KEYS = [
  { at: 2.6, dur: 2.0 }, // vortex -> S.
  { at: 6.6, dur: 1.8 }, // -> Startathon.
  { at: 11.2, dur: 1.8 }, // -> walker with laptop
  { at: 15.8, dur: 1.8 }, // -> opening the laptop
  { at: 20.4, dur: 1.8 }, // -> laptop on a table
  { at: 25.0, dur: 1.8 }, // -> Startathon. (resting state)
];

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

// Sample whatever is currently drawn on the canvas into `count` normalized
// target positions (x in [-0.5, 0.5], y aspect-correct), evenly spread.
function samplePoints(ctx, W, H, count) {
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

function drawText(ctx, W, H, text, px) {
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "14px";
  ctx.font = `900 ${px}px "Open Sauce Sans", sans-serif`;
  const w = ctx.measureText(text).width;
  if (w > W * 0.97) {
    px = Math.floor((px * W * 0.97) / w);
    ctx.font = `900 ${px}px "Open Sauce Sans", sans-serif`;
  }
  ctx.fillText(text, W / 2, H / 2);
}

// Pictogram scenes, drawn as bold rounded strokes so the silhouettes stay
// readable when rebuilt from spheres.
function strokeSetup(ctx) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 46;
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// A figure mid-stride, laptop tucked under the leading arm
function drawWalker(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  strokeSetup(ctx);
  const cx = W / 2 - 40;
  ctx.beginPath();
  ctx.arc(cx, H * 0.17, H * 0.085, 0, TWO_PI);
  ctx.fill();
  line(ctx, cx, H * 0.30, cx - 8, H * 0.56); // torso, slight lean
  line(ctx, cx - 8, H * 0.56, cx + 105, H * 0.90); // front leg
  line(ctx, cx - 8, H * 0.56, cx - 110, H * 0.90); // back leg
  line(ctx, cx - 4, H * 0.37, cx - 115, H * 0.53); // back arm swings
  line(ctx, cx - 4, H * 0.37, cx + 115, H * 0.50); // front arm carries
  ctx.save();
  ctx.translate(cx + 175, H * 0.54);
  ctx.rotate(-0.14);
  ctx.fillRect(-80, -50, 160, 100); // laptop under the arm
  ctx.restore();
}

// The figure kneeling, lifting the laptop lid toward themselves
function drawOpening(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  strokeSetup(ctx);
  const cx = W / 2 - 210;
  const ground = H * 0.86;
  ctx.beginPath();
  ctx.arc(cx, H * 0.26, H * 0.08, 0, TWO_PI);
  ctx.fill();
  line(ctx, cx, H * 0.38, cx + 6, H * 0.60); // torso
  line(ctx, cx + 6, H * 0.60, cx + 85, H * 0.63); // front thigh
  line(ctx, cx + 85, H * 0.63, cx + 85, ground); // front shin
  line(ctx, cx + 6, H * 0.60, cx - 20, ground); // back leg kneeling
  line(ctx, cx + 2, H * 0.44, cx + 165, H * 0.50); // arm on the lid
  const bx = cx + 150;
  const by = ground;
  ctx.fillRect(bx, by - 26, 250, 26); // laptop base on the ground
  ctx.save();
  ctx.translate(bx + 244, by - 26); // hinge at the far end of the base
  ctx.rotate(-1.85); // lid half-open, rising away from the figure
  ctx.fillRect(0, -12, 215, 24);
  ctx.restore();
}

// Laptop open on a table
function drawLaptopTable(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2;
  ctx.fillRect(cx - 360, H * 0.74, 720, 26); // table top
  ctx.fillRect(cx - 330, H * 0.74 + 26, 28, H * 0.18); // legs
  ctx.fillRect(cx + 302, H * 0.74 + 26, 28, H * 0.18);
  ctx.fillRect(cx - 160, H * 0.695, 320, 22); // laptop base
  ctx.fillRect(cx - 145, H * 0.38, 290, 140); // screen
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
  ctx.strokeStyle = "#fff";

  const shapes = [];
  const scenes = [
    () => drawText(ctx, W, H, WORD_MONO, 460),
    () => drawText(ctx, W, H, WORD_FULL, 330),
    () => drawWalker(ctx, W, H),
    () => drawOpening(ctx, W, H),
    () => drawLaptopTable(ctx, W, H),
    () => drawText(ctx, W, H, WORD_FULL, 330),
  ];
  for (const draw of scenes) {
    draw();
    const s = samplePoints(ctx, W, H, count);
    if (!s) return null;
    shapes.push(s);
  }
  return shapes;
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

function VoxelWord({ started, count }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const timeRef = useRef(initialTime());
  const pointer = useRef(new THREE.Vector2(999, 999));
  const pointerPrev = useRef(new THREE.Vector2(999, 999));
  const pointerVel = useRef(new THREE.Vector2(0, 0));
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

  // Per-instance state: scatter start, randomness, wake spring state
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
      // spring offsets/velocities for the cursor wake
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

  // Per-instance flat colors: moss → lime range, a few near-white accents.
  // Also hint GL that instance matrices are rewritten every frame.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !targets) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
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

    const pointerActive = pointerTarget.current.x < 900;
    if (pointerActive && pointer.current.x > 900) {
      // pointer just entered: snap, so it doesn't streak across the scene
      pointer.current.copy(pointerTarget.current);
      pointerPrev.current.copy(pointerTarget.current);
    }
    pointerPrev.current.copy(pointer.current);
    pointer.current.lerp(pointerTarget.current, 0.14);
    const px = pointer.current.x;
    const py = pointer.current.y;
    // smoothed cursor velocity in world units/s, capped so fast flicks
    // don't launch spheres off-screen
    if (pointerActive) {
      pointerVel.current
        .copy(pointer.current)
        .sub(pointerPrev.current)
        .divideScalar(Math.max(dt, 1e-3));
      const vmag = pointerVel.current.length();
      if (vmag > 26) pointerVel.current.multiplyScalar(26 / vmag);
    } else {
      pointerVel.current.set(0, 0);
    }
    const pvx = pointerVel.current.x;
    const pvy = pointerVel.current.y;

    // gentle parallax tilt of the whole word toward the cursor
    if (groupRef.current) {
      const tx = pointerActive ? pointerNdc.current.x : 0;
      const ty = pointerActive ? pointerNdc.current.y : 0;
      groupRef.current.rotation.y += (tx * 0.09 - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (-ty * 0.06 - groupRef.current.rotation.x) * 0.03;
    }

    const scale = Math.min(viewport.width * 0.92, 17);
    const baseSize = scale * 0.0055;
    const wakeR = scale * 0.14;
    const wobAmp = scale * 0.0045;
    const { starts, rands, offsets, vels, dummy } = inst;
    const shapes = targets;
    const shrink = 1 - Math.min(t / 4, 1) * 0.5;

    for (let i = 0; i < count; i++) {
      const r = rands[i];
      // keyframe 0: vortex → first shape
      const p0 = easeOutCubic(clamp01((t - KEYS[0].at - r * 1.2) / KEYS[0].dur));

      // vortex drift
      const ang = t * (0.18 + r * 0.25) + r * TWO_PI;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const sx0 = starts[i * 3];
      const sy0 = starts[i * 3 + 1];
      const sz0 = starts[i * 3 + 2];
      const sx = (ca * sx0 + sa * sz0) * shrink;
      const sy = (sy0 + Math.sin(t * 0.6 + r * 12) * 0.4 * (1 - p0)) * shrink;
      const sz = (-sa * sx0 + ca * sz0) * shrink;

      let x = sx + (shapes[0][i * 2] * scale - sx) * p0;
      let y = sy + (shapes[0][i * 2 + 1] * scale - sy) * p0;
      let z = sz * (1 - p0);

      // chained morphs through the remaining keyframe shapes
      for (let k = 1; k < KEYS.length; k++) {
        const pk = easeOutCubic(clamp01((t - KEYS[k].at - r) / KEYS[k].dur));
        if (pk <= 0) break;
        x += (shapes[k][i * 2] * scale - x) * pk;
        y += (shapes[k][i * 2 + 1] * scale - y) * pk;
      }

      let spin = t * (0.3 + r * 0.7) + r * 10;

      // ambient breathing: every settled sphere drifts on its own small
      // orbit so the silhouettes shimmer instead of freezing
      const settle = p0;
      x += Math.sin(t * (0.7 + r * 0.9) + r * 40.0) * wobAmp * settle;
      y += Math.cos(t * (0.9 + r * 0.7) + r * 27.0) * wobAmp * settle;

      // cursor wake: spheres near the pointer get dragged along with its
      // motion, then spring back into place
      let ox = offsets[i * 2];
      let oy = offsets[i * 2 + 1];
      let vx = vels[i * 2];
      let vy = vels[i * 2 + 1];
      if (pointerActive && settle > 0.5) {
        const ddx = x + ox - px;
        const ddy = y + oy - py;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < wakeR) {
          const fall = 1 - dist / wakeR;
          const drag = fall * fall * 1.1 * dt;
          vx += pvx * drag;
          vy += pvy * drag;
        }
      }
      // spring home + damping
      vx += -ox * 11 * dt;
      vy += -oy * 11 * dt;
      const dmp = 1 - Math.min(3.4 * dt, 0.85);
      vx *= dmp;
      vy *= dmp;
      ox += vx * dt;
      oy += vy * dt;
      offsets[i * 2] = ox;
      offsets[i * 2 + 1] = oy;
      vels[i * 2] = vx;
      vels[i * 2 + 1] = vy;
      x += ox;
      y += oy;
      spin += Math.sqrt(vx * vx + vy * vy) * 0.4;

      dummy.position.set(x, y, z);
      dummy.rotation.set(spin, spin * 0.8, 0);
      dummy.scale.setScalar(baseSize * (0.8 + r * 0.4));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // fade the whole system in over the first 1.2s, then drop transparency
    // entirely so the material renders in the cheaper opaque pass
    if (t < 1.5) {
      mesh.material.opacity = Math.min(t * 0.85, 1);
    } else if (mesh.material.transparent) {
      mesh.material.opacity = 1;
      mesh.material.transparent = false;
      mesh.material.needsUpdate = true;
    }
  });

  if (!targets) return null;

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
        {/* 10x8 segments ≈ 60% fewer triangles; toon banding hides the
            low-poly silhouette at these sphere sizes */}
        <sphereGeometry args={[0.5, 10, 8]} />
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

  // Adaptive resolution: start at full DPR, step down when the frame rate
  // sags and back up when it recovers.
  const maxDpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  const minDpr = isMobile ? 0.7 : 0.85;
  const [dpr, setDpr] = useState(maxDpr);

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
          flat
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
          dpr={dpr}
          frameloop={inView ? "always" : "never"}
          style={{ position: "absolute", inset: 0, background: "#050505" }}
        >
          <PerformanceMonitor
            onDecline={() => setDpr(minDpr)}
            onIncline={() => setDpr(maxDpr)}
            flipflops={3}
            onFallback={() => setDpr(minDpr)}
          />
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
