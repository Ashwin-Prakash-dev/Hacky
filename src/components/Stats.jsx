import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: null, display: "ALL",  suffix: "",    label: "Kerala"            },
  { value: 20,   display: null,   suffix: "",    label: "Teams"             },
  { value: 30,   display: null,   suffix: "HRS", label: "Non-stop\nBuilding" },
  { value: 3,    display: null,   suffix: "",    label: "Winners"           },
];

const Stats = () => {
  const sectionRef = useRef(null);
  const numRefs    = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      numRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = stats[i];

        // Text-only stat — no animation needed
        if (target.value === null) {
          el.textContent = target.display;
          return;
        }

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
            el.textContent = Math.round(counter.val) + target.suffix;
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
      style={{
        background: "#000",
        padding: "0",
        width: "100%",
        opacity: 0,
      }}
    >
      {/* Top border line */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      <div
        id="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="stats-cell"
            style={{
              padding: "3.5rem clamp(1rem, 3vw, 2.5rem)",
              borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              display: "flex", flexDirection: "column", gap: "0.5rem",
              position: "relative", overflow: "hidden",
              transition: "background 0.25s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.025)";
              e.currentTarget.querySelector(".stat-num").style.color = "#C8FF00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.querySelector(".stat-num").style.color = i === 0 ? "#C8FF00" : "#fff";
            }}
          >
            {/* Top accent line on all stats, lime only on first */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "1px",
              background: i === 0
                ? "linear-gradient(90deg, transparent, #C8FF00, transparent)"
                : "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
              opacity: i === 0 ? 0.7 : 1,
            }} />

            <span
              ref={(el) => (numRefs.current[i] = el)}
              className="stat-num"
              style={{
                fontFamily: "'zentry', sans-serif",
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                fontWeight: 900,
                color: i === 0 ? "#C8FF00" : "#fff",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                transition: "color 0.25s ease",
              }}
            >
              {stat.display ?? 0}
            </span>

            <span style={{
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.62rem", letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              lineHeight: 1.5, whiteSpace: "pre-line",
            }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      {/* Mobile: 2×2 grid */}
      <style>{`
        @media (max-width: 640px) {
          #stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          #stats-grid > div:nth-child(2) {
            border-right: none !important;
          }
          #stats-grid > div:nth-child(3),
          #stats-grid > div:nth-child(4) {
            border-top: 1px solid rgba(255,255,255,0.06);
          }
          #stats-grid > div:nth-child(4) {
            border-right: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Stats;