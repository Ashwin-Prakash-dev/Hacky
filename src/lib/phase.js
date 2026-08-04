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
export const APPLICATIONS_CLOSE = new Date("2026-08-12T23:59:59+05:30");

export const applicationsOpen = (now = new Date()) => now >= APPLICATIONS_OPEN;

export const submissionsClosed = (now = new Date()) => now >= APPLICATIONS_CLOSE;

// The one place the primary CTA's wording is decided.
export const primaryCta = (now = new Date()) =>
  applicationsOpen(now)
    ? { label: "Apply with your idea", note: null }
    : {
        label: "Register your team",
        note: "Registration is open now. Idea submissions open 5 August.",
      };
