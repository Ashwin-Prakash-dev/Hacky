import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: null, text: "ALL",  suffix: "",    label: "Kerala"             },
  { value: 20,   prefix: "",   suffix: "",    label: "Teams\nSelected"    },
  { value: 30,   prefix: "",   suffix: "hrs", label: "Non-stop\nBuilding" },
  { value: 3,    prefix: "",   suffix: "",    label: "Winners"            },
];

const Stats = () => {
  const sectionRef = useRef(null);
  const numRefs    = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      numRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = stats[i];
        if (target.value === null) return;
        const counter = { val: 0 };

        gsap.to(counter, {
          val: target.value,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reset",
          },
          onUpdate: () => {
            el.textContent =
              (target.prefix ?? "") +
              Math.round(counter.val) +
              target.suffix;
          },
        });
      });

      // Fade the whole section in
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-particles="stats"
      style={{
        background: "#0a0a0a",
        padding: "0",
        width: "100%",
        opacity: 0,
      }}
    >
      {/* Top border line */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      <div
        id="stats-grid"
        data-particle-target="stats-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          // above the fixed particle canvas (z-30): the sweeping swarm
          // passes behind the numbers and lights each cell it reaches
          position: "relative",
          zIndex: 31,
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="stats-cell"
            data-particle-target={`stat-${i}`}
            style={{
              padding: "3.5rem clamp(1rem, 3vw, 2.5rem)",
              borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              display: "flex", flexDirection: "column", gap: "0.5rem",
              alignItems: "center", textAlign: "center",
              position: "relative", overflow: "hidden",
              transition: "background 0.25s ease",
              cursor: "default",
            }}
          >
            {/* Top accent line — lime once the particle sweep lights the cell */}
            <div className="stat-accent" style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
              transition: "background 0.35s ease",
            }} />

            <span
              ref={(el) => (numRefs.current[i] = el)}
              className="stat-num"
              style={{
                fontFamily: "var(--font-general)",
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {stat.value === null ? stat.text : "0"}
            </span>

            <span style={{
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.8rem", letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.5, whiteSpace: "pre-line",
            }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      <style>{`
        .stat-num { color: #fff; transition: color 0.3s ease; }
        .stats-cell:hover { background: rgba(255,255,255,0.025); }
        .stats-cell:hover .stat-num { color: #C8FF00; }
        .stat-lit .stat-num { color: #C8FF00; }
        .stat-lit .stat-accent {
          background: linear-gradient(90deg, transparent, #C8FF00, transparent) !important;
          opacity: 0.7;
        }
        @media (max-width: 640px) {
          #stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          /* reset all right borders first */
          #stats-grid > div {
            border-right: none !important;
          }
          /* right border only on left column cells */
          #stats-grid > div:nth-child(odd) {
            border-right: 1px solid rgba(255,255,255,0.06) !important;
          }
          /* top border on bottom row */
          #stats-grid > div:nth-child(3),
          #stats-grid > div:nth-child(4) {
            border-top: 1px solid rgba(255,255,255,0.06);
          }
        }
      `}</style>
    </section>
  );
};

export default Stats;