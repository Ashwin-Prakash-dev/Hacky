// src/components/ScreenContent.jsx
import { Html } from "@react-three/drei";
import { useEffect, useRef } from "react";

const LINES = [
  { prompt: "startathon@2026:~$", cmd: " init hackathon", delay: 0 },
  { prompt: null, cmd: "› loading benefits...", delay: 700, color: "#C8FF00" },
  { prompt: null, cmd: "  ✓ ₹X.XL prize pool", delay: 1200, color: "rgba(200,255,0,0.6)" },
  { prompt: null, cmd: "  ✓ expert mentors on-site", delay: 1700, color: "rgba(200,255,0,0.6)" },
  { prompt: null, cmd: "  ✓ 30-hour build sprint", delay: 2200, color: "rgba(200,255,0,0.6)" },
  { prompt: null, cmd: "  ✓ demo day pitching", delay: 2700, color: "rgba(200,255,0,0.6)" },
  { prompt: "startathon@2026:~$", cmd: " compile rewards", delay: 3300 },
  { prompt: null, cmd: "› compiling...", delay: 3900, color: "#C8FF00" },
  { prompt: null, cmd: "  [████████████████] 100%", delay: 4600, color: "rgba(200,255,0,0.75)" },
  { prompt: null, cmd: "  ✓ build complete.", delay: 5200, color: "#C8FF00" },
  { prompt: "startathon@2026:~$", cmd: " run startathon --date=july-2026", delay: 5800 },
  { prompt: null, cmd: "  🚀 ready. build something real.", delay: 6600, color: "#C8FF00" },
];

function Terminal() {
  const linesRef = useRef([]);

  useEffect(() => {
    linesRef.current.forEach((el) => { if (el) el.style.opacity = "0"; });

    const timers = LINES.map((line, i) =>
      setTimeout(() => {
        const el = linesRef.current[i];
        if (!el) return;
        el.style.opacity = "1";
        const span = el.querySelector(".cmd-text");
        if (!span) return;
        const full = span.dataset.full;
        span.textContent = "";
        let j = 0;
        const tick = setInterval(() => {
          span.textContent += full[j];
          j++;
          if (j >= full.length) clearInterval(tick);
        }, 22);
      }, line.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      width: "1440px",
      height: "900px",
      background: "#000000",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Courier New', Menlo, monospace",
      fontSize: "20px",
      lineHeight: "1.75",
      userSelect: "none",
    }}>
      {/* macOS title bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "16px 22px",
        background: "#111111",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
        <span style={{
          margin: "0 auto",
          fontSize: "13px",
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.1em",
          fontFamily: "sans-serif",
        }}>
          bash — startathon
        </span>
      </div>

      {/* Output */}
      <div style={{ padding: "32px 36px", flex: 1, overflowY: "hidden" }}>
        {LINES.map((line, i) => (
          <div
            key={i}
            ref={(el) => (linesRef.current[i] = el)}
            style={{
              opacity: 0,
              transition: "opacity 0.12s ease",
              display: "flex",
              gap: "8px",
              marginBottom: "2px",
            }}
          >
            {line.prompt && (
              <span style={{ color: "#C8FF00", flexShrink: 0 }}>{line.prompt}</span>
            )}
            <span
              className="cmd-text"
              data-full={line.cmd}
              style={{ color: line.color || "rgba(255,255,255,0.72)" }}
            />
          </div>
        ))}

        {/* Blinking cursor */}
        <div style={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
          <span style={{ color: "#C8FF00" }}>startathon@2026:~$</span>
          <span style={{
            display: "inline-block",
            width: "11px",
            height: "20px",
            background: "#C8FF00",
            marginLeft: "10px",
            animation: "cur 1.1s step-end infinite",
          }} />
        </div>
      </div>

      <style>{`@keyframes cur { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

export default function ScreenContent() {
  return (
    <Html
      transform
      position={[0, 0, 0]}
      rotation={[Math.PI / 2, Math.PI, Math.PI]}
      scale={0.170}
      zIndexRange={[100, 0]}
      style={{ pointerEvents: "none" }}
    >
      <Terminal />
    </Html>
  );
}