import { useRef, useEffect, forwardRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const outcomes = [
  {
    num: "01",
    tag: "Career",
    headline: "Be seen before anyone else.",
    body: "Companies at the event watch you build for 30 hours. If something clicks, that's a conversation that doesn't happen anywhere else.",
  },
  {
    num: "02",
    tag: "Access",
    headline: "Talk to people who've done it.",
    body: "Founders, CTOs, operators. Not a keynote from 50 rows back. They're in the room, and you can walk up and talk to them.",
  },
  {
    num: "03",
    tag: "Network",
    headline: "Stand out to the right people.",
    body: "The people in this room remember who impressed them. That's not something a CV can do.",
  },
];

const StudentHook = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );

      rowRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.65, ease: "power3.out",
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
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
      style={{ background: "#0a0a0a", padding: "7rem 0 6rem", width: "100%" }}
    >
      <div className="container mx-auto px-5 md:px-10">
        {/* Headline + video side by side */}
        <div
          ref={headlineRef}
          style={{
            display: "flex", gap: "clamp(2rem, 5vw, 4rem)",
            alignItems: "flex-start", marginBottom: "5rem",
            opacity: 0, flexWrap: "wrap",
          }}
        >
          {/* Left: text */}
          <div style={{ flex: "1 1 300px" }}>
            <p
              className="font-general"
              style={{
                fontSize: "0.95rem",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "1.25rem",
                letterSpacing: "0.01em",
              }}
            >
              you're next
            </p>

            <h2
              className="special-font bento-title"
              style={{
                color: "#fff",
                fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
                letterSpacing: "-0.03em",
                lineHeight: 0.9,
                marginBottom: "1.5rem",
              }}
            >
              Still <b>i</b>n college.<br />
              Already <b>b</b>uilding<b>.</b>
            </h2>

            <p
              className="font-general"
              style={{
                fontSize: "1rem",
                color: "rgba(255,255,255,0.82)",
                lineHeight: 1.8,
                marginBottom: "2rem",
              }}
            >
              Every person behind those companies was a student once.
              They just didn't stop building. Startathon is how we find
              those people in Kerala. If that's you, you should be here.
            </p>
            <p className="font-general" style={{
              fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.75,
              marginBottom: "1.5rem",
            }}>
              If you're a builder and you resonated with that, there's no reason you shouldn't apply.
            </p>
            <a href="/apply" style={{ textDecoration: "none", display: "inline-block" }}>
              <button
                style={{
                  padding: "0.9rem 2.25rem",
                  background: "#C8FF00", color: "#000",
                  border: "none", borderRadius: "5px",
                  fontFamily: "var(--font-general, sans-serif)",
                  fontSize: "0.78rem", letterSpacing: "0.12em",
                  fontWeight: 700, textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(200,255,0,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Apply now →
              </button>
            </a>
          </div>

          {/* Right: video */}
          <div style={{ flex: "1 1 340px", minWidth: 0 }}>
            <div style={{
              position: "relative", width: "100%", paddingBottom: "56.25%",
              borderRadius: "10px", overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <iframe
                src="https://player.vimeo.com/video/1197348906?autoplay=0&title=0&byline=0&portrait=0"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* ── Outcome rows ─────────────────────────────────────── */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {outcomes.map((item, i) => (
            <OutcomeRow
              key={i}
              item={item}
              ref={(el) => (rowRefs.current[i] = el)}
            />
          ))}
        </div>

        {/* Pull-quote */}
        <div style={{
          marginTop: "4rem", paddingTop: "3rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "flex-start", gap: "1.25rem",
        }}>
          <div style={{
            width: "3px", minHeight: "2.5rem", flexShrink: 0,
            background: "linear-gradient(180deg, #C8FF00, transparent)",
            borderRadius: "2px", marginTop: "0.2rem",
          }} />
          <p className="font-general" style={{
            fontSize: "clamp(0.95rem, 2vw, 1.3rem)",
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.6, fontStyle: "italic",
          }}>
            "Kerala has the talent. It's always had it.
            We're just putting it in one room and letting it run."
          </p>
        </div>
      </div>

      <style>{`
        .sh-row-body {
          display: block;
        }
        @media (max-width: 639px) {
          .sh-outcome-grid {
            grid-template-columns: 2.5rem 1fr !important;
          }
          .sh-row-body {
            grid-column: 1 / -1;
            padding-left: 2.5rem;
            padding-top: 0.5rem;
          }
        }
      `}</style>
    </section>
  );
};

/* ── Individual outcome row ──────────────────────────────────────────────── */
const OutcomeRow = forwardRef(({ item }, ref) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="sh-outcome-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "3.5rem 1fr 1.6fr",
        gap: "clamp(1.25rem, 3vw, 3rem)",
        padding: "clamp(1.5rem, 3vw, 2.25rem) 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        alignItems: "center",
        opacity: 0,
        background: hovered ? "rgba(200,255,0,0.018)" : "transparent",
        transition: "background 0.3s ease",
        cursor: "default",
      }}
    >
      {/* Number */}
      <span style={{
        fontFamily: "var(--font-general)",
        fontSize: "clamp(2.2rem, 3.5vw, 3rem)",
        fontWeight: 900,
        color: hovered ? "rgba(200,255,0,0.25)" : "rgba(200,255,0,0.1)",
        lineHeight: 1,
        letterSpacing: "-0.04em",
        transition: "color 0.3s ease",
        userSelect: "none",
      }}>
        {item.num}
      </span>

      {/* Tag + headline */}
      <div>
        <span style={{
          display: "inline-block",
          fontFamily: "var(--font-general)",
          fontSize: "0.72rem", letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: hovered ? "rgba(200,255,0,0.85)" : "rgba(255,255,255,0.65)",
          border: `0.5px solid ${hovered ? "rgba(200,255,0,0.3)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "2px", padding: "3px 8px",
          marginBottom: "0.65rem",
          transition: "color 0.3s, border-color 0.3s",
        }}>{item.tag}</span>
        <h3 className="font-general" style={{
          fontSize: "clamp(1.1rem, 2vw, 1.45rem)",
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}>{item.headline}</h3>
      </div>

      {/* Body */}
      <p className="font-general sh-row-body" style={{
        fontSize: "0.95rem",
        color: "rgba(255,255,255,0.75)",
        lineHeight: 1.78,
      }}>{item.body}</p>
    </div>
  );
});

OutcomeRow.displayName = "OutcomeRow";

export default StudentHook;
