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
      { title: "Teams of 1–4", desc: "Build solo or with a crew. Up to 4 members per team" },
      { title: "Original work only", desc: "All code written during the 30-hour window. No pre-built projects" },
      { title: "Must be deployable", desc: "A working product or clear prototype. Slides don't count" },
      { title: "Fair play", desc: "Respect fellow builders, mentors, and the community you're in" },
    ],
  },
];

// Masked line: the child wipes upward out of the overflow-hidden shell on
// reveal — same grammar as the prize board above this section.
const Mask = ({ children, style }) => (
  <div style={{ overflow: "hidden", ...style }}>
    <div className="bf-line">{children}</div>
  </div>
);

const mono = {
  fontFamily: "var(--font-mono)",
  textTransform: "uppercase",
  letterSpacing: "0.22em",
};

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
      style={{ background: "#050505", width: "100%", padding: "6rem 0 9rem" }}
    >
      <div className="container mx-auto px-5 md:px-10">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(4rem, 9vh, 6rem)",
          }}
        >
          {blocks.map((block) => (
            <div key={block.id} className="bf-block">
              <Mask style={{ marginBottom: "1.8rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "-0.01em",
                    fontSize: "clamp(1.7rem, 4vw, 2.8rem)",
                    lineHeight: 1,
                    color: "#fff",
                  }}
                >
                  {block.heading}
                </h2>
              </Mask>

              {block.rows.map((row, i) => (
                <div key={row.title}>
                  <div
                    className="bf-rule"
                    style={{ height: "1px", background: "rgba(255,255,255,0.1)" }}
                  />
                  <Mask>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "baseline",
                        gap: "0.45rem clamp(1rem, 3vw, 1.6rem)",
                        padding: "1.15rem 0",
                      }}
                    >
                      <span
                        style={{
                          ...mono,
                          fontSize: "0.68rem",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        style={{
                          flex: "1 1 auto",
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.01em",
                          fontSize: "clamp(1.05rem, 2.3vw, 1.55rem)",
                          color: "rgba(255,255,255,0.92)",
                        }}
                      >
                        {row.title}
                      </span>
                      <span
                        className="font-general"
                        style={{
                          flexBasis: "min(38ch, 100%)",
                          marginLeft: "auto",
                          fontSize: "0.9rem",
                          lineHeight: 1.55,
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {row.desc}
                      </span>
                    </div>
                  </Mask>
                </div>
              ))}
              <div
                className="bf-rule"
                style={{ height: "1px", background: "rgba(255,255,255,0.1)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Briefing;
