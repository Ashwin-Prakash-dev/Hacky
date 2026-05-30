import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PrizesCard, ExpectCard } from "./Features";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ──────────────────────────────────────────────────────────────── */

const milestones = [
  { id: 1, date: "May 2026",  label: "Waitlist Opens",      sub: "Register your interest",   status: "current"  },
  { id: 2, date: "June 2026", label: "Applications Begin",  sub: "Early bird ₹750",           status: "upcoming" },
  { id: 3, date: "Late June", label: "Tracks Released",     sub: "Problem domains announced", status: "upcoming" },
  { id: 4, date: "July 1",    label: "Registration Closes", sub: "Regular ₹1200",             status: "upcoming" },
  { id: 5, date: "Mid July",  label: "Idea Submission",     sub: "₹100 concept brief",        status: "upcoming" },
  { id: 6, date: "July 26",   label: "Event Kickoff",       sub: "30-hour build sprint",      status: "upcoming" },
  { id: 7, date: "July 27",   label: "Demo Day",            sub: "Awards & celebration",      status: "upcoming" },
];

const flipCards = [
  {
    label: "Who guides you",
    titleFront: <>Ment<b>o</b>rs</>,
    tagline: "Builders who've shipped things.",
    back: [
      { icon: "◈", title: "Technical Founders", desc: "Startup builders who've shipped products to real users" },
      { icon: "◎", title: "Domain Specialists",  desc: "Engineers with deep expertise in AI, fintech, healthtech" },
      { icon: "◉", title: "Hands-on Help",       desc: "They sit with your team, look at your code, push you harder" },
      { icon: "◆", title: "Career Connections",  desc: "Meaningful intros to companies and investors in the ecosystem" },
    ],
  },
  {
    label: "What we expect",
    titleFront: <>Rul<b>e</b>s</>,
    tagline: "Keep it real. Keep it yours.",
    back: [
      { icon: "◈", title: "Teams of 2–4",      desc: "Solo entries not accepted — collaboration is core to this event" },
      { icon: "◎", title: "Original work only", desc: "All code written during the 30-hour window; no pre-built projects" },
      { icon: "◉", title: "Must be deployable", desc: "A working product or clear prototype — slides don't count" },
      { icon: "◆", title: "Fair play",          desc: "Respect fellow builders, mentors, and the community you're in" },
    ],
  },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */


const FeatureCardPanel = ({ card }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative overflow-hidden rounded-md border-hsla cursor-pointer"
      style={{
        height: "260px",
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
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#C8FF00", border: "0.5px solid rgba(200,255,0,0.35)",
          borderRadius: "2px", padding: "3px 9px", alignSelf: "flex-start",
        }}>{card.label}</span>
        <div>
          <h2 className="bento-title special-font"
            style={{ color: "#fff", lineHeight: 0.88, fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "0.5rem" }}>
            {card.titleFront}
          </h2>
          <p style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
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
          fontFamily: "var(--font-general, sans-serif)",
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
              <div style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.65rem", fontWeight: 600, color: "#111", textTransform: "uppercase", letterSpacing: "0.07em" }}>{item.title}</div>
              <div style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.65rem", color: "#888", marginTop: "1px", lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NowBadge = () => (
  <span style={{
    background: "rgba(200,255,0,0.12)", border: "1px solid rgba(200,255,0,0.35)",
    borderRadius: "2px", padding: "1px 6px",
    fontSize: "0.48rem", color: "#C8FF00",
    letterSpacing: "0.12em", textTransform: "uppercase",
    fontFamily: "var(--font-general, sans-serif)",
  }}>NOW</span>
);

/* ─── Imported card wrapper (PrizesCard / ExpectCard fill their container) ── */

const ImportedCardSlot = ({ children }) => (
  <div style={{
    height: "260px", borderRadius: "8px", overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
  }}>
    {children}
  </div>
);

/* ─── Timeline ───────────────────────────────────────────────────────────── */

const Timeline = () => {
  const sectionRef    = useRef(null);
  const beamRef       = useRef(null);
  const headRef       = useRef(null);
  const transitionRef = useRef(null);
  const focusDotRef   = useRef(null);
  const tlHeaderRef   = useRef(null);
  const cardRefs      = useRef([]);
  const rowRefs       = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Shared scroll range: beam traces the full section top-to-bottom
      const fullScrub = () => ({
        trigger: sectionRef.current,
        start: "top 85%",
        end: "bottom 20%",
        scrub: 0.8,
      });

      // Beam reveals from top, gradient brightens as it descends
      gsap.fromTo(
        beamRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", transformOrigin: "top center", scrollTrigger: fullScrub() }
      );

      // Head dot travels with the beam tip
      gsap.fromTo(
        headRef.current,
        { y: 0 },
        {
          y: () => sectionRef.current.offsetHeight,
          ease: "none",
          scrollTrigger: fullScrub(),
        }
      );

      // Feature card rows slide in from their respective sides
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

      // Transition zone: dot expands then collapses — "zoom into the axis"
      gsap.timeline({
        scrollTrigger: {
          trigger: transitionRef.current,
          start: "top 50%",
          end: "bottom 20%",
          scrub: 1.2,
        },
      })
        .fromTo(focusDotRef.current, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 3.5, ease: "power2.out" })
        .to(focusDotRef.current, { opacity: 0, scale: 0, ease: "power2.in" });

      // Timeline title: fades in when transition zone enters view
      gsap.fromTo(
        tlHeaderRef.current,
        { opacity: 0, x: 16 },
        {
          opacity: 1, x: 0, duration: 0.75, ease: "power3.out",
          scrollTrigger: { trigger: transitionRef.current, start: "top 60%", once: true },
        }
      );

      // Milestone rows reveal alternating left/right
      rowRefs.current.forEach((el, i) => {
        if (!el) return;
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          el,
          { opacity: 0, x: fromLeft ? -28 : 28 },
          {
            opacity: 1, x: 0, duration: 0.6, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
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
      {/* ── Faint axis track (always visible) ─────────────────────────── */}
      <div style={{
        position: "absolute", left: "50%", top: 0, bottom: 0,
        width: "1px", background: "rgba(255,255,255,0.05)",
        transform: "translateX(-50%)", zIndex: 0, pointerEvents: "none",
      }} />

      {/* ── Traced beam (grows top-to-bottom with scroll) ─────────────── */}
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

      {/* ── Moving head dot at current beam tip ───────────────────────── */}
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

      {/* ── Feature cards: Prizes (L), Expect (R), Mentors (L), Rules (R) */}
      <div style={{
        position: "relative", zIndex: 3,
        maxWidth: "900px", margin: "0 auto",
        padding: "8rem clamp(1.25rem, 5vw, 3rem) 18rem",
      }}>

        {/* 0 — Prizes · left */}
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

        {/* 1 — What to Expect · right */}
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

        {/* 2 — Mentors · left */}
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

        {/* 3 — Rules · right */}
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

      {/* ── Focus / zoom transition zone ──────────────────────────────── */}
      <div
        ref={transitionRef}
        style={{ position: "relative", zIndex: 3, height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* Center dot — unchanged */}
        <div
          ref={focusDotRef}
          style={{
            width: "14px", height: "14px", borderRadius: "50%",
            background: "#C8FF00",
            boxShadow: "0 0 0 5px rgba(200,255,0,0.12), 0 0 32px rgba(200,255,0,0.65)",
            opacity: 0, position: "relative", zIndex: 4,
          }}
        />

        {/* ── Timeline label — right of center dot ── */}
        <div
          ref={tlHeaderRef}
          style={{
            position: "absolute",
            left: "calc(50% + clamp(4rem, 7vw, 9rem))",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <p style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#C8FF00", marginBottom: "0.4rem" }}>
            Schedule
          </p>
          <h2
            className="special-font bento-title"
            style={{ color: "#fff", fontSize: "clamp(1.4rem, 3vw, 2.2rem)", letterSpacing: "-0.03em", lineHeight: 0.92 }}
          >
            Tim<b>e</b>line
          </h2>
          <p style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", marginTop: "0.5rem", letterSpacing: "0.04em" }}>
            July 2026 · SCTCE
          </p>
        </div>
      </div>

      {/* Spacer so milestones don't start flush after transition zone */}
      <div style={{ height: "4rem" }} />

      {/* ── Milestones ─────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 3, maxWidth: "780px", margin: "0 auto", padding: "0 clamp(1.25rem, 5vw, 3rem)" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {milestones.map((m, i) => {
            const isDone    = m.status === "done";
            const isCurrent = m.status === "current";
            const isLeft    = i % 2 === 0;

            const textBlock = (
              <div style={{ flex: 1, textAlign: isLeft ? "right" : "left", padding: isLeft ? "0 2.5rem 0 0" : "0 0 0 2.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: isLeft ? "flex-end" : "flex-start", marginBottom: "0.3rem" }}>
                  {isCurrent && isLeft  && <NowBadge />}
                  <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: isCurrent ? "#C8FF00" : isDone ? "rgba(200,255,0,0.55)" : "rgba(255,255,255,0.25)" }}>{m.date}</span>
                  {isCurrent && !isLeft && <NowBadge />}
                </div>
                <p style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)", fontWeight: isCurrent ? 600 : 400, color: isCurrent ? "#fff" : isDone ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.42)", lineHeight: 1.3, margin: "0 0 0.25rem", letterSpacing: "-0.01em" }}>{m.label}</p>
                <p style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)", lineHeight: 1.4, margin: 0 }}>{m.sub}</p>
              </div>
            );

            const emptySlot = <div style={{ flex: 1 }} />;

            return (
              <div
                key={m.id}
                ref={(el) => (rowRefs.current[i] = el)}
                style={{ display: "flex", alignItems: "center", position: "relative", padding: "2rem 0", opacity: 0, borderBottom: i < milestones.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}
              >
                {isLeft ? textBlock : emptySlot}
                <div style={{ flexShrink: 0, position: "relative", zIndex: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isCurrent && (
                    <span style={{ position: "absolute", inset: "-7px", borderRadius: "50%", border: "1px solid rgba(200,255,0,0.28)", animation: "timelinePulse 2s ease-in-out infinite", pointerEvents: "none" }} />
                  )}
                  <div style={{
                    width: isCurrent ? "16px" : "13px",
                    height: isCurrent ? "16px" : "13px",
                    borderRadius: "50%",
                    background: isDone || isCurrent ? "#C8FF00" : "transparent",
                    border: `2px solid ${isDone || isCurrent ? "#C8FF00" : "rgba(255,255,255,0.18)"}`,
                    boxShadow: isCurrent ? "0 0 0 4px rgba(200,255,0,0.1), 0 0 16px rgba(200,255,0,0.45)" : isDone ? "0 0 8px rgba(200,255,0,0.25)" : "none",
                  }} />
                </div>
                {isLeft ? emptySlot : textBlock}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 3, marginTop: "3rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.75rem", flexWrap: "wrap" }}>
        {[
          { color: "#C8FF00",     label: "Active",   glow: true  },
          { color: "transparent", label: "Upcoming", border: true },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: item.border ? "transparent" : item.color, border: item.border ? "1.5px solid rgba(255,255,255,0.2)" : "none", boxShadow: item.glow ? "0 0 6px rgba(200,255,0,0.5)" : "none" }} />
            <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>{item.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes timelinePulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 0;   transform: scale(1.7); }
        }
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
