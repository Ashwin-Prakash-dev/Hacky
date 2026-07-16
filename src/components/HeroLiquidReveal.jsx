import { useEffect, useMemo, useRef } from "react";
import {
  SHAPE_W,
  SHAPE_H,
  KEYS,
  clamp01,
  fittedTextPx,
  loadDisplayFont,
} from "./particles/shapes";
import { heroClock } from "./particles/registry";

// Liquid cursor reveal for the hero: a hidden, fully inverted lime layer —
// the SAME wordmark the particles form, but solid — shows through an
// organic blob that chases the cursor.
//
// The solid text is an SVG whose glyphs use the same font, size-fit rule,
// and 14px letter spacing as the particle rasterizer (fittedTextPx), CSS-
// scaled with the engine's camera math, so it registers 1:1 behind the
// swarm. And it doesn't just sit there: driven by the shared heroClock, it
// plays the same sequence as the particles — "S." fuses into "Startathon."
// through a gooey blur-threshold filter, liquid instead of a cut.
//
// The blob is movement-driven: it grows where the cursor moves, collapses
// after ~2s of stillness, and swells back the moment movement resumes.

const BLOB_POINTS = 10;
const IDLE_MS = 200; // cursor still for this long -> blob melts away
const TAP_MS = 1500; // touch: a tapped blob lives this long
const DROPS = 5; // ink droplets writhing before the S. congeals
// The ink runs deliberately slower than the particle morph — the solid
// text keeps settling like liquid after the swarm has landed.
const FORM_AT = KEYS[0].at; // goo droplets -> "S."
const FORM_DUR = KEYS[0].dur + 1.0;
const FUSE_AT = KEYS[1].at; // "S." -> "Startathon."
const FUSE_DUR = KEYS[1].dur + 2.4;

function canUse() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // no WebGL -> no particle engine -> the DOM fallback headline shows;
  // the reveal would fight it, so it sits out too
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

const isFinePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const smooth = (x) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

// Closed Catmull-Rom spline through the sample points -> cubic Béziers.
function blobPath(p) {
  const n = p.length;
  let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

const HIDDEN_CLIP = 'circle(0px at -200px -200px)';
const CX = SHAPE_W / 2;
const CY = SHAPE_H / 2;

const HeroLiquidReveal = () => {
  const layerRef = useRef(null);
  const svgRef = useRef(null);
  const tagRef = useRef(null);
  const sheenRef = useRef(null);
  const rimRef = useRef(null);
  const gooGroupRef = useRef(null);
  const dropsRef = useRef(null);
  const blurRef = useRef(null);
  const sTextRef = useRef(null);
  const wTextRef = useRef(null);
  const enabled = useMemo(canUse, []);

  // Size the SVG with the engine's camera math so the glyphs land exactly
  // where the particle letters park, and fit the font sizes through the
  // same rule the particle rasterizer uses.
  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;

    loadDisplayFont().then(() => {
      if (!alive) return;
      sTextRef.current?.setAttribute("font-size", fittedTextPx("S.", 460));
      wTextRef.current?.setAttribute(
        "font-size",
        fittedTextPx("Startathon.", 330)
      );
    });

    const size = () => {
      const svg = svgRef.current;
      if (!svg) return;
      // camera z=8, fov 50 (vertical): world height at z=0
      const vhWorld = 2 * 8 * Math.tan((50 * Math.PI) / 360);
      const vwWorld = vhWorld * (window.innerWidth / window.innerHeight);
      const scale = Math.min(vwWorld * 0.92, 17); // engine wordmark scale
      const pxPerWorld = window.innerHeight / vhWorld;
      const cssW = scale * pxPerWorld;
      const cssH = (cssW * SHAPE_H) / SHAPE_W;
      svg.style.width = `${cssW}px`;
      svg.style.height = `${cssH}px`;
      if (tagRef.current) {
        tagRef.current.style.top = `calc(50% + ${cssH / 2 + 18}px)`;
      }
    };
    size();
    window.addEventListener("resize", size);
    return () => {
      alive = false;
      window.removeEventListener("resize", size);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const layer = layerRef.current;
    const host = layer?.parentElement;
    if (!layer || !host) return undefined;

    const pos = { x: -400, y: -400 };
    const target = { x: -400, y: -400 };
    const state = { within: false, interactive: false, lastMove: -1e9 };
    const fine = isFinePointer();
    const idleMs = fine ? IDLE_MS : TAP_MS;
    let vx = 0;
    let vy = 0;
    let rCur = 0;
    let rVel = 0;
    let t = 0;
    let raf = 0;
    let lastPhase = "";
    let fluid = 0; // smoothed hover-energy driving the rest-state smear
    let skew = 0; // smoothed velocity skew on the resting text
    // The ink fuse deliberately outlives the particle movie, so it keeps
    // its own shadow clock: it mirrors heroClock while the movie runs and
    // free-runs to completion after the movie ends or gets abandoned.
    let shadowT = 0;
    let wasActive = false;

    const tf = (sx, sy, sk) =>
      `translate(${CX} ${CY}) skewX(${sk.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-CX} ${-CY})`;

    const baseR = () =>
      Math.min(Math.max(host.clientWidth * 0.11, 110), 190);

    const track = (e) => {
      const b = host.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      const within = x >= 0 && y >= 0 && x <= b.width && y <= b.height;
      if (within && !state.within) {
        // enter: grow in place instead of streaking across the section
        pos.x = x;
        pos.y = y;
      }
      state.within = within;
      state.lastMove = performance.now();
      target.x = x;
      target.y = y;
      // collapse over links/buttons so the lime world never hides a CTA
      const el = document.elementFromPoint(e.clientX, e.clientY);
      state.interactive = !!el?.closest?.("a,button,input,textarea,select");
    };
    // fine pointer: the blob follows movement; touch: it blooms at the tap
    // point (and rides a drag), then melts away after TAP_MS on its own
    const onMove = fine ? track : null;
    const onTouch = fine ? null : track;
    const onGone = () => {
      state.within = false;
    };

    const tick = () => {
      t += 1 / 60;

      // ---- pointer + blob radius (spring: ~1s bloom/collapse) ---------
      const px = pos.x;
      const py = pos.y;
      pos.x += (target.x - pos.x) * 0.13;
      pos.y += (target.y - pos.y) * 0.13;
      vx = pos.x - px;
      vy = pos.y - py;
      const idle = performance.now() - state.lastMove > idleMs;
      const rTarget =
        state.within && !state.interactive && !idle ? baseR() : 0;
      // under-damped spring (ω≈6, ζ≈0.75): settles in ~1s with a soft
      // overshoot, so the bloom swells and the collapse drains
      rVel += ((rTarget - rCur) * 36 - rVel * 9) / 60;
      rCur += rVel / 60;
      if (rCur < 0) {
        rCur = 0;
        rVel *= 0.3;
      }

      // ---- solid-ink dynamics ------------------------------------------
      // Timeline (shadow-clocked): goo droplets -> "S." -> "Startathon.",
      // every hand-off a liquid fuse, never a cut.
      if (heroClock.active) {
        shadowT = heroClock.t;
        wasActive = true;
      } else if (wasActive) {
        shadowT += 1 / 60; // movie over: let the ink finish settling
      }
      const T = wasActive ? shadowT : heroClock.t;
      const g0 = clamp01((T - FORM_AT) / FORM_DUR); // droplets -> S.
      const q = clamp01((T - FUSE_AT) / FUSE_DUR); // S. -> word
      const sEl = sTextRef.current;
      const wEl = wTextRef.current;
      const goo = gooGroupRef.current;
      const drops = dropsRef.current;
      const blur = blurRef.current;
      if (sEl && wEl && goo && drops && blur) {
        // shared: hover energy smears whichever ink is resting
        const open = rCur > 2;
        const sp = Math.hypot(vx, vy);
        const phase =
          q >= 1 ? "restW" : q > 0 ? "fuse" : g0 >= 1 ? "restS" : "goo";
        if (phase !== lastPhase) {
          lastPhase = phase;
          drops.setAttribute("opacity", phase === "goo" ? "1" : "0");
          if (phase === "restW") {
            sEl.setAttribute("opacity", "0");
            wEl.setAttribute("opacity", "1");
          }
          if (phase === "restS") sEl.setAttribute("opacity", "1");
          fluid = 0;
          skew = 0;
        }

        if (phase === "goo") {
          // while the particles gather, the ink is only a writhing cluster
          // of droplets; as the particle S. completes, they converge and
          // the S. congeals out of them
          const conv = smooth(g0);
          const kids = drops.children;
          for (let i = 0; i < kids.length; i++) {
            const ph = i * 1.9;
            const ax = (270 - i * 40) * (1 - conv);
            const ay = (115 - i * 13) * (1 - conv);
            const dx =
              CX +
              Math.cos(t * (0.7 + i * 0.23) + ph) * ax +
              Math.sin(t * 1.4 + i * 2.2) * 16 * (1 - conv);
            const dy = CY + Math.sin(t * (0.9 + i * 0.19) + ph * 2) * ay;
            const dr =
              (56 + 24 * Math.sin(t * (1.1 + i * 0.3) + ph)) *
              (1 - 0.72 * conv);
            kids[i].setAttribute("cx", dx.toFixed(1));
            kids[i].setAttribute("cy", dy.toFixed(1));
            kids[i].setAttribute("r", Math.max(dr, 4).toFixed(1));
          }
          drops.setAttribute(
            "opacity",
            g0 > 0.82 ? ((1 - g0) / 0.18).toFixed(3) : "1"
          );
          // the S. surfaces out of the goo late in the gather
          const sOp = smooth((g0 - 0.45) / 0.45);
          const sS = 0.72 + 0.28 * conv;
          sEl.setAttribute("opacity", sOp.toFixed(3));
          sEl.setAttribute(
            "transform",
            tf(sS * (1 + Math.cos(t * 2.1) * 0.04), sS * (1 + Math.sin(t * 2.7) * 0.05), 0)
          );
          wEl.setAttribute("opacity", "0");
          // heavy goo while forming, releasing as the S. sets
          const blurV = 3 + 17 * (1 - smooth((g0 - 0.6) / 0.4));
          blur.setAttribute(
            "stdDeviation",
            (blurV + Math.sin(t * 3.4) * 2).toFixed(1)
          );
          goo.setAttribute("filter", "url(#hero-goo)");
        } else if (phase === "fuse") {
          // the fuse: slow, wide goo envelope with living undulation —
          // "S." melts outward while the word congeals in underneath
          const wave = Math.sin(q * Math.PI);
          const sOp = 1 - smooth((q - 0.08) / 0.62);
          const wOp = smooth((q - 0.28) / 0.6);
          const sSx = 1 + smooth(q) * 2.6;
          const sSy = 1 + Math.sin(t * 3.1) * 0.06 * wave;
          const wSx = 0.5 + 0.5 * smooth(q * 1.05);
          const wSy = 1 + Math.sin(t * 2.6 + 1.7) * 0.05 * wave;
          sEl.setAttribute("opacity", sOp.toFixed(3));
          wEl.setAttribute("opacity", wOp.toFixed(3));
          sEl.setAttribute("transform", tf(sSx, sSy, 0));
          wEl.setAttribute("transform", tf(wSx, wSy, 0));
          const env = Math.pow(wave, 0.7); // wide, lingering liquid peak
          blur.setAttribute(
            "stdDeviation",
            (env * 26 + Math.sin(t * 4.2) * 2 * env).toFixed(1)
          );
          goo.setAttribute("filter", "url(#hero-goo)");
        } else {
          // resting ink ("S." before the fuse, the word after): a gentle
          // idle undulation keeps it liquid, and a moving cursor smears it
          // like wet oil — goo blur + skew follow pointer energy
          const el = phase === "restS" ? sEl : wEl;
          fluid += ((open ? Math.min(sp * 0.5, 7) : 0) - fluid) * 0.09;
          skew +=
            ((open ? Math.max(-6, Math.min(6, vx * 0.35)) : 0) - skew) * 0.09;
          const energy = fluid / 7;
          const iSx = 1 + Math.cos(t * 1.9) * 0.012 + Math.cos(t * 4.4) * 0.03 * energy;
          const iSy = 1 + Math.sin(t * 2.3) * 0.014 + Math.sin(t * 5.2) * 0.035 * energy;
          el.setAttribute("transform", tf(iSx, iSy, skew));
          if (fluid > 0.15) {
            blur.setAttribute("stdDeviation", fluid.toFixed(2));
            goo.setAttribute("filter", "url(#hero-goo)");
          } else {
            goo.removeAttribute("filter"); // crisp edges when still
          }
        }
      }

      // glossy hotspot lags slightly behind the motion, like light on oil
      if (sheenRef.current) {
        sheenRef.current.style.transform = `translate(${(pos.x - vx * 5).toFixed(1)}px, ${(pos.y - vy * 5).toFixed(1)}px)`;
      }
      // meniscus: a darker ring hugging the blob edge, scaled to its radius
      if (rimRef.current) {
        const rs = (rCur * 2.35) / 300;
        rimRef.current.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px) scale(${rs.toFixed(3)})`;
      }

      if (rCur < 1.5) {
        if (layer.style.clipPath !== HIDDEN_CLIP) {
          layer.style.clipPath = HIDDEN_CLIP;
        }
      } else {
        const speed = Math.min(Math.hypot(vx, vy) / 26, 1);
        const phi = Math.atan2(vy, vx);
        const pts = [];
        for (let i = 0; i < BLOB_POINTS; i++) {
          const th = (i / BLOB_POINTS) * Math.PI * 2;
          const dTh = th - phi;
          const r =
            rCur *
              (1 +
                0.42 * speed * Math.cos(2 * dTh) + // stretch along motion
                0.16 * speed * Math.cos(dTh - Math.PI)) + // drag behind
            rCur * 0.07 * Math.sin(t * 2.3 + i * 2.1) + // idle liquid wobble
            rCur * 0.05 * Math.cos(t * 1.7 + i * 3.7);
          pts.push([pos.x + Math.cos(th) * r, pos.y + Math.sin(th) * r]);
        }
        layer.style.clipPath = `path("${blobPath(pts)}")`;
      }
      raf = requestAnimationFrame(tick);
    };

    if (onMove) window.addEventListener("pointermove", onMove, { passive: true });
    if (onTouch) window.addEventListener("pointerdown", onTouch, { passive: true });
    document.documentElement.addEventListener("mouseleave", onGone);
    window.addEventListener("blur", onGone);
    raf = requestAnimationFrame(tick);
    return () => {
      if (onMove) window.removeEventListener("pointermove", onMove);
      if (onTouch) window.removeEventListener("pointerdown", onTouch);
      document.documentElement.removeEventListener("mouseleave", onGone);
      window.removeEventListener("blur", onGone);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  const textProps = {
    x: CX,
    y: CY,
    textAnchor: "middle",
    dominantBaseline: "central",
    fill: "#050505",
    letterSpacing: "14",
    style: { fontFamily: "var(--font-display)", fontWeight: 400 },
  };

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        // above the fixed particle canvas (z-30), below the nav (z-60):
        // inside the blob the particles vanish and only the solid text
        // world remains
        zIndex: 45,
        background: "#C8FF00",
        clipPath: HIDDEN_CLIP,
        pointerEvents: "none",
        willChange: "clip-path",
      }}
    >
      {/* oil-slick surface: two counter-drifting iridescent films, a
          specular hotspot trailing the blob center, and a meniscus ring
          hugging the blob edge (both positioned per-frame) */}
      <div className="oil-film" aria-hidden="true" />
      <div className="oil-film oil-film--b" aria-hidden="true" />
      <div ref={sheenRef} className="oil-sheen" aria-hidden="true" />
      <div ref={rimRef} className="oil-rim" aria-hidden="true" />

      {/* the exact wordmark the particles form, in solid ink — playing the
          same S. -> Startathon. sequence as a gooey fuse */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SHAPE_W} ${SHAPE_H}`}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          overflow: "visible",
        }}
      >
        <defs>
          <filter id="hero-goo" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="0" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
            />
          </filter>
        </defs>
        <g ref={gooGroupRef}>
          {/* ink droplets: the pre-S. goo cluster (driven per-frame) */}
          <g ref={dropsRef}>
            {Array.from({ length: DROPS }, (_, i) => (
              <circle key={i} cx={CX} cy={CY} r="0" fill="#050505" />
            ))}
          </g>
          <text ref={sTextRef} {...textProps} fontSize="460" opacity="0">
            S.
          </text>
          <text ref={wTextRef} {...textProps} fontSize="330" opacity="0">
            Startathon.
          </text>
        </g>
      </svg>
      <span
        ref={tagRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "72%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.6rem, 1vw, 0.78rem)",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "rgba(5,5,5,0.75)",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        30 hours · 20 teams · ship something real
      </span>
    </div>
  );
};

export default HeroLiquidReveal;
