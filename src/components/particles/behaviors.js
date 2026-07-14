import { racetrack, glyphForm, underline, burst, fract } from "./primitives";

// One target generator per section. Each runs only while its section owns
// the viewport center. `ctx` is rebuilt each frame by the engine:
//   t (global clock), at (seconds since this behavior took over), count,
//   rands, vw/vh (viewport world size), glyphs, shapes, heroOff,
//   scale (hero shape scale), hovered, faqOpen,
//   rect(id) -> { cx, cy, w, h } | null, consume(event), claim(i,x,y,z,k).
// Unclaimed particles ride the ambient stream. A behavior may return
// { wind } to blow the stream sideways (world units/s).

// Resting hero state (movie finished or abandoned): the wordmark, anchored
// to the hero section so it slides away naturally as the user scrolls.
function hero(c) {
  const s = c.shapes?.[6];
  if (!s) return;
  const m = Math.floor(c.count * 0.8);
  for (let i = 0; i < m; i++) {
    c.claim(i, s[i * 2] * c.scale, s[i * 2 + 1] * c.scale + c.heroOff, 0, 5);
  }
}

function sponsors(c) {
  const hov = c.hovered?.startsWith("sponsor-") ? c.rect(c.hovered) : null;
  if (hov) {
    // the whole flock rushes to the hovered card and circles it
    racetrack(c, hov, 0, Math.floor(c.count * 0.55), 0.35, 0.16, 9);
  } else {
    // idle: a thin halo drifting around each card
    const m = Math.floor(c.count * 0.24);
    const third = Math.floor(m / 3);
    for (let j = 0; j < 3; j++) {
      const r = c.rect(`sponsor-${j}`);
      if (r) racetrack(c, r, j * third, third, 0.3, 0.05, 4);
    }
  }
}

function videocards(c) {
  const hov = c.hovered?.startsWith("video-") ? c.rect(c.hovered) : null;
  if (hov) racetrack(c, hov, 0, Math.floor(c.count * 0.35), 0.25, 0.09, 7);
}

const STAT_GLYPHS = ["ALL", "20", "30", "3"];
function stats(c) {
  // condense into the counters while they tick, then burst as they land
  if (c.at > 3.4) return;
  const m = Math.floor(c.count * 0.6);
  const per = Math.floor(m / 4);
  for (let j = 0; j < 4; j++) {
    const r = c.rect(`stat-${j}`);
    if (!r) continue;
    if (c.at < 2.3 + j * 0.12) {
      glyphForm(c, c.glyphs?.[STAT_GLYPHS[j]], j * per, per, r.cx, r.cy + r.h * 0.12, r.h * 0.42, 6);
    } else {
      burst(c, r.cx, r.cy, j * per, per, c.at - (2.3 + j * 0.12), 7);
    }
  }
}

function studenthook(c) {
  // underline the outcome row nearest the viewport center
  let best = null;
  let bestD = Infinity;
  for (let j = 0; j < 3; j++) {
    const r = c.rect(`hook-${j}`);
    if (!r) continue;
    const d = Math.abs(r.cy);
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  if (best && bestD < c.vh * 0.45) underline(c, best, 0, Math.floor(c.count * 0.16), 6);
}

function marquee(c) {
  // no formations — a sideways gust catches the stream while it passes
  return { wind: Math.sin(c.at * 0.9) * 3.2 };
}

const term = { confetti: -1 };
function terminal(c) {
  if (c.at < 0.05) term.confetti = -1;
  if (c.consume("access-granted")) term.confetti = c.t;
  const r = c.rect("terminal-box");
  if (!r) return;
  if (term.confetti > 0 && c.t - term.confetti < 1.4) {
    burst(c, r.cx, r.cy - r.h * 0.2, 0, Math.floor(c.count * 0.35), c.t - term.confetti, 9);
    return;
  }
  // blinking block cursor beside the panel
  if ((c.t * 1.3) % 2 < 1.4) {
    const m = Math.floor(c.count * 0.08);
    for (let i = 0; i < m; i++) {
      c.claim(
        i,
        r.cx + r.w / 2 + 0.55 + (fract(c.rands[i] * 9.7) - 0.5) * 0.32,
        r.cy + (fract(c.rands[i] * 5.3) - 0.5) * 0.72,
        0,
        8
      );
    }
  }
}

function timeline(c) {
  const spine = c.rect("tl-spine");
  let i0 = 0;
  if (spine) {
    // trace the visible slice of the spine
    const top = Math.min(spine.cy + spine.h / 2, c.vh * 0.48);
    const bot = Math.max(spine.cy - spine.h / 2, -c.vh * 0.48);
    if (top > bot) {
      const m = Math.floor(c.count * 0.18);
      for (let i = 0; i < m; i++) {
        const u = fract(c.rands[i] * 11.3);
        c.claim(
          i,
          spine.cx + Math.sin(c.t * 1.5 + u * 20) * 0.14,
          bot + u * (top - bot),
          0,
          5
        );
      }
      i0 = m;
    }
  }
  // pool around the node nearest the viewport center
  for (let j = 0; j < 8; j++) {
    const r = c.rect(`tl-node-${j}`);
    if (r && Math.abs(r.cy) < c.vh * 0.22) {
      racetrack(c, r, i0, Math.floor(c.count * 0.12), 0.25, 0.06, 5);
      break;
    }
  }
}

const faqState = { until: -1 };
function faq(c) {
  // mobile accordion sets faqOpen; the desktop panel (always one answer
  // showing) emits faq-select on change — pulse the "!" for a moment
  if (c.consume("faq-select")) faqState.until = c.t + 1.8;
  const bang = c.faqOpen || c.t < faqState.until;
  const g = c.glyphs?.[bang ? "!" : "?"];
  glyphForm(c, g, 0, Math.floor(c.count * 0.3), c.vw * 0.3, 0, c.vh * 0.42, 5);
}

function contact(c) {
  const cta = c.rect("contact-cta");
  if (c.hovered === "contact-cta" && cta) {
    racetrack(c, cta, 0, Math.floor(c.count * 0.45), 0.25, 0.14, 9);
  } else {
    glyphForm(c, c.glyphs?.["@"], 0, Math.floor(c.count * 0.3), -c.vw * 0.3, 0, c.vh * 0.3, 5);
  }
}

function footer(c) {
  const r = c.rect("section:footer");
  const cy = r ? Math.max(r.cy, -c.vh * 0.3) : 0;
  glyphForm(c, c.glyphs?.["S."], 0, Math.floor(c.count * 0.4), 0, cy, c.vh * 0.28, 4);
}

export const BEHAVIORS = {
  hero,
  sponsors,
  videocards,
  stats,
  studenthook,
  marquee,
  terminal,
  timeline,
  faq,
  contact,
  footer,
};
