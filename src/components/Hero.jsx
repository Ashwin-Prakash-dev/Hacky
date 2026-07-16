import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { useState } from "react";
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

  const facts = [
    "SCTCE · Trivandrum",
    "30 hrs non-stop",
    "20 curated teams",
    "₹2L+ prize pool",
  ];

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
          <span className="eyebrow mb-5 rounded-full border border-white/10 bg-black/30 px-3 py-1 backdrop-blur-sm">
            Kerala · Limited teams only
          </span>

          <h1 className={inkOk ? "sr-only" : "hero-heading text-blue-100"}>
            Startathon{!inkOk && <span className="hero-dot">.</span>}
            <span className="sr-only">
              {" "}
              — Kerala&rsquo;s most curated 30-hour hackathon at SCTCE,
              Thiruvananthapuram
            </span>
          </h1>
        </div>

        <div className="glass- w-fit max-w-full p-6 sm:p-7">
          <p className="hero-sub mb-5 max-w-sm font-general text-base text-blue-50">
            30 hours. Ship something real.
            <br />
            Not everyone gets in.
          </p>

          <div className="mb-7 flex max-w-md flex-wrap items-center gap-2">
            {facts.map((fact) => (
              <span
                key={fact}
                style={{ fontFamily: "var(--font-mono)" }}
                className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-blue-50/70 backdrop-blur-sm"
              >
                {fact}
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
      </div>

    </section>
  );
};

export default Hero;
