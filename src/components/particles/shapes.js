import * as THREE from "three";

// Shape factory for the particle system: the hero-movie shapes (rasterized
// text scenes + analytic animated scenes) moved verbatim from
// HeroParticles.jsx, plus small "glyph" shapes (?, !, @, digits…) used by
// the per-section behaviors further down the page.
export const WORD_FULL = "Startathon.";
export const WORD_MONO = "S.";
export const TWO_PI = Math.PI * 2;

// Morph timeline: shapes[k] forms at KEYS[k].at over KEYS[k].dur seconds
// (plus up to ~1s of per-particle stagger). Holds are the gaps between.
export const KEYS = [
  { at: 2.6, dur: 2.0 }, // vortex -> S.
  { at: 6.6, dur: 1.8 }, // -> Startathon.
  { at: 11.2, dur: 1.8 }, // -> man walking with laptop (animated)
  { at: 17.0, dur: 1.8 }, // -> team at the table, lids opening (animated)
  { at: 23.0, dur: 1.8 }, // -> presenting at the demo-day screen
  { at: 27.6, dur: 1.8 }, // -> team raising the trophy
  { at: 32.2, dur: 1.8 }, // -> Startathon. (resting state)
];
export const WALK_SCENE = 2;
export const TABLE_SCENE = 3;
const STRIDE_TIME = 1.05; // seconds per full gait cycle
export const SHAPE_W = 1800;
export const SHAPE_H = 520;

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

export function evalElem(e, u, v, out) {
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
export function walkerElems(ts) {
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
export function tableElems(ts) {
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

export const ANIM_SCENES = { walk: walkerElems, table: tableElems };

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

export async function buildTargets(count) {
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

// ---------------------------------------------------------------------------
// Glyphs: small standalone shapes for section behaviors. Points are
// normalized so the glyph is centered and one glyph-height tall — a
// behavior places it with `center + pts * worldHeight`. Y is up.

const GLYPH_STRINGS = ["?", "!", "@", "S.", "ALL", "20", "30", "3"];

export async function buildGlyphs() {
  await loadDisplayFont();
  const W = 380;
  const H = 380;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#fff";

  const glyphs = {};
  for (const text of GLYPH_STRINGS) {
    drawText(ctx, W, H, text, 300);
    const data = ctx.getImageData(0, 0, W, H).data;
    const raw = [];
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        if (data[(y * W + x) * 4 + 3] > 128) raw.push(x, y);
      }
    }
    const n = raw.length / 2;
    if (n === 0) continue;
    // shuffle so consecutive particle indices spread over the glyph
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tx = raw[i * 2];
      const ty = raw[i * 2 + 1];
      raw[i * 2] = raw[j * 2];
      raw[i * 2 + 1] = raw[j * 2 + 1];
      raw[j * 2] = tx;
      raw[j * 2 + 1] = ty;
    }
    const pts = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      pts[i * 2] = (raw[i * 2] - W / 2) / H;
      pts[i * 2 + 1] = -(raw[i * 2 + 1] - H / 2) / H;
    }
    glyphs[text] = { pts, n };
  }
  return glyphs;
}

// Fixed particle slots for an animated scene: element index chosen by
// area-weighted CDF, plus a spot along/across that element.
export function assignSlots(elems, count) {
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

export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
export const clamp01 = (x) => Math.min(Math.max(x, 0), 1);

export function makeGradientMap() {
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
}
