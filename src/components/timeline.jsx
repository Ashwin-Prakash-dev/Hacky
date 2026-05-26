import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const milestones = [
  {
    id: 1,
    date: "May 2026",
    label: "Waitlist Opens",
    sub: "Register your interest",
    position: "above",
    status: "current", // done | current | upcoming
  },
  {
    id: 2,
    date: "June 2026",
    label: "Applications Begin",
    sub: "Early bird ₹750",
    position: "below",
    status: "upcoming",
  },
  {
    id: 3,
    date: "Late June",
    label: "Tracks Released",
    sub: "Problem domains announced",
    position: "above",
    status: "upcoming",
  },
  {
    id: 4,
    date: "July 1",
    label: "Registration Closes",
    sub: "Regular ₹1200",
    position: "below",
    status: "upcoming",
  },
  {
    id: 5,
    date: "Mid July",
    label: "Idea Submission",
    sub: "₹100 concept brief",
    position: "above",
    status: "upcoming",
  },
  {
    id: 6,
    date: "July 26",
    label: "Event Kickoff",
    sub: "30-hour build sprint",
    position: "below",
    status: "upcoming",
  },
  {
    id: 7,
    date: "July 27",
    label: "Demo Day",
    sub: "Awards & celebration",
    position: "above",
    status: "upcoming",
  },
];

const STATUS_COLORS = {
  done: "#C8FF00",
  current: "#C8FF00",
  upcoming: "transparent",
};

const Timeline = () => {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const filledLineRef = useRef(null);
  const nodesRef = useRef([]);
  const labelsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the full track line drawing in
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: "power3.out",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate the filled (completed) portion
      gsap.fromTo(
        filledLineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          ease: "power2.out",
          delay: 0.4,
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Stagger nodes in
      nodesRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.45,
            ease: "back.out(1.7)",
            delay: 0.25 + i * 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Stagger labels
      labelsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: milestones[i].position === "above" ? 12 : -12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            delay: 0.5 + i * 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Current milestone index
  const currentIdx = milestones.findIndex((m) => m.status === "current");
  // Fraction of line that's "completed" (through the current node)
  const completedFraction = currentIdx / (milestones.length - 1);

  return (
    <section
      ref={sectionRef}
      id="timeline"
      style={{
        background: "#000",
        padding: "7rem 0 9rem",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        className="container mx-auto"
        style={{ padding: "0 clamp(1.25rem, 5vw, 3rem)" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "5rem" }}>
          <p
            style={{
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C8FF00",
              marginBottom: "0.6rem",
            }}
          >
            Schedule
          </p>
          <h2
            className="special-font bento-title"
            style={{
              color: "#fff",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
            }}
          >
            Tim<b>e</b>line
          </h2>
          <p
            style={{
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.22)",
              marginTop: "0.75rem",
              letterSpacing: "0.06em",
            }}
          >
            July 2026 · SCTCE, Thiruvananthapuram
          </p>
        </div>

        {/* Timeline graph */}
        <div
          style={{
            position: "relative",
            // tall enough for labels above and below
            paddingTop: "110px",
            paddingBottom: "110px",
            overflowX: "auto",
            overflowY: "visible",
          }}
        >
          {/* Inner fixed-width container so it scrolls on mobile */}
          <div
            style={{
              position: "relative",
              minWidth: "680px",
              width: "100%",
            }}
          >
            {/* ── Track line (dim) ── */}
            <div
              ref={lineRef}
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                right: "0",
                height: "1px",
                background: "rgba(255,255,255,0.1)",
                transform: "scaleX(0)",
                transformOrigin: "left center",
                translateY: "-50%",
              }}
            />

            {/* ── Filled line (completed progress) ── */}
            <div
              ref={filledLineRef}
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                width: `${completedFraction * 100}%`,
                height: "1px",
                background:
                  "linear-gradient(90deg, #C8FF00, rgba(200,255,0,0.6))",
                transform: "scaleX(0)",
                transformOrigin: "left center",
                translateY: "-50%",
                zIndex: 1,
                boxShadow: "0 0 6px rgba(200,255,0,0.5)",
              }}
            />

            {/* ── Nodes + Labels ── */}
            {milestones.map((m, i) => {
              const pct = (i / (milestones.length - 1)) * 100;
              const isDone = m.status === "done";
              const isCurrent = m.status === "current";
              const isUpcoming = m.status === "upcoming";

              return (
                <div
                  key={m.id}
                  style={{
                    position: "absolute",
                    left: `${pct}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {/* Label ABOVE */}
                  {m.position === "above" && (
                    <div
                      ref={(el) => (labelsRef.current[i] = el)}
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 18px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        textAlign: "center",
                        opacity: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-general, sans-serif)",
                          fontSize: "0.6rem",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: isCurrent
                            ? "#C8FF00"
                            : isDone
                            ? "rgba(200,255,0,0.5)"
                            : "rgba(255,255,255,0.28)",
                          marginBottom: "3px",
                        }}
                      >
                        {m.date}
                        {isCurrent && (
                          <span
                            style={{
                              marginLeft: "6px",
                              background: "rgba(200,255,0,0.15)",
                              border: "1px solid rgba(200,255,0,0.4)",
                              borderRadius: "2px",
                              padding: "1px 5px",
                              fontSize: "0.5rem",
                              color: "#C8FF00",
                              letterSpacing: "0.1em",
                              verticalAlign: "middle",
                            }}
                          >
                            NOW
                          </span>
                        )}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-general, sans-serif)",
                          fontSize: "0.72rem",
                          fontWeight: isCurrent ? 600 : 400,
                          color: isCurrent
                            ? "#fff"
                            : isDone
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.38)",
                          lineHeight: 1.3,
                          marginBottom: "2px",
                        }}
                      >
                        {m.label}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-general, sans-serif)",
                          fontSize: "0.6rem",
                          color: "rgba(255,255,255,0.2)",
                          lineHeight: 1.3,
                        }}
                      >
                        {m.sub}
                      </p>
                      {/* Stem */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-18px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "1px",
                          height: "14px",
                          background: isCurrent
                            ? "rgba(200,255,0,0.4)"
                            : "rgba(255,255,255,0.08)",
                        }}
                      />
                    </div>
                  )}

                  {/* Node circle */}
                  <div
                    ref={(el) => (nodesRef.current[i] = el)}
                    style={{
                      position: "relative",
                      width: isCurrent ? "18px" : "14px",
                      height: isCurrent ? "18px" : "14px",
                      borderRadius: "50%",
                      background: isDone || isCurrent ? "#C8FF00" : "transparent",
                      border: `2px solid ${
                        isDone || isCurrent
                          ? "#C8FF00"
                          : "rgba(255,255,255,0.2)"
                      }`,
                      opacity: 0,
                      boxShadow: isCurrent
                        ? "0 0 0 5px rgba(200,255,0,0.12), 0 0 16px rgba(200,255,0,0.35)"
                        : isDone
                        ? "0 0 8px rgba(200,255,0,0.25)"
                        : "none",
                      transition: "box-shadow 0.3s",
                      zIndex: 3,
                    }}
                  >
                    {/* Pulsing ring for current */}
                    {isCurrent && (
                      <span
                        style={{
                          position: "absolute",
                          inset: "-6px",
                          borderRadius: "50%",
                          border: "1px solid rgba(200,255,0,0.3)",
                          animation: "timelinePulse 2s ease-in-out infinite",
                        }}
                      />
                    )}
                    {/* Inner dot for done */}
                    {isDone && (
                      <span
                        style={{
                          position: "absolute",
                          inset: "3px",
                          borderRadius: "50%",
                          background: "#000",
                        }}
                      />
                    )}
                  </div>

                  {/* Label BELOW */}
                  {m.position === "below" && (
                    <div
                      ref={(el) => (labelsRef.current[i] = el)}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 18px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        textAlign: "center",
                        opacity: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {/* Stem */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-18px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "1px",
                          height: "14px",
                          background: isCurrent
                            ? "rgba(200,255,0,0.4)"
                            : "rgba(255,255,255,0.08)",
                        }}
                      />
                      <p
                        style={{
                          fontFamily: "var(--font-general, sans-serif)",
                          fontSize: "0.6rem",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: isCurrent
                            ? "#C8FF00"
                            : isDone
                            ? "rgba(200,255,0,0.5)"
                            : "rgba(255,255,255,0.28)",
                          marginBottom: "3px",
                        }}
                      >
                        {m.date}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-general, sans-serif)",
                          fontSize: "0.72rem",
                          fontWeight: isCurrent ? 600 : 400,
                          color: isCurrent
                            ? "#fff"
                            : isDone
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.38)",
                          lineHeight: 1.3,
                          marginBottom: "2px",
                        }}
                      >
                        {m.label}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-general, sans-serif)",
                          fontSize: "0.6rem",
                          color: "rgba(255,255,255,0.2)",
                          lineHeight: 1.3,
                        }}
                      >
                        {m.sub}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: "3rem",
            display: "flex",
            alignItems: "center",
            gap: "1.75rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { color: "#C8FF00", label: "Completed / Active" },
            { color: "rgba(255,255,255,0.15)", label: "Upcoming", border: true },
          ].map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: item.border ? "transparent" : item.color,
                  border: item.border
                    ? "1.5px solid rgba(255,255,255,0.2)"
                    : "none",
                  boxShadow: !item.border
                    ? "0 0 6px rgba(200,255,0,0.4)"
                    : "none",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-general, sans-serif)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.22)",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes timelinePulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.5); }
        }
      `}</style>
    </section>
  );
};

export default Timeline;