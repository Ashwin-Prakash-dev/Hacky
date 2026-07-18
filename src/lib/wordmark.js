// Shared geometry for the hero wordmark ink. The SVG layers in
// HeroLiquidReveal rasterize nothing — they only need the same design-space
// box and font-fitting rule everywhere, so both stacked copies (the lime
// base ink and the blob-revealed dark ink) register 1:1.
export const SHAPE_W = 1800;
export const SHAPE_H = 520;

export const clamp01 = (x) => Math.min(Math.max(x, 0), 1);

// Cabinet Grotesk — the site's display font, declared in index.css (the
// 800 cut mapped to weight 400). The measurement below must run in the
// same face the SVG renders in.
export async function loadDisplayFont() {
  try {
    await document.fonts.load('400 330px "Cabinet Grotesk"');
    await document.fonts.ready;
  } catch {
    /* measure with whatever is available */
  }
}

const fontStr = (px) =>
  `400 ${px}px "Cabinet Grotesk", "Open Sauce Sans", sans-serif`;

// The font px `text` settles on after the fit rule (shrink until the line
// fits 97% of the design-space width, 14px letter spacing).
export function fittedTextPx(text, px) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  ctx.letterSpacing = "14px";
  ctx.font = fontStr(px);
  const w = ctx.measureText(text).width;
  return w > SHAPE_W * 0.97 ? Math.floor((px * SHAPE_W * 0.97) / w) : px;
}
