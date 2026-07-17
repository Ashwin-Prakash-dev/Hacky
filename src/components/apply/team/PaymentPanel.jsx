import { useState } from "react";
import TerminalInput from "../inputs/TerminalInput";
import {
  MONO, SANS, LIME, Panel, Eyebrow, ErrorLine, NoticeLine,
  PrimaryButton, GhostButton,
} from "../ui";

const UPI_ID = import.meta.env.VITE_UPI_ID;
const UPI_QR = import.meta.env.VITE_UPI_QR;

const PaymentPanel = ({
  team, onSubmit, busy, error,
  onApplyReferral, applyRefBusy, referralError,
}) => {
  const [ref, setRef] = useState("");
  const [refCode, setRefCode] = useState("");
  const [copied, setCopied] = useState(false);
  const isLeader = team.your_role === "leader";
  const fee = team.expected_fee ?? 100;

  if (!isLeader) {
    return (
      <Panel maxWidth="none">
        <Eyebrow>PAYMENT — ₹{fee}</Eyebrow>
        <p style={{
          fontFamily: MONO, fontSize: "0.9rem",
          color: "rgba(255,255,255,0.8)", marginTop: "0.75rem", lineHeight: 1.6,
        }}>
          {"// waiting for your leader to complete payment"}
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
      <Eyebrow>PAYMENT — ₹{fee}</Eyebrow>

      <form onSubmit={applyReferral} noValidate style={{ marginTop: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <TerminalInput
              label="Referral code (optional)" value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              style={{ fontFamily: MONO }}
            />
          </div>
          <div style={{ marginBottom: "1.75rem" }}>
            <GhostButton
              onClick={applyReferral}
              disabled={applyRefBusy || !refCode.trim()}
            >
              {applyRefBusy ? "applying…" : "Apply"}
            </GhostButton>
          </div>
        </div>
        <ErrorLine>{referralError}</ErrorLine>
        <NoticeLine>
          {team.referred_by ? "referral applied — pay ₹90 instead of ₹100" : ""}
        </NoticeLine>
      </form>

      <div style={{
        display: "flex", flexWrap: "wrap", gap: "1.25rem",
        alignItems: "flex-start", marginTop: "0.75rem",
      }}>
        {UPI_QR && (
          <img
            src={UPI_QR}
            alt={`UPI QR code for ${UPI_ID}`}
            style={{
              width: "140px", height: "140px", borderRadius: "6px",
              border: "0.5px solid rgba(255,255,255,0.12)", background: "#fff",
            }}
          />
        )}
        <div style={{ flex: "1 1 240px" }}>
          <p style={{ fontFamily: SANS, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Pay <b style={{ color: LIME }}>₹{fee}</b> to the UPI ID below (or scan the QR),
            then paste the transaction reference from your UPI app.
          </p>
          <p style={{
            fontFamily: MONO, fontSize: "0.9rem", color: "#fff",
            margin: "0.75rem 0", userSelect: "all",
          }}>
            {UPI_ID}{" "}
            <GhostButton onClick={copyUpi}>{copied ? "copied ✓" : "copy"}</GhostButton>
          </p>
          <form onSubmit={submit} noValidate>
            <TerminalInput
              label="UPI transaction reference" value={ref}
              onChange={(e) => setRef(e.target.value)}
              style={{ fontFamily: MONO }}
            />
            <ErrorLine>{error}</ErrorLine>
            <PrimaryButton type="submit" disabled={busy || !ref.trim()}>
              {busy ? "confirming…" : "Confirm payment"}
            </PrimaryButton>
          </form>
        </div>
      </div>
    </Panel>
  );
};

export default PaymentPanel;
