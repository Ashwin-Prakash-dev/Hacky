import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const blocks = [
  {
    id: "expect",
    heading: "What to Expect",
    rows: [
      { title: "30-Hour Build Sprint", desc: "Non-stop building from kickoff to demo day" },
      { title: "Expert Mentors", desc: "Technical founders and engineers in the room with you" },
      { title: "Curated Teams Only", desc: "20 selected teams. Builders, not attendees" },
      { title: "Fast-track Interviews", desc: "Top performers skip the cold application queue entirely" },
    ],
  },
  {
    id: "mentors",
    heading: "Mentors",
    rows: [
      { title: "Technical Founders", desc: "Startup builders who've shipped products to real users" },
      { title: "Domain Specialists", desc: "Engineers with deep expertise in AI, fintech, healthtech" },
      { title: "Hands-on Help", desc: "They sit with your team, look at your code, push you harder" },
      { title: "Real 1:1s", desc: "Sit across from founders and CTOs. Not a panel from 20 rows back" },
    ],
  },
  {
    id: "rules",
    heading: "Rules",
    rows: [
      { title: "Teams of 3–4", desc: "Squad up — every team needs 3 to 4 members to compete" },
      { title: "Original work only", desc: "All code written during the 30-hour window. No pre-built projects" },
      { title: "Must be deployable", desc: "A working product or clear prototype. Slides don't count" },
      { title: "Fair play", desc: "Respect fellow builders, mentors, and the community you're in" },
    ],
  },
];

// Masked line: the child wipes upward out of the overflow-hidden shell on
// reveal — same grammar as the prize board above this section.
const Mask = ({ children, className = "" }) => (
  <div className={`overflow-hidden ${className}`}>
    <div className="bf-line">{children}</div>
  </div>
);

// The briefing: What to Expect / Mentors / Rules as one editorial document
// continuing straight out of the prize reveal. Each block's lines mask in
// once as it enters the viewport; reduced motion sees the content as-is.
const Briefing = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".bf-block").forEach((block) => {
        gsap.from(block.querySelectorAll(".bf-line"), {
          yPercent: 110,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: block, start: "top 80%", once: true },
        });
        gsap.from(block.querySelectorAll(".bf-rule"), {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.9,
          ease: "power2.inOut",
          stagger: 0.1,
          scrollTrigger: { trigger: block, start: "top 80%", once: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="briefing"
      data-lens="briefing"
      className="w-full bg-[#050505] pb-36 pt-24"
    >
      <div className="container mx-auto px-5 md:px-10">
        <div className="flex flex-col gap-[clamp(4rem,9vh,6rem)]">
          {blocks.map((block) => (
            <div key={block.id} className="bf-block">
              <Mask className="mb-[1.8rem]">
                <h2 className="font-display text-[clamp(1.7rem,4vw,2.8rem)] font-extrabold uppercase leading-none tracking-[-0.01em] text-white">
                  {block.heading}
                </h2>
              </Mask>

              {block.rows.map((row, i) => (
                <div key={row.title}>
                  <div className="bf-rule h-px bg-white/10" />
                  <Mask>
                    <div className="flex flex-wrap items-baseline gap-x-[clamp(1rem,3vw,1.6rem)] gap-y-[0.45rem] py-[1.15rem]">
                      <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-[1_1_auto] font-display text-[clamp(1.05rem,2.3vw,1.55rem)] font-extrabold uppercase tracking-[0.01em] text-white/[0.92]">
                        {row.title}
                      </span>
                      <span className="ml-auto basis-[min(38ch,100%)] font-general text-[0.9rem] leading-[1.55] text-white/55">
                        {row.desc}
                      </span>
                    </div>
                  </Mask>
                </div>
              ))}
              <div className="bf-rule h-px bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Briefing;
