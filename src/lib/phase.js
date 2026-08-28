// Where the event is in its own timeline. Until idea submissions open, the
// only thing a team can actually do is register and form a roster, so CTAs
// must not promise "apply with your idea" yet.
//
// This is read from the visitor's clock rather than the API because there is
// no phase flag on the backend today. It means the copy flips on its own at
// the date below, with no redeploy. If the date moves, change it here only.
export const APPLICATIONS_OPEN = new Date("2026-08-04T00:00:00+05:30");

// The submission deadline, mirroring "Submissions close and payment due" in
// Timeline.jsx. The API enforces this server-side and exposes it nowhere, so
// this constant is a duplicate kept in sync by hand: it drives the countdown
// and the client-side lock only. A 403 "Applications are closed" from either
// PUT is always the authority — if the two disagree, the server wins.
export const APPLICATIONS_CLOSE = new Date("2026-08-14T19:05:00+05:30");

// When every shortlisted seat's fee has to be in. A team that still has an
// unpaid seat after this loses its place, so this date is a hard one for the
// people reading it, not a soft nudge.
//
// Hand-synced with the server the same way APPLICATIONS_CLOSE is: nothing
// exposes it over the API, so this drives copy and the countdown only. The
// server is always the authority on whether a payment still counts.
export const SELECTION_FEE_DUE = new Date("2026-08-29T11:00:00+05:30");

// The day everyone arrives. Only the time of arrival is ever asked for, since
// the date is the event's, not the traveller's: the form stores a full instant
// so nothing downstream has to remember which day was meant.
export const ARRIVAL_DATE = "2026-09-05";

export const ARRIVAL_DATE_LABEL = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  timeZone: "Asia/Kolkata",
}).format(new Date(`${ARRIVAL_DATE}T00:00:00+05:30`));

// New registrations (signup, team creation, joining a team) were shut off
// manually ahead of the deadline above — not time-based, just flipped once
// and left off for the rest of the event. Teams that were already confirmed
// (paid) keep working normally; everyone else is locked out.
export const REGISTRATIONS_OPEN = false;

export const applicationsOpen = (now = new Date()) => now >= APPLICATIONS_OPEN;

export const submissionsClosed = (now = new Date()) => now >= APPLICATIONS_CLOSE;

export const registrationsOpen = () => REGISTRATIONS_OPEN;

export const selectionFeeClosed = (now = new Date()) => now >= SELECTION_FEE_DUE;

// The deadline as people read it, formatted once from the constant above so the
// copy can never drift from the clock it belongs to.
export const SELECTION_FEE_DUE_LABEL = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
}).format(SELECTION_FEE_DUE);

// The same moment written out for the Terms, where a year and a timezone are
// the difference between a date and a commitment.
export const SELECTION_FEE_DUE_LONG = `${new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
}).format(SELECTION_FEE_DUE)} IST`;

// The one place the primary CTA's wording is decided.
export const primaryCta = (now = new Date()) =>
  applicationsOpen(now)
    ? { label: "Apply with your idea", note: null }
    : {
        label: "Register your team",
        note: "Registration is open now. Idea submissions open 5 August.",
      };
