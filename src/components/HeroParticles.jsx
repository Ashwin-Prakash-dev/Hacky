/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props */
import { useEffect, useMemo, useRef, useState, Component } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

// A particle "movie" on an InstancedMesh of toon-shaded spheres. The
// spheres drift in from a vortex, then morph through the builder's
// journey before settling on the wordmark:
//   S. → Startathon. → man walking with a laptop (animated stride) →
//   the team around a table, laptop lids swinging open (animated) →
//   presenter with a pointer stick at the demo-day screen →
//   the team raising the trophy together → Startathon.
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
  { at: 11.2, dur: 1.8 }, // -> man walking with laptop (animated)
  { at: 17.0, dur: 1.8 }, // -> team at the table, lids opening (animated)
  { at: 23.0, dur: 1.8 }, // -> presenting at the demo-day screen
  { at: 27.6, dur: 1.8 }, // -> team raising the trophy
  { at: 32.2, dur: 1.8 }, // -> Startathon. (resting state)
];
const WALK_SCENE = 2;
const TABLE_SCENE = 3;
const STRIDE_TIME = 1.05; // seconds per full gait cycle
const SHAPE_W = 1800;
const SHAPE_H = 520;

// ---------------------------------------------------------------------------
// Animated scenes are analytic: a scene is a list of primitive elements
// (disc / stroke segment / rotated rect) recomputed each frame from the
// scene-local time. Every particle owns a fixed slot (element index + a
// spot on it), so motion is perfectly continuous — no pose crossfading.

const disc = (x, y, r) => ({ k: 0, x, y, r, wt: Math.PI * r * r });
const seg = (x1, y1, x2, y2, w = 46) => ({
  k: 1,
  x1,
  y1,
  x2,
  y2,
  w,
  wt: (Math.hypot(x2 - x1, y2 - y1) + w) * w,
});
const rect = (x, y, w, h, a = 0) => ({ k: 2, x, y, w, h, a, wt: w * h });

function evalElem(e, u, v, out) {
  if (e.k === 0) {
    const a = u * TWO_PI;
    const rr = e.r * Math.sqrt(v);
    out[0] = e.x + Math.cos(a) * rr;
    out[1] = e.y + Math.sin(a) * rr;
  } else if (e.k === 1) {
    const dx = e.x2 - e.x1;
    const dy = e.y2 - e.y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const off = (v - 0.5) * e.w;
    out[0] = e.x1 + dx * u + (-dy / len) * off;
    out[1] = e.y1 + dy * u + (dx / len) * off;
  } else {
    const lx = (u - 0.5) * e.w;
    const ly = (v - 0.5) * e.h;
    const c = Math.cos(e.a);
    const s = Math.sin(e.a);
    out[0] = e.x + lx * c - ly * s;
    out[1] = e.y + lx * s + ly * c;
  }
}

const smooth01 = (x) => {
  const c = Math.min(Math.max(x, 0), 1);
  return c * c * (3 - 2 * c);
};

// The walking figure: legs and free arm swing, body bobs, laptop steady.
function walkerElems(ts) {
  const W = SHAPE_W;
  const H = SHAPE_H;
  const ph = (ts / STRIDE_TIME) * TWO_PI;
  const cx = W / 2 - 40;
  const bob = Math.sin(ph * 2) * H * 0.018;
  const hipX = cx - 8;
  const hipY = H * 0.56 + bob;
  const legL = H * 0.36;
  const swing = 0.62 * Math.sin(ph);
  const armY = H * 0.37 + bob;
  const armSw = 0.7 * Math.sin(ph + Math.PI);
  return [
    disc(cx, H * 0.17 + bob, H * 0.085),
    seg(cx, H * 0.3 + bob, hipX, hipY),
    seg(hipX, hipY, hipX + Math.sin(swing) * legL, hipY + Math.cos(swing) * legL),
    seg(hipX, hipY, hipX - Math.sin(swing) * legL, hipY + Math.cos(swing) * legL),
    seg(
      cx - 4,
      armY,
      cx - 4 + Math.sin(armSw - 0.5) * H * 0.24,
      armY + Math.cos(armSw - 0.5) * H * 0.24
    ),
    seg(cx - 4, armY, cx + 115, H * 0.5 + bob),
    rect(cx + 175, H * 0.54 + bob, 160, 100, -0.14),
  ];
}

// The team around a table (side view): two seated in profile, two behind,
// two laptops on the tabletop whose lids swing open over the scene.
function tableElems(ts) {
  const W = SHAPE_W;
  const H = SHAPE_H;
  const cx = W / 2;
  const topY = H * 0.6;
  // lids: closed on arrival, swing open once the team has formed, then
  // a faint sway so the scene stays alive
  const open = smooth01((ts - 1.6) / 2.6);
  const lid = 0.08 + 1.32 * open + Math.sin(ts * 1.8) * 0.03 * open;
  const lc = Math.cos(lid) * 140;
  const ls = Math.sin(lid) * 140;
  const lhx = cx - 225; // left laptop hinge (inner end of its base)
  const rhx = cx + 225;
  const hy = topY - 24;
  return [
    rect(cx, topY + 13, 780, 26), // tabletop
    rect(cx - 350, topY + 98, 28, 144), // legs
    rect(cx + 350, topY + 98, 28, 144),
    // left teammate, seated profile facing right
    disc(cx - 560, H * 0.29, 42),
    seg(cx - 560, H * 0.37, cx - 545, H * 0.52),
    seg(cx - 552, H * 0.41, cx - 455, H * 0.49, 40), // arm to the table
    seg(cx - 545, H * 0.52, cx - 470, H * 0.52), // thigh
    seg(cx - 470, H * 0.52, cx - 465, H * 0.76, 40), // shin
    // right teammate, mirrored
    disc(cx + 560, H * 0.29, 42),
    seg(cx + 560, H * 0.37, cx + 545, H * 0.52),
    seg(cx + 552, H * 0.41, cx + 455, H * 0.49, 40),
    seg(cx + 545, H * 0.52, cx + 470, H * 0.52),
    seg(cx + 470, H * 0.52, cx + 465, H * 0.76, 40),
    // two teammates behind the table
    disc(cx - 150, H * 0.245, 38),
    seg(cx - 150, H * 0.32, cx - 150, H * 0.58),
    disc(cx + 140, H * 0.265, 38),
    seg(cx + 140, H * 0.34, cx + 140, H * 0.58),
    // laptops: bases on the tabletop, lids opening outward
    rect(cx - 310, topY - 14, 175, 26),
    seg(lhx, hy, lhx - lc, hy - ls, 30), // left lid
    rect(cx + 310, topY - 14, 175, 26),
    seg(rhx, hy, rhx + lc, hy - ls, 30), // right lid
  ];
}

const ANIM_SCENES = { walk: walkerElems, table: tableElems };

// ---------------------------------------------------------------------------
// Static scenes are rasterized offscreen and sampled once.

// Open Sauce Sans 900 — the site's headline font, declared in index.css.
async function loadDisplayFont() {
  try {
    await document.fonts.load('900 330px "Open Sauce Sans"');
    await document.fonts.ready;
  } catch {
    /* sample with whatever is available */
  }
}

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

// Demo day: presenter (full figure, pointer stick in hand) beside a
// lectern, big screen with S., audience heads below.
function drawPodium(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  strokeSetup(ctx);
  const cx = W / 2;
  const px = cx - 320;
  ctx.beginPath();
  ctx.arc(px, H * 0.2, H * 0.075, 0, TWO_PI);
  ctx.fill();
  line(ctx, px, H * 0.31, px, H * 0.55); // torso
  line(ctx, px, H * 0.55, px + 60, H * 0.88); // legs
  line(ctx, px, H * 0.55, px - 60, H * 0.88);
  line(ctx, px - 2, H * 0.38, px - 90, H * 0.52); // relaxed arm
  line(ctx, px - 2, H * 0.38, px + 118, H * 0.31); // pointing arm
  ctx.save();
  ctx.lineWidth = 18; // pointer stick
  line(ctx, px + 118, H * 0.31, px + 255, H * 0.235);
  ctx.restore();
  ctx.fillRect(px - 265, H * 0.52, 160, H * 0.36); // lectern
  ctx.fillRect(cx - 20, H * 0.14, 470, 290); // big screen
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '900 150px "Open Sauce Sans", sans-serif';
  ctx.fillText("S.", cx - 20 + 235, H * 0.14 + 145);
  ctx.restore();
  for (let k = 0; k < 4; k++) {
    ctx.beginPath(); // audience heads
    ctx.arc(cx + 20 + k * 130, H * 0.9, H * 0.05, 0, TWO_PI);
    ctx.fill();
  }
}

// Winning together: a proper cup (bowl, handles, stem, base) raised by
// the center figure, flanked by two celebrating teammates.
function drawTrophyTeam(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  strokeSetup(ctx);
  const cx = W / 2;
  const ty = H * 0.05;
  ctx.beginPath(); // bowl, tapered
  ctx.moveTo(cx - 100, ty);
  ctx.lineTo(cx + 100, ty);
  ctx.lineTo(cx + 44, ty + 92);
  ctx.lineTo(cx - 44, ty + 92);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.lineWidth = 20; // handles
  ctx.beginPath();
  ctx.arc(cx - 112, ty + 34, 40, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 112, ty + 34, 40, Math.PI * 1.5, Math.PI * 0.5);
  ctx.stroke();
  ctx.restore();
  ctx.fillRect(cx - 14, ty + 92, 28, 34); // stem
  ctx.fillRect(cx - 58, ty + 126, 116, 22); // base

  ctx.beginPath(); // center figure holding it up
  ctx.arc(cx, H * 0.44, 40, 0, TWO_PI);
  ctx.fill();
  line(ctx, cx, H * 0.52, cx, H * 0.7);
  line(ctx, cx, H * 0.7, cx + 70, H * 0.94);
  line(ctx, cx, H * 0.7, cx - 70, H * 0.94);
  line(ctx, cx, H * 0.56, cx - 62, H * 0.32); // arms to the trophy base
  line(ctx, cx, H * 0.56, cx + 62, H * 0.32);

  for (const side of [-1, 1]) {
    const fx = cx + side * 195; // celebrating teammates
    ctx.beginPath();
    ctx.arc(fx, H * 0.5, 36, 0, TWO_PI);
    ctx.fill();
    line(ctx, fx, H * 0.57, fx, H * 0.74);
    line(ctx, fx, H * 0.74, fx + 55, H * 0.95);
    line(ctx, fx, H * 0.74, fx - 55, H * 0.95);
    line(ctx, fx, H * 0.61, fx + side * 95, H * 0.37); // outer arm up
    line(ctx, fx, H * 0.61, fx - side * 60, H * 0.55); // inner arm
  }
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
    { anim: "walk" },
    { anim: "table" },
    sample(() => drawPodium(ctx, W, H)),
    sample(() => drawTrophyTeam(ctx, W, H)),
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

// Fixed particle slots for an animated scene: element index chosen by
// area-weighted CDF, plus a spot along/across that element.
function assignSlots(elems, count) {
  const total = elems.reduce((a, e) => a + e.wt, 0);
  const cdf = [];
  let acc = 0;
  for (const e of elems) {
    acc += e.wt / total;
    cdf.push(acc);
  }
  const idx = new Uint16Array(count);
  const u = new Float32Array(count);
  const v = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const pick = Math.random();
    let s = 0;
    while (pick > cdf[s] && s < cdf.length - 1) s++;
    idx[i] = s;
    u[i] = Math.random();
    v[i] = Math.random();
  }
  return { idx, u, v };
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

  // Per-instance state: scatter start, randomness, animated-scene slots,
  // wake spring state
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
    const slots = {};
    for (const name of Object.keys(ANIM_SCENES)) {
      slots[name] = assignSlots(ANIM_SCENES[name](0), count);
    }
    return {
      starts,
      rands,
      slots,
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

    // gentle parallax tilt of the whole scene toward the cursor
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
    const { starts, rands, slots, offsets, vels, dummy } = inst;
    const shapes = targets;
    const shrink = 1 - Math.min(t / 4, 1) * 0.5;

    // animated-scene elements for this frame (shared by all particles)
    const animEls = {
      walk: t > KEYS[WALK_SCENE].at ? walkerElems(t - KEYS[WALK_SCENE].at) : null,
      table: t > KEYS[TABLE_SCENE].at ? tableElems(t - KEYS[TABLE_SCENE].at) : null,
    };
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
        if (s.anim) {
          const slot = slots[s.anim];
          evalElem(animEls[s.anim][slot.idx[i]], slot.u[i], slot.v[i], segOut);
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
