import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { canUseParticles } from "./particles/GlobalParticles";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: null, text: "ALL", suffix: "",    label: "Kerala" },
  { value: 20,   suffix: "",    label: "Teams\nSelected" },
  { value: 30,   suffix: "hrs", label: "Non-stop\nBuilding" },
  { value: 3,    suffix: "",    label: "Winners" },
];

const Stats = () => {
  const sectionRef = useRef(null);
  const numRefs    = useRef([]);

  useEffect(() => {
    // Counters are armed but paused: each one fires the moment the particle
    // sweep's tip lights its cell (the engine toggles .stat-lit), so the
    // swarm literally delivers the numbers. Scrolling back reverses them.
    const cells = Array.from(
      sectionRef.current.querySelectorAll(".stats-cell")
    );
    const tweens = stats.map((s, i) => {
      const el = numRefs.current[i];
      if (s.value === null || !el) return null;
      const counter = { val: 0 };
      return gsap.to(counter, {
        val: s.value,
        duration: 1.4,
        ease: "power3.out",
        paused: true,
        onUpdate: () => {
          el.textContent = Math.round(counter.val);
        },
      });
    });
    const observers = cells.map((cell, i) => {
      const tw = tweens[i];
      if (!tw) return null;
      const o = new MutationObserver(() => {
        if (cell.classList.contains("stat-lit")) tw.play();
        else tw.reverse();
      });
      o.observe(cell, { attributes: true, attributeFilter: ["class"] });
      return o;
    });

    const ctx = gsap.context(() => {
      // No particle system (reduced motion / no WebGL): light the cells and
      // run the counters on plain scroll entry instead.
      if (!canUseParticles()) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 75%",
          onEnter: () => {
            cells.forEach((cell, i) => {
              gsap.delayedCall(i * 0.18, () => cell.classList.add("stat-lit"));
            });
          },
        });
      }

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

    return () => {
      observers.forEach((o) => o?.disconnect());
      tweens.forEach((t) => t?.kill());
      ctx.revert();
    };
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
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      <div className="container mx-auto px-5 md:px-10">
        {/* Eyebrow strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "1rem",
            padding: "1.3rem 0.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
            zIndex: 31,
          }}
        >
          <p
            className="font-general"
            style={{
              fontSize: "0.78rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#C8FF00",
            }}
          >
            By the numbers
          </p>
          <p
            className="font-general"
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            SCTCE · Trivandrum
          </p>
        </div>

        {/* The rail: the wire the particle comet rides. It sits below the
            canvas (no z-index) so the swarm flies over it, while the lime
            fill — driven frame-by-frame by the particle engine — etches
            across it behind the tip. Cell content lives above the canvas. */}
        <div style={{ position: "relative" }}>
          <div
            className="stats-rail"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: "1px",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <div
              data-particle-target="stats-rail-fill"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(200,255,0,0.05), rgba(200,255,0,0.55) 82%, #C8FF00)",
                boxShadow: "0 0 12px rgba(200,255,0,0.25)",
                transform: "scaleX(0)",
                transformOrigin: "left center",
              }}
            />
          </div>

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
                padding: "2.5rem clamp(1.1rem, 2.2vw, 2rem) 2.25rem",
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                minHeight: "clamp(200px, 22vw, 260px)",
                position: "relative",
                overflow: "hidden",
                transition: "background 0.3s ease",
                cursor: "default",
              }}
            >
              {/* Top accent line — sweeps lime when the particle tip lights the cell */}
              <div
                className="stat-accent"
                style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                  background: "linear-gradient(90deg, rgba(255,255,255,0.1), transparent 70%)",
                  transition: "background 0.35s ease, opacity 0.35s ease",
                }}
              />

              {/* Tick notch on the rail — flashes lime when the tip crosses */}
              <span
                className="stat-tick"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "1px",
                  height: "9px",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(255,255,255,0.15)",
                  transition: "background 0.3s ease, box-shadow 0.3s ease",
                }}
              />

              {/* Index marker */}
              <span
                className="stat-idx"
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.78rem",
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.32)",
                  transition: "color 0.3s ease",
                  userSelect: "none",
                }}
              >
                0{i + 1}
              </span>

              {/* Numeral block, anchored to the cell's baseline */}
              <div style={{ marginTop: "auto", paddingTop: "2.75rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.12em" }}>
                  <span
                    ref={(el) => (numRefs.current[i] = el)}
                    className="stat-num"
                    style={{
                      fontFamily: "var(--font-general)",
                      fontSize: "clamp(2.8rem, 5.6vw, 4.8rem)",
                      fontWeight: 900,
                      lineHeight: 0.95,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {stat.value === null ? stat.text : "0"}
                  </span>
                  {stat.suffix && (
                    <span
                      className="stat-suffix"
                      style={{
                        fontFamily: "var(--font-general)",
                        fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)",
                        fontWeight: 800,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {stat.suffix}
                    </span>
                  )}
                </div>

                <span
                  className="font-general"
                  style={{
                    display: "block",
                    marginTop: "0.7rem",
                    fontSize: "0.78rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      <style>{`
        .stat-num { color: #fff; transition: color 0.3s ease; }
        .stat-suffix { color: rgba(255,255,255,0.35); transition: color 0.3s ease; }
        .stats-cell:hover { background: rgba(255,255,255,0.02); }
        .stats-cell:hover .stat-num, .stat-lit .stat-num { color: #C8FF00; }
        .stats-cell:hover .stat-suffix, .stat-lit .stat-suffix { color: rgba(200,255,0,0.55); }
        .stat-lit .stat-idx { color: rgba(200,255,0,0.5); }
        .stat-lit .stat-tick {
          background: #C8FF00 !important;
          box-shadow: 0 0 10px rgba(200,255,0,0.9);
        }
        .stat-lit .stat-accent {
          background: linear-gradient(90deg, #C8FF00, transparent 70%) !important;
          opacity: 0.8;
        }
        @media (max-width: 640px) {
          #stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .stats-rail { display: none; }
          #stats-grid > div {
            border-right: none !important;
            min-height: 150px !important;
          }
          #stats-grid > div:nth-child(odd) {
            border-right: 1px solid rgba(255,255,255,0.06) !important;
          }
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
