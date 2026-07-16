import { racetrack, scatterInRect, bordersPoint, burst } from "./primitives";

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

// Idle: the swarm drifts scattered across the headline block. Hovering the
// Apply button switches on a magnet: each particle stays near its own
// scattered spot but snaps onto the nearest field line running through the
// button, so the scatter reorganizes into thin rays pointing at the pole —
// trembling in place like kinetic energy it can't release.
const FIELD_LINES = 22;
const LINE_STEP = (Math.PI * 2) / FIELD_LINES;
function studenthook(c) {
  const sec = c.rect("hook-scatter");
  if (!sec) return;
  const btn = c.hovered === "hook-apply" ? c.rect("hook-apply") : null;
  for (let i = 0; i < c.count; i++) {
    // frozen home (t = 0) while magnetized, so nobody hops between lines
    scatterInRect(sec, c.rands2[i], c.rands3[i], btn ? 0 : c.t, 0, out);
    if (btn) {
      const dx = out[0] - btn.cx;
      const dy = out[1] - btn.cy;
      const rho = Math.hypot(dx, dy);
      const th = Math.round(Math.atan2(dy, dx) / LINE_STEP) * LINE_STEP;
      const ca = Math.cos(th);
      const sa = Math.sin(th);
      const R = Math.max(rho * 0.92, 0.5); // slight pull, never inside
      const vib = Math.sin(c.t * 16 + c.rands3[i] * 40) * 0.05;
      const vib2 = Math.cos(c.t * 21 + c.rands3[i] * 27) * 0.03;
      c.claim(
        i,
        btn.cx + ca * (R + vib2) - sa * vib,
        btn.cy + sa * (R + vib2) + ca * vib,
        (c.rands3[i] - 0.5) * 0.4,
        8
      );
    } else {
      c.claim(i, out[0], out[1], (c.rands[i] - 0.5) * 0.8, 4);
    }
  }
}

// Terminal: the swarm rings the terminal box in a slow patrol orbit. The
// moment the boot sequence prints ACCESS GRANTED (the section emits the
// event), the ring detonates — particles blast radially out of the box,
// then get reeled back onto the patrol.
let grantAt = -100;
function terminal(c) {
  const box = c.rect("terminal-box");
  if (!box) return;
  if (c.consume("access-granted")) grantAt = c.t;
  const age = c.t - grantAt;
  if (age >= 0 && age < 1.1) {
    burst(c, box.cx, box.cy, 0, c.count, age, 5);
    return;
  }
  racetrack(c, box, 0, c.count, 0.1, 0.045, 5);
}

// Timeline: the swarm rides the spine as a vertical comet locked to the
// traced beam's tip (same scroll mapping GSAP uses: section top at 85% of
// the viewport -> bottom at 20%), tail thinning upward — the particles
// *are* the pen drawing the timeline.
function timeline(c) {
  const spine = c.rect("tl-spine");
  if (!spine || spine.h < 0.1) return;
  const topY = spine.cy + spine.h / 2;
  // beam progress, mirroring its ScrollTrigger (start "top 85%", end
  // "bottom 20%"): p = 0 with the top edge at -0.35vh, p = 1 with the
  // bottom edge at +0.3vh (world y is up, viewport center is 0)
  const p = Math.max(0, Math.min(1, (topY + 0.35 * c.vh) / (spine.h + 0.65 * c.vh)));
  const tipY = topY - p * spine.h;
  const tail = Math.min(spine.h * 0.35, c.vh * 0.55);
  for (let i = 0; i < c.count; i++) {
    const q = c.rands2[i];
    const x =
      spine.cx +
      (c.rands3[i] - 0.5) * 0.22 +
      Math.sin(c.t * (1.2 + c.rands[i]) + q * 21) * 0.07;
    const y = tipY + q * q * tail + Math.cos(c.t * (0.4 + q) + c.rands[i] * 17) * 0.05;
    c.claim(i, x, y, (c.rands[i] - 0.5) * 0.4, 6);
  }
}

// FAQ: the swarm idles scattered behind the question list; picking a
// question (the section emits faq-select) snaps it into a tight orbit
// around the answer panel for a beat — the answer visibly "delivered" —
// before it relaxes back into the list scatter.
let faqSelectAt = -100;
function faq(c) {
  if (c.consume("faq-select")) faqSelectAt = c.t;
  const ans = c.rect("faq-answer");
  const list = c.rect("faq-list");
  const age = c.t - faqSelectAt;
  if (ans && age >= 0 && age < 1.4) {
    racetrack(c, ans, 0, c.count, 0.14, 0.4, 9);
    return;
  }
  if (!list) return;
  for (let i = 0; i < c.count; i++) {
    scatterInRect(list, c.rands2[i], c.rands3[i], c.t, 0.3, out);
    c.claim(i, out[0], out[1], (c.rands[i] - 0.5) * 0.8, 4);
  }
}

// Contact: the swarm patrols the waitlist panel's border. Hovering the
// submit button pulls it into a tight, fast orbit around the button —
// the same magnet language as the sponsor cards.
function contact(c) {
  const btn = c.hovered === "contact-cta" ? c.rect("contact-cta") : null;
  if (btn) {
    racetrack(c, btn, 0, c.count, 0.12, 0.16, 9);
    return;
  }
  const panel = c.rect("contact-panel");
  if (!panel) return;
  racetrack(c, panel, 0, c.count, 0.12, 0.035, 4);
}

export const BEHAVIORS = {
  sponsors,
  videocards,
  studenthook,
  terminal,
  timeline,
  faq,
  contact,
};
