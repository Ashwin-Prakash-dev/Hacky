import { useEffect, useRef } from "react";

// The badge disc: a permanent quality stamp docked in the bottom-right
// corner at every viewport — ring text spinning with an idle drift plus
// smoothed scroll velocity (backspins when scrolling up). Static under
// reduced motion. Lifted verbatim from the retired Hero.
const BadgeDisc = () => {
  const discRef = useRef(null);
  const discSpinRef = useRef(null);

  useEffect(() => {
    const disc = discRef.current;
    const spin = discSpinRef.current;
    if (!disc || !spin) return undefined;

    const D = 128; // rendered svg box (size-32)
    const place = () => {
      const s = window.innerWidth < 640 ? 0.55 : 0.68;
      // outer chrome ring r58 in the 120-unit viewBox -> 62px at scale 1
      const r = 62 * s;
      const cx = window.innerWidth - 24 - r;
      const cy = window.innerHeight - 24 - r;
      disc.style.transform = `translate3d(${(cx - D / 2).toFixed(1)}px, ${(cy - D / 2).toFixed(1)}px, 0) scale(${s})`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place();
      window.addEventListener("resize", place);
      return () => window.removeEventListener("resize", place);
    }

    let raf = 0;
    let rot = 0;
    let vel = 0;
    let lastY = window.scrollY;
    const tick = () => {
      const y = window.scrollY;
      vel += (y - lastY - vel) * 0.15; // smoothed px/frame
      lastY = y;
      place();
      rot = (rot + 0.2 + vel * 0.25) % 360;
      spin.style.transform = `rotate(${rot.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={discRef}
      className="hero-disc pointer-events-none fixed left-0 top-0"
      aria-hidden="true"
    >
      {/* no z-index here: the face must paint BELOW the svg (which is
          position:relative), or its backdrop blur swallows the band
          and text into a gray disc */}
      <div className="hero-disc-face opacity-100" />
      {/* position:relative so the svg paints ABOVE the absolutely-
          positioned glass face — static elements always paint below
          positioned siblings, which buried the band + text under the
          face's backdrop blur */}
      <svg viewBox="0 0 120 120" className="relative size-32 overflow-visible">
        <defs>
          {/* the ring the text rides: r46 around the hub */}
          <path
            id="hero-disc-arc"
            d="M 60 14 A 46 46 0 0 1 60 106 A 46 46 0 0 1 60 14"
          />
          {/* band material: dark glass with a faint lime cast —
              furniture, never brighter than the wordmark */}
          <linearGradient
            id="hero-band-grad"
            gradientUnits="userSpaceOnUse"
            x1="14"
            y1="14"
            x2="106"
            y2="106"
          >
            <stop offset="0" stopColor="#1c2110" />
            <stop offset="0.45" stopColor="#101408" />
            <stop offset="0.72" stopColor="#191e0c" />
            <stop offset="1" stopColor="#0c0f06" />
          </linearGradient>
          <filter
            id="hero-band-fx"
            filterUnits="userSpaceOnUse"
            x="-20"
            y="-20"
            width="160"
            height="160"
          >
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="6"
              floodColor="#000000"
              floodOpacity="0.45"
            />
          </filter>
        </defs>
        {/* the band: a thick ring stroke with a slightly wider lime
            under-stroke so it keeps an edge against the near-black
            ground */}
        <use
          href="#hero-disc-arc"
          fill="none"
          stroke="rgba(200,255,0,0.32)"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <use
          href="#hero-disc-arc"
          fill="none"
          stroke="url(#hero-band-grad)"
          strokeWidth="22"
          strokeLinecap="round"
          filter="url(#hero-band-fx)"
        />
        <g opacity="1">
          <circle
            cx="60"
            cy="60"
            r="58"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
          />
          <circle
            cx="60"
            cy="60"
            r="30"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
          />
          <circle cx="60" cy="60" r="4" fill="#C8FF00" />
        </g>
        <g ref={discSpinRef} className="hero-disc-spin">
          <text
            fill="#C8FF00"
            fontSize="10.5"
            dominantBaseline="central"
            className="font-mono"
          >
            {/* textLength alone distributes the glyphs across the
                path's constant length (≈289) — combining it with
                letter-spacing double-counts in Chrome and leaves the
                tail of the ring empty */}
            <textPath href="#hero-disc-arc" textLength="286" lengthAdjust="spacing">
              2L+ PRIZE POOL · LIMITED TEAMS ONLY ·
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
};

export default BadgeDisc;
