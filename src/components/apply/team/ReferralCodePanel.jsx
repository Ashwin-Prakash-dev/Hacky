import { useState } from "react";
import { Check } from "lucide-react";
import { Panel, Eyebrow, GhostButton } from "../ui";

const teamsLine = (n) => (n === 1 ? "1 team has used your code." : `${n} teams have used your code.`);

const ReferralCodePanel = ({ code, count }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; code is selectable below
    }
  };

  const earned = count != null ? count * 10 : null;

  return (
    <Panel maxWidth="none">
      <Eyebrow>Referral code</Eyebrow>

      <div className="mt-2 flex flex-wrap items-center gap-x-[0.85rem] gap-y-2">
        <span className="select-all font-mono text-[clamp(1.2rem,3.5vw,1.6rem)] font-bold tracking-[0.25em] text-lime">
          {code}
        </span>
        <GhostButton onClick={copy}>
          {copied ? (
            <span className="inline-flex items-center gap-[0.3rem]">
              <Check size={12} strokeWidth={3} /> copied
            </span>
          ) : "copy"}
        </GhostButton>
      </div>

      <p className="mt-3 font-general text-[0.85rem] leading-relaxed text-white/70">
        Teams that use this pay <span className="text-white">₹90</span> instead of ₹100.
      </p>

      {earned !== null && (
        earned > 0 ? (
          <div className="mt-4">
            <p className="font-general text-[clamp(1.5rem,4vw,2rem)] font-bold text-lime">
              ₹{earned} earned
            </p>
            <p className="mt-1 font-general text-[0.85rem] text-white/60">
              {teamsLine(count)} ₹10 a team, paid out by UPI after the event.
            </p>
          </div>
        ) : (
          <p className="mt-3 font-general text-[0.85rem] text-white/60">
            ₹10 a team. Share it and start earning.
          </p>
        )
      )}
    </Panel>
  );
};

export default ReferralCodePanel;
