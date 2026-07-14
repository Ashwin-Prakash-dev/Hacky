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
// The walker scene is an animated cycle of WALK_FRAMES poses.
const KEYS = [
  { at: 2.6, dur: 2.0 }, // vortex -> S.
  { at: 6.6, dur: 1.8 }, // -> Startathon.
  { at: 11.2, dur: 1.8 }, // -> man walking with laptop (animated stride)
  { at: 17.0, dur: 1.8 }, // -> kneeling, opening the laptop
  { at: 21.6, dur: 1.8 }, // -> laptop on a desk, code on screen
  { at: 26.2, dur: 1.8 }, // -> presenting at the podium (demo day)
  { at: 30.8, dur: 1.8 }, // -> raising the trophy
  { at: 35.4, dur: 1.8 }, // -> Startathon. (resting state)
];
const WALK_SCENE = 2;
const STRIDE_TIME = 1.05; // seconds per full gait cycle
const SHAPE_W = 1800;
const SHAPE_H = 520;

// The walking figure is analytic rather than rasterized: every particle
// owns a fixed slot on the skeleton (segment, fraction along it, offset
// across it) and its position is computed from the stride phase each
// frame — so the man genuinely walks instead of crossfading poses.
// Joint layout mirrors the other pictograms' proportions.
function walkerJoints(ph) {
  const W = SHAPE_W;
  const H = SHAPE_H;
  const cx = W / 2 - 40;
  const bob = Math.sin(ph * 2) * H * 0.018;
  const hipY = H * 0.56 + bob;
  const legL = H * 0.36;
  const swing = 0.62 * Math.sin(ph);
  const armY = H * 0.37 + bob;
  const armSw = 0.7 * Math.sin(ph + Math.PI);
  return {
    headX: cx,
    headY: H * 0.17 + bob,
    headR: H * 0.085,
    neckX: cx,
    neckY: H * 0.3 + bob,
    hipX: cx - 8,
    hipY,
    f1x: cx - 8 + Math.sin(swing) * legL,
    f1y: hipY + Math.cos(swing) * legL,
    f2x: cx - 8 - Math.sin(swing) * legL,
    f2y: hipY + Math.cos(swing) * legL,
    shX: cx - 4,
    shY: armY,
    h1x: cx - 4 + Math.sin(armSw - 0.5) * H * 0.24,
    h1y: armY + Math.cos(armSw - 0.5) * H * 0.24,
    h2x: cx + 115,
    h2y: H * 0.5 + bob,
    lapX: cx + 175,
    lapY: H * 0.54 + bob,
  };
}

// Cumulative particle share per segment:
// head, torso, front leg, back leg, free arm, laptop arm, laptop slab
const WALK_SEG_CDF = [0.11, 0.22, 0.37, 0.52, 0.62, 0.72, 1.0];

const STROKE_HALF = 23; // half of the 46px pictogram stroke width

function segPoint(J, seg, u, v, out) {
  let x1;
  let y1;
  let x2;
  let y2;
  switch (seg) {
    case 0: {
      const a = u * TWO_PI;
      const rr = J.headR * Math.sqrt(v);
      out[0] = J.headX + Math.cos(a) * rr;
      out[1] = J.headY + Math.sin(a) * rr;
      return;
    }
    case 1: x1 = J.neckX; y1 = J.neckY; x2 = J.hipX; y2 = J.hipY; break;
    case 2: x1 = J.hipX; y1 = J.hipY; x2 = J.f1x; y2 = J.f1y; break;
    case 3: x1 = J.hipX; y1 = J.hipY; x2 = J.f2x; y2 = J.f2y; break;
    case 4: x1 = J.shX; y1 = J.shY; x2 = J.h1x; y2 = J.h1y; break;
    case 5: x1 = J.shX; y1 = J.shY; x2 = J.h2x; y2 = J.h2y; break;
    default: {
      // laptop slab under the arm, slightly tilted
      const lx = (u - 0.5) * 160;
      const ly = (v - 0.5) * 100;
      const c = Math.cos(-0.14);
      const s = Math.sin(-0.14);
      out[0] = J.lapX + lx * c - ly * s;
      out[1] = J.lapY + lx * s + ly * c;
      return;
    }
  }
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const off = (v - 0.5) * 2 * STROKE_HALF;
  out[0] = x1 + dx * u + (-dy / len) * off;
  out[1] = y1 + dy * u + (dx / len) * off;
}

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

// Laptop open on a desk, "</>" cut out of the glowing screen
function drawDesk(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2;
  ctx.fillRect(cx - 360, H * 0.74, 720, 26); // desk top
  ctx.fillRect(cx - 330, H * 0.74 + 26, 28, H * 0.18); // legs
  ctx.fillRect(cx + 302, H * 0.74 + 26, 28, H * 0.18);
  ctx.fillRect(cx - 160, H * 0.695, 320, 22); // laptop base
  ctx.fillRect(cx - 145, H * 0.38, 290, 140); // screen
  ctx.save();
  ctx.globalCompositeOperation = "destination-out"; // punch the code glyph
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '900 96px "Open Sauce Sans", sans-serif';
  ctx.fillText("</>", cx, H * 0.38 + 72);
  ctx.restore();
}

// Demo day: presenter at a podium gesturing at a big screen, audience below
function drawPodium(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  strokeSetup(ctx);
  const cx = W / 2;
  ctx.beginPath();
  ctx.arc(cx - 330, H * 0.24, H * 0.075, 0, TWO_PI); // presenter head
  ctx.fill();
  line(ctx, cx - 330, H * 0.35, cx - 330, H * 0.58); // torso
  line(ctx, cx - 328, H * 0.42, cx - 195, H * 0.28); // arm toward screen
  ctx.fillRect(cx - 415, H * 0.58, 190, H * 0.30); // podium
  ctx.fillRect(cx - 90, H * 0.16, 470, 290); // big screen
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '900 150px "Open Sauce Sans", sans-serif';
  ctx.fillText("S.", cx - 90 + 235, H * 0.16 + 145);
  ctx.restore();
  for (let k = 0; k < 4; k++) {
    ctx.beginPath(); // audience heads
    ctx.arc(cx - 40 + k * 130, H * 0.90, H * 0.05, 0, TWO_PI);
    ctx.fill();
  }
}

// Winning: figure with both arms up raising the trophy
function drawTrophy(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  strokeSetup(ctx);
  const cx = W / 2;
  ctx.beginPath();
  ctx.arc(cx, H * 0.36, H * 0.08, 0, TWO_PI); // head
  ctx.fill();
  line(ctx, cx, H * 0.47, cx, H * 0.68); // torso
  line(ctx, cx, H * 0.68, cx + 85, H * 0.94); // legs
  line(ctx, cx, H * 0.68, cx - 85, H * 0.94);
  line(ctx, cx, H * 0.52, cx - 110, H * 0.26); // arms in a V
  line(ctx, cx, H * 0.52, cx + 110, H * 0.26);
  ctx.fillRect(cx - 90, H * 0.04, 180, 74); // trophy bowl
  ctx.fillRect(cx - 20, H * 0.04 + 74, 40, 40); // stem
  ctx.fillRect(cx - 62, H * 0.04 + 114, 124, 26); // base
}

async function buildTargets(count) {
  await loadDisplayFont();
  const W = SHAPE_W;
  const H = SHAPE_H;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";

  const sample = (draw) => {
    draw();
    return samplePoints(ctx, W, H, count);
  };

  const shapes = [
    sample(() => drawText(ctx, W, H, WORD_MONO, 460)),
    sample(() => drawText(ctx, W, H, WORD_FULL, 330)),
    { walk: true }, // analytic walking figure, computed per frame
    sample(() => drawOpening(ctx, W, H)),
    sample(() => drawDesk(ctx, W, H)),
    sample(() => drawPodium(ctx, W, H)),
    sample(() => drawTrophy(ctx, W, H)),
    sample(() => drawText(ctx, W, H, WORD_FULL, 330)),
  ];
  if (shapes.some((s) => !s)) return null;
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
    // walking-figure slots: segment via the weighted CDF, then a spot
    // along/across it
    const walkSeg = new Uint8Array(count);
    const walkU = new Float32Array(count);
    const walkV = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const pick = Math.random();
      let seg = 0;
      while (pick > WALK_SEG_CDF[seg]) seg++;
      walkSeg[i] = seg;
      walkU[i] = Math.random();
      walkV[i] = Math.random();
    }
    return {
      starts,
      rands,
      walkSeg,
      walkU,
      walkV,
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
    const { starts, rands, walkSeg, walkU, walkV, offsets, vels, dummy } = inst;
    const shapes = targets;
    const shrink = 1 - Math.min(t / 4, 1) * 0.5;

    // walking-figure joints for this frame (shared by all particles)
    const J =
      t > KEYS[WALK_SCENE].at
        ? walkerJoints(((t - KEYS[WALK_SCENE].at) / STRIDE_TIME) * TWO_PI)
        : null;
    const segOut = [0, 0];

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
        const s = shapes[k];
        let tx;
        let ty;
        if (s.walk) {
          // animated scene: this particle's slot on the walking skeleton
          segPoint(J, walkSeg[i], walkU[i], walkV[i], segOut);
          tx = (segOut[0] - SHAPE_W / 2) / SHAPE_W;
          ty = -(segOut[1] - SHAPE_H / 2) / SHAPE_W;
        } else {
          tx = s[i * 2];
          ty = s[i * 2 + 1];
        }
        x += (tx * scale - x) * pk;
        y += (ty * scale - y) * pk;
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
