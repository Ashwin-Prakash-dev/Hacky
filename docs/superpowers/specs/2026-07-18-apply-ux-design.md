# /apply Flow UX Overhaul — Design

**Date:** 2026-07-18
**Status:** Approved by user
**Scope:** Frontend only (this repo). No backend changes.

## Problem

The application flow (`/signup` → `/profile` → `/onboarding` → `/team` → payment) is
functional but unfriendly:

1. **Confusing copy/jargon** — terminal-speak (`// checking your status…`, `[APPLY]`,
   "operative") confuses non-technical applicants; no plain-language guidance.
2. **No sense of progress** — users can't tell where they are in the flow or what's
   left before they're registered.
3. **Team page is overwhelming** — join code, referral, roster, invites, and payment
   stack in one long column with no hierarchy.
4. **Forms & errors feel raw** — bare validation messages, `window.confirm()` popups,
   minimal loading states.
5. **Team-size rule invisible** — teams need **3–4 members** to compete, but the UI
   (and landing page, which says "Teams of 1–4") never says so.

## Decisions made with user

| Decision | Choice |
|---|---|
| Tone | Keep the terminal/lime visual brand; rewrite all copy in plain, helpful language (drop `// ` prefixes, "operative", cryptic labels) |
| Team-size rule | **Hard gate in the UI**: payment locked until roster has 3+ members. UI-side only; backend unchanged |
| Progress | Cross-page stepper **plus** a "Next Steps" checklist on the team page |
| Team page layout | **Checklist-driven**: page spotlights the current step; secondary panels demoted |

## Design

### 1. Shared building blocks

- **`Stepper` component**, rendered by `AuthShell` beneath the top bar.
  Steps: `Account → Phone → Team → Pay`.
  - States: done (lime dot), current (ring/highlight), upcoming (dim).
  - Shown on: signup, login (Account); profile (Phone); onboarding, team (Team);
    the Team step flips to Pay once the roster qualifies and payment is the current step.
  - Not shown on: forgot, reset, callback pages.
  - Compact single-line rendering on mobile.
- **Copy primitives** (`src/components/apply/ui.jsx`):
  - `ErrorLine` / `NoticeLine` drop the `"// "` prefix. Same mono/red/lime look;
    messages read as sentences ("That join code doesn't match any team.").
  - Loading states become plain text: "Checking your status…", "Loading your team…".
- **`ConfirmDialog` component** — styled in-page modal (panel aesthetic, lime accent)
  replacing all `window.confirm()` calls (kick, leave, disband). States the
  consequence explicitly; danger-styled confirm button; cancel is the safe default.

### 2. Team-size rule (3–4 members)

- Shared constants `MIN_MEMBERS = 3`, `MAX_MEMBERS = 4` (single source of truth,
  e.g. `src/lib/teamRules.js`).
- **Onboarding**: both cards carry "Teams need 3–4 members to compete — you can add
  teammates after creating."
- **Roster**: 4 slots total; the first 3 render as required, the 4th as dashed
  "optional slot".
- **Payment gate (UI-side)**: while `team.members.length < MIN_MEMBERS`, the leader
  sees a locked payment panel — "🔒 Payment unlocks when your team has 3 members
  (you have N)" — with no form rendered. Unlocks automatically once the roster
  qualifies (on refresh/refetch).
- **Consistency fix**: update landing-page copy (`src/components/*`) and SEO
  descriptions (`usePageMeta`) that currently say "Teams of 1–4" to "Teams of 3–4".

### 3. Team page — checklist-driven layout

Top to bottom:

1. **Header** — team name, status badge, "N steps left" summary.
2. **Next Steps card** —
   - ☑ Team created
   - ▶ Add teammates — X of 3 minimum (progress shown)
   - ☐ Pay ₹{fee} (with "unlocks at 3 members" note while locked)
   - When confirmed: all items checked + "You're in — see you at SCTCE."
3. **Add Teammates panel** — merges roster + join code + invite form:
   - Roster rows first (with leader tag, kick action for leader via ConfirmDialog).
   - "Share this join code: `CODE` [copy]" — visible to all members.
   - "or" divider, then the email-invite form (leader only, hidden at 4 members
     or when confirmed).
4. **Payment panel** — three states:
   - **Locked** (roster < 3): lock message, no form.
   - **Unlocked** (leader): referral-code entry ("Have another team's referral code?
     Enter it to pay ₹90 instead of ₹100."), UPI QR + ID + copy, transaction
     reference field, confirm button.
   - **Non-leader**: "Waiting for {leader name} to complete payment."
   - **Confirmed**: panel replaced by the checklist's done state.
5. **Footer row** (compact, de-emphasized) —
   - Referral code as one line: "Your referral code `CODE` [copy] — other teams get
     10% off; N team(s) have used it."
   - Leave / disband via ConfirmDialog.

The "applications open soon" idea notice stays, in plain language.

### 4. Copy pass on remaining pages

Login, Signup, Forgot, Reset, Profile, Apply, Callback keep their layouts.
Every user-facing string rewritten in plain language:

- No "operative"; "// logged in as" → "Signed in as {name}".
- Field labels get hints where useful (phone format on Profile, join-code format).
- Success/error messages state what happened and what to do next.
- Button/loading labels stay short but human ("Sending…", "Checking…").

## Out of scope

- Backend changes (payment validation, team-size enforcement server-side).
- Payment provider changes.
- Landing-page redesign beyond the "3–4" string fix.

## Error handling

- Existing error paths (401 → login, 404 → onboarding, network → retry) unchanged;
  only message wording improves.
- If the backend ever rejects payment for an under-sized team, its error message is
  surfaced via the normal `ErrorLine` path (no special handling needed).

## Testing

- Manual verification via the flow itself (no test suite exists in this repo).
- Key states to check: teamless onboarding, roster 1→2→3→4 (payment lock/unlock),
  leader vs member views, confirmed team, kick/leave/disband confirm dialogs,
  mobile stepper rendering.
