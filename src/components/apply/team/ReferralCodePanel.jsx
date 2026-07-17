import { useState } from "react";
import { MONO, LIME, Panel, Eyebrow, GhostButton } from "../ui";

const pluralTeams = (n) => (n === 1 ? "1 team" : `${n} teams`);

const ReferralCodePanel = ({ code, count }) => {
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
      <Eyebrow>REFERRAL CODE</Eyebrow>
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
        fontFamily: MONO, fontSize: "0.85rem",
        color: "rgba(255,255,255,0.75)", marginTop: "0.75rem", lineHeight: 1.6,
      }}>
        {"// share this code — other teams get 10% off by using it"}
      </p>
      {count != null && (
        <p style={{
          fontFamily: MONO, fontSize: "0.85rem",
          color: "rgba(200,255,0,0.85)", marginTop: "0.35rem", lineHeight: 1.6,
        }}>
          {`// ${pluralTeams(count)} used your code so far`}
        </p>
      )}
    </Panel>
  );
};

export default ReferralCodePanel;
