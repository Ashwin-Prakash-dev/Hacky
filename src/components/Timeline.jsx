import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PrizesCard, ExpectCard } from "./Features";

gsap.registerPlugin(ScrollTrigger);

const mentorItems = [
  { icon: "◉", title: "Technical Founders", desc: "Startup builders who've shipped products to real users" },
  { icon: "◉", title: "Domain Specialists",  desc: "Engineers with deep expertise in AI, fintech, healthtech" },
  { icon: "◉", title: "Hands-on Help",       desc: "They sit with your team, look at your code, push you harder" },
  { icon: "◉", title: "Real 1:1s",           desc: "Sit across from founders and CTOs. Not a panel from 20 rows back" },
];

const rulesItems = [
  { icon: "◉", title: "Teams of 1–4",      desc: "Build solo or with a crew. Up to 4 members per team" },
  { icon: "◉", title: "Original work only", desc: "All code written during the 30-hour window. No pre-built projects" },
  { icon: "◉", title: "Must be deployable", desc: "A working product or clear prototype. Slides don't count" },
  { icon: "◉", title: "Fair play",          desc: "Respect fellow builders, mentors, and the community you're in" },
];

/* ── Mentors Card ─────────────────────────────────────────────────────────── */
const MentorsCard = () => {
  const [hovered, setHovered] = useState(false);
  const items = mentorItems;
  return (
    <div
      className="relative size-full overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setHovered((v) => !v)}
      style={{
        backgroundColor: hovered ? "#f7f5f0" : "#0c0c0c",
        transition: "background-color 0.45s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    >
      {/* Background texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(200,255,0,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        opacity: hovered ? 0 : 1, transition: "opacity 0.4s ease",
      }} />

      {/* Ghost text */}
      <div style={{
        position: "absolute", bottom: "-20px", right: "-4px",
        fontFamily: "var(--font-general)",
        fontSize: "clamp(90px, 18vw, 160px)", fontWeight: 900,
        color: "transparent",
        WebkitTextStroke: "1px rgba(200,255,0,0.05)",
        lineHeight: 1, userSelect: "none",
        opacity: hovered ? 0 : 1, transition: "opacity 0.25s ease",
        pointerEvents: "none",
      }}>GEN</div>

      {/* Front face */}
      <div style={{
        position: "absolute", inset: 0, padding: "2rem",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        opacity: hovered ? 0 : 1,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        pointerEvents: hovered ? "none" : "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            display: "inline-block", fontFamily: "var(--font-general)",
            fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase",
            color: "#C8FF00", border: "0.5px solid rgba(200,255,0,0.35)",
            borderRadius: "2px", padding: "3px 9px",
          }}>Who guides you</span>
          <span style={{ fontFamily: "var(--font-general)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C8FF00", opacity: 0.85, display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#C8FF00", animation: "tapPulse 1.8s ease-in-out infinite" }} />
            tap to explore
          </span>
        </div>
        <div>
          <h2 className="bento-title special-font" style={{ color: "#fff", lineHeight: 0.88, fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: "0.75rem" }}>
            Ment<b>o</b>rs
          </h2>
          <p style={{ fontFamily: "var(--font-general)", fontSize: "0.88rem", color: "rgba(255,255,255,0.7)" }}>
            Builders who've shipped things.
          </p>
        </div>
      </div>

      {/* Back face */}
      <div style={{
        position: "absolute", inset: 0, padding: "2rem",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.3s ease 0.08s, transform 0.3s ease 0.08s",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        <span style={{ fontFamily: "var(--font-general)", fontSize: "0.78rem", letterSpacing: "0.16em", color: "#555", textTransform: "uppercase" }}>Who guides you</span>
        <div>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: "14px", alignItems: "flex-start",
              padding: "0.65rem 0",
              borderBottom: i < items.length - 1 ? "0.5px solid rgba(0,0,0,0.1)" : "none",
              transform: hovered ? "translateX(0)" : "translateX(-8px)",
              opacity: hovered ? 1 : 0,
              transition: `transform 0.28s ease ${0.1 + i * 0.06}s, opacity 0.28s ease ${0.1 + i * 0.06}s`,
            }}>
              <span style={{ color: "#7a9900", fontSize: "0.85rem", flexShrink: 0, lineHeight: 1.6 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--font-general)", fontSize: "0.82rem", fontWeight: 600, color: "#111", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</div>
                <div style={{ fontFamily: "var(--font-general)", fontSize: "0.8rem", color: "#555", marginTop: "1px", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Rules Card ───────────────────────────────────────────────────────────── */
const RulesCard = () => {
  const [hovered, setHovered] = useState(false);
  const items = rulesItems;
  return (
    <div
      className="relative size-full overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setHovered((v) => !v)}
      style={{
        backgroundColor: hovered ? "#fff" : "#0c0c0c",
        transition: "background-color 0.45s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    >
      {/* Background texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(200,255,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.03) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        opacity: hovered ? 0 : 1, transition: "opacity 0.4s ease",
      }} />

      {/* Ghost text */}
      <div style={{
        position: "absolute", bottom: "-20px", right: "-4px",
        fontFamily: "var(--font-general)",
        fontSize: "clamp(90px, 18vw, 160px)", fontWeight: 900,
        color: "transparent",
        WebkitTextStroke: "1px rgba(200,255,0,0.05)",
        lineHeight: 1, userSelect: "none",
        opacity: hovered ? 0 : 1, transition: "opacity 0.25s ease",
        pointerEvents: "none",
      }}>LAW</div>

      {/* Front face */}
      <div style={{
        position: "absolute", inset: 0, padding: "2rem",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        opacity: hovered ? 0 : 1,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        pointerEvents: hovered ? "none" : "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            display: "inline-block", fontFamily: "var(--font-general)",
            fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase",
            color: "#C8FF00", border: "0.5px solid rgba(200,255,0,0.35)",
            borderRadius: "2px", padding: "3px 9px",
          }}>What we expect</span>
        </div>
        <div>
          <h2 className="bento-title special-font" style={{ color: "#fff", lineHeight: 0.88, fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: "0.75rem" }}>
            Rul<b>e</b>s
          </h2>
          <p style={{ fontFamily: "var(--font-general)", fontSize: "0.88rem", color: "rgba(255,255,255,0.7)" }}>
            Keep it real. Keep it yours.
          </p>
        </div>
      </div>

      {/* Back face */}
      <div style={{
        position: "absolute", inset: 0, padding: "2rem",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.3s ease 0.08s, transform 0.3s ease 0.08s",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        <span style={{ fontFamily: "var(--font-general)", fontSize: "0.78rem", letterSpacing: "0.16em", color: "#555", textTransform: "uppercase" }}>What we expect</span>
        <div>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: "14px", alignItems: "flex-start",
              padding: "0.65rem 0",
              borderBottom: i < items.length - 1 ? "0.5px solid rgba(0,0,0,0.1)" : "none",
              transform: hovered ? "translateX(0)" : "translateX(-8px)",
              opacity: hovered ? 1 : 0,
              transition: `transform 0.28s ease ${0.1 + i * 0.06}s, opacity 0.28s ease ${0.1 + i * 0.06}s`,
            }}>
              <span style={{ color: "#7a9900", fontSize: "0.85rem", flexShrink: 0, lineHeight: 1.6 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--font-general)", fontSize: "0.82rem", fontWeight: 600, color: "#111", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</div>
                <div style={{ fontFamily: "var(--font-general)", fontSize: "0.8rem", color: "#555", marginTop: "1px", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ImportedCardSlot = ({ children }) => (
  // Double-bezel shell (.tl-slot in index.css) — lifts + rims lime on hover
  <div className="tl-slot">
    <div className="tl-slot-core">{children}</div>
  </div>
);

const Timeline = () => {
  const sectionRef = useRef(null);
  const beamRef    = useRef(null);
  const headRef    = useRef(null);
  const cardRefs   = useRef([]);

  useEffect(() => {
    const track = document.getElementById("fc-track");
    if (!track) return;
    const updateDots = () => {
      const index = Math.round(track.scrollLeft / track.offsetWidth);
      document.querySelectorAll(".fc-dot").forEach((dot, i) => {
        dot.style.width = i === index ? "18px" : "6px";
        dot.style.background = i === index ? "#C8FF00" : "rgba(255,255,255,0.18)";
      });
    };
    track.addEventListener("scroll", updateDots, { passive: true });
    return () => track.removeEventListener("scroll", updateDots);
  }, []);

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
      data-particles="timeline"
      style={{ background: "#050505", position: "relative", width: "100%", paddingBottom: "9rem" }}
    >
      {/* Faint axis track */}
      <div className="fc-axis-track" data-particle-target="tl-spine" style={{
        position: "absolute", left: "50%", top: 0, bottom: 0,
        width: "1px", background: "rgba(255,255,255,0.05)",
        transform: "translateX(-50%)", zIndex: 0, pointerEvents: "none",
      }} />

      {/* Traced beam */}
      <div
        ref={beamRef}
        className="fc-beam"
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
        className="fc-head"
        style={{
          position: "absolute", left: "50%", top: 0,
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#C8FF00",
          boxShadow: "0 0 0 3px rgba(200,255,0,0.15), 0 0 14px rgba(200,255,0,0.75)",
          transform: "translate(-50%, -4px)",
          zIndex: 5, pointerEvents: "none",
        }}
      />


      {/* Desktop: zigzag cards */}
      <div className="fc-desktop-cards fc-cards-wrap" style={{
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
          <div className="fc-card" data-particle-target="tl-node-0" style={{ flex: 1, paddingRight: "2rem" }}>
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
          <div className="fc-card" data-particle-target="tl-node-1" style={{ flex: 1, paddingLeft: "2rem" }}>
            <ImportedCardSlot><ExpectCard /></ImportedCardSlot>
          </div>
        </div>

        {/* Mentors · left */}
        <div
          ref={(el) => (cardRefs.current[2] = el)}
          className="fc-row"
          style={{ display: "flex", alignItems: "center", padding: "2.5rem 0", opacity: 0 }}
        >
          <div className="fc-card" data-particle-target="tl-node-2" style={{ flex: 1, paddingRight: "2rem" }}>
            <ImportedCardSlot><MentorsCard /></ImportedCardSlot>
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
          <div className="fc-card" data-particle-target="tl-node-3" style={{ flex: 1, paddingLeft: "2rem" }}>
            <ImportedCardSlot><RulesCard /></ImportedCardSlot>
          </div>
        </div>
      </div>

      {/* Mobile: swipeable carousel */}
      <div className="fc-mobile-carousel" style={{ position: "relative", zIndex: 3 }}>
        <div className="fc-mobile-track" id="fc-track">
          <div className="fc-mobile-slide"><PrizesCard /></div>
          <div className="fc-mobile-slide"><ExpectCard /></div>
          <div className="fc-mobile-slide"><MentorsCard /></div>
          <div className="fc-mobile-slide"><RulesCard /></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "1.25rem" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {[0,1,2,3].map(i => (
              <div key={i} className={`fc-dot fc-dot-${i}`} style={{
                width: i === 0 ? "18px" : "6px", height: "6px", borderRadius: "3px",
                background: i === 0 ? "#C8FF00" : "rgba(255,255,255,0.18)",
                transition: "width 0.3s ease, background 0.3s ease",
              }} />
            ))}
          </div>
          <span style={{
            fontFamily: "var(--font-general)",
            fontSize: "0.75rem", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.65)",
          }}>swipe</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .fc-axis-track,
          .fc-beam,
          .fc-head,
          .fc-desktop-cards { display: none !important; }

          .fc-mobile-carousel {
            display: block !important;
            padding: 1rem 0 1.5rem;
          }
        }
        @media (min-width: 768px) {
          .fc-mobile-carousel { display: none !important; }
        }

        .fc-mobile-carousel { display: none; }

        .fc-mobile-track {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          gap: 0.75rem;
          padding: 0 1.25rem 0.5rem;
        }
        .fc-mobile-track::-webkit-scrollbar { display: none; }

        .fc-mobile-slide {
          flex: 0 0 85vw;
          height: 340px;
          scroll-snap-align: center;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>
    </section>
  );
};

export default Timeline;
