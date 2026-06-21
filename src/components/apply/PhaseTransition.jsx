import { useRef, useEffect } from "react";
import gsap from "gsap";

const DURATION  = 5000; // ms
const CHARS     = "01ABCDEF#@!%?;:[]{}".split("");

// Pre-computed RGB palette (excludes bg so we never pick it for noise)
const PALETTE = [
  [255, 0,   51 ],  // red
  [0,   255, 255],  // cyan
  [200, 255, 0  ],  // lime
  [255, 255, 255],  // white
  [255, 153, 0  ],  // amber
  [255, 0,   255],  // magenta
];
const BG = [10, 10, 10];

// ─── per-frame renderer ──────────────────────────────────────────────────────
const renderFrame = (ctx, imgData, W, H, t) => {
  const d = imgData.data;

  // Phase windows (0–1)
  const burst   = t < 0.10;                      // 0.0–0.5s  white chaos
  const corrupt = t >= 0.08  && t < 0.46;        // 0.4–2.3s  dense colored noise + rgb bands
  const scan    = t >= 0.46  && t < 0.72;        // 2.3–3.6s  lime scan sweep + chars
  const acquire = t >= 0.72  && t < 0.88;        // 3.6–4.4s  sparse + chars thin out
  const lockout = t >= 0.88;                     // 4.4–5.0s  fade to black

  // ── fill background into imageData ──
  for (let i = 0; i < d.length; i += 4) {
    d[i] = BG[0]; d[i+1] = BG[1]; d[i+2] = BG[2]; d[i+3] = 255;
  }

  // ── pixel block noise ──
  let density = 0;
  let bw = 2, bh = 2; // block size in (half-res) canvas pixels

  if (burst) {
    density = 0.92;
    bw = bh = 1;
  } else if (corrupt) {
    const p = (t - 0.08) / 0.38;
    density = 0.88 - p * 0.72;   // 0.88 → 0.16
    bw = bh = 2 + Math.floor(p * 5);
  } else if (acquire) {
    const p = (t - 0.72) / 0.16;
    density = 0.09 - p * 0.08;
    bw = bh = 3;
  }

  if (density > 0.005) {
    const cols = Math.ceil(W / bw);
    const rows = Math.ceil(H / bh);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() >= density) continue;

        let r, g, b;
        if (burst && Math.random() > 0.35) {
          r = g = b = 255; // mostly white on burst
        } else {
          const pal = PALETTE[Math.floor(Math.random() * PALETTE.length)];
          r = pal[0]; g = pal[1]; b = pal[2];
        }

        const x0 = col * bw, y0 = row * bh;
        for (let dy = 0; dy < bh && y0 + dy < H; dy++) {
          for (let dx = 0; dx < bw && x0 + dx < W; dx++) {
            const idx = ((y0 + dy) * W + (x0 + dx)) * 4;
            d[idx] = r; d[idx+1] = g; d[idx+2] = b; d[idx+3] = 255;
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // ── RGB vertical bands (corrupt phase) ──
  if (corrupt) {
    const p = (t - 0.08) / 0.38;
    const count = 2 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const c = ["#ff0033","#00ffff","#C8FF00"][Math.floor(Math.random() * 3)];
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.08 + Math.random() * (0.18 - p * 0.1);
      ctx.fillRect(Math.random() * W, 0, 4 + Math.random() * 20, H);
    }
    ctx.globalAlpha = 1;
  }

  // ── Lime scan sweep (scan phase) ──
  if (scan) {
    const p   = (t - 0.46) / 0.26;
    const sy  = p * H;

    // Leading line
    ctx.fillStyle = "#C8FF00";
    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, sy - 1, W, 2);

    // Halo above
    ctx.globalAlpha = 0.18;
    ctx.fillRect(0, sy - 12, W, 24);

    // Trailing fade above
    const grad = ctx.createLinearGradient(0, sy - 60, 0, sy - 12);
    grad.addColorStop(0, "rgba(200,255,0,0)");
    grad.addColorStop(1, "rgba(200,255,0,0.06)");
    ctx.fillStyle = grad;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, sy - 60, W, 48);

    ctx.globalAlpha = 1;
  }

  // ── Random characters (scan + acquire) ──
  if (scan || acquire) {
    let opacity;
    if (scan) {
      const p = (t - 0.46) / 0.26;
      opacity = Math.min(1, p * 2) * 0.65;
    } else {
      const p = (t - 0.72) / 0.16;
      opacity = 0.65 * (1 - p);
    }
    const count = scan ? 55 : 20;

    ctx.font  = "8px monospace";
    ctx.globalAlpha = opacity;
    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      ctx.fillStyle = roll > 0.55 ? "#C8FF00" : roll > 0.3 ? "#00ffff" : "#fff";
      ctx.fillText(
        CHARS[Math.floor(Math.random() * CHARS.length)],
        Math.random() * W,
        Math.random() * H
      );
    }
    ctx.globalAlpha = 1;
  }

  // ── White flash on first burst ──
  if (t < 0.06) {
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 1 - t / 0.06;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // ── Lime flash at scan-start boundary ──
  if (t > 0.44 && t < 0.50) {
    ctx.fillStyle = "#C8FF00";
    ctx.globalAlpha = 0.25 * Math.sin(Math.PI * (t - 0.44) / 0.06);
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // ── Fade canvas to bg (lockout) ──
  if (lockout) {
    const p = (t - 0.88) / 0.12;
    ctx.fillStyle = "#0a0a0a";
    ctx.globalAlpha = p * p; // ease-in
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // ── Static scanlines (always — subtle CRT texture) ──
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = "#000";
  for (let y = 0; y < H; y += 2) ctx.fillRect(0, y, W, 1);
  ctx.globalAlpha = 1;
};

// ─── component ───────────────────────────────────────────────────────────────
const PhaseTransition = ({ direction = "forward", children }) => {
  const contentRef = useRef(null);
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const imgRef     = useRef(null); // reusable ImageData

  useEffect(() => {
    const el     = contentRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !el) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });

    // Half-res canvas → pixelated scale-up = authentic glitch pixels
    const W = Math.floor(window.innerWidth  / 2);
    const H = Math.floor(window.innerHeight / 2);
    canvas.width  = W;
    canvas.height = H;
    imgRef.current = ctx.createImageData(W, H);

    const dx = direction === "back" ? -50 : 50;
    gsap.set(el, { opacity: 0, x: dx });

    const start = performance.now();
    let contentShown = false;
    let canvasFading = false;

    const animate = () => {
      const t = Math.min((performance.now() - start) / DURATION, 1);
      renderFrame(ctx, imgRef.current, W, H, t);

      // Begin fading canvas at 88% (4.4s) — overlaps with content entry
      if (t >= 0.88 && !canvasFading) {
        canvasFading = true;
        gsap.to(canvas, { opacity: 0, duration: 0.7, ease: "power2.in" });
      }

      // Slide content in at 90% (4.5s)
      if (t >= 0.90 && !contentShown) {
        contentShown = true;
        gsap.to(el, { opacity: 1, x: 0, duration: 0.65, ease: "expo.out" });
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {/* Canvas overlay — half-res, scaled up with pixelated rendering */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
          zIndex: 500,
          pointerEvents: "none",
        }}
      />

      {/* Phase content */}
      <div
        ref={contentRef}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        {children}
      </div>
    </div>
  );
};

export default PhaseTransition;
