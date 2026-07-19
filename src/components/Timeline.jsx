import { useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Seven stops between the waitlist going live and the event itself. Months
// are 0-indexed (4 = May, 6 = Jul, 7 = Aug, 8 = Sep) to match Date's native
// constructor — no date library needed for a static list this small.
const MILESTONES = [
  { date: new Date(2026, 4, 31), label: "Waitlist & website go live" },
  { date: new Date(2026, 6, 19), label: "Registration opens · dates announced" },
  { date: new Date(2026, 6, 29), label: "Idea submissions open" },
  { date: new Date(2026, 7, 5), label: "Submissions close" },
  { date: new Date(2026, 7, 10), label: "Shortlisted teams announced" },
  { date: new Date(2026, 7, 20), label: "Payment deadline" },
  {
    date: new Date(2026, 8, 5),
    endDate: new Date(2026, 8, 6),
    label: "Startathon.",
    finale: true,
  },
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const fmt = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;

const dateTextClass = (status, finale) => {
  if (finale || status === "active") return "text-lime";
  if (status === "done") return "text-white/30";
  return "text-white/90";
};

const dotClass = (status) => {
  if (status === "active") {
    return "animate-pulse bg-lime shadow-[0_0_0_4px_rgba(200,255,0,0.15)]";
  }
  if (status === "done") return "bg-lime/40";
  return "border border-white/25 bg-transparent";
};

const Timeline = () => {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);

  // Computed once on mount: real-world done / active / upcoming per
  // milestone, based on today's date.
  const rowStatus = useMemo(() => {
    const today = new Date();
    const passed = MILESTONES.map((m) => today >= m.date);
    const lastPassedIdx = passed.lastIndexOf(true);
    return MILESTONES.map((_, i) => {
      if (i === lastPassedIdx) return "active";
      if (passed[i]) return "done";
      return "upcoming";
    });
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        rowRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.fromTo(
            el,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: "power3.out",
              delay: (i % 4) * 0.05,
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        rowRefs.current.forEach((el) => el && gsap.set(el, { opacity: 1, y: 0 }));
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="timeline"
      data-lens="timeline"
      className="relative w-full bg-[#050505] py-20 md:py-28"
    >
      <div className="container mx-auto px-5 md:px-10">
        <div className="mb-[clamp(2.5rem,6vh,4rem)]">
          <span className="eyebrow mb-[1.4rem]">the road to september</span>
          <h2 className="font-general text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.02em] text-white">
            Every date between
            <br className="hidden sm:block" /> now and the event.
          </h2>
        </div>

        <div>
          <div className="h-px bg-white/10" />
          {MILESTONES.map((m, i) => (
            <div key={m.label}>
              <div
                ref={(el) => (rowRefs.current[i] = el)}
                className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 opacity-0 ${
                  m.finale ? "py-[clamp(1.6rem,3.2vw,2.2rem)]" : "py-[clamp(1.2rem,2.6vw,1.75rem)]"
                }`}
              >
                <div className="flex items-baseline gap-4">
                  <span
                    aria-hidden="true"
                    className={`size-2.5 shrink-0 ${m.finale ? "rotate-45" : "rounded-full"} ${dotClass(rowStatus[i])}`}
                  />
                  <span
                    className={`font-mono font-extrabold leading-none tracking-[-0.01em] [font-variant-numeric:tabular-nums] ${
                      m.finale ? "text-[clamp(1.9rem,4.5vw,2.8rem)]" : "text-[clamp(1.3rem,2.6vw,1.7rem)]"
                    } ${dateTextClass(rowStatus[i], m.finale)}`}
                  >
                    {m.finale ? `${fmt(m.date)}–${m.endDate.getDate()}` : fmt(m.date)}
                  </span>
                </div>
                <span
                  className={`font-general leading-[1.35] ${
                    m.finale
                      ? "text-[clamp(1.15rem,2.2vw,1.5rem)] font-bold text-white/90"
                      : "text-[clamp(1rem,1.8vw,1.2rem)] font-semibold text-white/75"
                  }`}
                >
                  {m.label}
                </span>
              </div>
              <div className="h-px bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
