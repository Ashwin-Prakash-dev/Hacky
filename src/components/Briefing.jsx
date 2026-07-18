import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BriefingPortals from "./BriefingPortals";

gsap.registerPlugin(ScrollTrigger);

const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

const CARDS = [
  {
    id: "expect",
    title: "What to expect",
    lines: [
      "30 hours — 24 build, 6 eval",
      "20 curated teams — builders, not attendees",
    ],
  },
  {
    id: "mentors",
    title: "Mentors",
    lines: ["Technical founders in the room", "Real 1:1s at your table"],
  },
  {
    id: "rules",
    title: "Rules",
    lines: [
      "Teams of 3–4",
      "All code written inside the window",
      "Ship something deployable — slides don't count",
    ],
  },
];

// The briefing: three portal cards orbiting in a pinned stage — What to
// Expect / Mentors / Rules, each a small 3D world you can peek inside on
// hover. Reduced motion / no WebGL fall back to a plain stacked column
// with the same trimmed copy, no canvas, no pin.
const Briefing = () => {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const webgl = useMemo(supportsWebGL, []);

  useEffect(() => {
    if (reduced || !webgl) return undefined;
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=200%",
      scrub: true,
      pin: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });
    return () => st.kill();
  }, [reduced, webgl]);

  if (reduced || !webgl) {
    return (
      <section
        id="briefing"
        data-lens="briefing"
        className="w-full bg-[#050505] pb-36 pt-24"
      >
        <div className="container mx-auto flex flex-col gap-12 px-5 md:px-10">
          {CARDS.map((card) => (
            <div key={card.id} className="rounded-xl bg-white/[0.03] p-6">
              <h3 className="mb-2 font-display text-xl font-extrabold uppercase text-white">
                {card.title}
              </h3>
              <ul className="space-y-1 font-general text-sm text-white/70">
                {card.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="briefing"
      data-lens="briefing"
      className="relative h-dvh w-full overflow-hidden bg-[#050505]"
    >
      <BriefingPortals progressRef={progressRef} onActiveChange={setActiveIndex} />
      <div className="pointer-events-none absolute left-5 top-24 z-10 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/45 sm:left-10">
        {String(activeIndex + 1).padStart(2, "0")} / {CARDS[activeIndex]?.title}
      </div>
    </section>
  );
};

export default Briefing;
