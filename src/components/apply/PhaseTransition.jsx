import { useRef, useEffect } from "react";
import gsap from "gsap";

const DURATION  = 5000; // ms
const BLOB      = 10;   // canvas-pixel blob size (~20px on screen at ½-res)
const EDGE_W    = 0.07; // width of lime glow edge (noise units 0-1)

// Build the noise lookup once: low-res random blobs + vertical sweep bias.
// noiseField[y*W + x] is a value 0-1 indicating "when this pixel reveals".
function buildField(W, H) {
  const cols = Math.ceil(W / BLOB);
  const rows = Math.ceil(H / BLOB);
  const lr   = new Float32Array(cols * rows);
  for (let i = 0; i < lr.length; i++) lr[i] = Math.random();

  const field = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    const vbias = (y / H) * 0.28; // top reveals first, then bottom
    for (let x = 0; x < W; x++) {
      const ci  = Math.min(Math.floor(x / BLOB), cols - 1);
      const ri  = Math.min(Math.floor(y / BLOB), rows - 1);
      field[y * W + x] = lr[ri * cols + ci] * 0.72 + vbias;
    }
  }
  return field;
}

// Cubic ease-in-out
const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const PhaseTransition = ({ direction = "forward", children }) => {
  const contentRef = useRef(null);
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);

  useEffect(() => {
    const el     = contentRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !el) return;

    const ctx = canvas.getContext("2d");

    // Half-resolution → pixelated scale-up gives chunky digital feel
    const W = Math.floor(window.innerWidth  / 2);
    const H = Math.floor(window.innerHeight / 2);
    canvas.width  = W;
    canvas.height = H;

    // Fill solid dark immediately so new content is hidden on first paint
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    const field   = buildField(W, H);
    const imgData = ctx.createImageData(W, H);
    const d       = imgData.data;

    const start = performance.now();

    const animate = () => {
      const t   = Math.min((performance.now() - start) / DURATION, 1);
      const thr = ease(t);

      for (let i = 0, pi = 0; i < W * H; i++, pi += 4) {
        const n = field[i];

        if (n < thr) {
          // Revealed — transparent, HTML content shows through
          d[pi] = d[pi+1] = d[pi+2] = d[pi+3] = 0;
        } else if (n < thr + EDGE_W) {
          // Dissolving edge — lime glow fades in
          const glow = 1 - (n - thr) / EDGE_W;
          d[pi]   = (200 * glow)         | 0;
          d[pi+1] = (255 * glow)         | 0;
          d[pi+2] = 0;
          d[pi+3] = (100 + 155 * glow)   | 0;
        } else {
          // Still covered — deep dark
          d[pi] = d[pi+1] = d[pi+2] = 10;
          d[pi+3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        gsap.to(canvas, { opacity: 0, duration: 0.25, ease: "power2.out" });
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {/* Dissolve overlay — starts opaque, organic blob-noise reveal */}
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

      {/* Content visible immediately behind the dissolving overlay */}
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
