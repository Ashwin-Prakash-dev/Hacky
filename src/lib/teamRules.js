import { getUser } from "./auth";

// Single source of truth for the competition's team-size rule.
export const MIN_MEMBERS = 3;
export const MAX_MEMBERS = 4;

// The per-member selection fee, in rupees. Charged only to shortlisted teams,
// and entirely separate from the ₹100 registration fee the leader pays once for
// the whole team at signup.
//
// The server owns this number and returns it on the team as `selection_fee`.
// This constant is the hand-synced fallback for when it isn't there, in the
// same spirit as the date constants in phase.js: if the fee moves, it changes
// here only, and the server always wins.
export const SELECTION_FEE = 250;

// Statuses that mean a team completed registration and its ₹100 is paid.
// A shortlisted team is `selected` rather than `confirmed`, but it has done
// everything a confirmed team has and more, so both belong here.
//
// Deliberately an allowlist rather than an ordered ladder. A future status like
// `withdrawn` or `disqualified` comes later in time but is not further along,
// and must not inherit access by being ranked above `confirmed`.
const REGISTERED_STATUSES = new Set(["confirmed", "selected"]);

export const isRegistered = (team) => REGISTERED_STATUSES.has(team?.status);

export const isSelected = (team) => team?.status === "selected";

// Always read the fee through this, never the raw field, so the fallback lives
// in one place.
export const selectionFee = (team) => team?.selection_fee ?? SELECTION_FEE;

// The signed-in user's own roster row. The stored user object has no guaranteed
// id field, so identity comes from matching the account email against the
// roster; a leader whose row carries no email is matched by role as a fallback.
// Returns null when the account can't be matched, which callers must treat as
// "we cannot attribute anything to this person" rather than as an empty member.
export const currentMember = (team) => {
  if (!team) return null;
  const email = getUser()?.email?.toLowerCase();
  return (
    team.members.find((m) => m.email?.toLowerCase() === email) ??
    (team.your_role === "leader"
      ? team.members.find((m) => m.role === "leader")
      : null)
  );
};

// True once a member's seat is spoken for: the payment is verified, or a
// reference is in and waiting to be matched. Either way, stop asking them for
// money — including when the payment is somebody else's.
export const selectionFeeSettled = (member) =>
  member?.selection_payment_status === "confirmed" ||
  member?.selection_payment_status === "submitted";

// Who is paying for this seat, or null while nobody is. `selection_paid_by` is
// the authority; a paid seat with no payer named is the member's own, which is
// how a payment that covers only its sender may come back.
export const selectionPayerId = (member) => {
  if (!member?.selection_payment_status) return null;
  return member.selection_paid_by ?? member.user_id ?? null;
};

// A seat a teammate paid for. Both halves matter: there is a payment, and it
// isn't the member's own.
export const coveredByOther = (member) => {
  const payer = selectionPayerId(member);
  return !!payer && payer !== member.user_id;
};

// The teammate whose transfer covers this member, or null when it is their own
// payment, or nobody's yet.
export const payerOf = (team, member) =>
  coveredByOther(member)
    ? (team?.members.find((m) => m.user_id === selectionPayerId(member)) ?? null)
    : null;

// Whether `payerId` may put `member` on their payment: either nobody has paid
// for that seat, or the payment that already covers it is the one being edited.
// Anyone else's payment is off limits — the server 409s and names them.
export const canCover = (member, payerId) =>
  !member?.selection_payment_status || selectionPayerId(member) === payerId;
