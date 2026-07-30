import { useMemo } from "react";
import { Diamond } from "lucide-react";

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
      className={`marquee-track flex w-max ${
        reverse ? "animate-[marqueeRev_28s_linear_infinite]" : "animate-[marqueeFwd_28s_linear_infinite]"
      }`}
    >
      {repeated.map((item, i) => (
        <span
          key={i}
          className={`inline-flex items-center whitespace-nowrap px-6 font-mono text-[0.72rem] tracking-[0.22em] ${
            // no uppercase transform: the brand word must render exactly
            // as "Startathon." — the other items are typed in caps already
            i % ITEMS.length === 0 ? "text-lime" : "text-white/[0.55]"
          }`}
        >
          {item}
          <span className="ml-6 inline-flex text-lime/50">
            <Diamond size={9} fill="currentColor" strokeWidth={0} />
          </span>
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
