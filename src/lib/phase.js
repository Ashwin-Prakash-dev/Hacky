// Where the event is in its own timeline. Until idea submissions open, the
// only thing a team can actually do is register and form a roster, so CTAs
// must not promise "apply with your idea" yet.
//
// This is read from the visitor's clock rather than the API because there is
// no phase flag on the backend today. It means the copy flips on its own at
// the date below, with no redeploy. If the date moves, change it here only.
export const APPLICATIONS_OPEN = new Date("2026-08-05T00:00:00+05:30");

export const applicationsOpen = (now = new Date()) => now >= APPLICATIONS_OPEN;

// The one place the primary CTA's wording is decided.
export const primaryCta = (now = new Date()) =>
  applicationsOpen(now)
    ? { label: "Apply with your idea", note: null }
    : {
        label: "Register your team",
        note: "Registration is open now. Idea submissions open 5 August.",
      };
