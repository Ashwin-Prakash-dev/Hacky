# Auth + Team Flow — Design

**Date:** 2026-07-12
**Scope:** Replaces the `/apply` application form entirely. Main landing page untouched.

## Background

The Startathon API v3 (`https://api.sctcoding.club/api/v3/events/startathon`) has no
application-form endpoint. Its lifecycle is: **account → team → payment**.

1. **Auth** — signup (name/email/password/phone/college), login, Google OAuth,
   password reset. JWT bearer token, 7-day life.
2. **Team** — create (become leader, receive a `join_code`), join via code, or accept
   an emailed invite. 1 leader + up to 3 members.
3. **Payment** — leader submits a UPI transaction ref (₹100) → team `confirmed`,
   roster locks.

The current 6-phase form, the AI apply-method dialog, and the `/apply` POST are
removed. The frontend becomes an auth gate plus a team dashboard.

## Decisions made during brainstorming

- **Full replacement** of the form/method dialog (no legacy form anywhere).
- **Multi-route** structure with guards (approach B), routes at top level, not under `/apply/`.
- **Google OAuth** returns to a frontend callback route which forwards `code`+`state`
  to the API. (Backend requirement: Google redirect_uri must point at
  `https://startathon.sctcoding.club/auth/callback`.)
- **Payment screen** shows a UPI ID + QR code (env/config-driven).
- **Keep the terminal aesthetic** — dark `#0a0a0a`, monospace, lime `#C8FF00`,
  scanline overlay; consistent with the landing page.

## 1. Routes & guards

| Route | Screen | Guard |
|---|---|---|
| `/apply` | Redirect hub only | no token → `/login`; team → `/team`; else `/onboarding` |
| `/login` | Email+password, Google button, forgot link | authed → `/apply` |
| `/signup` | Name, email, password, phone, college + Google | authed → `/apply` |
| `/forgot` | Request reset email | none |
| `/reset?token=…` | Set new password (also invitee first password) | none |
| `/auth/callback` | Exchanges `code`+`state` → stores JWT → `/apply` | none |
| `/onboarding` | Create team / join by code / pending invites | requires token; has team → `/team` |
| `/team` | Team dashboard | requires token; `GET /team` 404 → `/onboarding` |

- `/apply` stays alive so existing landing-page "Apply" links keep working.
- A `RequireAuth` layout route wraps `/onboarding` and `/team`.
- Team-vs-teamless is decided by one `GET /team` call (404 = teamless, a normal state).
- Any 401 clears the token and redirects to `/login`.
- After every mutation (create/join/invite/accept/decline/leave/kick/pay), re-fetch
  `GET /team` as the single source of truth.

## 2. Screens

### Auth (`/login`, `/signup`)

Centered terminal panel: eyebrow label (`[AUTHENTICATE]` / `[NEW OPERATIVE]`),
heading, `TerminalInput` fields, lime primary submit, divider, neutral
"Continue with Google" button (G mark). Cross-links between login/signup.

- Client-side validation mirrors API rules: password 8–100, phone 10–15 chars,
  name 1–100, college 1–150 — most 400s never reach the server.
- Server errors render as a red terminal line above the submit button.
  Signup 409 ("email registered") links to `/login`. Login 401 shows the generic
  invalid-credentials message.
- Google flow: `GET /auth/google` → redirect the browser to `data.auth_url`.

### Forgot / reset (`/forgot`, `/reset`)

- `/forgot`: one email field; always resolves to "if that account exists, a reset
  link is on its way" (API never enumerates).
- `/reset`: reads `?token=`, new-password + confirm fields →
  `POST /auth/password/reset/verify`. 400 (invalid/expired) → error with link back
  to `/forgot`. Success → `/login` with a "password set — log in" notice.
- This is also how leader-invited users with brand-new accounts set their first
  password (their email contains a set-password link).

### OAuth callback (`/auth/callback`)

"Signing you in…" screen. Forwards `code`+`state` to
`GET /auth/google/callback`, stores the JWT + user, navigates to `/apply`.
On 400, shows the error with a "back to login" link.

### Onboarding (`/onboarding`)

Greeting with the user's name + logout link.

- **Pending invites first** (`GET /invites`): cards — "**Byte Force** — invited by
  Alice" with Accept / Decline. Accept → `/team`. Decline removes the card.
- Two panels side by side (stacked on mobile):
  - **Create a team** — team-name field (2–60 chars) → `POST /team` → `/team`.
  - **Join a team** — join-code field → `POST /team/join` → `/team`.
- 409s ("name taken", "already on a team") surface the server `error` verbatim.
- Footer note: "Applications open soon — form or join a team now; once submissions
  open, your team will apply with its idea."

### Dashboard (`/team`)

- Header: team name + status badge — `PAYMENT PENDING` (amber) / `CONFIRMED` (lime).
- **Join code** panel: large monospace code, copy button.
- **Roster**: leader-first, 1–4 slots; empty slots as dashed placeholders; leader
  sees kick buttons on members (hidden once confirmed).
- **Invite panel** (leader only, roster < 4): email + optional name →
  `POST /team/invite`. The "name required for new accounts" 400 reveals the name
  field inline with an explanatory hint.
- **Payment panel** (leader only, while `payment-pending`): UPI ID + QR image,
  ₹100 amount, transaction-ref input → `POST /payment`. 400 messages
  ("not found / already used") shown inline. Members see
  "waiting for your leader to complete payment".
- **Leave** (member) / **Disband** (leader, confirm step — deletes the team).
  Both hidden once confirmed.
- Confirmed state: "✓ TEAM CONFIRMED" treatment, roster-locked notice, no
  destructive actions visible.
- **Idea-submission notice** (all states, most prominent once confirmed): a
  terminal-styled banner — "APPLICATIONS OPEN SOON — once submissions open, your
  team will apply with its idea here." Static copy for now; it marks where the
  future idea-submission flow will live.

## 3. Files

### New

```
src/lib/startathon.js                     — API client (fetch wrapper + per-endpoint fns)
src/lib/auth.js                           — token/user persistence + useAuth() context
src/components/apply/AuthShell.jsx        — shared chrome (bg, glow, scanlines, top bar)
src/components/apply/RequireAuth.jsx      — auth guard layout route
src/components/apply/pages/LoginPage.jsx
src/components/apply/pages/SignupPage.jsx
src/components/apply/pages/ForgotPage.jsx
src/components/apply/pages/ResetPage.jsx
src/components/apply/pages/CallbackPage.jsx
src/components/apply/pages/OnboardingPage.jsx
src/components/apply/pages/TeamPage.jsx
src/components/apply/team/RosterList.jsx
src/components/apply/team/InvitePanel.jsx
src/components/apply/team/PaymentPanel.jsx
src/components/apply/team/JoinCodePanel.jsx
src/components/apply/team/InviteCards.jsx
```

### API client details

- Base URL from `VITE_STARTATHON_API_BASE`.
- Wrapper adds `Authorization: Bearer` when a token exists, parses
  `{success, data}` / `{success, error}`, throws `ApiError { status, message }`.
- On 401 it clears stored auth so guards bounce to `/login`.

### Auth state

- `localStorage`: `access_token`, expiry timestamp (now + `expires_in`), `user` JSON.
- `useAuth()` context exposes `{ user, token, login(data), logout() }`.
- Expired-at-load tokens are treated as logged out.

### Reused

`TerminalInput`, `PhaseTransition` (page-enter animation), scanline/top-bar
styling patterns from the current `ApplyPage`.

### Deleted

`ApplyMethodDialog.jsx`, `phases/*.jsx` (all six), `PhaseShared.jsx`,
`BackgroundCanvas.jsx` (completes the Three.js removal from the 2026-07-10 spec),
and `inputs/MemberRow.jsx`, `inputs/TagInput.jsx`, `inputs/TerminalTextarea.jsx`
(nothing else uses them). `ApplyPage.jsx` shrinks to the `/apply` redirect hub.

### Config (env)

- `VITE_STARTATHON_API_BASE` = `https://api.sctcoding.club/api/v3/events/startathon`
- `VITE_UPI_ID` — UPI ID shown on the payment panel
- `VITE_UPI_QR` — path to the QR image (asset in `public/`)

## 4. Error handling

| Status | Rule |
|---|---|
| 400 | Prevented client-side where possible; otherwise show server `error` inline at the relevant field |
| 401 | Clear token, redirect `/login` |
| 403 | Shouldn't occur (leader-only UI hidden from members); surface `error` if it does |
| 404 on `GET /team` | Normal state — route to `/onboarding` |
| 409 | Show server `error` verbatim (written for users) |
| Network failure | Generic "connection failed" line + retry button on fetch-driven screens |

## 5. Testing

Manual walkthrough:

- Email signup → onboarding; login round-trip; wrong-password 401 message.
- Google sign-in end to end via `/auth/callback` (new + existing account).
- Forgot → email link → `/reset` → new password → login.
- Create team → join code shown; second account joins via code; third via invite
  (accept) and a decline case.
- Leader kick, member leave, leader disband (confirm step) — team dissolves.
- Payment: valid ref confirms team (badge flips, actions lock); bad ref shows 400
  message inline.
- Token expiry / manual token deletion → bounced to `/login`.
- `npm run lint` passes.
