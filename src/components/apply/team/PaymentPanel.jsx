import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import TerminalInput from "../inputs/TerminalInput";
import {
  MONO, Panel, Eyebrow, ErrorLine, NoticeLine,
  PrimaryButton, GhostButton,
} from "../ui";
import { MIN_MEMBERS, MAX_MEMBERS } from "../../../lib/teamRules";
import RosterMeter from "./RosterMeter";

const UPI_ID = import.meta.env.VITE_UPI_ID;
const UPI_QR = import.meta.env.VITE_UPI_QR;

const PaymentPanel = ({
  team, locked, onSubmit, busy, error,
  onApplyReferral, applyRefBusy, referralError,
}) => {
  const [ref, setRef] = useState("");
  const [refCode, setRefCode] = useState("");
  const [copied, setCopied] = useState(false);
  const isLeader = team.your_role === "leader";
  const fee = team.expected_fee ?? 100;
  const missing = Math.max(0, MIN_MEMBERS - team.members.length);

  if (locked) {
    const joined = team.members.length;
    const pending = team.invites?.length ?? 0;
    return (
      <Panel maxWidth="none">
        <Eyebrow>Payment (₹{fee})</Eyebrow>
        <div className="my-[0.85rem]">
          <RosterMeter joined={joined} pending={pending} min={MIN_MEMBERS} max={MAX_MEMBERS} />
        </div>
        <p className="flex items-start gap-2 font-general text-[0.9rem] leading-relaxed text-white/65">
          <span className="mt-[0.15rem] text-white/50">
            <Lock size={14} strokeWidth={2} />
          </span>
          <span>
            Payment unlocks once your team has {MIN_MEMBERS} members. You
            need {missing} more {missing === 1 ? "teammate" : "teammates"}.
            {isLeader ? " Add them above, then come back here." : ""}
          </span>
        </p>
      </Panel>
    );
  }

  if (!isLeader) {
    const leaderName = team.members.find((m) => m.role === "leader")?.name ?? "your team leader";
    return (
      <Panel maxWidth="none">
        <Eyebrow>Payment (₹{fee})</Eyebrow>
        <p className="mt-3 font-general text-[0.9rem] leading-relaxed text-white/80">
          Waiting for {leaderName} to complete the payment. Nothing for you to
          do here. Once it&apos;s confirmed, your whole team is registered.
        </p>
      </Panel>
    );
  }

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // UPI ID text below is selectable as fallback
    }
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(ref.trim());
  };

  const applyReferral = (e) => {
    e.preventDefault();
    if (!refCode.trim()) return;
    onApplyReferral(refCode.trim());
  };

  return (
    <Panel maxWidth="none">
      <Eyebrow>Payment (₹{fee})</Eyebrow>
      <p className="mt-2 font-general text-[0.88rem] leading-relaxed text-white/70">
        One payment covers your whole team and registers you for idea submission.
        It does not guarantee selection — 20 teams are shortlisted from the submissions.
      </p>

      {!team.referred_by && (
        <form onSubmit={applyReferral} noValidate className="mt-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <TerminalInput
                label="Referral code from another team (optional, 10% off)"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                style={{ fontFamily: MONO }}
              />
            </div>
            <div className="mb-7">
              <GhostButton
                onClick={applyReferral}
                disabled={applyRefBusy || !refCode.trim()}
              >
                {applyRefBusy ? "Applying…" : "Apply"}
              </GhostButton>
            </div>
          </div>
          <ErrorLine>{referralError}</ErrorLine>
        </form>
      )}
      <NoticeLine>
        {team.referred_by ? `Referral applied. You pay ₹${fee}.` : ""}
      </NoticeLine>

      <div className="mt-3 flex flex-wrap items-start gap-5">
        {UPI_QR && (
          <img
            src={UPI_QR}
            alt={`UPI QR code for ${UPI_ID}`}
            className="size-[140px] rounded-md border-[0.5px] border-white/[0.12] bg-white"
          />
        )}
        <div className="flex-[1_1_240px]">
          <p className="font-general text-[0.85rem] leading-relaxed text-white/70">
            Pay <b className="text-lime">₹{fee}</b> to the UPI ID below (or scan the QR),
            then paste the transaction reference from your UPI app so we can verify it.
          </p>
          <p className="my-3 select-all font-mono text-[0.9rem] text-white">
            {UPI_ID}{" "}
            <GhostButton onClick={copyUpi}>
              {copied ? (
                <span className="inline-flex items-center gap-[0.3rem]">
                  <Check size={12} strokeWidth={3} /> copied
                </span>
              ) : "copy"}
            </GhostButton>
          </p>
          <form onSubmit={submit} noValidate>
            <TerminalInput
              label="UPI transaction reference" value={ref}
              onChange={(e) => setRef(e.target.value)}
              style={{ fontFamily: MONO }}
            />
            <ErrorLine>{error}</ErrorLine>
            <PrimaryButton type="submit" disabled={busy || !ref.trim()}>
              {busy ? "Confirming…" : "Confirm payment"}
            </PrimaryButton>
            <p className="mt-4 font-mono text-[0.75rem] leading-relaxed text-white/45">
              Registration fees are non-refundable. By paying you agree to our{" "}
              <Link to="/terms" className="text-lime/80 underline underline-offset-[3px]">Terms</Link>.
            </p>
          </form>
        </div>
      </div>
    </Panel>
  );
};

export default PaymentPanel;
