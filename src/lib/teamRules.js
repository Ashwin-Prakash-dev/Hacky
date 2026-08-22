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
