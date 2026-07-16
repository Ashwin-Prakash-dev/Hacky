import * as THREE from "three";

// Shape factory for the particle system. The hero sequence is exactly two
// rasterized text scenes — "S." then "Startathon." — sampled into particle
// targets. (The old walk/table/podium/trophy movie scenes are gone.)
export const WORD_FULL = "Startathon.";
export const WORD_MONO = "S.";
export const TWO_PI = Math.PI * 2;

// Morph timeline: shapes[k] forms at KEYS[k].at over KEYS[k].dur seconds
// (plus up to ~1s of per-particle stagger).
export const KEYS = [
  { at: 1.4, dur: 1.8 }, // vortex -> S.
  { at: 4.6, dur: 2.0 }, // -> Startathon. (resting state)
];
export const SHAPE_W = 1800;
export const SHAPE_H = 520;

// ---------------------------------------------------------------------------
// Scenes are rasterized offscreen and sampled once.

// Cabinet Grotesk — the site's display font, declared in index.css (the
// 800 cut mapped to weight 400). The particle wordmark must rasterize in
// the same face the DOM headlines use.
export async function loadDisplayFont() {
  try {
    await document.fonts.load('400 330px "Cabinet Grotesk"');
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

const fontStr = (px) =>
  `400 ${px}px "Cabinet Grotesk", "Open Sauce Sans", sans-serif`;

function drawText(ctx, W, H, text, px) {
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "14px";
  ctx.font = fontStr(px);
  const w = ctx.measureText(text).width;
  if (w > W * 0.97) {
    px = Math.floor((px * W * 0.97) / w);
    ctx.font = fontStr(px);
  }
  ctx.fillText(text, W / 2, H / 2);
}

// The final font px drawText would settle on for `text` — the hero's
// liquid-reveal SVG uses this (same font string, same 14px letter
// spacing, same fit rule) so its glyphs register 1:1 with the particles.
export function fittedTextPx(text, px) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  ctx.letterSpacing = "14px";
  ctx.font = fontStr(px);
  const w = ctx.measureText(text).width;
  return w > SHAPE_W * 0.97 ? Math.floor((px * SHAPE_W * 0.97) / w) : px;
}

// The resting wordmark, partitioned: particle slots [0, dotCount) get the
// period's points, the rest get the letters. The dot swarm is the only
// group that travels beyond the hero, so it's given roughly double the
// period's natural point share to have enough bodies for the journey.
function sampleWordWithDot(ctx, W, H, count) {
  // drawText has just run, so ctx.font/letterSpacing hold the final values
  const wFull = ctx.measureText(WORD_FULL).width;
  const wBare = ctx.measureText("Startathon").width;
  const xSplit = W / 2 - wFull / 2 + wBare + (wFull - wBare) * 0.15;
  const data = ctx.getImageData(0, 0, W, H).data;
  const letters = [];
  const period = [];
  for (let y = 0; y < H; y += 3) {
    for (let x = 0; x < W; x += 3) {
      if (data[(y * W + x) * 4 + 3] > 128) (x >= xSplit ? period : letters).push(x, y);
    }
  }
  const nP = period.length / 2;
  const nL = letters.length / 2;
  if (!nP || !nL) return null;
  for (const pts of [period, letters]) {
    const n = pts.length / 2;
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tx = pts[i * 2];
      const ty = pts[i * 2 + 1];
      pts[i * 2] = pts[j * 2];
      pts[i * 2 + 1] = pts[j * 2 + 1];
      pts[j * 2] = tx;
      pts[j * 2 + 1] = ty;
    }
  }
  const frac = nP / (nP + nL);
  const dotCount = Math.max(100, Math.min(280, Math.round(count * frac * 2)));
  const targets = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const src = i < dotCount ? period : letters;
    const n = i < dotCount ? nP : nL;
    const j = (i < dotCount ? i : i - dotCount) % n;
    targets[i * 2] = (src[j * 2] - W / 2) / W + (Math.random() - 0.5) * 0.003;
    targets[i * 2 + 1] = -(src[j * 2 + 1] - H / 2) / W + (Math.random() - 0.5) * 0.003;
  }
  return { targets, dotCount };
}

// shapes[0] = "S.", shapes[1] = "Startathon." partitioned for the resting
// state (dot swarm on the period, letters on the rest).
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

  drawText(ctx, W, H, WORD_MONO, 460);
  const sShape = samplePoints(ctx, W, H, count);
  drawText(ctx, W, H, WORD_FULL, 330);
  const rest = sampleWordWithDot(ctx, W, H, count);
  if (!sShape || !rest) return null;
  return { shapes: [sShape, rest.targets], dotCount: rest.dotCount };
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
