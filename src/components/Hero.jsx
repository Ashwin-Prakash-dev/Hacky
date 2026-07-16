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

  // The badge disc is fixed: it starts in the hero's right gutter, docks
  // to the bottom-right corner as the page scrolls (so it never scrolls
  // away), and its spin is scroll-reactive — driven by smoothed scroll
  // velocity on top of a slow idle drift, reversing on scroll-up.
  useEffect(() => {
    const disc = discRef.current;
    const spin = discSpinRef.current;
    if (!disc || !spin) return undefined;

    const D = 128; // svg box (size-32)
    // hero anchor: top-right, tucked under the nav
    const gutter = () => ({
      x: window.innerWidth * 0.97 - D,
      y: Math.max(96, window.innerHeight * 0.14),
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // static stamp in the gutter, no spin, no docking
      const place = () => {
        const g = gutter();
        disc.style.transform = `translate3d(${g.x}px, ${g.y}px, 0)`;
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
      const vh = window.innerHeight;
      const y = window.scrollY;
      vel += (y - lastY - vel) * 0.15; // smoothed px/frame
      lastY = y;

      // dock: gutter anchor -> bottom-right corner over ~0.7 viewports
      const c = Math.min(Math.max(y / (vh * 0.7), 0), 1);
      const p = c * c * (3 - 2 * c);
      const g = gutter();
      const k = 1 - 0.32 * p; // 128px -> ~88px
      const x = g.x + (window.innerWidth - 24 - D * (0.5 + k / 2) - g.x) * p;
      const yPos = g.y + (vh - 24 - D * (0.5 + k / 2) - g.y) * p;
      disc.style.transform = `translate3d(${x.toFixed(1)}px, ${yPos.toFixed(1)}px, 0) scale(${k.toFixed(3)})`;

      // spin: idle drift + scroll drive (signed, so it backspins on up)
      rot += 0.2 + vel * 0.3;
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

        {/* Rotating badge disc: fixed, so it survives the hero — it sits
            top-right under the nav, then docks to the bottom-right corner
            on scroll (positioned + spun per-frame by the effect above) */}
        <div
          ref={discRef}
          className="hero-disc pointer-events-none fixed left-0 top-0 hidden sm:block"
          aria-hidden="true"
        >
          <svg viewBox="0 0 120 120" className="size-32">
            <defs>
              <path
                id="hero-disc-arc"
                d="M 60 60 m -46 0 a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0"
              />
            </defs>
            <circle
              cx="60"
              cy="60"
              r="58"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
            />
            <circle cx="60" cy="60" r="34" fill="none" stroke="rgba(255,255,255,0.08)" />
            <g ref={discSpinRef} className="hero-disc-spin">
              <text
                fill="rgba(255,255,255,0.7)"
                fontSize="10.5"
                letterSpacing="3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {/* textLength pins the ring text to the arc's full
                    circumference (2π·46 ≈ 289) so it never gaps */}
                <textPath href="#hero-disc-arc" textLength="288" lengthAdjust="spacing">
                  KERALA · LIMITED TEAMS ONLY ·
                </textPath>
              </text>
            </g>
            <circle cx="60" cy="60" r="4" fill="#C8FF00" />
          </svg>
        </div>
      </div>

    </section>
  );
};

export default Hero;
