import gsap from "gsap";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";

gsap.registerPlugin(ScrollTrigger);

const differentiators = [
  {
    number: "01",
    heading: "Curated, not crowded.",
    body: "We cap at 20 teams. Every team is hand-selected based on their idea brief and execution potential — not their college name or CGPA. If you're here, you earned it.",
  },
  {
    number: "02",
    heading: "Products, not demos.",
    body: "Most hackathons reward slides. We reward shipping. The judging criteria is simple: does it work, does it solve something real, and would someone actually use it?",
  },
  {
    number: "03",
    heading: "Mentors who've built things.",
    body: "Our mentors aren't HR reps or keynote speakers. They're technical founders and engineers who sit with your team, look at your code, and push you to build better.",
  },
  {
    number: "04",
    heading: "30 hours that actually matter.",
    body: "No filler workshops. No mandatory networking sessions. Just uninterrupted build time, structured check-ins, and the kind of focused energy that produces real outcomes.",
  },
  {
    number: "05",
    heading: "Kerala's builder community starts here.",
    body: "Startathon isn't just an event — it's the beginning of an ecosystem. The teams who build here will be the ones who define what Kerala's startup scene looks like in 5 years.",
  },
];

const Story = () => {
  const sectionRef = useRef(null);
  const itemRefs = useRef([]);

  useGSAP(() => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          delay: i * 0.04,
        }
      );
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="story"
      style={{
        background: "#000",
        padding: "8rem 0 9rem",
        width: "100%",
      }}
    >
      <div className="container mx-auto" style={{ padding: "0 clamp(1.25rem, 5vw, 3rem)" }}>

        {/* Header */}
        <div style={{ marginBottom: "5rem" }}>
          <p style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#C8FF00",
            marginBottom: "1.25rem",
          }}>
            The difference
          </p>
          <AnimatedTitle
            title="Buil<b>d</b>er-first,<br />not event-<b>f</b>irst"
            containerClass="!text-white text-left !items-start sm:!px-0"
          />
        </div>

        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "3rem 1fr 1fr",
          gap: "clamp(1rem, 3vw, 2.5rem)",
          padding: "0 0 1rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span />
          <span style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.6rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)",
          }}>Principle</span>
          <span style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.6rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)",
          }}>What this means</span>
        </div>

        {/* Rows */}
        <div>
          {differentiators.map((item, i) => (
            <div
              key={i}
              ref={(el) => (itemRefs.current[i] = el)}
              style={{
                display: "grid",
                gridTemplateColumns: "3rem 1fr 1fr",
                gap: "clamp(1rem, 3vw, 2.5rem)",
                padding: "2rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                alignItems: "start",
                opacity: 0,
              }}
              className="story-row"
            >
              {/* Number */}
              <span style={{
                fontFamily: "var(--font-general, sans-serif)",
                fontSize: "0.62rem",
                color: "rgba(255,255,255,0.18)",
                letterSpacing: "0.1em",
                paddingTop: "3px",
              }}>
                {item.number}
              </span>

              {/* Heading */}
              <h3 style={{
                fontFamily: "'General Sans', sans-serif",
                fontSize: "clamp(0.95rem, 1.8vw, 1.25rem)",
                fontWeight: 600,
                color: "#fff",
                lineHeight: 1.35,
                letterSpacing: "-0.02em",
                margin: 0,
              }}>
                {item.heading}
              </h3>

              {/* Body */}
              <p style={{
                fontFamily: "var(--font-circular-web, sans-serif)",
                fontSize: "0.88rem",
                color: "rgba(255,255,255,0.38)",
                lineHeight: 1.8,
                margin: 0,
              }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: "3.5rem",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          flexWrap: "wrap",
        }}>
          <Button
            id="story-cta"
            title="Register Interest"
            containerClass="cursor-pointer"
          />
          <p style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.65rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.18)",
          }}>
            Applications open soon · SCTCE, Thiruvananthapuram
          </p>
        </div>
      </div>

      {/* Mobile styles */}
      <style>{`
        @media (max-width: 640px) {
          .story-row {
            grid-template-columns: 2rem 1fr !important;
            grid-template-rows: auto auto;
          }
          .story-row > p {
            grid-column: 2;
          }
        }
      `}</style>
    </section>
  );
};

export default Story;