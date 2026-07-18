import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import MercuryField from "./MercuryField";

// The hero: a raymarched liquid-mercury field (MercuryField, WebGL) with
// the HTML wordmark floating over it, framed by four anchored posts —
// positioning line top-left, badge ribbon top-right, message + CTAs
// baseline-left, date/venue facts baseline-right. The site-wide x-ray
// lens (LiquidLens, mounted in MainPage) recolors all of it inside the
// cursor blob.

gsap.registerPlugin(ScrollTrigger);

const StaticHeroBackground = () => (
  <div
    aria-hidden="true"
    className="absolute left-0 top-0 size-full bg-[#050505] bg-[radial-gradient(ellipse_80%_60%_at_30%_25%,rgba(200,255,0,0.09),transparent_65%),radial-gradient(ellipse_70%_55%_at_75%_70%,rgba(200,255,0,0.05),transparent_60%)]"
  />
);

const Hero = () => {
  const discRef = useRef(null);
  const discSpinRef = useRef(null);

  // The badge disc: a permanent quality stamp docked in the bottom-right
  // corner at every viewport — ring text spinning with an idle drift
  // plus smoothed scroll velocity (backspins when scrolling up). Static
  // under reduced motion.
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

  useGSAP(() => {
    // wordmark entrance: the lines surface with a soft rise; skipped
    // under reduced motion (content is visible by default — the reveal
    // only enhances it)
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.from(".hero-rise", {
        yPercent: 32,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.09,
        delay: 0.2,
      });
    }

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
  // the badge disc, hours + teams in the wordmark tagline, date + venue
  // here. The shadow keeps them legible over passing mercury rims.
  const facts = (
    <>
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#C8FF00] [text-shadow:0_2px_16px_rgba(0,0,0,0.9)]">
        July 2026
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-blue-50/50 [text-shadow:0_2px_16px_rgba(0,0,0,0.9)]">
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

        {/* the raymarched mercury field — drops drift, fuse, and follow
            the cursor behind the wordmark */}
        <MercuryField />

        <div className="hero-vignette" />
      </div>

      {/* Text overlay: sibling of #video-frame (a z-10 stacking context),
          so its z-index competes at page level — above the base ink
          (z-20) but BELOW the lens (z-45), so the blob's backdrop filter
          recolors this text live as it passes over. The blob collapses
          over the CTAs, so they stay usable. */}
      <div className="absolute left-0 top-0 z-[21] flex size-full flex-col justify-between px-5 pb-8 pt-24 sm:px-10 sm:pb-12 sm:pt-28">
        {/* Top band: positioning line left, date/venue facts right
            (the badge disc owns the bottom-right corner). */}
        <div className="flex w-full items-start justify-between gap-6">
          <p className="hero-rise max-w-60 font-display text-xl leading-snug text-blue-50/80 sm:text-2xl">
            Kerala&rsquo;s most curated hackathon
            <span className="text-[#C8FF00]">.</span>
          </p>
          <div className="hero-rise hidden flex-col items-end gap-1.5 pt-1 text-right sm:flex">
            {facts}
          </div>
        </div>

        {/* Center: the wordmark, floating over the mercury field */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="hero-heading hero-rise text-[#C8FF00]">
            Startathon.
            <span className="sr-only">
              {" "}
              — Kerala&rsquo;s most curated 30-hour hackathon at SCTCE,
              Thiruvananthapuram
            </span>
          </h1>
          <p className="hero-rise whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.24em] text-blue-50/75 [text-shadow:0_2px_18px_rgba(0,0,0,0.9)] sm:text-xs sm:tracking-[0.32em]">
            30 hours · 20 teams · ship something real
          </p>
        </div>

        {/* Baseline band: message + CTAs anchor the left corner; the
            badge disc stamps the right. On mobile the facts stack in
            here instead of the top band. */}
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
                  <ArrowUpRight size={15} strokeWidth={2.25} />
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
        </div>

        {/* Badge disc: fixed, so it survives the hero — the permanent
            quality stamp in the bottom-right corner (positioned and spun
            per-frame by the effect above). */}
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
          <svg
            viewBox="0 0 120 120"
            className="relative size-32 overflow-visible"
          >
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
