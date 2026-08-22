import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import TerminalInput from "../inputs/TerminalInput";
import { Panel, Eyebrow, ErrorLine, PrimaryButton, GhostButton } from "../ui";
import { selectionFee } from "../../../lib/teamRules";

const UPI_ID = import.meta.env.VITE_UPI_ID;
const UPI_QR = import.meta.env.VITE_UPI_QR;

const SupportMail = () => (
  <a
    href="mailto:support@sctcoding.club"
    className="text-lime/80 underline underline-offset-[3px]"
  >
    support@sctcoding.club
  </a>
);

const Amount = ({ value }) => (
  <p className="mt-2 font-display text-[clamp(1.6rem,5vw,2.2rem)] font-extrabold tracking-[-0.01em] text-lime">
    &#8377;{value}
    <span className="ml-2 font-mono text-[0.8rem] font-normal tracking-[0.12em] text-white/45">
      PER MEMBER
    </span>
  </p>
);

/**
 * The second of Startathon's two payments: the per-member fee a shortlisted
 * team pays after evaluation. The first (the team's one-off registration fee)
 * is settled long before anyone sees this and is never mentioned as outstanding.
 *
 * Renders one of five things, in this order of precedence: identity unknown,
 * payment details missing, this member already confirmed, this member awaiting
 * verification, or the pay form. `me` is the current user's own roster row, so
 * there is no path here that acts on anyone else's payment.
 */
const SelectionFeePanel = ({ team, me, onSubmit, busy, error }) => {
  const [ref, setRef] = useState("");
  const [copied, setCopied] = useState(false);
  const fee = selectionFee(team);
  const status = me?.selection_payment_status;

  // No `me` means we could not match the signed-in account to a roster row, so
  // we cannot attribute a payment to anyone. Never take money we can't credit.
  if (!me) {
    return (
      <Panel maxWidth="none">
        <Eyebrow>Selection fee</Eyebrow>
        <Amount value={fee} />
        <p className="mt-3 font-general text-[0.9rem] leading-relaxed text-white/70">
          We can&rsquo;t match your account to your team&rsquo;s roster, so
          don&rsquo;t pay yet. Email <SupportMail /> and we&rsquo;ll sort it out.
        </p>
      </Panel>
    );
  }

  if (!UPI_ID) {
    return (
      <Panel maxWidth="none">
        <Eyebrow>Selection fee</Eyebrow>
        <Amount value={fee} />
        <p className="mt-3 font-general text-[0.9rem] leading-relaxed text-white/70">
          Payment details aren&rsquo;t available right now. Email <SupportMail />{" "}
          and we&rsquo;ll send them to you directly. Your seat is not at risk.
        </p>
      </Panel>
    );
  }

  if (status === "confirmed") {
    return (
      <Panel maxWidth="none">
        <Eyebrow>Selection fee</Eyebrow>
        <p className="mt-2 flex items-center gap-2 font-display text-[clamp(1.3rem,4vw,1.7rem)] font-extrabold tracking-[-0.01em] text-lime">
          <Check size={20} strokeWidth={3} aria-hidden="true" />
          Paid
        </p>
        <p className="mt-3 font-general text-[0.9rem] leading-relaxed text-white/70">
          Your seat is held. Nothing else to do here.
        </p>
      </Panel>
    );
  }

  if (status === "submitted") {
    return (
      <Panel maxWidth="none">
        <Eyebrow>Selection fee</Eyebrow>
        <p className="mt-2 font-display text-[clamp(1.3rem,4vw,1.7rem)] font-extrabold tracking-[-0.01em] text-white">
          Reference submitted
        </p>
        {me.selection_transaction_ref && (
          <p className="mt-3 select-all break-all font-mono text-[0.9rem] text-white/80">
            {me.selection_transaction_ref}
          </p>
        )}
        <p className="mt-3 font-general text-[0.9rem] leading-relaxed text-white/70">
          We check this against our UPI records by hand, so give it a day. Your
          seat is held while we do. If something looks wrong, email <SupportMail />.
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
      // clipboard unavailable; the UPI ID below is selectable
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const value = ref.trim();
    if (!value || busy) return;
    onSubmit(value);
  };

  return (
    <Panel maxWidth="none">
      <Eyebrow>Selection fee</Eyebrow>
      <Amount value={fee} />
      <p className="mt-3 font-general text-[0.9rem] leading-relaxed text-white/70">
        Your team made the shortlist. Everyone pays their own seat fee, so this
        covers you and nobody else. It is separate from the registration fee
        your leader already paid.
      </p>

      <div className="mt-5 flex flex-wrap items-start gap-5">
        {UPI_QR && (
          <img
            src={UPI_QR}
            alt={`UPI QR code for ${UPI_ID}`}
            className="size-[140px] rounded-md border-[0.5px] border-white/[0.12] bg-white"
          />
        )}
        <div className="flex-[1_1_240px]">
          <p className="font-general text-[0.85rem] leading-relaxed text-white/70">
            Pay <b className="text-lime">&#8377;{fee}</b> to the UPI ID below, or
            scan the QR. Then paste the transaction reference from your UPI app
            so we can match it to you.
          </p>
          <p className="my-3 flex flex-wrap items-center gap-x-[0.6rem] gap-y-1">
            <span className="select-all break-all font-mono text-[0.9rem] text-white">
              {UPI_ID}
            </span>
            <GhostButton onClick={copyUpi}>
              {copied ? (
                <span className="inline-flex items-center gap-[0.3rem]">
                  <Check size={12} strokeWidth={3} aria-hidden="true" /> copied
                </span>
              ) : (
                "copy"
              )}
            </GhostButton>
          </p>

          <form onSubmit={submit} noValidate>
            <TerminalInput
              mono
              label="UPI transaction reference"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
            <ErrorLine>{error}</ErrorLine>
            <PrimaryButton type="submit" disabled={busy || !ref.trim()}>
              {busy ? "Confirming\u2026" : "Confirm payment"}
            </PrimaryButton>
            <p className="mt-4 font-mono text-[0.75rem] leading-relaxed text-white/45">
              This fee is non-refundable. By paying you agree to our{" "}
              <Link
                to="/terms"
                className="text-lime/80 underline underline-offset-[3px]"
              >
                Terms
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </Panel>
  );
};

export default SelectionFeePanel;
