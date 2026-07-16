import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// The headline is the liquid ink wordmark (LiquidLens, mounted site-wide
// in MainPage); this section supplies the dark backdrop it floats over and
// the DOM fallback headline when reduced motion is requested.

gsap.registerPlugin(ScrollTrigger);

const StaticHeroBackground = () => (
  <div
    aria-hidden="true"
    className="absolute left-0 top-0 size-full"
    style={{
      background:
        "radial-gradient(ellipse 80% 60% at 30% 25%, rgba(200,255,0,0.09), transparent 65%)," +
        "radial-gradient(ellipse 70% 55% at 75% 70%, rgba(200,255,0,0.05), transparent 60%)," +
        "#050505",
    }}
  />
);

function canUseInk() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const Hero = () => {
  // Under reduced motion the liquid ink headline sits out — fall back to
  // the visible DOM headline over a static gradient.
  const [inkOk] = useState(canUseInk);
  const discRef = useRef(null);
  const discSpinRef = useRef(null);
  const discArcRef = useRef(null);
  const discChromeRef = useRef(null);
  const discFaceRef = useRef(null);

  // The badge starts as a BANNER: the ring text on a flattened path,
  // docked as the hero's top-right post (dark glass, lime type — quiet
  // furniture, never brighter than the wordmark). On scroll the path
  // reels into the disc at the top-right corner, then rides the right
  // edge down to the bottom-right dock. Spin is scroll-reactive (idle
  // drift + smoothed velocity) and only engages once the ring has
  // closed. On mobile the reel sits out: the badge renders as a small
  // closed disc under the nav with a gentle idle spin.
  useEffect(() => {
    const disc = discRef.current;
    const spin = discSpinRef.current;
    const arcEl = discArcRef.current;
    const chrome = discChromeRef.current;
    const face = discFaceRef.current;
    if (!disc || !spin || !arcEl || !chrome || !face) return undefined;

    const D = 128; // rendered svg box (size-32)
    const RING = 289; // text path length in svg units (2π·46)
    const ANCHOR = 49.07; // px from box center up to the path's apex (60,14)

    // Reel-style curl: the ribbon winds onto a spool at its RIGHT end
    // (one-sided, like paper rolling up) instead of bending from both
    // ends. The spool is the final ring (r 46 at 60,60), tangent to the
    // banner line at the fixed entry point (60,14): a straight tail of
    // the un-wound length runs in from the left, then the wound part
    // wraps clockwise. Constant path length + textLength keep the glyph
    // spacing steady throughout.
    const pathFor = (f) => {
      if (f < 0.003) {
        return `M ${(60 - RING).toFixed(2)} 14 L 60 14`;
      }
      const W = f * Math.PI * 2; // wound angle around the reel
      const tail = (1 - f) * RING; // ribbon still unrolled
      const pt = (th) =>
        `${(60 + 46 * Math.sin(th)).toFixed(2)} ${(60 - 46 * Math.cos(th)).toFixed(2)}`;
      let d = `M ${(60 - tail).toFixed(2)} 14 L 60 14`;
      if (W <= Math.PI) {
        d += ` A 46 46 0 0 1 ${pt(W)}`;
      } else {
        d += ` A 46 46 0 0 1 ${pt(Math.PI)} A 46 46 0 0 1 ${pt(W)}`;
      }
      return d;
    };
    const ease = (v) => {
      const c = Math.min(Math.max(v, 0), 1);
      return c * c * (3 - 2 * c);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // static closed disc, top-right, no curl, no spin
      const place = () => {
        arcEl.setAttribute("d", pathFor(1));
        chrome.setAttribute("opacity", "1");
        face.style.opacity = "1";
        const s = window.innerWidth < 640 ? 0.55 : 0.68;
        const cx = window.innerWidth - 16 - 64 * s - 18;
        disc.style.transform = `translate3d(${(cx - D / 2).toFixed(1)}px, ${(130 - D / 2).toFixed(1)}px, 0) scale(${s})`;
      };
      place();
      window.addEventListener("resize", place);
      return () => window.removeEventListener("resize", place);
    }

    let raf = 0;
    let rot = 0;
    let vel = 0;
    let lastY = window.scrollY;
    const tick = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const y = window.scrollY;
      vel += (y - lastY - vel) * 0.15; // smoothed px/frame
      lastY = y;

      if (vw < 640) {
        // mobile: no reel — a small closed disc that rests under the
        // nav (top-right) and rides the right edge down to the
        // bottom-right dock on scroll, spinning gently throughout
        arcEl.setAttribute("d", pathFor(1));
        chrome.setAttribute("opacity", "1");
        face.style.opacity = "1";
        const s = 0.55;
        const cx = vw - 16 - 36;
        const p = ease(Math.min(y / (vh * 0.6), 1));
        const cy = 130 + (vh - 24 - 36 - 130) * p;
        disc.style.transform = `translate3d(${(cx - D / 2).toFixed(1)}px, ${(cy - D / 2).toFixed(1)}px, 0) scale(${s})`;
        rot += 0.15 + vel * 0.2;
        spin.style.transform = `rotate(${rot.toFixed(2)}deg)`;
        raf = requestAnimationFrame(tick);
        return;
      }

      // two-leg journey: leg 1 (c 0→0.5) the banner reels itself into
      // the ring at the top-right corner; leg 2 (c 0.5→1) the closed
      // ring rides the right edge down to the bottom corner
      const c = Math.min(Math.max(y / (vh * 0.9), 0), 1);
      const p1 = ease(Math.min(c / 0.5, 1));
      const p2 = ease(Math.max((c - 0.5) / 0.5, 0));

      // curl the banner into the ring (one-sided reel)
      arcEl.setAttribute("d", pathFor(p1));

      // scale: banner spans ~30vw as the top-right post (clamped so the
      // ring text stays legible on tablets and sane on ultrawides)
      // -> ~87px disc
      const kA = Math.min(Math.max(vw * 0.3, 320), 480) / (RING * (D / 120));
      const kB = 0.68;
      const k = kA + (kB - kA) * p1;
      // the reel entry point (60,14) is the anchor. At rest the banner's
      // right end sits flush with the content margin (top-right post);
      // leg 1 reels it into the corner ring, leg 2 drops it to the dock.
      const xC = vw - 24 - (D * kB) / 2; // right-edge column, both corners
      const ayTR = 132 - ANCHOR * kB; // ring center y 132, under the nav
      const ayBR = vh - 24 - (D * kB) / 2 - ANCHOR * kB;
      const axRest = vw - 40; // right end at the px-10 content margin
      const ayRest = 148; // banner line just under the nav band
      const ax = axRest + (xC - axRest) * p1;
      const ay = ayRest + (ayTR - ayRest) * p1 + (ayBR - ayTR) * p2;
      disc.style.transform = `translate3d(${(ax - D / 2).toFixed(1)}px, ${(ay - D / 2 + ANCHOR * k).toFixed(1)}px, 0) scale(${k.toFixed(3)})`;

      // disc chrome (glass face, rings, hub) surfaces as the reel closes
      const chromeOp = ease((p1 - 0.75) / 0.25).toFixed(3);
      chrome.setAttribute("opacity", chromeOp);
      face.style.opacity = chromeOp;

      // spin only once the ring has closed; while open, relax any
      // accumulated rotation back to a full turn so the flattened banner
      // always lies flat (never frozen at a diagonal)
      const gate = ease((c - 0.52) / 0.12);
      rot += (0.2 + vel * 0.3) * gate;
      rot += (Math.round(rot / 360) * 360 - rot) * (1 - gate) * 0.12;
      spin.style.transform = `rotate(${rot.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  // Each fact is said exactly once in the hero: prize pool + team cap on
  // the ribbon, hours + teams in the wordmark tagline, date + venue here.
  const facts = (
    <>
      <span
        style={{ fontFamily: "var(--font-mono)" }}
        className="text-[11px] uppercase tracking-[0.3em] text-[#C8FF00]"
      >
        July 2026
      </span>
      <span
        style={{ fontFamily: "var(--font-mono)" }}
        className="text-[10px] uppercase tracking-[0.22em] text-blue-50/50"
      >
        SCTCE · Thiruvananthapuram
      </span>
    </>
  );

  return (
    <section
      aria-label="Startathon — Kerala's most curated 30-hour hackathon"
      className="relative h-dvh w-screen overflow-x-hidden"
    >
      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-black"
      >
        <StaticHeroBackground />

        <div className="hero-vignette" />
      </div>

      {/* Text overlay: sibling of #video-frame (a z-10 stacking context),
          so its z-index competes at page level — above the base ink
          (z-20) but BELOW the lens (z-45), so the blob's backdrop filter
          recolors this text live as it passes over. The blob collapses
          over the CTAs, so they stay usable. */}
      <div className="absolute left-0 top-0 z-[21] flex size-full flex-col justify-between px-5 pb-8 pt-24 sm:px-10 sm:pb-12 sm:pt-28">
        {/* Top-left post: the positioning line, balancing the ribbon
            (top-right post). The h1 stays for a11y/reduced-motion. */}
        <div>
          <h1 className={inkOk ? "sr-only" : "hero-heading text-blue-100"}>
            Startathon{!inkOk && <span className="hero-dot">.</span>}
            <span className="sr-only">
              {" "}
              — Kerala&rsquo;s most curated 30-hour hackathon at SCTCE,
              Thiruvananthapuram
            </span>
          </h1>
          <p
            className="max-w-60 text-xl leading-snug text-blue-50/80 sm:text-2xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Kerala&rsquo;s most curated hackathon
            <span className="text-[#C8FF00]">.</span>
          </p>
        </div>

        {/* Baseline band: message + CTAs anchor the left corner, the
            date/venue facts anchor the right — a framed composition
            around the centered wordmark. On mobile the facts stack
            into the left column. */}
        <div className="flex w-full flex-wrap items-end justify-between gap-6">
          <div className="w-fit max-w-full">
            <p className="hero-sub mb-4 max-w-sm font-general text-lg font-medium text-blue-50">
              Not everyone gets in.
            </p>

            <div className="mb-6 flex flex-col gap-1.5 sm:hidden">{facts}</div>

            <div className="flex flex-wrap items-center gap-5">
              <Link to="/apply" className="cta-pill group">
                <span className="relative inline-flex overflow-hidden">
                  <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
                    Apply Now
                  </span>
                  <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
                    Apply Now
                  </span>
                </span>
                <span className="cta-pill-icon" aria-hidden="true">
                  ↗
                </span>
              </Link>

              <a
                href="#what-is-it"
                className="font-general text-xs uppercase tracking-widest text-blue-50/60 underline-offset-4 transition hover:text-[#C8FF00] hover:underline"
              >
                What is Startathon?
              </a>
            </div>
          </div>

          <div className="hidden flex-col items-end gap-1.5 pb-1 text-right sm:flex">
            {facts}
          </div>
        </div>

        {/* Badge banner→disc: fixed, so it survives the hero. Desktop:
            a straight text banner docked top-right that reels into a
            ring on scroll and docks bottom-right; mobile: a small closed
            disc under the nav (both driven per-frame by the effect
            above). */}
        <div
          ref={discRef}
          className="hero-disc pointer-events-none fixed left-0 top-0"
          aria-hidden="true"
        >
          {/* no z-index here: the face must paint BELOW the svg (which is
              position:relative), or its backdrop blur swallows the band
              and text into a gray disc */}
          <div ref={discFaceRef} className="hero-disc-face" />
          {/* position:relative so the svg paints ABOVE the absolutely-
              positioned glass face — static elements always paint below
              positioned siblings, which buried the band + text under the
              face's backdrop blur */}
          <svg
            viewBox="0 0 120 120"
            className="size-32"
            style={{ overflow: "visible", position: "relative" }}
          >
            <defs>
              {/* morphed per-frame: straight banner -> reeled ring r46 */}
              <path ref={discArcRef} id="hero-disc-arc" d="M -229 14 L 60 14" />
              {/* ribbon material: dark glass with a faint lime cast —
                  furniture, never brighter than the wordmark. User-space
                  coords: a bbox-relative gradient degenerates on the flat
                  banner (zero-height bbox) and the band paints as
                  nothing. */}
              <linearGradient
                id="hero-band-grad"
                gradientUnits="userSpaceOnUse"
                x1="-220"
                y1="0"
                x2="110"
                y2="120"
              >
                <stop offset="0" stopColor="#1c2110" />
                <stop offset="0.45" stopColor="#101408" />
                <stop offset="0.72" stopColor="#191e0c" />
                <stop offset="1" stopColor="#0c0f06" />
              </linearGradient>
              {/* shader-style surface: anisotropic turbulence streaks a
                  holographic sheen along the ribbon, then a drop shadow
                  lifts it off the page. The region is user-space and
                  generous: a straight banner has a zero-height bbox, so
                  percentage regions would collapse and hide the band. */}
              <filter
                id="hero-band-fx"
                filterUnits="userSpaceOnUse"
                x="-340"
                y="-60"
                width="520"
                height="300"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.06 0.55"
                  numOctaves="2"
                  seed="7"
                  result="noise"
                />
                <feColorMatrix
                  in="noise"
                  type="matrix"
                  values="0 0 0 0 0.55  0 0 0 0 0.72  0 0 0 0 0  0 0 0 0.22 0"
                  result="tint"
                />
                <feComposite
                  in="tint"
                  in2="SourceAlpha"
                  operator="in"
                  result="sheen"
                />
                <feMerge result="band">
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="sheen" />
                </feMerge>
                <feDropShadow
                  dx="0"
                  dy="5"
                  stdDeviation="6"
                  floodColor="#000000"
                  floodOpacity="0.45"
                />
              </filter>
            </defs>
            {/* the ribbon: a thick stroke on the SAME morphing path, so
                it curls with the text and closes into the disc's ring.
                A slightly wider lime under-stroke rims the dark band so
                it keeps an edge against the near-black ground. */}
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
            <g ref={discChromeRef} opacity="0">
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
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {/* textLength alone distributes the glyphs across the
                    path's constant length (≈289) — combining it with
                    letter-spacing double-counts in Chrome and leaves the
                    tail of the ring empty */}
                <textPath
                  href="#hero-disc-arc"
                  textLength="286"
                  lengthAdjust="spacing"
                >
                  2L+ PRIZE POOL · LIMITED TEAMS ONLY ·
                </textPath>
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
