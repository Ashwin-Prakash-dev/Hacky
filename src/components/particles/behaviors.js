import { racetrack, scatterInRect, bordersPoint } from "./primitives";
import { getEl } from "./registry";

// Target generators for the traveling dot swarm. After the hero movie
// settles, only the wordmark's period keeps living particles (ctx.count is
// the dot budget, not the full pool); each behavior poses that small swarm
// inside its section. Sections are being specced one at a time — sponsors
// is the first.

const out = [0, 0];

// Idle: the swarm rests dispersed behind the whole card group (the cards
// sit above the canvas, so particles show in the gaps and around the
// edges). Hovering a card pulls the swarm into a tight orbit around it.
function sponsors(c) {
  const hovered = c.hovered?.startsWith("sponsor-") ? c.rect(c.hovered) : null;
  if (hovered) {
    racetrack(c, hovered, 0, c.count, 0.12, 0.16, 9);
    return;
  }
  const g = c.rect("sponsor-group");
  if (!g) return;
  for (let i = 0; i < c.count; i++) {
    scatterInRect(g, c.rands2[i], c.rands3[i], c.t, 0.5, out);
    c.claim(i, out[0], out[1], (c.rands[i] - 0.5) * 0.8, 4);
  }
}

// Idle: the swarm rests spread along the borders of the five video cards
// (weighted by perimeter so the big cards get their share), each dot
// creeping slowly around its card's edge.
function videocards(c) {
  const rects = [];
  for (let k = 0; k < 5; k++) {
    const r = c.rect(`vc-card-${k}`);
    if (r && r.w > 0.05) rects.push(r);
  }
  if (!rects.length) return;
  for (let i = 0; i < c.count; i++) {
    const dir = c.rands[i] > 0.5 ? 1 : -1;
    bordersPoint(rects, c.rands2[i], c.rands3[i] + c.t * 0.03 * dir, 0.06, out);
    c.claim(i, out[0], out[1], (c.rands[i] - 0.5) * 0.5, 4);
  }
}

// Sweep bookkeeping for the stats row: W is the tip's progress (0 = left
// edge, 1 = right edge; negative = fully reset). Lights each stat cell as
// the tip passes its center and returns the tip's world x.
export function sweepStats(c, W) {
  const row = c.rect("stats-row");
  if (!row) return null;
  const tipX = row.cx - row.w / 2 + W * row.w;
  for (let k = 0; k < 4; k++) {
    const el = getEl(`stat-${k}`);
    const r = c.rect(`stat-${k}`);
    if (el && r) el.classList.toggle("stat-lit", tipX >= r.cx);
  }
  return tipX;
}

// Idle: the sweep has finished — the swarm rests as the completed trail,
// tip at the row's right edge and the tail thinning back leftward, with
// every stat lit.
function stats(c) {
  const row = c.rect("stats-row");
  if (!row) return;
  const tipX = sweepStats(c, 1);
  for (let i = 0; i < c.count; i++) {
    const q = c.rands2[i];
    const x =
      tipX -
      q * q * row.w * 0.5 +
      Math.sin(c.t * (0.2 + c.rands[i] * 0.3) + q * 19) * 0.15;
    const y =
      row.cy +
      (c.rands3[i] - 0.5) * row.h * 0.6 +
      Math.cos(c.t * (0.25 + q * 0.2) + c.rands[i] * 23) * 0.12;
    c.claim(i, x, y, (c.rands[i] - 0.5) * 0.5, 4);
  }
}

export const BEHAVIORS = {
  sponsors,
  videocards,
  stats,
};
