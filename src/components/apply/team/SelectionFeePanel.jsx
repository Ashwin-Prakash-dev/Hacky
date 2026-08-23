import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import TerminalInput from "../inputs/TerminalInput";
import Countdown from "../Countdown";
import { Panel, Eyebrow, ErrorLine, PrimaryButton, GhostButton } from "../ui";
import {
  canCover,
  payerOf,
  selectionFee,
  selectionPayerId,
} from "../../../lib/teamRules";
import {
  SELECTION_FEE_DUE,
  SELECTION_FEE_DUE_LABEL,
  selectionFeeClosed,
} from "../../../lib/phase";

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

const Amount = ({ value, note }) => (
  <p className="mt-2 font-display text-[clamp(1.6rem,5vw,2.2rem)] font-extrabold tracking-[-0.01em] text-lime">
    &#8377;{value}
    <span className="ml-2 font-mono text-[0.8rem] font-normal tracking-[0.12em] text-white/45">
      {note}
    </span>
  </p>
);

const Heading = ({ children }) => (
  <p className="mt-2 flex items-center gap-2 font-display text-[clamp(1.3rem,4vw,1.7rem)] font-extrabold tracking-[-0.01em] text-white">
    {children}
  </p>
);

const Body = ({ children }) => (
  <p className="mt-3 font-general text-[0.9rem] leading-relaxed text-white/70">
    {children}
  </p>
);

/**
 * The second of Startathon's two payments: the per-seat fee a shortlisted team
 * pays after evaluation. The first (the team's one-off registration fee) is
 * settled long before anyone sees this and is never mentioned as outstanding.
 *
 * One transfer can cover several seats, so the panel is two things stacked: the
 * state of the member's own seat, and — only when they are allowed to send one
 * — the form for the payment they are making. A member whose seat a teammate
 * covered sees the first and not the second.
 *
 * `me` is the current user's own roster row. Nothing here can submit a payment
 * as anyone else; covering a teammate still attributes the payment to `me`.
 */
const SelectionFeePanel = ({ team, me, onSubmit, busy, error }) => {
  const fee = selectionFee(team);
  const status = me?.selection_payment_status ?? null;
  const myId = me?.user_id;
  const payer = payerOf(team, me);

  // Everyone this member's own payment currently covers. Empty until they send
  // one, and empty for a member somebody else covered.
  const myCovered = team.members.filter(
    (m) => myId && selectionPayerId(m) === myId
  );

  const initialCovers =
    myCovered.length > 0 ? myCovered.map((m) => m.user_id) : myId ? [myId] : [];

  const [ref, setRef] = useState(me?.selection_transaction_ref ?? "");
  const [covers, setCovers] = useState(initialCovers);
  const [copied, setCopied] = useState(false);
  // Past the deadline we stop taking money rather than accept a transfer the
  // server may refuse. The countdown flips this for a page left open.
  const [closed, setClosed] = useState(() => selectionFeeClosed());

  // A confirmed payment is final (the server 409s any further POST), a seat
  // somebody else covered isn't this member's to pay for, and past the deadline
  // nobody should be sending anything.
  const canSubmitPayment =
    !closed && (status === null || (status === "submitted" && !payer));

  // The server owns the payment record, so when it changes underneath us — our
  // own submit, or a teammate covering us while this page is open — the form
  // has to follow. Keyed reset rather than an effect: it lands in the same
  // render as the new props, and a poll that changes nothing leaves typing
  // alone.
  const paymentKey = `${status ?? "none"}:${me?.selection_transaction_ref ?? ""}:${myCovered
    .map((m) => m.user_id)
    .join(",")}`;
  const [formKey, setFormKey] = useState(paymentKey);
  if (formKey !== paymentKey) {
    setFormKey(paymentKey);
    setRef(me?.selection_transaction_ref ?? "");
    setCovers(initialCovers);
  }

  // No `me` means we could not match the signed-in account to a roster row, so
  // we cannot attribute a payment to anyone. Never take money we can't credit.
  if (!me) {
    return (
      <Panel maxWidth="none">
        <Eyebrow>Selection fee</Eyebrow>
        <Amount value={fee} note="PER SEAT" />
        <Body>
          We can&rsquo;t match your account to your team&rsquo;s roster, so
          don&rsquo;t pay yet. Email <SupportMail /> and we&rsquo;ll sort it out.
        </Body>
      </Panel>
    );
  }

  if (!UPI_ID) {
    return (
      <Panel maxWidth="none">
        <Eyebrow>Selection fee</Eyebrow>
        <Amount value={fee} note="PER SEAT" />
        <Body>
          Payment details aren&rsquo;t available right now. Email <SupportMail />{" "}
          and we&rsquo;ll send them to you directly. Your seat is not at risk.
        </Body>
      </Panel>
    );
  }

  const toggleCover = (id) =>
    setCovers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const total = fee * covers.length;

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
    if (!value || busy || covers.length === 0) return;
    // Paying for yourself alone is the plain case and needs no cover list.
    const onlyMe = covers.length === 1 && covers[0] === myId;
    onSubmit(value, onlyMe ? undefined : covers);
  };

  // ── the state of this member's own seat ───────────────────────────────────

  const seatState = (() => {
    if (status === "confirmed") {
      return (
        <>
          <Heading>
            <Check size={20} strokeWidth={3} aria-hidden="true" />
            {payer ? `Paid by ${payer.name}` : "Paid"}
          </Heading>
          <Body>
            {payer
              ? "Their transfer covers your seat, so you're done here."
              : "Your seat is held. Nothing else to do here."}
          </Body>
        </>
      );
    }

    if (status === "submitted") {
      return (
        <>
          <Heading>
            {payer ? `${payer.name} paid for you` : "Reference submitted"}
          </Heading>
          {me.selection_transaction_ref && (
            <p className="mt-3 select-all break-all font-mono text-[0.9rem] text-white/80">
              {me.selection_transaction_ref}
            </p>
          )}
          <Body>
            {payer
              ? "We check it against our UPI records automatically, usually within five minutes. Your seat is held while we do."
              : `This reference covers ${myCovered.length} ${
                  myCovered.length === 1 ? "seat" : "seats"
                }. We check it against our UPI records automatically, usually within five minutes. You can replace it below until it clears.`}
          </Body>
        </>
      );
    }

    return null;
  })();

  // Somebody on the roster still owes. Worth saying to a member who is settled
  // themselves: the deadline is team-wide, and a confirmed payer can no longer
  // edit their payment to cover the stragglers.
  const teamHasUnpaid = team.members.some((m) => !m.selection_payment_status);

  return (
    <Panel maxWidth="none">
      <Eyebrow>Selection fee</Eyebrow>

      {seatState}

      {teamHasUnpaid && !canSubmitPayment && !closed && (
        <Body>
          {status === "confirmed"
            ? "Your payment is confirmed, so it can't be changed now. "
            : ""}
          Seats on your team are still unpaid, and the deadline covers all of
          them. If any are still unpaid by {SELECTION_FEE_DUE_LABEL}, the whole
          team is disqualified and every seat fee already paid is refunded.
          Nudge whoever is left, or ask someone to cover them.
        </Body>
      )}

      {closed && status !== "confirmed" && (
        <Body>
          The payment deadline passed on {SELECTION_FEE_DUE_LABEL}. Don&rsquo;t
          send anything now. Email <SupportMail /> and we&rsquo;ll tell you where
          your team stands.
        </Body>
      )}

      {canSubmitPayment && (
        <>
          {status === null && (
            <>
              <Amount value={total} note={`${covers.length} OF ${team.members.length} SEATS`} />
              <Body>
                Your team made the shortlist. Every seat costs &#8377;{fee}.
                Pay for your own, or cover teammates in the same transfer. This
                is separate from the registration fee your leader already paid.
              </Body>
            </>
          )}

          <div className="mt-4 rounded-md border-[0.5px] border-lime/25 bg-lime/[0.05] px-4 py-3">
            <p className="font-general text-[0.85rem] leading-relaxed text-lime/85">
              Every seat on your team has to be paid by {SELECTION_FEE_DUE_LABEL}.
              If even one is unpaid then, the whole team is disqualified and
              every seat fee already paid is refunded.
            </p>
            <div className="mt-2">
              <Countdown
                to={SELECTION_FEE_DUE}
                label="Due in"
                expiredLabel="Payment window closed"
                onExpire={() => setClosed(true)}
              />
            </div>
          </div>

          <fieldset className="mt-5 border-none p-0">
            <legend className="mb-[0.6rem] font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/80">
              Seats this payment covers
            </legend>
            <ul className="flex flex-col gap-2">
              {team.members.map((m) => {
                const selectable = canCover(m, myId);
                const covered = payerOf(team, m);
                return (
                  <li key={m.user_id ?? m.email}>
                    <label
                      className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-md border-[0.5px] border-white/[0.08] bg-white/[0.02] px-4 py-[0.7rem] ${
                        selectable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <input
                          type="checkbox"
                          className="size-4 shrink-0 accent-lime"
                          checked={covers.includes(m.user_id)}
                          disabled={!selectable}
                          onChange={() => toggleCover(m.user_id)}
                        />
                        <span className="min-w-0 truncate font-general text-[0.9rem] text-white">
                          {m.name}
                          {m === me && (
                            <span className="ml-2 font-mono text-[0.75rem] tracking-[0.12em] text-white/40">
                              you
                            </span>
                          )}
                        </span>
                      </span>
                      {!selectable && (
                        <span className="shrink-0 font-mono text-[0.78rem] tracking-[0.12em] text-white/40">
                          {covered ? `PAID BY ${covered.name.toUpperCase()}` : "PAID"}
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

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
                Transfer exactly <b className="text-lime">&#8377;{total}</b> to
                the UPI ID below, or scan the QR. If the amount doesn&rsquo;t
                match, your payment sits unmatched until we sort it out by hand.
                Then paste the transaction reference from your UPI app.
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
                <PrimaryButton
                  type="submit"
                  disabled={busy || !ref.trim() || covers.length === 0}
                >
                  {busy
                    ? "Confirming…"
                    : status === "submitted"
                      ? `Replace reference for ₹${total}`
                      : `Confirm payment of ₹${total}`}
                </PrimaryButton>
                <p className="mt-4 font-mono text-[0.75rem] leading-relaxed text-white/45">
                  Changed your mind? We refund this fee until{" "}
                  {SELECTION_FEE_DUE_LABEL}. After that it stays with us, unless
                  a teammate misses the deadline and the team is disqualified,
                  in which case it comes back to you. By paying you agree to
                  our{" "}
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
        </>
      )}
    </Panel>
  );
};

export default SelectionFeePanel;
