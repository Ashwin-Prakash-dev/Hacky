import { useState } from "react";
import { MONO, LIME, Panel, Eyebrow, GhostButton } from "../ui";

const JoinCodePanel = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — code is selectable below
    }
  };

  return (
    <Panel maxWidth="none">
      <Eyebrow>JOIN CODE</Eyebrow>
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: "0.75rem",
      }}>
        <span style={{
          fontFamily: MONO, fontSize: "clamp(1.4rem, 4vw, 2rem)",
          fontWeight: 700, letterSpacing: "0.25em", color: LIME,
          userSelect: "all",
        }}>
          {code}
        </span>
        <GhostButton onClick={copy}>{copied ? "copied ✓" : "copy"}</GhostButton>
      </div>
      <p style={{
        fontFamily: MONO, fontSize: "0.7rem",
        color: "rgba(255,255,255,0.4)", marginTop: "0.75rem", lineHeight: 1.6,
      }}>
        {"// share this code — teammates enter it on the join screen"}
      </p>
    </Panel>
  );
};

export default JoinCodePanel;
