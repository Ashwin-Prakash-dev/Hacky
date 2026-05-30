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
  "Startathon",
];

const MarqueeTrack = ({ reverse = false }) => {
  const repeated = useMemo(() => [...ITEMS, ...ITEMS, ...ITEMS], []);

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
            padding: "0 1.5rem",
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: i % ITEMS.length === 0 ? "#C8FF00" : "rgba(255,255,255,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          {item}
          <span style={{ marginLeft: "1.5rem", color: "rgba(200,255,0,0.45)", fontSize: "0.45rem" }}>◆</span>
        </span>
      ))}
    </div>
  );
};

const Marquee = ({ reverse = false }) => (
  <div className="marquee-wrap">
    <div className="marquee-glow" />
    <div className="marquee-fade" />
    <MarqueeTrack reverse={reverse} />
  </div>
);

export default Marquee;
