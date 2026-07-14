// Shared target-generator primitives. All coordinates are world units on
// the fixed full-viewport canvas; rects come from ctx.rect() as
// { cx, cy, w, h }.

export const fract = (x) => x - Math.floor(x);

// Point at arc-length fraction s around a rect's border, inflated by pad.
export function perimeterPoint(r, s, pad, out) {
  const w = r.w + pad * 2;
  const h = r.h + pad * 2;
  const P = 2 * (w + h);
  let d = (fract(s)) * P;
  if (d < w) {
    out[0] = -w / 2 + d;
    out[1] = h / 2;
  } else if (d < w + h) {
    out[0] = w / 2;
    out[1] = h / 2 - (d - w);
  } else if (d < 2 * w + h) {
    out[0] = w / 2 - (d - w - h);
    out[1] = -h / 2;
  } else {
    out[0] = -w / 2;
    out[1] = -h / 2 + (d - 2 * w - h);
  }
  out[0] += r.cx;
  out[1] += r.cy;
}

const seg = [0, 0];

// Claim particles [i0, i0+m) onto a racetrack orbit around rect r.
// speed in laps/s; sign alternates per particle so the ring reads alive.
export function racetrack(ctx, r, i0, m, pad, speed, k) {
  for (let i = i0; i < i0 + m && i < ctx.count; i++) {
    const rd = ctx.rands[i];
    const dir = rd > 0.85 ? -1 : 1;
    perimeterPoint(r, rd + ctx.t * speed * (0.7 + rd * 0.6) * dir, pad + rd * 0.25, seg);
    ctx.claim(i, seg[0], seg[1], (rd - 0.5) * 0.5, k);
  }
}

// Claim particles [i0, i0+m) into glyph g centered at (cx, cy), hWorld tall.
export function glyphForm(ctx, g, i0, m, cx, cy, hWorld, k) {
  if (!g) return;
  for (let i = i0; i < i0 + m && i < ctx.count; i++) {
    const j = i % g.n;
    ctx.claim(
      i,
      cx + g.pts[j * 2] * hWorld,
      cy + g.pts[j * 2 + 1] * hWorld,
      (ctx.rands[i] - 0.5) * 0.4,
      k
    );
  }
}

// Claim particles [i0, i0+m) onto a wavy underline along rect r's bottom.
export function underline(ctx, r, i0, m, k) {
  for (let i = i0; i < i0 + m && i < ctx.count; i++) {
    const u = fract(ctx.rands[i] * 7.31);
    const x = r.cx - r.w / 2 + u * r.w;
    const y = r.cy - r.h / 2 - 0.12 + Math.sin(ctx.t * 3 + u * 14) * 0.06;
    ctx.claim(i, x, y, 0, k);
  }
}

// Claim particles [i0, i0+m) flying radially out of (cx, cy); age in s.
export function burst(ctx, cx, cy, i0, m, age, k) {
  for (let i = i0; i < i0 + m && i < ctx.count; i++) {
    const a = ctx.rands[i] * Math.PI * 2;
    const sp = 2.5 + ctx.rands[i] * 5;
    ctx.claim(
      i,
      cx + Math.cos(a) * sp * age,
      cy + Math.sin(a * 1.7) * sp * age,
      (ctx.rands[i] - 0.5) * 2 * age,
      k
    );
  }
}
