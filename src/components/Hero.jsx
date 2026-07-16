import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { useState } from "react";
import HeroLiquidReveal from "./HeroLiquidReveal";

// The particle headline is drawn by the site-wide canvas (GlobalParticles,
// mounted in MainPage); this section supplies the dark backdrop it floats
// over and the DOM fallback headline when WebGL/motion is unavailable.

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

function canUseParticles() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
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

const Hero = () => {
  // When WebGL/motion is unavailable, the particle headline can't render —
  // fall back to the visible DOM headline over a static gradient.
  const [particlesOk] = useState(canUseParticles);

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
      data-particles="hero"
      className="relative h-dvh w-screen overflow-x-hidden"
    >
      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-black"
      >
        <StaticHeroBackground />

        <div className="hero-vignette" />

        <div className="absolute left-0 top-0 z-40 flex size-full flex-col justify-between px-5 pb-10 pt-28 sm:px-10 sm:pb-14">
          <div>
            <span className="eyebrow mb-5">Kerala · Limited teams only</span>

            <h1 className={particlesOk ? "sr-only" : "hero-heading text-blue-100"}>
              Startathon{!particlesOk && <span className="hero-dot">.</span>}
              <span className="sr-only">
                {" "}— Kerala&rsquo;s most curated 30-hour hackathon at SCTCE,
                Thiruvananthapuram
              </span>
            </h1>
          </div>

          <div>
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
              <a href="/apply" className="cta-pill group">
                <span className="relative inline-flex overflow-hidden">
                  <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
                    Apply Now
                  </span>
                  <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
                    Apply Now
                  </span>
                </span>
                <span className="cta-pill-icon" aria-hidden="true">↗</span>
              </a>

              <a
                href="#what-is-it"
                className="font-general text-xs uppercase tracking-widest text-blue-50/60 underline-offset-4 transition hover:text-[#C8FF00] hover:underline"
              >
                What is Startathon?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Liquid cursor blob: reveals the solid-text lime world. Sibling of
          #video-frame (a z-10 stacking context) so its own z-index (45)
          competes at page level — above the particle canvas (z-30). */}
      <HeroLiquidReveal />
    </section>
  );
};

export default Hero;
