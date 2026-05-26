import { useRef, useState } from "react";

/* ── Bento tilt wrapper (unchanged) ─────────────────────────────────────── */
export const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!itemRef.current) return;
    const { left, top, width, height } = itemRef.current.getBoundingClientRect();
    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;
    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;
    setTransformStyle(
      `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`
    );
  };

  const handleMouseLeave = () => setTransformStyle("");

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {children}
    </div>
  );
};

/* ── PRIZES CARD ─────────────────────────────────────────────────────────── */
const PrizesCard = () => {
  const [hovered, setHovered] = useState(false);

  const prizes = [
    { rank: "01", label: "First Place", amount: "TBD", sub: "cash + incubation opportunity" },
    { rank: "02", label: "Second Place", amount: "TBD", sub: "cash + cloud credits" },
    { rank: "03", label: "Third Place", amount: "TBD", sub: "cash + swag" },
    { rank: "★", label: "Special Tracks", amount: "TBD", sub: "domain-specific prizes" },
  ];

  return (
    <div
      className="relative size-full overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "#f5f0e8" : "#0a0a0a",
        transition: "background-color 0.5s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    >
      {/* Diagonal texture */}
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(200,255,0,0.04) 28px, rgba(200,255,0,0.04) 29px)`,
          opacity: hovered ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      />
      {/* Ghost text */}
      <div
        style={{
          position: "absolute", bottom: "-20px", right: "-10px",
          fontFamily: "'zentry', sans-serif",
          fontSize: "clamp(80px, 18vw, 160px)", fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: "1px rgba(200,255,0,0.07)",
          lineHeight: 1, userSelect: "none", letterSpacing: "-4px",
          opacity: hovered ? 0 : 1, transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      >
        WIN
      </div>

      {/* Resting */}
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "28px",
          opacity: hovered ? 0 : 1,
          transform: hovered ? "translateY(-8px)" : "translateY(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          pointerEvents: hovered ? "none" : "auto",
        }}
      >
        <div>
          <div style={{ display: "inline-block", border: "0.5px solid rgba(200,255,0,0.4)", borderRadius: "2px", padding: "3px 10px", marginBottom: "16px" }}>
            <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "10px", letterSpacing: "3px", color: "#C8FF00", textTransform: "uppercase" }}>Prize Pool</span>
          </div>
          <h2 className="bento-title special-font" style={{ color: "#fff", lineHeight: 0.9, fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Pr<b>i</b>zes
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{ fontFamily: "'zentry', sans-serif", fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 900, color: "#C8FF00", lineHeight: 1 }}>
            ₹X.XL
          </span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>+</span>
        </div>
      </div>

      {/* Hover */}
      <div
        style={{
          position: "absolute", inset: 0, padding: "28px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s",
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "9px", letterSpacing: "3px", color: "#999", textTransform: "uppercase" }}>Prize Breakdown</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {prizes.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: i < prizes.length - 1 ? "0.5px solid #d4cfc6" : "none",
                transform: hovered ? "translateX(0)" : "translateX(-10px)",
                opacity: hovered ? 1 : 0,
                transition: `transform 0.3s ease ${0.12 + i * 0.07}s, opacity 0.3s ease ${0.12 + i * 0.07}s`,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <span style={{ fontFamily: "'zentry', sans-serif", fontSize: "11px", color: "#bbb", fontWeight: 700, minWidth: "20px" }}>{p.rank}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "12px", fontWeight: 600, color: "#111", textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.label}</div>
                  <div style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "10px", color: "#888", marginTop: "1px" }}>{p.sub}</div>
                </div>
              </div>
              <span style={{ fontFamily: "'zentry', sans-serif", fontSize: "1rem", fontWeight: 900, color: "#111" }}>{p.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── WHAT TO EXPECT CARD ─────────────────────────────────────────────────── */
const ExpectCard = () => {
  const [hovered, setHovered] = useState(false);

  const items = [
    { icon: "◈", title: "30-Hour Build Sprint", desc: "Non-stop building from kickoff to demo day" },
    { icon: "◎", title: "Expert Mentors", desc: "Technical founders and engineers guide you live" },
    { icon: "◉", title: "Curated Teams Only", desc: "20 selected teams — builders, not attendees" },
    { icon: "◆", title: "Demo Day Pitching", desc: "Top teams pitch to judges and ecosystem partners" },
    { icon: "◇", title: "Meals & Hospitality", desc: "Food and logistics covered throughout the event" },
  ];

  return (
    <div
      className="relative size-full overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "#fff" : "#0a0a0a",
        transition: "background-color 0.5s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(200,255,0,0.1) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        opacity: hovered ? 0 : 1, transition: "opacity 0.4s ease",
      }} />

      {/* Resting */}
      <div style={{
        position: "absolute", inset: 0, padding: "28px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        opacity: hovered ? 0 : 1,
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        pointerEvents: hovered ? "none" : "auto",
      }}>
        <div style={{ display: "inline-block", border: "0.5px solid rgba(200,255,0,0.4)", borderRadius: "2px", padding: "3px 10px", alignSelf: "flex-start" }}>
          <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "10px", letterSpacing: "3px", color: "#C8FF00", textTransform: "uppercase" }}>Experience</span>
        </div>
        <div>
          <h2 className="bento-title special-font" style={{ color: "#fff", lineHeight: 0.9, fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
            Wh<b>a</b>t to<br />Exp<b>e</b>ct
          </h2>
          <div style={{ marginTop: "16px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["30 HRS", "CURATED", "IRL"].map((tag, i) => (
              <span key={i} style={{
                fontFamily: "var(--font-general, sans-serif)", fontSize: "9px",
                letterSpacing: "2px", color: "rgba(255,255,255,0.4)",
                border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "2px", padding: "3px 8px",
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Hover */}
      <div style={{
        position: "absolute", inset: 0, padding: "24px 28px",
        display: "flex", flexDirection: "column", gap: "4px",
        opacity: hovered ? 1 : 0, transition: "opacity 0.35s ease 0.08s",
        pointerEvents: hovered ? "auto" : "none", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "9px", letterSpacing: "3px", color: "#999", textTransform: "uppercase", marginBottom: "12px" }}>What to Expect</span>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: "14px", alignItems: "flex-start",
            padding: "10px 0",
            borderBottom: i < items.length - 1 ? "0.5px solid #ebebeb" : "none",
            transform: hovered ? "translateX(0)" : "translateX(-10px)",
            opacity: hovered ? 1 : 0,
            transition: `transform 0.3s ease ${0.1 + i * 0.06}s, opacity 0.3s ease ${0.1 + i * 0.06}s`,
          }}>
            <span style={{ color: "#00aa55", fontSize: "14px", marginTop: "1px", flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "11px", fontWeight: 600, color: "#111", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.title}</div>
              <div style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "11px", color: "#777", marginTop: "2px", lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── TIMELINE CARD ───────────────────────────────────────────────────────── */
const TimelineCard = () => {
  const [hovered, setHovered] = useState(false);

  const events = [
    { time: "JUNE", label: "Interest Form Opens", live: false },
    { time: "JUNE", label: "Early Bird Registration (₹750)", live: false },
    { time: "JULY 1", label: "Regular Registration Closes (₹1200)", live: false },
    { time: "JULY WK2/3", label: "Idea Submission (₹100 fee)", live: false },
    { time: "DAY 1", label: "Kickoff + Build Sprint Begins", live: false },
    { time: "DAY 1–2", label: "Mentor Rounds · Mid-hack Check-in", live: false },
    { time: "DAY 2", label: "Final Submissions", live: true },
    { time: "DAY 2", label: "Demo Day · Awards", live: false },
  ];

  return (
    <div
      className="relative size-full overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(200,255,0,0.02) 22px, rgba(200,255,0,0.02) 23px)",
        opacity: hovered ? 0 : 1, transition: "opacity 0.4s ease",
      }} />

      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        fontFamily: "'zentry', sans-serif",
        fontSize: "clamp(60px, 14vw, 120px)", fontWeight: 900,
        color: "transparent",
        WebkitTextStroke: "1px rgba(200,255,0,0.05)",
        lineHeight: 1, userSelect: "none", whiteSpace: "nowrap",
        opacity: hovered ? 0 : 1, transition: "opacity 0.3s ease",
        pointerEvents: "none",
      }}>JUL 26</div>

      {/* Resting */}
      <div style={{
        position: "absolute", inset: 0, padding: "28px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        opacity: hovered ? 0 : 1,
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        pointerEvents: hovered ? "none" : "auto",
      }}>
        <div style={{ display: "inline-block", border: "0.5px solid rgba(200,255,0,0.4)", borderRadius: "2px", padding: "3px 10px", alignSelf: "flex-start" }}>
          <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "10px", letterSpacing: "3px", color: "#C8FF00", textTransform: "uppercase" }}>Schedule</span>
        </div>
        <div>
          <h2 className="bento-title special-font" style={{ color: "#fff", lineHeight: 0.9, fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
            Tim<b>e</b>line
          </h2>
          <p style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "10px" }}>
            July 2026 · SCTCE, Thiruvananthapuram
          </p>
        </div>
      </div>

      {/* Hover timeline */}
      <div style={{
        position: "absolute", inset: 0, padding: "20px 24px",
        display: "flex", flexDirection: "column",
        opacity: hovered ? 1 : 0, transition: "opacity 0.35s ease 0.08s",
        pointerEvents: hovered ? "auto" : "none",
        overflowY: "auto", backgroundColor: "#fff",
      }}>
        <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "9px", letterSpacing: "3px", color: "#999", textTransform: "uppercase", marginBottom: "16px" }}>Event Timeline</span>
        <div style={{ position: "relative", paddingLeft: "16px" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "1px", background: "linear-gradient(to bottom, #C8FF00, rgba(200,255,0,0.1))" }} />
          {events.map((ev, i) => (
            <div key={i} style={{
              display: "flex", gap: "12px", alignItems: "flex-start",
              marginBottom: i < events.length - 1 ? "10px" : 0,
              transform: hovered ? "translateX(0)" : "translateX(-8px)",
              opacity: hovered ? 1 : 0,
              transition: `transform 0.28s ease ${0.1 + i * 0.05}s, opacity 0.28s ease ${0.1 + i * 0.05}s`,
            }}>
              <div style={{
                position: "absolute", left: "-4px",
                width: "8px", height: "8px", borderRadius: "50%",
                backgroundColor: ev.live ? "#C8FF00" : "#ccc",
                marginTop: "3px", flexShrink: 0,
                boxShadow: ev.live ? "0 0 8px rgba(200,255,0,0.6)" : "none",
              }} />
              <div style={{ paddingLeft: "16px" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "9px", color: ev.live ? "#6a8800" : "#aaa", letterSpacing: "0.08em", display: "block", marginBottom: "1px" }}>
                  {ev.time} {ev.live && "← LIVE"}
                </span>
                <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "11px", color: "#111", fontWeight: ev.live ? 600 : 400, lineHeight: 1.4 }}>
                  {ev.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── FEATURES SECTION ────────────────────────────────────────────────────── */
const featureCards = [PrizesCard, ExpectCard, TimelineCard];

const Features = () => (
  <section id="perks" className="features-stack-section">
    <div className="container mx-auto px-3 md:px-10">
      <div className="px-5 py-32">
        <p className="mt-3 max-w-md font-circular-web text-lg text-blue-50 opacity-50">
          Scroll through the prizes, the full experience, and the event schedule. Hover each card to explore.
        </p>
      </div>

      <div>
        {featureCards.map((Card, index) => (
          <div
            className="stacked-card"
            key={Card.name}
            style={{ zIndex: index + 1 }}
          >
            <BentoTilt className="stacked-card-panel border-hsla overflow-hidden rounded-md transition-transform duration-300 ease-out">
              <Card />
            </BentoTilt>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
