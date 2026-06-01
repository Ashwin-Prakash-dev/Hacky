import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const outcomes = [
  {
    tag: "Career",
    headline: "Get hired on the spot.",
    body: "Sponsors watch you build for 30 hours. If they like what they see, they make offers right there. No interviews. No waiting.",
  },
  {
    tag: "Access",
    headline: "Talk to people who've done it.",
    body: "Founders, CTOs, operators. Not a keynote from 50 rows back. They're in the room, and you can walk up and talk to them.",
  },
  {
    tag: "Network",
    headline: "Skip the application queue.",
    body: "Top builders get referred directly into hiring pipelines. The people in this room remember who impressed them.",
  },
];

const StudentHook = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );

      cardsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            delay: i * 0.1,
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
      style={{ background: "#000", padding: "7rem 0 6rem", width: "100%" }}
    >
      <div style={{ marginBottom: "6rem" }} />

      <div className="container mx-auto px-5 md:px-10">
        {/* Headline + video side by side */}
        <div ref={headlineRef} style={{ display: "flex", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "flex-start", marginBottom: "5rem", opacity: 0, flexWrap: "wrap" }}>
          {/* Left: text */}
          <div style={{ flex: "1 1 300px" }}>
            <p
              className="font-general"
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#C8FF00",
                marginBottom: "1.25rem",
              }}
            >
              You're next
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
                fontSize: "0.88rem",
                color: "rgba(255,255,255,0.38)",
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
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.75,
              marginBottom: "1.5rem",
            }}>
              If you're a builder and you resonated with that, there's no reason you shouldn't apply.
            </p>
            <a href="#contact" style={{ textDecoration: "none", display: "inline-block" }}>
              <button
                style={{
                  padding: "0.9rem 2.25rem",
                  background: "#C8FF00",
                  color: "#000",
                  border: "none",
                  borderRadius: "5px",
                  fontFamily: "var(--font-general, sans-serif)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.14em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
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

        {/* Outcome cards */}
        <div className="sh-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {outcomes.map((item, i) => (
            <OutcomeCard
              key={i}
              item={item}
              isLast={i === outcomes.length - 1}
              ref={(el) => (cardsRef.current[i] = el)}
            />
          ))}
        </div>

        {/* Bottom pull-quote */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "3rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "flex-start",
            gap: "1.25rem",
          }}
        >
          <div
            style={{
              width: "3px",
              minHeight: "2.5rem",
              flexShrink: 0,
              background: "linear-gradient(180deg, #C8FF00, transparent)",
              borderRadius: "2px",
              marginTop: "0.2rem",
            }}
          />
          <p
            className="font-general"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.3rem)",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            "Kerala has the talent. It's always had it.
            We're just putting it in one room and letting it run."
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .sh-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .sh-video-row {
            flex-direction: column !important;
          }
        }
      `}</style>
    </section>
  );
};

/* ── Individual outcome card ─────────────────────────────────────────────── */
import { forwardRef, useState } from "react";

const OutcomeCard = forwardRef(({ item, isLast }, ref) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(200,255,0,0.04)" : "#000",
        padding: "2.5rem 2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        cursor: "default",
        transition: "background 0.3s ease",
        opacity: 0,
      }}
    >
      <span
        className="font-general"
        style={{
          fontSize: "0.55rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: hovered ? "#C8FF00" : "rgba(255,255,255,0.25)",
          border: `0.5px solid ${hovered ? "rgba(200,255,0,0.3)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "2px",
          padding: "3px 8px",
          display: "inline-block",
          width: "fit-content",
          transition: "color 0.3s, border-color 0.3s",
        }}
      >
        {item.tag}
      </span>

      <h3
        className="font-general"
        style={{
          fontSize: "clamp(1.1rem, 2vw, 1.45rem)",
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        {item.headline}
      </h3>

      <p
        className="font-general"
        style={{
          fontSize: "0.78rem",
          color: "rgba(255,255,255,0.38)",
          lineHeight: 1.75,
        }}
      >
        {item.body}
      </p>

      {/* Bottom accent line on hover */}
      <div
        style={{
          marginTop: "auto",
          height: "1px",
          background: hovered
            ? "linear-gradient(90deg, #C8FF00, transparent)"
            : "transparent",
          transition: "background 0.4s ease",
          borderRadius: "1px",
        }}
      />
    </div>
  );
});

OutcomeCard.displayName = "OutcomeCard";

export default StudentHook;
