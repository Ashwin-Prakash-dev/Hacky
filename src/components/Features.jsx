import { useRef, useState, useEffect } from "react";
import { SignalPulseBg } from "./CanvasBg";

/* ── Bento tilt wrapper ─────────────────────────────────────────────────── */
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
      `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.98, .98, .98)`
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

/* ── Shared label pill ──────────────────────────────────────────────────── */
const CardLabel = ({ text, dark = false }) => (
  <span
    style={{
      display: "inline-block",
      fontFamily: "var(--font-general, sans-serif)",
      fontSize: "0.6rem",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: dark ? "#C8FF00" : "rgba(255,255,255,0.35)",
      border: `0.5px solid ${dark ? "rgba(200,255,0,0.35)" : "rgba(255,255,255,0.12)"}`,
      borderRadius: "2px",
      padding: "3px 9px",
    }}
  >
    {text}
  </span>
);

/* ── Animated prize counter ─────────────────────────────────────────────── */
const AnimatedPrize = ({ target = 100, duration = 1800 }) => {
  const [count, setCount] = useState(0);
  const animatedRef = useRef(false);
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animatedRef.current) return;
        animatedRef.current = true;

        const startTime = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span
      ref={elRef}
      style={{
        fontFamily: "'zentry', sans-serif",
        fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
        fontWeight: 900,
        color: "#C8FF00",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      ₹{count}K
    </span>
  );
};

/* ── PRIZES CARD ─────────────────────────────────────────────────────────── */
export const PrizesCard = () => {
  const [hovered, setHovered] = useState(false);

  const prizes = [
    { rank: "01", label: "First Place",  amount: "₹50,000" },
    { rank: "02", label: "Second Place", amount: "₹30,000" },
    { rank: "03", label: "Third Place",  amount: "₹20,000" },
  ];

  const additionalRewards = ["Sponsored challenge rewards", "Internship opportunities", "Swags"];

  return (
    <div
      className="relative size-full overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "#f7f5f0" : "#0c0c0c",
        transition: "background-color 0.45s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(200,255,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        opacity: hovered ? 0 : 1,
        transition: "opacity 0.4s ease",
      }} />

      <div style={{
        position: "absolute", bottom: "-16px", right: "-8px",
        fontFamily: "'zentry', sans-serif",
        fontSize: "clamp(90px, 20vw, 170px)", fontWeight: 900,
        color: "transparent",
        WebkitTextStroke: "1px rgba(200,255,0,0.05)",
        lineHeight: 1, userSelect: "none",
        opacity: hovered ? 0 : 1, transition: "opacity 0.25s ease",
        pointerEvents: "none",
      }}>WIN</div>

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "2rem",
        opacity: hovered ? 0 : 1,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        pointerEvents: hovered ? "none" : "auto",
      }}>
        <CardLabel text="Prize Pool" dark />
        <div>
          <h2 className="bento-title special-font" style={{ color: "#fff", lineHeight: 0.88, fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)", marginBottom: "0.75rem" }}>
            Pr<b>i</b>zes
          </h2>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <AnimatedPrize target={100} duration={1800} />
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", letterSpacing: "0.05em" }}>total pool</span>
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute", inset: 0, padding: "1.75rem 2rem",
        display: "flex", flexDirection: "column", justifyContent: "center",
        gap: "0",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.3s ease 0.08s, transform 0.3s ease 0.08s",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#999", textTransform: "uppercase" }}>Prize Breakdown</span>
          <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.55rem", letterSpacing: "0.12em", color: "#bbb", textTransform: "uppercase" }}>Amount</span>
        </div>

        {/* Prize rows */}
        {prizes.map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0.65rem 0",
            borderTop: "0.5px solid rgba(0,0,0,0.08)",
            transform: hovered ? "translateX(0)" : "translateX(-8px)",
            opacity: hovered ? 1 : 0,
            transition: `transform 0.28s ease ${0.1 + i * 0.06}s, opacity 0.28s ease ${0.1 + i * 0.06}s`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.55rem", color: "#bbb", letterSpacing: "0.08em", minWidth: "16px" }}>{p.rank}</span>
              <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.72rem", fontWeight: 600, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.label}</span>
            </div>
            <span style={{ fontFamily: "'zentry', sans-serif", fontSize: "0.95rem", fontWeight: 900, color: "#111", letterSpacing: "-0.01em" }}>{p.amount}</span>
          </div>
        ))}

        {/* Additional rewards */}
        <div style={{
          borderTop: "0.5px solid rgba(0,0,0,0.08)",
          paddingTop: "0.8rem",
          marginTop: "0.1rem",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-8px)",
          transition: "opacity 0.28s ease 0.32s, transform 0.28s ease 0.32s",
        }}>
          <div style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#aaa", marginBottom: "0.45rem" }}>
            Additional Rewards
          </div>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {additionalRewards.map((r, i) => (
              <span key={i} style={{
                fontFamily: "var(--font-general, sans-serif)",
                fontSize: "0.56rem", color: "#666",
                border: "0.5px solid rgba(0,0,0,0.14)",
                borderRadius: "2px", padding: "2px 8px",
                backgroundColor: "rgba(0,0,0,0.03)",
                letterSpacing: "0.02em",
              }}>{r}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── WHAT TO EXPECT CARD ─────────────────────────────────────────────────── */
export const ExpectCard = () => {
  const [hovered, setHovered] = useState(false);

  const items = [
    { icon: "◈", title: "30-Hour Build Sprint",        desc: "Work alongside the state's most ambitious builders in an intense product development sprint." },
    { icon: "◎", title: "Demo Day Pitching",           desc: "Present your product to experienced builders, founders, and industry professionals." },
    { icon: "◉", title: "High-Value Networking",       desc: "Connect with ambitious developers, innovators, and potential future co-founders from across the state." },
    { icon: "◆", title: "Mentorship & Feedback",       desc: "Receive guidance and actionable feedback throughout the entire building process." },
    { icon: "◇", title: "Meals & Accommodation",       desc: "All funds collected from participants will be used exclusively to cover meal and accommodation expenses." },
  ];

  return (
    <div
      className="relative size-full overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "#fff" : "#0c0c0c",
        transition: "background-color 0.45s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(200,255,0,0.08) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        opacity: hovered ? 0 : 1, transition: "opacity 0.4s ease",
      }} />

      <div style={{
        position: "absolute", inset: 0, padding: "2rem",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        opacity: hovered ? 0 : 1,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        pointerEvents: hovered ? "none" : "auto",
      }}>
        <CardLabel text="Experience" dark />
        <div>
          <h2 className="bento-title special-font" style={{ color: "#fff", lineHeight: 0.88, fontSize: "clamp(1.9rem, 4vw, 3.2rem)", marginBottom: "1rem" }}>
            Wh<b>a</b>t to<br />Exp<b>e</b>ct
          </h2>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["30 HRS", "CURATED", "IRL"].map((tag, i) => (
              <span key={i} style={{
                fontFamily: "var(--font-general, sans-serif)", fontSize: "0.58rem",
                letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)",
                border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "2px", padding: "3px 8px",
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute", inset: 0, padding: "1.4rem 1.5rem",
        display: "flex", flexDirection: "column", justifyContent: "flex-start",
        opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease 0.08s",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        <span style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.6rem", display: "block" }}>What to Expect</span>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: "10px", alignItems: "flex-start",
            padding: "0.38rem 0",
            borderBottom: i < items.length - 1 ? "0.5px solid #ebebeb" : "none",
            transform: hovered ? "translateX(0)" : "translateX(-8px)",
            opacity: hovered ? 1 : 0,
            transition: `transform 0.28s ease ${0.08 + i * 0.05}s, opacity 0.28s ease ${0.08 + i * 0.05}s`,
          }}>
            <span style={{ color: "#00aa55", fontSize: "0.65rem", marginTop: "1px", flexShrink: 0, lineHeight: 1.5 }}>{item.icon}</span>
            <div>
              <div style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.6rem", fontWeight: 600, color: "#111", textTransform: "uppercase", letterSpacing: "0.07em" }}>{item.title}</div>
              <div style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.58rem", color: "#888", marginTop: "1px", lineHeight: 1.35 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── FEATURES SECTION ────────────────────────────────────────────────────── */
const featureCards = [PrizesCard, ExpectCard];

const Features = () => (
  <section id="perks" className="features-stack-section" style={{ position: "relative" }}>
    {/* Signal pulse bg — covers the entire black features section */}
    <SignalPulseBg />

    <div className="container mx-auto px-3 md:px-10" style={{ position: "relative", zIndex: 1 }}>
      <div style={{ padding: "8rem 1.25rem 4rem" }}>
        <p style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.62rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#C8FF00",
          marginBottom: "0.75rem",
        }}>
          What's inside
        </p>
        <p style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.82rem",
          color: "rgba(255,255,255,0.3)",
          lineHeight: 1.7,
          maxWidth: "28rem",
        }}>
          Scroll through the prizes and the full experience. Hover each card to explore.
        </p>
      </div>

      <div>
        {featureCards.map((Card, index) => (
          <div
            className="stacked-card"
            key={Card.name}
            style={{ zIndex: index + 2 }}
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