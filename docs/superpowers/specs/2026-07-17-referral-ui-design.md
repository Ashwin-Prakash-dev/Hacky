# Referral Code UI — Design

**Date:** 2026-07-17
**Scope:** `TeamPage` only — no new routes. Adds referral sharing + applying to the existing team dashboard.

## Background

The API (`docs` on the backend repo, `scc-api-worker`) shipped a team-referral-code
feature: every team gets a `referral_code` at creation; a leader can apply another
team's code via `PUT /team/referral` before paying, discounting their own team's fee
from ₹100 to ₹90; a referrer's `referral_count` (confirmed teams that used its code)
is exposed on `GET /team`. `GET /team` now also returns `referred_by` (the applied
referrer's `team_id`, or `null`) and `expected_fee` (`90` or `100`).

This spec covers surfacing that on the frontend: sharing your own code, applying
someone else's, and reflecting the live price.

## Decisions made during brainstorming

- Applying a code lives **inside `PaymentPanel`**, as its own field + `Apply` button
  above the existing UPI-reference field — not a separate panel. It's a distinct API
  call (`PUT /team/referral`) from submitting payment (`POST /payment`), so it gets
  its own action.
- The field stays **editable even after a code is applied** (the API allows changing
  it right up until payment) — no "locked" state pre-payment.
- Sharing **your own** code gets a small new panel, `ReferralCodePanel`, mirroring
  `JoinCodePanel` exactly (code + copy button), placed right after `JoinCodePanel`.
  Visible to every member (like `join_code`), regardless of payment status — a leader
  keeps earning referral credit after their own team is `confirmed`.
- `referral_count` is leader-only data from the API (`null` for members) — shown as
  an extra line in `ReferralCodePanel` only when present.

## 1. API client (`src/lib/startathon.js`)

One new method, alongside the existing `submitPayment`:

```js
applyReferral: (code) =>
  request("/team/referral", { method: "PUT", body: { referral_code: code } }),
```

## 2. `ReferralCodePanel` (new component)

`src/components/apply/team/ReferralCodePanel.jsx`, structurally identical to
`JoinCodePanel.jsx`:

- `Eyebrow`: `REFERRAL CODE`
- Large lime monospace code (`team.referral_code`), copy button (same
  clipboard-with-1.5s-"copied ✓" pattern as `JoinCodePanel`).
- Caption line: `// share this code — other teams get 10% off by using it`
- If `team.referral_count != null` (leader only), an extra line below the caption:
  `// N team(s) have used your code so far` (pluralize `team`/`teams` on count).

Props: `{ code, count }` — `TeamPage` passes `team.referral_code` and
`team.referral_count`.

## 3. `PaymentPanel` changes

**Eyebrow** becomes dynamic: `PAYMENT — ₹{team.expected_fee}` (was hardcoded `₹100`),
in both the leader and non-leader branches.

**Non-leader branch**: unchanged structure, just reads the price from
`team.expected_fee` instead of the literal `100`.

**Leader branch**: new block inserted above the existing UPI-reference `<form>`,
inside the same `Panel`:

- A `TerminalInput` labeled `referral code (optional)`, local state `refCode`.
- A compact `Apply` button next to it (same visual weight as `JoinCodePanel`'s copy
  button — a `GhostButton`, not a full-width `PrimaryButton`). Disabled when
  `refCode` is empty or a referral-apply request is already in flight.
- On click: calls the new `onApplyReferral(code)` prop (passed from `TeamPage`,
  wraps `api.applyReferral` + `refresh()`), which updates `team.expected_fee` /
  `team.referred_by` through the normal refresh cycle — no local optimistic state
  needed since the whole panel re-renders from the refreshed `team`.
- Error surface: its own `ErrorLine`, separate from the payment form's existing
  `error` prop (two independent forms, two independent error slots) — new prop
  `referralError`.
- When `team.referred_by` is truthy, a `NoticeLine` appears below the input:
  `// referral applied — pay ₹90 instead of ₹100`. The input/button remain visible
  and usable (per the "always editable pre-payment" decision) so the leader can
  swap codes; re-applying just re-runs the same flow.
- This whole block (input + button + notice) is **hidden once `team.status ===
  "confirmed"`** — `PaymentPanel` already early-returns to a "waiting" state for
  non-leaders but for leaders it currently keeps rendering the payment form even
  when confirmed only via the `!confirmed` guard in `TeamPage`; the referral block
  should follow the same `!confirmed` condition PaymentPanel is already gated by
  from its parent (`{!confirmed && <PaymentPanel .../>}` in `TeamPage.jsx`) — no
  extra guard needed inside `PaymentPanel` itself since the whole component
  unmounts on confirm.

## 4. `TeamPage.jsx` wiring

- New state: `applyRefBusy`, `applyRefError` (mirrors the existing
  `inviteBusy`/`inviteError` pair).
- New handler `applyReferralCode(code)`: same busy-guard pattern as `invite`/`pay`/
  `kick` (bail if any other action is in flight), calls `api.applyReferral(code)`,
  on error sets `applyRefError`, on success calls `refresh()`.
- Render `<ReferralCodePanel code={team.referral_code} count={team.referral_count}
  />` immediately after `<JoinCodePanel code={team.join_code} />`.
- Pass `onApplyReferral={applyReferralCode}`, `applyRefBusy`, `referralError=
  {applyRefError}` into `<PaymentPanel .../>`.

## Out of scope

- Any UI for the future individual-fee tiered discount (backend explicitly deferred
  this too — see the backend spec's "Out of Scope").
- Editing/removing an applied referral code without replacing it with another (the
  API has no "clear" endpoint — only apply/overwrite).
- Any onboarding/pre-team-creation referral entry point — codes only exist once a
  team exists, and are only applied once a team (the applicant's) exists too.
