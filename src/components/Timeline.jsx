import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PrizesCard, ExpectCard } from "./Features";

gsap.registerPlugin(ScrollTrigger);

const flipCards = [
  {
    label: "Who guides you",
    titleFront: <>Ment<b>o</b>rs</>,
    tagline: "Builders who've shipped things.",
    back: [
      { icon: "◉", title: "Technical Founders", desc: "Startup builders who've shipped products to real users" },
      { icon: "◉", title: "Domain Specialists",  desc: "Engineers with deep expertise in AI, fintech, healthtech" },
      { icon: "◉", title: "Hands-on Help",       desc: "They sit with your team, look at your code, push you harder" },
      { icon: "◉", title: "Career Connections",  desc: "Meaningful intros to companies and investors in the ecosystem" },
    ],
  },
  {
    label: "What we expect",
    titleFront: <>Rul<b>e</b>s</>,
    tagline: "Keep it real. Keep it yours.",
    back: [
      { icon: "◉", title: "Teams of 3–4",      desc: "Solo entries not accepted — collaboration is core to this event" },
      { icon: "◉", title: "Original work only", desc: "All code written during the 30-hour window; no pre-built projects" },
      { icon: "◉", title: "Must be deployable", desc: "A working product or clear prototype — slides don't count" },
      { icon: "◉", title: "Fair play",          desc: "Respect fellow builders, mentors, and the community you're in" },
    ],
  },
];

const FeatureCardPanel = ({ card }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative overflow-hidden rounded-md border-hsla cursor-pointer"
      style={{
        height: "340px",
        backgroundColor: hovered ? "#f7f5f0" : "#0c0c0c",
        transition: "background-color 0.45s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: "absolute", inset: 0, padding: "2rem",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        opacity: hovered ? 0 : 1,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        pointerEvents: hovered ? "none" : "auto",
      }}>
        <span style={{
          display: "inline-block",
          fontFamily: "var(--font-general)",
          fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#C8FF00", border: "0.5px solid rgba(200,255,0,0.35)",
          borderRadius: "2px", padding: "3px 9px", alignSelf: "flex-start",
        }}>{card.label}</span>
        <div>
          <h2 className="bento-title special-font"
            style={{ color: "#fff", lineHeight: 0.88, fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "0.5rem" }}>
            {card.titleFront}
          </h2>
          <p style={{ fontFamily: "var(--font-general)", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
            {card.tagline}
          </p>
        </div>
      </div>

      <div style={{
        position: "absolute", inset: 0, padding: "1.75rem 2rem",
        display: "flex", flexDirection: "column", justifyContent: "center",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s ease 0.08s",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        <span style={{
          fontFamily: "var(--font-general)",
          fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#bbb", marginBottom: "0.75rem", display: "block",
        }}>{card.label}</span>
        {card.back.map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: "12px", alignItems: "flex-start",
            padding: "0.55rem 0",
            borderBottom: i < card.back.length - 1 ? "0.5px solid #ebebeb" : "none",
            transform: hovered ? "translateX(0)" : "translateX(-8px)",
            opacity: hovered ? 1 : 0,
            transition: `transform 0.28s ease ${0.08 + i * 0.05}s, opacity 0.28s ease ${0.08 + i * 0.05}s`,
          }}>
            <span style={{ color: "#00aa55", fontSize: "0.7rem", flexShrink: 0, lineHeight: 1.6 }}>{item.icon}</span>
            <div>
              <div style={{ fontFamily: "var(--font-general)", fontSize: "0.65rem", fontWeight: 600, color: "#111", textTransform: "uppercase", letterSpacing: "0.07em" }}>{item.title}</div>
              <div style={{ fontFamily: "var(--font-general)", fontSize: "0.65rem", color: "#888", marginTop: "1px", lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ImportedCardSlot = ({ children }) => (
  <div style={{
    height: "340px", borderRadius: "8px", overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
  }}>
    {children}
  </div>
);

const Timeline = () => {
  const sectionRef = useRef(null);
  const beamRef    = useRef(null);
  const headRef    = useRef(null);
  const cardRefs   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const fullScrub = () => ({
        trigger: sectionRef.current,
        start: "top 85%",
        end: "bottom 20%",
        scrub: 0.8,
      });

      gsap.fromTo(
        beamRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", transformOrigin: "top center", scrollTrigger: fullScrub() }
      );

      gsap.fromTo(
        headRef.current,
        { y: 0 },
        {
          y: () => sectionRef.current.offsetHeight,
          ease: "none",
          scrollTrigger: fullScrub(),
        }
      );

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          el,
          { opacity: 0, x: fromLeft ? -44 : 44 },
          {
            opacity: 1, x: 0, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" },
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
      style={{ background: "#000", position: "relative", width: "100%", paddingBottom: "9rem" }}
    >
      {/* Faint axis track */}
      <div style={{
        position: "absolute", left: "50%", top: 0, bottom: 0,
        width: "1px", background: "rgba(255,255,255,0.05)",
        transform: "translateX(-50%)", zIndex: 0, pointerEvents: "none",
      }} />

      {/* Traced beam */}
      <div
        ref={beamRef}
        style={{
          position: "absolute", left: "50%", top: 0, bottom: 0,
          width: "2px",
          background: "linear-gradient(to bottom, rgba(200,255,0,0.08), rgba(200,255,0,0.5))",
          transform: "translateX(-50%) scaleY(0)",
          transformOrigin: "top center",
          zIndex: 1, pointerEvents: "none",
        }}
      />

      {/* Moving head dot */}
      <div
        ref={headRef}
        style={{
          position: "absolute", left: "50%", top: 0,
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#C8FF00",
          boxShadow: "0 0 0 3px rgba(200,255,0,0.15), 0 0 14px rgba(200,255,0,0.75)",
          transform: "translate(-50%, -4px)",
          zIndex: 5, pointerEvents: "none",
        }}
      />

      {/* Feature cards */}
      <div style={{
        position: "relative", zIndex: 3,
        maxWidth: "1170px", margin: "0 auto",
        padding: "8rem clamp(1.25rem, 5vw, 3rem) 4rem",
      }}>
        {/* Prizes · left */}
        <div
          ref={(el) => (cardRefs.current[0] = el)}
          className="fc-row"
          style={{ display: "flex", alignItems: "center", padding: "2.5rem 0", opacity: 0 }}
        >
          <div className="fc-card" style={{ flex: 1, paddingRight: "2rem" }}>
            <ImportedCardSlot><PrizesCard /></ImportedCardSlot>
          </div>
          <div className="fc-spacer" style={{ flex: 1 }} />
        </div>

        {/* What to Expect · right */}
        <div
          ref={(el) => (cardRefs.current[1] = el)}
          className="fc-row"
          style={{ display: "flex", alignItems: "center", padding: "2.5rem 0", opacity: 0 }}
        >
          <div className="fc-spacer" style={{ flex: 1 }} />
          <div className="fc-card" style={{ flex: 1, paddingLeft: "2rem" }}>
            <ImportedCardSlot><ExpectCard /></ImportedCardSlot>
          </div>
        </div>

        {/* Mentors · left */}
        <div
          ref={(el) => (cardRefs.current[2] = el)}
          className="fc-row"
          style={{ display: "flex", alignItems: "center", padding: "2.5rem 0", opacity: 0 }}
        >
          <div className="fc-card" style={{ flex: 1, paddingRight: "2rem" }}>
            <FeatureCardPanel card={flipCards[0]} />
          </div>
          <div className="fc-spacer" style={{ flex: 1 }} />
        </div>

        {/* Rules · right */}
        <div
          ref={(el) => (cardRefs.current[3] = el)}
          className="fc-row"
          style={{ display: "flex", alignItems: "center", padding: "2.5rem 0", opacity: 0 }}
        >
          <div className="fc-spacer" style={{ flex: 1 }} />
          <div className="fc-card" style={{ flex: 1, paddingLeft: "2rem" }}>
            <FeatureCardPanel card={flipCards[1]} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .fc-row    { flex-direction: column !important; gap: 1.5rem; }
          .fc-spacer { display: none !important; }
          .fc-card   { padding: 0 !important; }
        }
      `}</style>
    </section>
  );
};

export default Timeline;
