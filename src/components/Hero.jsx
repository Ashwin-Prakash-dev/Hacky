import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import HeroDissolve from "./HeroDissolve";

// The hero: one fullscreen video (HeroDissolve, WebGL) that comes apart
// bottom-up in large mosaic pixels as the pinned hero is scrubbed,
// revealing the DOM atmosphere gradient underneath. The wordmark, CTA,
// and date/venue facts sit over it for the whole (short) pin and scroll
// away naturally when it releases. The badge disc (fixed) and the
// site-wide x-ray lens (LiquidLens, mounted in MainPage) survive the
// whole ride.

gsap.registerPlugin(ScrollTrigger);

const StaticHeroBackground = () => (
  <div
    aria-hidden="true"
    className="absolute left-0 top-0 size-full bg-[#050505] bg-[radial-gradient(ellipse_80%_60%_at_30%_25%,rgba(200,255,0,0.09),transparent_65%),radial-gradient(ellipse_70%_55%_at_75%_70%,rgba(200,255,0,0.05),transparent_60%)]"
  />
);

const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

const Hero = () => {
  const sectionRef = useRef(null);
  const overlayRef = useRef(null);
  const progressRef = useRef(0);
  const discRef = useRef(null);
  const discSpinRef = useRef(null);

  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const webgl = useMemo(supportsWebGL, []);

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

  useGSAP(
    () => {
      // wordmark entrance: the lines surface with a soft rise; skipped
      // under reduced motion (content is visible by default — the reveal
      // only enhances it)
      if (!reduced) {
        gsap.from(".hero-rise", {
          yPercent: 32,
          opacity: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.09,
          delay: 0.2,
        });
      }
      if (reduced || !webgl) return;

      // one short pin: the dissolve is the only beat here, so the
      // overlay just persists for the pin and scrolls away naturally
      // when it releases — no fade choreography needed
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=100%",
        scrub: true,
        pin: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    },
    { scope: sectionRef, dependencies: [reduced, webgl] },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Startathon — Kerala's most curated 30-hour hackathon"
      className="relative h-dvh w-screen overflow-hidden bg-[#050505] backdrop-blur-md"
    >
      <div className="absolute left-0 top-0 size-full">
        <StaticHeroBackground />
        {webgl && (
          <HeroDissolve progressRef={progressRef} staticMode={reduced} />
        )}
        <div className="hero-vignette" />
      </div>

      {/* Text overlay: z-[21] — above the base ink (z-20) but BELOW the
          lens (z-45), so the blob's backdrop filter recolors this text
          live as it passes over. Persists for the whole pin and scrolls
          away naturally when it releases. */}
      <div
        ref={overlayRef}
        className="absolute left-0 top-0 z-[21] flex size-full flex-col justify-between px-5 pb-8 pt-24 sm:px-10 sm:pb-12 sm:pt-28"
      >
        {/* Top band: date/venue facts (the badge disc owns the
            bottom-right corner). */}
        <div className="flex w-full items-start justify-end gap-6">
          <div className="hero-rise hidden flex-col items-end gap-1.5 pt-1 text-right sm:flex">
            {/* {facts} */}
          </div>
        </div>

        {/* Center: the wordmark, floating over the dissolving video */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-fit max-w-full">
            <h1 className="hero-heading hero-rise pointer-events-none select-none text-white shadow-sm">
              Startathon<span className="text-lime">.</span>
            </h1>
            <span className="hero-rise pointer-events-none mt-1 block select-none text-right font-general text-sm tracking-[0.03em] text-white/80 md:text-xl">
              an initiative by <a href="https://sctcoding.club" target="_blank" rel="noopener noreferrer" className="text-red-400 pointer-events-auto hover:underline">
                SCTCE Coding Club
              </a>
            </span>
          </div>
        </div>

        {/* Baseline band: message + CTAs anchor the left corner; the
            badge disc stamps the right. On mobile the facts stack in
            here instead of the top band. */}
        <div className="flex w-full flex-wrap items-end justify-between gap-6">
          <div className="w-fit max-w-full rounded-2xl bg-black/35 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
            <p className="hero-sub mb-2 max-w-sm font-general text-lg font-medium text-white">
              Build something extraordinary.
            </p>
            <p className="hero-sub font-regular mb-4 max-w-sm font-general text-base text-white">
              Join 100+ innovators pushing boundaries and creating the future
              together.
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <Link to="/apply" className="cta-pill group">
                <span className="relative inline-flex overflow-hidden">
                  <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
                    Start Your Journey
                  </span>
                  <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
                    Start Your Journey
                  </span>
                </span>
                <span className="cta-pill-icon" aria-hidden="true">
                  <ArrowUpRight size={15} strokeWidth={2.25} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Badge disc: portaled to <body> because the pinned section carries
          a GSAP transform, which would demote position:fixed to
          "absolute inside the pin" and drag the stamp away with the hero.
          From body it stays truly fixed bottom-right for the whole page
          (positioned and spun per-frame by the effect above); z-30 keeps
          it above sections and below the lens (z-45). */}
      {createPortal(
        <div
          ref={discRef}
          className="hero-disc pointer-events-none fixed left-0 top-0 z-30"
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
        </div>,
        document.body,
      )}
    </section>
  );
};

export default Hero;
