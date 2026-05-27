const ITEMS = [
  "BUILDER-FIRST",
  "PRODUCTS NOT DEMOS",
  "30 HOURS",
  "KERALA",
  "JULY 2026",
  "CURATED TEAMS",
  "DEMO DAY",
  "SCTCE",
  "STARTATHON",
];

// Render items duplicated for seamless loop
const MarqueeTrack = ({ reverse = false }) => {
  const repeated = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div
      style={{
        display: "flex",
        width: "max-content",
        animation: `marquee${reverse ? "Rev" : "Fwd"} 28s linear infinite`,
      }}
    >
      {repeated.map((item, i) => (
        <span
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0",
            padding: "0 1.5rem",
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: i % ITEMS.length === 0
              ? "#C8FF00"
              : "rgba(255,255,255,0.28)",
            whiteSpace: "nowrap",
          }}
        >
          {item}
          <span
            style={{
              marginLeft: "1.5rem",
              color: "rgba(200,255,0,0.25)",
              fontSize: "0.5rem",
            }}
          >
            ◆
          </span>
        </span>
      ))}
    </div>
  );
};

const Marquee = ({ reverse = false }) => (
  <div
    style={{
      width: "100%",
      background: "#000",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      padding: "1.1rem 0",
      overflow: "hidden",
      position: "relative",
    }}
  >
    {/* Fade edges */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(90deg, #000 0%, transparent 8%, transparent 92%, #000 100%)",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
    <MarqueeTrack reverse={reverse} />

    <style>{`
      @keyframes marqueeFwd {
        from { transform: translateX(0); }
        to   { transform: translateX(calc(-100% / 3)); }
      }
      @keyframes marqueeRev {
        from { transform: translateX(calc(-100% / 3)); }
        to   { transform: translateX(0); }
      }
    `}</style>
  </div>
);

export default Marquee;