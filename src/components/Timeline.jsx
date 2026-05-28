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
    status: "current",
  },
  {
    id: 2,
    date: "June 2026",
    label: "Applications Begin",
    sub: "Early bird ₹750",
    status: "upcoming",
  },
  {
    id: 3,
    date: "Late June",
    label: "Tracks Released",
    sub: "Problem domains announced",
    status: "upcoming",
  },
  {
    id: 4,
    date: "July 1",
    label: "Registration Closes",
    sub: "Regular ₹1200",
    status: "upcoming",
  },
  {
    id: 5,
    date: "Mid July",
    label: "Idea Submission",
    sub: "₹100 concept brief",
    status: "upcoming",
  },
  {
    id: 6,
    date: "July 26",
    label: "Event Kickoff",
    sub: "30-hour build sprint",
    status: "upcoming",
  },
  {
    id: 7,
    date: "July 27",
    label: "Demo Day",
    sub: "Awards & celebration",
    status: "upcoming",
  },
];

const Timeline = () => {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.8,
          ease: "power3.out",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      rowRefs.current.forEach((el, i) => {
        if (!el) return;
        const isLeft = i % 2 === 0;
        gsap.fromTo(
          el,
          { opacity: 0, x: isLeft ? -28 : 28 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power3.out",
            delay: 0.2 + i * 0.1,
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

  return (
    <section
      ref={sectionRef}
      id="timeline"
      style={{ background: "#000", padding: "7rem 0 9rem", width: "100%" }}
    >
      <div
        className="container mx-auto"
        style={{ padding: "0 clamp(1.25rem, 5vw, 3rem)" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "5rem", textAlign: "center" }}>
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

        {/* Timeline */}
        <div style={{ position: "relative", maxWidth: "780px", margin: "0 auto" }}>
          {/* Center vertical line */}
          <div
            ref={lineRef}
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: "1px",
              background: "rgba(255,255,255,0.08)",
              transform: "translateX(-50%) scaleY(0)",
              transformOrigin: "top center",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {milestones.map((m, i) => {
              const isDone = m.status === "done";
              const isCurrent = m.status === "current";
              const isLeft = i % 2 === 0;

              const textBlock = (
                <div
                  style={{
                    flex: 1,
                    textAlign: isLeft ? "right" : "left",
                    padding: isLeft ? "0 2.5rem 0 0" : "0 0 0 2.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      justifyContent: isLeft ? "flex-end" : "flex-start",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {isCurrent && isLeft && (
                      <span
                        style={{
                          background: "rgba(200,255,0,0.12)",
                          border: "1px solid rgba(200,255,0,0.35)",
                          borderRadius: "2px",
                          padding: "1px 6px",
                          fontSize: "0.48rem",
                          color: "#C8FF00",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          fontFamily: "var(--font-general, sans-serif)",
                        }}
                      >
                        NOW
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--font-general, sans-serif)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: isCurrent
                          ? "#C8FF00"
                          : isDone
                          ? "rgba(200,255,0,0.55)"
                          : "rgba(255,255,255,0.25)",
                      }}
                    >
                      {m.date}
                    </span>
                    {isCurrent && !isLeft && (
                      <span
                        style={{
                          background: "rgba(200,255,0,0.12)",
                          border: "1px solid rgba(200,255,0,0.35)",
                          borderRadius: "2px",
                          padding: "1px 6px",
                          fontSize: "0.48rem",
                          color: "#C8FF00",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          fontFamily: "var(--font-general, sans-serif)",
                        }}
                      >
                        NOW
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-general, sans-serif)",
                      fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
                      fontWeight: isCurrent ? 600 : 400,
                      color: isCurrent
                        ? "#fff"
                        : isDone
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.42)",
                      lineHeight: 1.3,
                      margin: "0 0 0.25rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {m.label}
                  </p>

                  <p
                    style={{
                      fontFamily: "var(--font-general, sans-serif)",
                      fontSize: "0.7rem",
                      color: "rgba(255,255,255,0.18)",
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {m.sub}
                  </p>
                </div>
              );

              const emptySlot = <div style={{ flex: 1 }} />;

              return (
                <div
                  key={m.id}
                  ref={(el) => (rowRefs.current[i] = el)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    padding: "2rem 0",
                    opacity: 0,
                    borderBottom:
                      i < milestones.length - 1
                        ? "1px solid rgba(255,255,255,0.03)"
                        : "none",
                  }}
                >
                  {/* Left side */}
                  {isLeft ? textBlock : emptySlot}

                  {/* Center node */}
                  <div
                    style={{
                      flexShrink: 0,
                      position: "relative",
                      zIndex: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isCurrent && (
                      <span
                        style={{
                          position: "absolute",
                          inset: "-7px",
                          borderRadius: "50%",
                          border: "1px solid rgba(200,255,0,0.28)",
                          animation: "timelinePulse 2s ease-in-out infinite",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                    <div
                      style={{
                        width: isCurrent ? "16px" : "13px",
                        height: isCurrent ? "16px" : "13px",
                        borderRadius: "50%",
                        background:
                          isDone || isCurrent ? "#C8FF00" : "transparent",
                        border: `2px solid ${
                          isDone || isCurrent
                            ? "#C8FF00"
                            : "rgba(255,255,255,0.18)"
                        }`,
                        boxShadow: isCurrent
                          ? "0 0 0 4px rgba(200,255,0,0.1), 0 0 16px rgba(200,255,0,0.45)"
                          : isDone
                          ? "0 0 8px rgba(200,255,0,0.25)"
                          : "none",
                      }}
                    />
                  </div>

                  {/* Right side */}
                  {isLeft ? emptySlot : textBlock}
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
            justifyContent: "center",
            gap: "1.75rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { color: "#C8FF00", label: "Active", glow: true },
            { color: "transparent", label: "Upcoming", border: true },
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
                  boxShadow: item.glow
                    ? "0 0 6px rgba(200,255,0,0.5)"
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
          50% { opacity: 0; transform: scale(1.7); }
        }
      `}</style>
    </section>
  );
};

export default Timeline;