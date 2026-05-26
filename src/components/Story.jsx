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
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          delay: i * 0.05,
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
        padding: "8rem 0 10rem",
        width: "100%",
      }}
    >
      <div className="container mx-auto px-5 md:px-10">

        {/* Header */}
        <div className="mb-20">
          <p
            className="font-general text-xs uppercase tracking-widest mb-4"
            style={{ color: "#C8FF00", letterSpacing: "0.15em" }}
          >
            The difference
          </p>
          <AnimatedTitle
            title="Buil<b>d</b>er-first,<br />not event-<b>f</b>irst"
            containerClass="!text-white text-left !items-start sm:!px-0"
          />
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            marginBottom: "0",
          }}
        />

        {/* Differentiator rows */}
        <div>
          {differentiators.map((item, i) => (
            <div
              key={i}
              ref={(el) => (itemRefs.current[i] = el)}
              style={{
                display: "grid",
                gridTemplateColumns: "64px 1fr 1fr",
                gap: "2rem",
                padding: "2.5rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                alignItems: "start",
              }}
            >
              {/* Number */}
              <span
                className="font-general"
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.2)",
                  letterSpacing: "0.1em",
                  paddingTop: "4px",
                }}
              >
                {item.number}
              </span>

              {/* Heading */}
              <h3
                className="special-font"
                style={{
                  fontFamily: "'Open Sauce One', sans-serif",
                  fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                  fontWeight: 600,
                  color: "#fff",
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                {item.heading}
              </h3>

              {/* Body */}
              <p
                className="font-circular-web"
                style={{
                  fontSize: "0.92rem",
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.8,
                  margin: 0,
                  maxWidth: "520px",
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: "4rem",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <Button
            id="story-cta"
            title="Register Interest"
            containerClass="cursor-pointer"
          />
          <p
            className="font-general text-xs uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em" }}
          >
            Applications open soon · SCTCE, Thiruvananthapuram
          </p>
        </div>
      </div>
    </section>
  );
};

export default Story;