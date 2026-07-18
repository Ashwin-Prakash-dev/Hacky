import { useState } from "react";
import { Check } from "lucide-react";
import { GhostButton } from "../ui";

const teamsUsedLine = (n) => (n === 1 ? "1 team has used it so far." : `${n} teams have used it so far.`);

/** Compact one-row version. The referral code is a nice-to-have, not a step. */
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

  return (
    <div className="flex flex-wrap items-center gap-x-[0.85rem] gap-y-[0.6rem] rounded-md border-[0.5px] border-white/[0.08] bg-white/[0.02] px-[1.1rem] py-[0.85rem]">
      <span className="font-general text-[0.85rem] text-white/70">
        Your referral code:
      </span>
      <span className="select-all font-mono text-[0.95rem] font-bold tracking-[0.18em] text-lime">
        {code}
      </span>
      <GhostButton onClick={copy}>
        {copied ? (
          <span className="inline-flex items-center gap-[0.3rem]">
            <Check size={12} strokeWidth={3} /> copied
          </span>
        ) : "copy"}
      </GhostButton>
      <span className="font-general text-[0.8rem] text-white/50">
        Other teams get 10% off with it.{count != null ? ` ${teamsUsedLine(count)}` : ""}
      </span>
    </div>
  );
};

export default ReferralCodePanel;
