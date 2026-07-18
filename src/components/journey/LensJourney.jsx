import { Suspense, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import JourneyScene from "./JourneyScene";
import BadgeDisc from "./BadgeDisc";
import {
  CHAPTERS,
  CHAPTER_COUNT,
  BUILDERS,
  BRIEFING_BLOCKS,
  PRIZE_LADDER,
  SPONSORS,
} from "./journeyContent";

gsap.registerPlugin(ScrollTrigger);

// The landing page as one scroll journey: a DOM track (one viewport of
// scroll per chapter) with a sticky full-screen canvas riding it. Lenis
// stays the single scroll authority — the scene reads the track's
// position, and this shell scrubs the HTML overlays with a ScrollTrigger
// on the same track, so WebGL and DOM can never drift apart. When the
// track ends the sticky canvas scrolls away natively into the DOM
// sections that follow (FAQ, contact, footer).

// The cursor reticle's target-lock (previously set by LiquidLens): the
// ring squares up over the Apply CTAs.
const lockProps = {
  onMouseEnter: () => document.body.classList.add("lens-lock"),
  onMouseLeave: () => document.body.classList.remove("lens-lock"),
};

const CtaPill = ({ className = "" }) => (
  <Link to="/apply" className={`cta-pill group ${className}`} {...lockProps}>
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
);

const LensJourney = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  // shared per-frame state the scene reads without re-rendering React
  const journey = useRef({ progress: 0 });
  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  // coarse pointer = phone/tablet: shrink the refraction budget
  const lowTier = useMemo(
    () => window.matchMedia("(pointer: coarse)").matches,
    []
  );

  useGSAP(
    () => {
      // Overlay choreography scrubbed to track progress. Timeline position
      // = journey progress fraction (the trailing set() pins duration to 1).
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
      // arrival posts hand the frame over to the scene
      tl.to(".jn-post", { autoAlpha: 0, duration: 0.06 }, 0.09);
      // corner CTA yields to the threshold moment
      tl.to(".jn-corner", { autoAlpha: 0, duration: 0.04 }, 0.86);
      tl.fromTo(
        ".jn-final",
        { autoAlpha: 0, y: reducedMotion ? 0 : 28 },
        { autoAlpha: 1, y: 0, duration: 0.05 },
        0.9
      );
      tl.set({}, {}, 1);

      // entrance: the posts surface once on load
      if (!reducedMotion) {
        gsap.from(".jn-rise", {
          yPercent: 32,
          opacity: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.09,
          delay: 0.2,
        });
      }
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Startathon — Kerala's most curated 30-hour hackathon"
      className="relative"
    >
      <div
        ref={trackRef}
        className="relative"
        // one viewport of scroll per chapter — derived, not hand-tuned
        style={{ height: `${CHAPTER_COUNT * 100}svh` }}
      >
        {/* invisible rails so navbar + in-page anchors land on chapters */}
        {CHAPTERS.map(
          (c, i) =>
            c.anchor && (
              <div
                key={c.anchor}
                id={c.anchor}
                aria-hidden="true"
                className="absolute left-0 size-px"
                style={{ top: `${i * 100}svh` }}
              />
            )
        )}

        <div className="sticky top-0 h-svh w-full overflow-hidden">
          {/* ambient ground: the lime pools the old hero established */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#050505] bg-[radial-gradient(ellipse_80%_60%_at_30%_25%,rgba(200,255,0,0.09),transparent_65%),radial-gradient(ellipse_70%_55%_at_75%_70%,rgba(200,255,0,0.05),transparent_60%)]"
          />

          <div className="absolute inset-0">
            <Canvas
              frameloop="demand"
              flat
              dpr={[1, 1.75]}
              camera={{ position: [0, 0, 20], fov: 15 }}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
              <Suspense fallback={null}>
                <JourneyScene
                  trackRef={trackRef}
                  journey={journey}
                  reducedMotion={reducedMotion}
                  lowTier={lowTier}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* HTML overlay: interactive + microcopy posts above the glass */}
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-5 pb-8 pt-24 sm:px-10 sm:pb-12 sm:pt-28">
            <div className="jn-post jn-rise flex flex-col items-end gap-1.5 text-right">
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#C8FF00]">
                July 2026
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-blue-50/50">
                SCTCE · Thiruvananthapuram
              </span>
            </div>

            <div className="jn-corner jn-rise pointer-events-auto flex flex-wrap items-center gap-5">
              <CtaPill />
              <a
                href="#what-is-it"
                className="font-general text-xs uppercase tracking-widest text-blue-50/60 underline-offset-4 transition hover:text-[#C8FF00] hover:underline"
              >
                What is Startathon?
              </a>
            </div>
          </div>

          {/* threshold: the journey's closing Apply moment */}
          <div className="jn-final invisible absolute inset-x-0 bottom-0 z-10 flex justify-center pb-32 opacity-0">
            <div className="pointer-events-auto">
              <CtaPill className="scale-110" />
            </div>
          </div>

          <BadgeDisc />
        </div>
      </div>

      {/* Semantic mirror of the in-canvas content: screen readers and
          crawlers read the full journey, links included. */}
      <div className="sr-only">
        <h1>
          Startathon — Kerala&rsquo;s most curated 30-hour hackathon at SCTCE,
          Thiruvananthapuram
        </h1>
        <p>30 hours · 20 teams · ship something real. Not everyone gets in.</p>
        <h2>We took notes from the builders who changed everything</h2>
        <ul>
          {BUILDERS.map((b) => (
            <li key={b.name}>
              {b.name} — {b.blurb}
            </li>
          ))}
        </ul>
        <h2>What is Startathon?</h2>
        {BRIEFING_BLOCKS.map((block) => (
          <section key={block.heading}>
            <h3>{block.heading}</h3>
            <ul>
              {block.rows.map(([title, desc]) => (
                <li key={title}>
                  {title} — {desc}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <h2>₹2,00,000 total prize pool</h2>
        <ul>
          {PRIZE_LADDER.map(([label, amount]) => (
            <li key={label}>
              {label}: {amount}
            </li>
          ))}
        </ul>
        <h2>Companies backing Startathon</h2>
        <ul>
          {SPONSORS.map((s) => (
            <li key={s.name}>
              <a href={s.href}>{s.name}</a> — {s.blurb}
            </li>
          ))}
        </ul>
        <h2>Still in college. Already building.</h2>
        <p>
          Every person behind those companies was a student once. They just
          didn&rsquo;t stop building. Startathon is how we find those people in
          Kerala. If that&rsquo;s you, you should be here.
        </p>
      </div>
    </section>
  );
};

export default LensJourney;
