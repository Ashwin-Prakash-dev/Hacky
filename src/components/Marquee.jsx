import { useMemo } from "react";

const ITEMS = [
  "BUILDER-FIRST",
  "PRODUCTS NOT DEMOS",
  "30 HOURS",
  "KERALA",
  "JULY 2026",
  "CURATED TEAMS",
  "DEMO DAY",
  "SCTCE",
  "Startathon.",
];

const MarqueeTrack = ({ reverse = false }) => {
  const repeated = useMemo(() => [...ITEMS, ...ITEMS, ...ITEMS], []);

  return (
    <div
      className="marquee-track"
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
            padding: "0 1.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            // no uppercase transform: the brand word must render exactly
            // as "Startathon." — the other items are typed in caps already
            color: i % ITEMS.length === 0 ? "#C8FF00" : "rgba(255,255,255,0.55)",
            whiteSpace: "nowrap",
          }}
        >
          {item}
          <span style={{ marginLeft: "1.5rem", color: "rgba(200,255,0,0.5)", fontSize: "0.55rem" }}>◆</span>
        </span>
      ))}
    </div>
  );
};

const Marquee = ({ reverse = false }) => (
  <div className="marquee-outer">
    <div className="marquee-wrap">
      <div className="marquee-glow" />
      <div className="marquee-fade" />
      <MarqueeTrack reverse={reverse} />
    </div>
  </div>
);

export default Marquee;
