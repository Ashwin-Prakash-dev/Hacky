# Referral Code UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a team share its own referral code and apply another team's code from the payment panel, reflecting the live ₹90/₹100 price from the API.

**Architecture:** One new API client method, one new presentational component (`ReferralCodePanel`, structurally identical to the existing `JoinCodePanel`), an additive rework of `PaymentPanel` to add a referral-code field with its own apply action, and wiring in `TeamPage`.

**Tech Stack:** React 18 (function components, hooks, no state library), Vite, plain inline `style` objects (no CSS modules/Tailwind classes used in these components — the `apply/` component tree is 100% inline-styled), no test framework, ESLint.

## Global Constraints

- **The dev server/build are explicitly authorized for this task** (user override of `CLAUDE.md`'s default restriction) — implementers and reviewers may run `npm run dev` and `npm run build` to verify.
- No test framework exists (`package.json` has no test runner) — verification is `npm run lint`, `npm run build`, and a `npm run dev` boot check.
- Referral field stays **editable even after a code is applied** — no locked/disabled state pre-payment (spec: `docs/superpowers/specs/2026-07-17-referral-ui-design.md`).
- `PaymentPanel`'s referral block requires no extra "hide when confirmed" guard inside the component — `TeamPage` already only renders `<PaymentPanel>` at all when `!confirmed`.
- Match existing file conventions exactly: relative imports (`../ui`, `../inputs/TerminalInput`), inline `style` objects (no new CSS files, no Tailwind classes), the same clipboard-copy pattern already used in `JoinCodePanel`/`PaymentPanel` (`navigator.clipboard.writeText` + 1.5s "copied ✓" reset, silently swallow rejection).
- API base URL / auth header handling is centralized in `request()` inside `src/lib/startathon.js` — new API methods must go through it exactly like every existing method, no direct `fetch` calls elsewhere.

---

## Task 1: API client — `applyReferral`

**Files:**
- Modify: `src/lib/startathon.js`

**Interfaces:**
- Consumes: existing `request(path, { method, body })` helper (already defined in this file).
- Produces: `api.applyReferral(code)` — used by Task 4's `TeamPage` handler.

- [ ] **Step 1: Add the new method**

In `src/lib/startathon.js`, find:

```js
  // payment
  submitPayment: (transactionId) =>
    request("/payment", { method: "POST", body: { transaction_id: transactionId } }),
};
```

Replace with:

```js
  // payment
  submitPayment: (transactionId) =>
    request("/payment", { method: "POST", body: { transaction_id: transactionId } }),
  applyReferral: (code) =>
    request("/team/referral", { method: "PUT", body: { referral_code: code } }),
};
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors from this file.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds (this file has no JSX, so a build failure here would mean a syntax typo — fix before continuing).

- [ ] **Step 4: Commit**

```bash
git add src/lib/startathon.js
git commit -m "feat: add applyReferral API client method"
```

---

## Task 2: `ReferralCodePanel` component

**Files:**
- Create: `src/components/apply/team/ReferralCodePanel.jsx`

**Interfaces:**
- Consumes: `MONO`, `LIME`, `Panel`, `Eyebrow`, `GhostButton` from `../ui` (all already exported, used identically by `JoinCodePanel.jsx`).
- Produces: `ReferralCodePanel` default export, props `{ code, count }` — `code: string`, `count: number | null | undefined`. Consumed by Task 4's `TeamPage`.

- [ ] **Step 1: Write the component**

Create `src/components/apply/team/ReferralCodePanel.jsx`:

```jsx
import { useState } from "react";
import { MONO, LIME, Panel, Eyebrow, GhostButton } from "../ui";

const pluralTeams = (n) => (n === 1 ? "1 team" : `${n} teams`);

const ReferralCodePanel = ({ code, count }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — code is selectable below
    }
  };

  return (
    <Panel maxWidth="none">
      <Eyebrow>REFERRAL CODE</Eyebrow>
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: "0.75rem",
      }}>
        <span style={{
          fontFamily: MONO, fontSize: "clamp(1.4rem, 4vw, 2rem)",
          fontWeight: 700, letterSpacing: "0.25em", color: LIME,
          userSelect: "all",
        }}>
          {code}
        </span>
        <GhostButton onClick={copy}>{copied ? "copied ✓" : "copy"}</GhostButton>
      </div>
      <p style={{
        fontFamily: MONO, fontSize: "0.85rem",
        color: "rgba(255,255,255,0.75)", marginTop: "0.75rem", lineHeight: 1.6,
      }}>
        {"// share this code — other teams get 10% off by using it"}
      </p>
      {count != null && (
        <p style={{
          fontFamily: MONO, fontSize: "0.85rem",
          color: "rgba(200,255,0,0.85)", marginTop: "0.35rem", lineHeight: 1.6,
        }}>
          {`// ${pluralTeams(count)} used your code so far`}
        </p>
      )}
    </Panel>
  );
};

export default ReferralCodePanel;
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors from this file.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds. (This component isn't imported anywhere yet, so Vite will only catch syntax errors, not usage errors — that's expected at this stage; integration verification happens in Task 4.)

- [ ] **Step 4: Commit**

```bash
git add src/components/apply/team/ReferralCodePanel.jsx
git commit -m "feat: add ReferralCodePanel component"
```

---

## Task 3: `PaymentPanel` — referral field + dynamic pricing

**Files:**
- Modify: `src/components/apply/team/PaymentPanel.jsx`

**Interfaces:**
- Consumes: `MONO`, `SANS`, `LIME`, `Panel`, `Eyebrow`, `ErrorLine`, `NoticeLine`, `PrimaryButton`, `GhostButton` from `../ui` (all already exist; `NoticeLine` is a new import for this file, already defined in `ui.jsx`). `TerminalInput` from `../inputs/TerminalInput` (already imported).
- Produces: `PaymentPanel` now takes three new props — `onApplyReferral: (code: string) => void`, `applyRefBusy: boolean`, `referralError: string` — on top of its existing `{ team, onSubmit, busy, error }`. Consumed by Task 4's `TeamPage`. Reads `team.expected_fee` (number, `90` or `100`) and `team.referred_by` (string or `null`) from the `team` object already returned by `GET /team`.

- [ ] **Step 1: Replace the file**

Replace the full contents of `src/components/apply/team/PaymentPanel.jsx` with:

```jsx
import { useState } from "react";
import TerminalInput from "../inputs/TerminalInput";
import {
  MONO, SANS, LIME, Panel, Eyebrow, ErrorLine, NoticeLine,
  PrimaryButton, GhostButton,
} from "../ui";

const UPI_ID = import.meta.env.VITE_UPI_ID;
const UPI_QR = import.meta.env.VITE_UPI_QR;

const PaymentPanel = ({
  team, onSubmit, busy, error,
  onApplyReferral, applyRefBusy, referralError,
}) => {
  const [ref, setRef] = useState("");
  const [refCode, setRefCode] = useState("");
  const [copied, setCopied] = useState(false);
  const isLeader = team.your_role === "leader";
  const fee = team.expected_fee ?? 100;

  if (!isLeader) {
    return (
      <Panel maxWidth="none">
        <Eyebrow>PAYMENT — ₹{fee}</Eyebrow>
        <p style={{
          fontFamily: MONO, fontSize: "0.9rem",
          color: "rgba(255,255,255,0.8)", marginTop: "0.75rem", lineHeight: 1.6,
        }}>
          {"// waiting for your leader to complete payment"}
        </p>
      </Panel>
    );
  }

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // UPI ID text below is selectable as fallback
    }
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(ref.trim());
  };

  const applyReferral = (e) => {
    e.preventDefault();
    if (!refCode.trim()) return;
    onApplyReferral(refCode.trim());
  };

  return (
    <Panel maxWidth="none">
      <Eyebrow>PAYMENT — ₹{fee}</Eyebrow>

      <form onSubmit={applyReferral} noValidate style={{ marginTop: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <TerminalInput
              label="Referral code (optional)" value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              style={{ fontFamily: MONO }}
            />
          </div>
          <div style={{ marginBottom: "1.75rem" }}>
            <GhostButton
              onClick={applyReferral}
              disabled={applyRefBusy || !refCode.trim()}
            >
              {applyRefBusy ? "applying…" : "Apply"}
            </GhostButton>
          </div>
        </div>
        <ErrorLine>{referralError}</ErrorLine>
        <NoticeLine>
          {team.referred_by ? "referral applied — pay ₹90 instead of ₹100" : ""}
        </NoticeLine>
      </form>

      <div style={{
        display: "flex", flexWrap: "wrap", gap: "1.25rem",
        alignItems: "flex-start", marginTop: "0.75rem",
      }}>
        {UPI_QR && (
          <img
            src={UPI_QR}
            alt={`UPI QR code for ${UPI_ID}`}
            style={{
              width: "140px", height: "140px", borderRadius: "6px",
              border: "0.5px solid rgba(255,255,255,0.12)", background: "#fff",
            }}
          />
        )}
        <div style={{ flex: "1 1 240px" }}>
          <p style={{ fontFamily: SANS, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Pay <b style={{ color: LIME }}>₹{fee}</b> to the UPI ID below (or scan the QR),
            then paste the transaction reference from your UPI app.
          </p>
          <p style={{
            fontFamily: MONO, fontSize: "0.9rem", color: "#fff",
            margin: "0.75rem 0", userSelect: "all",
          }}>
            {UPI_ID}{" "}
            <GhostButton onClick={copyUpi}>{copied ? "copied ✓" : "copy"}</GhostButton>
          </p>
          <form onSubmit={submit} noValidate>
            <TerminalInput
              label="UPI transaction reference" value={ref}
              onChange={(e) => setRef(e.target.value)}
              style={{ fontFamily: MONO }}
            />
            <ErrorLine>{error}</ErrorLine>
            <PrimaryButton type="submit" disabled={busy || !ref.trim()}>
              {busy ? "confirming…" : "Confirm payment"}
            </PrimaryButton>
          </form>
        </div>
      </div>
    </Panel>
  );
};

export default PaymentPanel;
```

Note on the two `<form>` elements: `GhostButton` (see `src/components/apply/ui.jsx`) always renders `type="button"`, so clicking "Apply" never triggers a native form submit — it fires `applyReferral` directly via `onClick`. The wrapping `<form onSubmit={applyReferral}>` exists only so pressing Enter while focused in the referral-code field also triggers the apply action (standard single-text-input browser behavior). Both paths call the same handler with a preventDefault-capable event, so this is safe either way — don't "simplify" this by removing the `<form>` wrapper, it would silently break the Enter-to-apply behavior.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors. (`NoticeLine` must show as used, not unused-import.)

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/apply/team/PaymentPanel.jsx
git commit -m "feat: add referral code field and dynamic pricing to PaymentPanel"
```

---

## Task 4: `TeamPage` wiring — render `ReferralCodePanel`, wire referral apply handler

**Files:**
- Modify: `src/pages/TeamPage.jsx`

**Interfaces:**
- Consumes: `ReferralCodePanel` (Task 2) — props `{ code, count }`. `PaymentPanel`'s new props (Task 3) — `onApplyReferral`, `applyRefBusy`, `referralError`. `api.applyReferral` (Task 1).
- Produces: fully working end-to-end referral UI on `/team`.

- [ ] **Step 1: Add the import**

In `src/pages/TeamPage.jsx`, find:

```jsx
import JoinCodePanel from "../components/apply/team/JoinCodePanel";
import RosterList from "../components/apply/team/RosterList";
import InvitePanel from "../components/apply/team/InvitePanel";
import PaymentPanel from "../components/apply/team/PaymentPanel";
```

Replace with:

```jsx
import JoinCodePanel from "../components/apply/team/JoinCodePanel";
import ReferralCodePanel from "../components/apply/team/ReferralCodePanel";
import RosterList from "../components/apply/team/RosterList";
import InvitePanel from "../components/apply/team/InvitePanel";
import PaymentPanel from "../components/apply/team/PaymentPanel";
```

- [ ] **Step 2: Add busy/error state**

Find:

```jsx
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState("");
  const [kickBusyId, setKickBusyId] = useState(null);
```

Replace with:

```jsx
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState("");
  const [applyRefBusy, setApplyRefBusy] = useState(false);
  const [applyRefError, setApplyRefError] = useState("");
  const [kickBusyId, setKickBusyId] = useState(null);
```

- [ ] **Step 3: Add the handler**

Find:

```jsx
  const pay = async (transactionId) => {
    if (kickBusyId || inviteBusy || payBusy || leaveBusy) return;
    setPayBusy(true);
    setPayError("");
    try {
      await api.submitPayment(transactionId);
      await refresh();
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPayBusy(false);
    }
  };
```

Replace with:

```jsx
  const pay = async (transactionId) => {
    if (kickBusyId || inviteBusy || payBusy || leaveBusy) return;
    setPayBusy(true);
    setPayError("");
    try {
      await api.submitPayment(transactionId);
      await refresh();
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPayBusy(false);
    }
  };

  const applyReferralCode = async (code) => {
    if (kickBusyId || inviteBusy || payBusy || leaveBusy || applyRefBusy) return;
    setApplyRefBusy(true);
    setApplyRefError("");
    try {
      await api.applyReferral(code);
      await refresh();
    } catch (err) {
      setApplyRefError(err.message);
    } finally {
      setApplyRefBusy(false);
    }
  };
```

This mirrors `pay`/`invite`/`kick` exactly: same busy-guard pattern (bail if any other mutation is in flight), same try/refresh/catch/finally shape.

- [ ] **Step 4: Render `ReferralCodePanel` and wire `PaymentPanel`'s new props**

Find:

```jsx
          <JoinCodePanel code={team.join_code} />

          <RosterList team={team} onKick={kick} busyId={kickBusyId} />

          {isLeader && !confirmed && team.members.length < 4 && (
            <InvitePanel
              onInvite={invite}
              busy={inviteBusy}
              error={inviteError}
              sentTo={inviteSentTo}
            />
          )}

          {!confirmed && (
            <PaymentPanel team={team} onSubmit={pay} busy={payBusy} error={payError} />
          )}
```

Replace with:

```jsx
          <JoinCodePanel code={team.join_code} />

          <ReferralCodePanel code={team.referral_code} count={team.referral_count} />

          <RosterList team={team} onKick={kick} busyId={kickBusyId} />

          {isLeader && !confirmed && team.members.length < 4 && (
            <InvitePanel
              onInvite={invite}
              busy={inviteBusy}
              error={inviteError}
              sentTo={inviteSentTo}
            />
          )}

          {!confirmed && (
            <PaymentPanel
              team={team} onSubmit={pay} busy={payBusy} error={payError}
              onApplyReferral={applyReferralCode}
              applyRefBusy={applyRefBusy}
              referralError={applyRefError}
            />
          )}
```

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: build succeeds — this is the first point where a prop-name mismatch between `TeamPage` and `PaymentPanel`/`ReferralCodePanel` could realistically surface as a runtime issue (JS has no compile-time prop checking, so a typo here won't fail the build, only misbehave at runtime — hence Step 7).

- [ ] **Step 7: Manual verification via dev server**

This app requires backend auth (signup/login against `api.sctcoding.club` or a local `wrangler dev` instance of the backend) to reach `/team` at all — there's no way to stub this from the frontend alone. Verify as follows:

Run: `npm run dev` (starts Vite on `http://localhost:3000`)

1. Confirm the dev server boots without error: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/` → expect `200`.
2. If you have a way to reach a real or local Startathon backend (check `.env` for `VITE_STARTATHON_API_BASE` — it may already point at the live API), sign up, create two teams (as in the backend's own verification flow), and in a browser:
   - Confirm `ReferralCodePanel` renders the team's `referral_code` with a working copy button.
   - As the leader of a second, unconfirmed team, type the first team's `referral_code` into the "Referral code (optional)" field in `PaymentPanel` and click "Apply" — confirm the `PAYMENT — ₹100` eyebrow updates to `PAYMENT — ₹90` and the notice line appears.
   - Confirm submitting an invalid code shows `referralError` without crashing the page.
   - Confirm the referral code field remains editable/usable after a successful apply (per the "always editable pre-payment" requirement).
3. If no backend is reachable in this environment, at minimum confirm the dev server serves `/team` without a JS console error by checking the browser devtools console is clean on page load (a broken import or undefined-prop crash will show there even before backend data loads, since React renders the shell immediately).

Report exactly what you were able to check — full backend-connected walkthrough, or dev-server-boots-clean only — in your report file.

- [ ] **Step 8: Commit**

```bash
git add src/pages/TeamPage.jsx
git commit -m "feat: wire referral code panel and apply handler into TeamPage"
```

---

## Self-Review Notes

- **Spec coverage:** API method (Task 1), `ReferralCodePanel` with code+copy+leader-only count (Task 2), `PaymentPanel`'s referral field/apply button/dynamic pricing/notice/always-editable behavior (Task 3), `TeamPage` wiring including the "hide when confirmed" behavior inherited for free from the existing `{!confirmed && <PaymentPanel/>}` gate (Task 4) — all spec sections have a task.
- **No placeholders**, every step has complete code.
- **Type/prop consistency checked:** `ReferralCodePanel({ code, count })` in Task 2 matches `<ReferralCodePanel code={team.referral_code} count={team.referral_count} />` in Task 4. `PaymentPanel`'s new props `onApplyReferral`/`applyRefBusy`/`referralError` in Task 3 match the JSX passed in Task 4 exactly.
- **Out-of-scope items** (tiered individual-fee UI, clear-referral endpoint, pre-team-creation entry point) are not tasked — correctly excluded per spec.
