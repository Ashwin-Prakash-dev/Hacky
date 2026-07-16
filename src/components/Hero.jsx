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

  // The badge starts as a BANNER: the ring text on a flattened path laid
  // straight across the wordmark. On scroll the path curls — its ends
  // bend down until they meet — closing into the disc, which glides to
  // the bottom-right corner and lives there as a fixed stamp. Spin is
  // scroll-reactive (idle drift + smoothed velocity, backspins on up)
  // and only engages once the ring has closed.
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
        disc.style.transform = `translate3d(${window.innerWidth * 0.97 - D}px, ${Math.max(96, window.innerHeight * 0.14)}px, 0)`;
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

      // two-leg journey: leg 1 (c 0→0.5) the banner flows RIGHT while
      // reeling itself into the ring at the top-right; leg 2 (c 0.5→1)
      // the closed ring rides the right edge down to the bottom corner
      const c = Math.min(Math.max(y / (vh * 0.9), 0), 1);
      const p1 = ease(Math.min(c / 0.5, 1));
      const p2 = ease(Math.max((c - 0.5) / 0.5, 0));

      // curl the banner into the ring (one-sided reel)
      arcEl.setAttribute("d", pathFor(p1));

      // scale: banner spans ~46vw across the wordmark -> ~87px disc
      const kA = (vw * 0.46) / (RING * (D / 120));
      const kB = 0.68;
      const k = kA + (kB - kA) * p1;
      // the reel entry point (60,14) is the anchor. At rest the banner
      // hangs left of it (centered over the wordmark); leg 1 flies it to
      // the top-right corner, leg 2 drops it to the bottom-right dock.
      const xC = vw - 24 - (D * kB) / 2; // right-edge column, both corners
      const ayTR = 132 - ANCHOR * kB; // ring center y 132, under the nav
      const ayBR = vh - 24 - (D * kB) / 2 - ANCHOR * kB;
      const bannerHalf = (RING * (D / 120) * kA) / 2;
      const ax = vw / 2 + bannerHalf + (xC - vw / 2 - bannerHalf) * p1;
      const ay = vh * 0.32 + (ayTR - vh * 0.32) * p1 + (ayBR - ayTR) * p2;
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

  // "30 hrs" and "20 teams" already live in the wordmark tagline — the
  // chips only carry what isn't said elsewhere. `hot` flips a chip to the
  // lime emphasis treatment.
  const facts = [
    { label: "SCTCE · Trivandrum" },
    { label: "₹2L+ prize pool", hot: true },
  ];

  const chipClass = (hot) =>
    `rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur-sm ${
      hot
        ? "border-[#C8FF00]/40 bg-[#C8FF00]/10 text-[#C8FF00] shadow-[0_0_18px_rgba(200,255,0,0.15)]"
        : "border-white/10 bg-black/30 text-blue-50/70"
    }`;

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
      <div className="absolute left-0 top-0 z-[21] flex size-full flex-col justify-between px-5 pb-10 pt-28 sm:px-10 sm:pb-14">
        <div>
          <h1 className={inkOk ? "sr-only" : "hero-heading text-blue-100"}>
            Startathon{!inkOk && <span className="hero-dot">.</span>}
            <span className="sr-only">
              {" "}
              — Kerala&rsquo;s most curated 30-hour hackathon at SCTCE,
              Thiruvananthapuram
            </span>
          </h1>
        </div>

        {/* Bottom band, split for balance: message + CTAs bottom-left,
            fact chips as a right-aligned rail bottom-right (they echo the
            wordmark tagline's right alignment). On mobile the rail folds
            back into the left block. */}
        <div className="flex w-full flex-wrap items-end justify-between gap-6">
          <div className="glass- w-fit max-w-full p-6 sm:p-7">
            <p className="hero-sub mb-5 max-w-sm font-general text-base text-blue-50">
              Not everyone gets in.
            </p>

            <div className="mb-7 flex max-w-md flex-wrap items-center gap-2 sm:hidden">
              {facts.map(({ label, hot }) => (
                <span
                  key={label}
                  style={{ fontFamily: "var(--font-mono)" }}
                  className={chipClass(hot)}
                >
                  {label}
                </span>
              ))}
            </div>

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

          <div className="hidden flex-col items-end gap-2 pb-1 sm:flex">
            {facts.map(({ label, hot }) => (
              <span
                key={label}
                style={{ fontFamily: "var(--font-mono)" }}
                className={chipClass(hot)}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Badge banner→disc: fixed, so it survives the hero. Starts as a
            straight text banner across the wordmark; the path curls into
            a ring on scroll and docks bottom-right (driven per-frame by
            the effect above). */}
        <div
          ref={discRef}
          className="hero-disc pointer-events-none fixed left-0 top-0 hidden sm:block"
          aria-hidden="true"
        >
          <div ref={discFaceRef} className="hero-disc-face z-40" />
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
              {/* ribbon material: off-white gradient with a faint lime
                  cast. User-space coords: a bbox-relative gradient
                  degenerates on the flat banner (zero-height bbox) and
                  the band paints as nothing. */}
              <linearGradient
                id="hero-band-grad"
                gradientUnits="userSpaceOnUse"
                x1="-220"
                y1="0"
                x2="110"
                y2="120"
              >
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.45" stopColor="#edf2e0" />
                <stop offset="0.72" stopColor="#ffffff" />
                <stop offset="1" stopColor="#e5efcf" />
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
                  values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.82  0 0 0 0.45 0"
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
                it curls with the text and closes into the disc's ring */}
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
                fill="#141804"
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
