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
  { date: new Date(2026, 6, 31), label: "Idea submissions open" },
  { date: new Date(2026, 7, 7), label: "Submissions close and payment due" },
  { date: new Date(2026, 7, 12), label: "Shortlisted teams announced" },
  // { date: new Date(2026, 7, 20), label: "Payment deadline" },
  {
    date: new Date(2026, 8, 5),
    endDate: new Date(2026, 8, 6),
    label: "Startathon.",
    finale: true,
  },
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

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
  const ruleRefs = useRef([]);
  const dayRefs = useRef([]);

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
        gsap.set(ruleRefs.current.filter(Boolean), { scaleX: 0, transformOrigin: "left center" });

        rowRefs.current.forEach((el, i) => {
          if (!el) return;
          const m = MILESTONES[i];
          const dayEl = dayRefs.current[i];
          // Resting DOM already shows the true day number (no-JS / SSR
          // correct-by-default); only reset it to a decoy start once we
          // know the count-up is about to run, mirroring Prizes' reel.
          if (dayEl) dayEl.textContent = "1";

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          });

          tl.fromTo(
            el,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
            0,
          );
          if (ruleRefs.current[i]) {
            tl.to(ruleRefs.current[i], { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, 0.15);
          }
          if (dayEl) {
            const proxy = { v: 1 };
            tl.to(
              proxy,
              {
                v: m.date.getDate(),
                duration: 0.6,
                ease: "power2.out",
                onUpdate: () => {
                  dayEl.textContent = String(Math.round(proxy.v));
                },
              },
              0.05,
            );
          }
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        rowRefs.current.forEach((el) => el && gsap.set(el, { opacity: 1, y: 0 }));
        gsap.set(ruleRefs.current.filter(Boolean), { scaleX: 1 });
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
                className={`group -mx-2 flex flex-col items-start gap-y-1.5 rounded-md px-2 opacity-0 transition-colors duration-300 hover:bg-lime/[0.03] sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-6 sm:gap-y-2 ${
                  m.finale ? "py-[clamp(1.6rem,3.2vw,2.2rem)]" : "py-[clamp(1.2rem,2.6vw,1.75rem)]"
                }`}
              >
                <div className="flex items-baseline gap-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1.5">
                  <span
                    aria-hidden="true"
                    className={`size-2.5 shrink-0 ${m.finale ? "rotate-45" : "rounded-full"} ${dotClass(rowStatus[i])}`}
                  />
                  <span
                    className={`font-mono font-extrabold leading-none tracking-[-0.01em] [font-variant-numeric:tabular-nums] ${
                      m.finale ? "text-[clamp(1.9rem,4.5vw,2.8rem)]" : "text-[clamp(1.3rem,2.6vw,1.7rem)]"
                    } ${dateTextClass(rowStatus[i], m.finale)}`}
                  >
                    {m.finale ? (
                      `${MONTHS[m.date.getMonth()]} ${m.date.getDate()}–${m.endDate.getDate()}`
                    ) : (
                      <>
                        {MONTHS[m.date.getMonth()]}{" "}
                        <span ref={(el) => (dayRefs.current[i] = el)}>{m.date.getDate()}</span>
                      </>
                    )}
                  </span>
                </div>
                <span
                  className={`font-general leading-[1.35] transition-colors duration-300 group-hover:text-white ${
                    m.finale
                      ? "text-[clamp(1.15rem,2.2vw,1.5rem)] font-bold text-white/90"
                      : "text-[clamp(1rem,1.8vw,1.2rem)] font-semibold text-white/75"
                  }`}
                >
                  {m.label}
                </span>
              </div>
              <div ref={(el) => (ruleRefs.current[i] = el)} className="h-px bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
