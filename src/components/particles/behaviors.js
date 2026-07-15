import { racetrack } from "./primitives";

// Target generators for the traveling dot swarm. After the hero movie
// settles, only the wordmark's period keeps living particles (ctx.count is
// the dot budget, not the full pool); each behavior poses that small swarm
// inside its section. Sections are being specced one at a time — sponsors
// is the first.

// Idle: the swarm slowly revolves around one card at a time, moving to the
// next every few seconds. Hover pulls it to that card and tightens the
// orbit. Cards sit above the canvas (z-index), so the ring passes behind
// them and peeks out around the edges.
// the swarm streams in along the right edge, so start on the right card
const cycle = { idx: 2, next: 0 };
function sponsors(c) {
  const hovered = c.hovered?.startsWith("sponsor-") ? c.hovered : null;
  if (!hovered && c.t > cycle.next) {
    cycle.idx = (cycle.idx + 1) % 3;
    cycle.next = c.t + 3.2;
  }
  const r = c.rect(hovered ?? `sponsor-${cycle.idx}`);
  if (!r) return;
  if (hovered) racetrack(c, r, 0, c.count, 0.12, 0.16, 9);
  else racetrack(c, r, 0, c.count, 0.28, 0.06, 5);
}

export const BEHAVIORS = {
  sponsors,
};
