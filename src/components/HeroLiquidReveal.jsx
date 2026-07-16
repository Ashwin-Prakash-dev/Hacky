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
const IDLE_MS = 1000; // cursor still for this long -> blob melts away
const TAP_MS = 1500; // touch: a tapped blob lives this long
// The ink fuse runs deliberately slower than the particle morph — the
// solid text keeps settling like liquid after the swarm has landed.
const FUSE_AT = KEYS[1].at;
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
  const gooGroupRef = useRef(null);
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
    let lastQ = -1;
    let fluid = 0; // smoothed hover-energy driving the rest-state smear
    let skew = 0; // smoothed velocity skew on the resting word
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

      // ---- solid-text dynamics: goo fuse + hover fluidness ------------
      if (heroClock.active) {
        shadowT = heroClock.t;
        wasActive = true;
      } else if (wasActive) {
        shadowT += 1 / 60; // movie over: let the ink finish settling
      }
      const q = wasActive
        ? clamp01((shadowT - FUSE_AT) / FUSE_DUR)
        : clamp01((heroClock.t - FUSE_AT) / FUSE_DUR);
      const sEl = sTextRef.current;
      const wEl = wTextRef.current;
      const goo = gooGroupRef.current;
      const blur = blurRef.current;
      if (sEl && wEl && goo && blur) {
        if (q < 1) {
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
          fluid = 0;
          skew = 0;
          lastQ = q;
        } else {
          if (lastQ !== 1) {
            // fuse just finished: settle the layers once
            sEl.setAttribute("opacity", "0");
            wEl.setAttribute("opacity", "1");
            lastQ = 1;
          }
          // at rest, a moving cursor smears the ink like wet oil: goo
          // blur + skew follow pointer energy while the blob is open
          const open = rCur > 2;
          const sp = Math.hypot(vx, vy);
          fluid += ((open ? Math.min(sp * 0.5, 7) : 0) - fluid) * 0.09;
          skew +=
            ((open ? Math.max(-6, Math.min(6, vx * 0.35)) : 0) - skew) * 0.09;
          const energy = fluid / 7;
          const wSx = 1 + Math.cos(t * 4.4) * 0.03 * energy;
          const wSy = 1 + Math.sin(t * 5.2) * 0.035 * energy;
          wEl.setAttribute("transform", tf(wSx, wSy, skew));
          if (fluid > 0.15) {
            blur.setAttribute("stdDeviation", fluid.toFixed(2));
            goo.setAttribute("filter", "url(#hero-goo)");
          } else {
            goo.removeAttribute("filter"); // crisp when still
          }
        }
      }

      // glossy hotspot lags slightly behind the motion, like light on oil
      if (sheenRef.current) {
        sheenRef.current.style.transform = `translate(${(pos.x - vx * 5).toFixed(1)}px, ${(pos.y - vy * 5).toFixed(1)}px)`;
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
      {/* oil-slick surface: drifting iridescent film + a specular hotspot
          that trails the blob center (positioned per-frame) */}
      <div className="oil-film" aria-hidden="true" />
      <div ref={sheenRef} className="oil-sheen" aria-hidden="true" />

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
          <text ref={sTextRef} {...textProps} fontSize="460">
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
