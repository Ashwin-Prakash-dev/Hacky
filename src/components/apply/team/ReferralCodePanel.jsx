import { useState } from "react";
import { Check, Eye } from "lucide-react";
import { Panel, Eyebrow, GhostButton } from "../ui";

const teamsLine = (n) => (n === 1 ? "1 team has used it." : `${n} teams have used it.`);

const ReferralCodePanel = ({ code, count }) => {
  const [revealed, setRevealed] = useState(false);
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
        {revealed ? (
          <>
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
          </>
        ) : (
          <>
            <span className="select-none font-mono text-[clamp(1.2rem,3.5vw,1.6rem)] font-bold tracking-[0.25em] text-white/20">
              {"•".repeat(code.length)}
            </span>
            <GhostButton onClick={() => setRevealed(true)}>
              <span className="inline-flex items-center gap-[0.3rem]">
                <Eye size={12} strokeWidth={2.5} /> reveal code
              </span>
            </GhostButton>
          </>
        )}
      </div>

      <p className="mt-4 font-display text-[clamp(1.4rem,4vw,1.9rem)] font-extrabold tracking-[-0.01em] text-lime">
        ₹10 per team you refer.
      </p>

      <p className="mt-2 font-mono text-[0.8rem] leading-relaxed text-white/50">
        Teams that use it pay ₹90 instead of ₹100.
      </p>

      {earned !== null && (
        <p className="mt-1 font-mono text-[0.8rem] leading-relaxed text-white/50">
          {earned > 0
            ? `₹${earned} earned. ${teamsLine(count)} Paid out by UPI after the event.`
            : "Nobody's used it yet."}
        </p>
      )}
    </Panel>
  );
};

export default ReferralCodePanel;
