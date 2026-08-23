import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import TerminalInput from "../inputs/TerminalInput";
import Countdown from "../Countdown";
import { Panel, Eyebrow, ErrorLine, PrimaryButton, GhostButton } from "../ui";
import {
  canCover,
  openSelectionPayment,
  payerOf,
  selectionFee,
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

  // The payment being worked on, if there is one. A member can hold several at
  // once — a confirmed one covering a teammate, a submitted one for their own
  // seat — so "what I sent" comes from the payment, never from roster rows,
  // which say who paid for a seat but not which payment did it.
  const open = openSelectionPayment(team);

  // Seats the form starts on: the ones the open payment covers, or your own
  // unpaid seat when you are starting a fresh payment.
  const openCovers = open?.covers ?? [];
  const initialCovers = openCovers.length
    ? openCovers
    : myId && canCover(me, myId)
      ? [myId]
      : [];

  const [ref, setRef] = useState(open?.transaction_ref ?? "");
  const [covers, setCovers] = useState(initialCovers);
  const [copied, setCopied] = useState(false);
  // Past the deadline we stop taking money rather than accept a transfer the
  // server may refuse. The countdown flips this for a page left open.
  const [closed, setClosed] = useState(() => selectionFeeClosed());

  // Whether there is anything left for this member to pay for. Not a question
  // about their own seat: someone whose seat a teammate covered may still cover
  // a third member, and someone with a confirmed payment behind them may still
  // start another. Only the deadline closes the form outright.
  const canSubmitPayment =
    !closed && team.members.some((m) => canCover(m, myId));

  // The server owns the payment record, so when it changes underneath us — our
  // own submit, or a teammate covering us while this page is open — the form
  // has to follow. Keyed reset rather than an effect: it lands in the same
  // render as the new props, and a poll that changes nothing leaves typing
  // alone.
  const paymentKey = `${open?.payment_id ?? "new"}:${open?.transaction_ref ?? ""}:${openCovers.join(",")}`;
  const [formKey, setFormKey] = useState(paymentKey);
  if (formKey !== paymentKey) {
    setFormKey(paymentKey);
    setRef(open?.transaction_ref ?? "");
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
          don&rsquo;t pay yet. Email <SupportMail /> and we&rsquo;ll sort it
          out.
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
          Payment details aren&rsquo;t available right now. Email{" "}
          <SupportMail /> and we&rsquo;ll send them to you directly. Your seat
          is not at risk.
        </Body>
      </Panel>
    );
  }

  const toggleCover = (id) => {
    const next = covers.includes(id)
      ? covers.filter((x) => x !== id)
      : [...covers, id];
    setCovers(next);
    // A tick can turn a correction of the open payment into a separate one, and
    // a separate payment needs its own reference: the server rejects a
    // transaction_ref that is already filed. Clear it rather than let someone
    // submit the old one by accident, and put it back if they tick their way
    // home again.
    const touchesOpen = next.some((cid) => openCovers.includes(cid));
    setRef(touchesOpen ? (open?.transaction_ref ?? "") : "");
  };

  // What is actually being paid for. A teammate can settle their own seat while
  // this form sits open, and a tick made before that must not survive it: it
  // would inflate the amount on screen and put a seat the server will reject
  // into the request. Filtering here rather than in the toggle keeps the check
  // in one place, on the freshest roster we have.
  const payableCovers = covers.filter((id) =>
    canCover(
      team.members.find((m) => m.user_id === id),
      myId,
    ),
  );

  const total = fee * payableCovers.length;

  const sentAmount = open ? (open.amount ?? fee * openCovers.length) : 0;

  // What this submit will do, decided the same way the server decides it: an
  // identical cover set corrects the open payment, a set that touches it has to
  // name it by id or the seats it already holds come back as a 409, and a set
  // that shares nothing with it is simply a second payment.
  const mode = (() => {
    if (!open || payableCovers.length === 0) return "new";
    const sameSeats =
      openCovers.length === payableCovers.length &&
      openCovers.every((id) => payableCovers.includes(id));
    if (sameSeats) return "correction";
    return payableCovers.some((id) => openCovers.includes(id)) ? "edit" : "new";
  })();

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
    if (!value || busy || payableCovers.length === 0) return;
    // Paying for yourself alone is the plain case and needs no cover list.
    const onlyMe = payableCovers.length === 1 && payableCovers[0] === myId;
    onSubmit(
      value,
      onlyMe ? undefined : payableCovers,
      mode === "new" ? undefined : open.payment_id,
    );
  };

  // The team is only in when every seat is confirmed. A submitted reference is
  // unverified, so it counts as owed here exactly as the server counts it.
  const awaiting = team.members.filter(
    (m) => m.selection_payment_status === "submitted",
  );
  const stillToPay = team.members.filter((m) => !m.selection_payment_status);
  const teamSettled = awaiting.length === 0 && stillToPay.length === 0;

  const nameList = (list) =>
    list
      .map((m) => (m.user_id === myId ? "you" : m.name))
      .join(list.length > 2 ? ", " : " and ");

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
            {payer ? "Their transfer covers your seat." : "Your seat is held."}{" "}
            {teamSettled
              ? "Every seat on your team is paid for, so there is nothing left to do."
              : "Your team isn't in yet though. Here is who is left."}
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
            <>
              <p className="mt-3 font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/50">
                {payer ? "Reference they sent" : "Reference you sent"}
              </p>
              <p className="mt-1 select-all break-all font-mono text-[0.9rem] text-white/80">
                {me.selection_transaction_ref}
              </p>
            </>
          )}
          <Body>
            {payer
              ? "We check it against our UPI records automatically, usually within five minutes. Your seat is held while we do."
              : `This reference covers ${openCovers.length || 1} ${
                  (openCovers.length || 1) === 1 ? "seat" : "seats"
                }. Check it against your UPI app: if it is wrong, we can't match it, and you can replace it below until it clears. Matching is automatic and usually takes under five minutes.`}
          </Body>
        </>
      );
    }

    return null;
  })();

  return (
    <Panel maxWidth="none">
      <Eyebrow>Selection fee</Eyebrow>

      {seatState}

      {!teamSettled && !closed && (
        <div className="mt-4 rounded-md border-[0.5px] border-lime/25 bg-lime/[0.05] px-4 py-3">
          <p className="font-general text-[0.85rem] leading-relaxed text-lime/85">
            {team.members.length - awaiting.length - stillToPay.length} of{" "}
            {team.members.length} seats are confirmed.{" "}
            {stillToPay.length > 0 &&
              `${nameList(stillToPay)} still ${
                stillToPay.length === 1 && stillToPay[0].user_id !== myId
                  ? "has"
                  : "have"
              } to pay. `}
            {awaiting.length > 0 &&
              `We are still matching the money for ${nameList(awaiting)}. `}
            Every seat has to be confirmed by {SELECTION_FEE_DUE_LABEL}. If one
            is missing then, the whole team is disqualified and every fee
            already paid is refunded.
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
      )}

      {closed && status !== "confirmed" && (
        <Body>
          The payment deadline passed on {SELECTION_FEE_DUE_LABEL}. Don&rsquo;t
          send anything now. Email <SupportMail /> and we&rsquo;ll tell you
          where your team stands.
        </Body>
      )}

      {canSubmitPayment && (
        <>
          <Amount
            value={total}
            note={
              payableCovers.length
                ? `${payableCovers.length} OF ${team.members.length} SEATS`
                : "PICK A SEAT BELOW"
            }
          />

          {!open && (
            <>
              <Body>
                Your team made the shortlist. Every seat costs &#8377;{fee}. It
                pays for your food across the 30 hours, meals and snacks, and
                the rest of what it takes to host you on site. Pay for your own,
                or cover teammates in the same transfer. This is separate from
                the registration fee your leader already paid.
              </Body>
            </>
          )}

          {mode === "edit" && (
            <div className="mt-4 rounded-md border-[0.5px] border-[rgba(255,180,84,0.35)] bg-[rgba(255,180,84,0.05)] px-4 py-3">
              <p className="font-general text-[0.85rem] leading-relaxed text-[#ffb454]">
                These seats overlap the &#8377;{sentAmount} payment you already
                sent, so this rewrites that payment instead of opening a new
                one. It becomes &#8377;{total}: send one fresh transfer of that
                amount and paste its reference below.
                {total !== sentAmount && (
                  <>
                    {" "}
                    The &#8377;{sentAmount} already sent won&rsquo;t match on
                    its own, so email <SupportMail /> and we&rsquo;ll reconcile
                    the two by hand.
                  </>
                )}{" "}
                Any seat you untick goes back to unpaid.
              </p>
            </div>
          )}

          {open && mode === "new" && payableCovers.length > 0 && (
            <div className="mt-4 rounded-md border-[0.5px] border-lime/25 bg-lime/[0.05] px-4 py-3">
              <p className="font-general text-[0.85rem] leading-relaxed text-lime/85">
                This is a second payment. Your &#8377;{sentAmount} for{" "}
                {openCovers
                  .map((id) =>
                    id === myId
                      ? "your own seat"
                      : (team.members.find((m) => m.user_id === id)?.name ??
                        "a teammate"),
                  )
                  .join(", ")}{" "}
                stays as it is. Transfer &#8377;{total} for the seats ticked
                above and paste that new reference, not the old one.
              </p>
            </div>
          )}

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
                        selectable
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <input
                          type="checkbox"
                          className="size-4 shrink-0 accent-lime"
                          checked={payableCovers.includes(m.user_id)}
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
                          {covered
                            ? `PAID BY ${
                                covered.user_id === myId
                                  ? "YOU"
                                  : covered.name.toUpperCase()
                              }`
                            : "PAID"}
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
                      <Check size={12} strokeWidth={3} aria-hidden="true" />{" "}
                      copied
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
                  disabled={busy || !ref.trim() || payableCovers.length === 0}
                >
                  {busy
                    ? "Confirming…"
                    : mode === "edit"
                      ? `Replace payment with ₹${total}`
                      : mode === "correction"
                        ? `Replace reference for ₹${total}`
                        : `Confirm payment of ₹${total}`}
                </PrimaryButton>
                <p className="mt-4 font-mono text-[0.75rem] leading-relaxed text-white/45">
                  Changed your mind? We refund this fee until{" "}
                  {SELECTION_FEE_DUE_LABEL}. After that it stays with us, unless
                  a teammate misses the deadline and the team is disqualified,
                  in which case it comes back to you. By paying you agree to our{" "}
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
