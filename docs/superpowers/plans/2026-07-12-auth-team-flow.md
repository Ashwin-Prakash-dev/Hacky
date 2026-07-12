# Auth + Team Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/apply` application form with a full auth (email + Google, password reset) and team-management flow against the Startathon API v3.

**Architecture:** Top-level routes (`/login`, `/signup`, `/forgot`, `/reset`, `/auth/callback`, `/onboarding`, `/team`) with `/apply` as a redirect hub. A thin fetch-based API client (`src/lib/startathon.js`) and localStorage auth store (`src/lib/auth.js`) feed state-driven pages; `GET /team` is the single source of truth after every mutation. Terminal aesthetic reuses `TerminalInput` and a GSAP-rewritten `PhaseTransition`.

**Tech Stack:** React 18, react-router-dom v7, GSAP, plain fetch, Vite env vars.

**Spec:** `docs/superpowers/specs/2026-07-12-auth-team-flow-design.md`

## Global Constraints

- **No test framework exists in this repo.** Verification per task = `npm run lint` (must pass with zero new warnings) + code review. Full manual browser walkthrough happens at the end (spec §5). **Do NOT run `npm run dev`/`build`/`preview`/`deploy`** — CLAUDE.md forbids it unless the user explicitly asks.
- API base: `https://api.sctcoding.club/api/v3/events/startathon` via `VITE_STARTATHON_API_BASE`. Payment display: `VITE_UPI_ID`, `VITE_UPI_QR`.
- API envelope: success `{ success: true, data }`, failure `{ success: false, error }` (error strings are user-facing — show verbatim).
- Status rules: 401 → clear token, land on `/login`; 404 on `GET /team` → `/onboarding` (normal state); 409 → show server `error` verbatim; network failure → generic retry message.
- Visual language: bg `#0a0a0a`, lime `#C8FF00`, monospace eyebrows/labels like `[AUTHENTICATE]`, sans `var(--font-general, sans-serif)`, CRT scanline overlay, panels `rgba(12,12,12,0.96)` with `0.5px solid rgba(200,255,0,0.14)` border, radius 8px.
- Copy rule: the "applications open soon" notice reads exactly: `APPLICATIONS OPEN SOON — once submissions open, your team will apply with its idea here.`
- The working tree already has uncommitted in-progress changes to `ApplyPage.jsx` / `PhaseTransition.jsx` and an untracked `ApplyMethodDialog.jsx` from the previous rework — these get overwritten/deleted by Tasks 2, 6, and 8; that is expected.
- Commit after every task with the trailer:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: API client + auth storage

**Files:**
- Create: `src/lib/auth.js`
- Create: `src/lib/startathon.js`
- Create: `.env.example`

**Interfaces:**
- Consumes: nothing (leaf modules).
- Produces:
  - `auth.js`: `saveAuth({access_token, expires_in, user})`, `clearAuth()`, `getToken(): string|null` (null + auto-clear when expired), `getUser(): object|null`, `isAuthed(): boolean`.
  - `startathon.js`: `class ApiError extends Error { status: number }` (status `0` = network failure) and `api.{signup, login, googleInit, googleCallback, requestReset, verifyReset, createTeam, getTeam, invite, joinTeam, leaveTeam, kickMember, listInvites, acceptInvite, declineInvite, submitPayment}` — every function returns the unwrapped `data` object or throws `ApiError`.

- [ ] **Step 1: Write `src/lib/auth.js`**

```js
const KEY_TOKEN = "st_access_token";
const KEY_EXP   = "st_token_expiry";
const KEY_USER  = "st_user";

export function saveAuth({ access_token, expires_in, user }) {
  localStorage.setItem(KEY_TOKEN, access_token);
  localStorage.setItem(KEY_EXP, String(Date.now() + expires_in * 1000));
  localStorage.setItem(KEY_USER, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_EXP);
  localStorage.removeItem(KEY_USER);
}

export function getToken() {
  const token = localStorage.getItem(KEY_TOKEN);
  const expiry = Number(localStorage.getItem(KEY_EXP) || 0);
  if (!token || Date.now() >= expiry) {
    clearAuth();
    return null;
  }
  return token;
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY_USER));
  } catch {
    return null;
  }
}

export const isAuthed = () => getToken() !== null;
```

- [ ] **Step 2: Write `src/lib/startathon.js`**

```js
import { getToken, clearAuth } from "./auth";

const BASE = import.meta.env.VITE_STARTATHON_API_BASE;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = network failure
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "connection failed — check your network and retry");
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON body; fall through to error below
  }

  if (res.ok && json?.success) return json.data;
  if (res.status === 401) clearAuth();
  throw new ApiError(res.status, json?.error || "something went wrong — try again");
}

export const api = {
  // auth
  signup: (fields) => request("/auth/signup", { method: "POST", body: fields }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  googleInit: () => request("/auth/google"),
  googleCallback: (code, state) =>
    request(
      `/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
    ),
  requestReset: (email) =>
    request("/auth/password/reset", { method: "POST", body: { email } }),
  verifyReset: (token, newPassword) =>
    request("/auth/password/reset/verify", {
      method: "POST",
      body: { token, new_password: newPassword },
    }),

  // team
  createTeam: (teamName) =>
    request("/team", { method: "POST", body: { team_name: teamName } }),
  getTeam: () => request("/team"),
  invite: (email, name) =>
    request("/team/invite", {
      method: "POST",
      body: name ? { email, name } : { email },
    }),
  joinTeam: (joinCode) =>
    request("/team/join", { method: "POST", body: { join_code: joinCode } }),
  leaveTeam: () => request("/team/leave", { method: "POST" }),
  kickMember: (userId) =>
    request(`/team/members/${encodeURIComponent(userId)}/kick`, { method: "POST" }),

  // invites (receiving side)
  listInvites: () => request("/invites"),
  acceptInvite: (id) =>
    request(`/invites/${encodeURIComponent(id)}/accept`, { method: "POST" }),
  declineInvite: (id) =>
    request(`/invites/${encodeURIComponent(id)}/decline`, { method: "POST" }),

  // payment
  submitPayment: (transactionId) =>
    request("/payment", { method: "POST", body: { transaction_id: transactionId } }),
};
```

- [ ] **Step 3: Write `.env.example`**

```
VITE_STARTATHON_API_BASE=https://api.sctcoding.club/api/v3/events/startathon
VITE_UPI_ID=example@upi
VITE_UPI_QR=/upi-qr.png
```

Also check whether a `.env` file exists in the repo root (it is gitignored). If it exists, append the same three variables with real values if known, otherwise the example values. If it does not exist, create it as a copy of `.env.example`.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: passes (no errors in the two new files; pre-existing warnings elsewhere are acceptable).

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.js src/lib/startathon.js .env.example
git commit -m "feat: startathon api client and auth storage"
```

---

### Task 2: UI primitives, AuthShell, GSAP PhaseTransition

**Files:**
- Create: `src/components/apply/ui.jsx`
- Create: `src/components/apply/AuthShell.jsx`
- Rewrite (overwrite entirely): `src/components/apply/PhaseTransition.jsx`

**Interfaces:**
- Consumes: `gsap`, `react-router-dom` `Link`.
- Produces:
  - `ui.jsx`: `MONO`, `SANS`, `LIME` (style constants); components `Panel({maxWidth?, children})`, `Eyebrow({children})` (renders `[CHILDREN]`), `Title({children})`, `ErrorLine({children})` (renders nothing when falsy), `NoticeLine({children})`, `PrimaryButton({type?, disabled?, onClick?, children})` (full-width lime), `GhostButton({onClick, disabled?, danger?, children})` (borderless mono text button), `GoogleButton({onClick, disabled?})`, `MonoLink({to, children})`, `Divider()`.
  - `AuthShell.jsx`: default export `AuthShell({label, right?, children})` — full-page chrome (bg, lime glow, scanlines, fixed top bar with logo / `[label]` / right slot defaulting to an `✕ Exit` link to `/`), children centered in the viewport.
  - `PhaseTransition.jsx`: default export `PhaseTransition({direction?, children})` — pure GSAP 0.5s fade+slide wrapper, no Three.js imports.

- [ ] **Step 1: Write `src/components/apply/ui.jsx`**

```jsx
import { Link } from "react-router-dom";

export const MONO = "monospace";
export const SANS = "var(--font-general, sans-serif)";
export const LIME = "#C8FF00";

export const Panel = ({ maxWidth = "440px", children }) => (
  <div style={{
    width: "100%", maxWidth,
    background: "rgba(12,12,12,0.96)",
    border: "0.5px solid rgba(200,255,0,0.14)",
    borderRadius: "8px",
    padding: "clamp(1.5rem, 4vw, 2.5rem)",
  }}>
    {children}
  </div>
);

export const Eyebrow = ({ children }) => (
  <p style={{
    fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.16em",
    color: "rgba(200,255,0,0.75)", marginBottom: "0.6rem",
  }}>
    [{children}]
  </p>
);

export const Title = ({ children }) => (
  <p style={{
    fontFamily: SANS, fontSize: "clamp(1.4rem, 4vw, 1.9rem)", fontWeight: 700,
    color: "#fff", letterSpacing: "-0.01em", marginBottom: "1.5rem",
  }}>
    {children}
  </p>
);

export const ErrorLine = ({ children }) =>
  children ? (
    <p style={{
      fontFamily: MONO, fontSize: "0.75rem", lineHeight: 1.6,
      color: "rgba(255,107,107,0.9)", margin: "0.25rem 0 1rem",
    }}>
      {"// "}{children}
    </p>
  ) : null;

export const NoticeLine = ({ children }) =>
  children ? (
    <p style={{
      fontFamily: MONO, fontSize: "0.75rem", lineHeight: 1.6,
      color: "rgba(200,255,0,0.8)", margin: "0.25rem 0 1rem",
    }}>
      {"// "}{children}
    </p>
  ) : null;

export const PrimaryButton = ({ type = "button", disabled = false, onClick, children }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    style={{
      width: "100%", padding: "0.9rem 2rem",
      background: disabled ? "rgba(200,255,0,0.35)" : LIME,
      color: "#000", border: "none", borderRadius: "4px",
      fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.14em",
      fontWeight: 700, textTransform: "uppercase",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s",
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(200,255,0,0.22)";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {children}
  </button>
);

export const GhostButton = ({ onClick, disabled = false, danger = false, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      background: "none", border: "none", padding: 0,
      fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.06em",
      color: danger ? "rgba(255,107,107,0.7)" : "rgba(255,255,255,0.45)",
      cursor: disabled ? "not-allowed" : "pointer",
      textDecoration: "underline", textUnderlineOffset: "3px",
      transition: "color 0.2s",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.color = danger ? "#ff6b6b" : "#fff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = danger ? "rgba(255,107,107,0.7)" : "rgba(255,255,255,0.45)";
    }}
  >
    {children}
  </button>
);

export const GoogleButton = ({ onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      gap: "0.6rem", padding: "0.85rem 2rem",
      background: "rgba(255,255,255,0.04)",
      border: "0.5px solid rgba(255,255,255,0.16)", borderRadius: "4px",
      color: "#fff", fontFamily: SANS, fontSize: "0.85rem", fontWeight: 500,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "border-color 0.2s, background 0.2s",
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
        e.currentTarget.style.background = "rgba(255,255,255,0.07)";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
    }}
  >
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/>
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/>
    </svg>
    Continue with Google
  </button>
);

export const MonoLink = ({ to, children }) => (
  <Link
    to={to}
    style={{
      fontFamily: MONO, fontSize: "0.75rem", letterSpacing: "0.03em",
      color: "rgba(200,255,0,0.7)", textDecoration: "underline",
      textUnderlineOffset: "3px",
    }}
  >
    {children}
  </Link>
);

export const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", margin: "1.4rem 0" }}>
    <span style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
    <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>or</span>
    <span style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
  </div>
);
```

- [ ] **Step 2: Write `src/components/apply/AuthShell.jsx`**

```jsx
import { Link } from "react-router-dom";
import { MONO, SANS } from "./ui";

const AuthShell = ({ label, right = null, children }) => (
  <div style={{ minHeight: "100dvh", background: "#0a0a0a", position: "relative" }}>
    {/* Lime glow */}
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
      background: "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(200,255,0,0.05), transparent 70%)",
    }} />

    {/* CRT scanlines */}
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none",
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)",
    }} />

    {/* Top bar */}
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: "56px", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(1.25rem, 4vw, 2.5rem)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(10,10,10,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}>
      <Link to="/" style={{
        fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700,
        letterSpacing: "-0.01em", color: "#fff", textDecoration: "none",
      }}>
        Startathon<span style={{ color: "#888" }}>.</span>
      </Link>

      <span style={{
        fontFamily: MONO, fontSize: "0.65rem",
        letterSpacing: "0.12em", color: "rgba(200,255,0,0.55)",
      }}>
        [{label}]
      </span>

      {right ?? (
        <Link to="/" style={{
          fontFamily: SANS, fontSize: "0.65rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
          textDecoration: "none",
        }}>
          ✕ Exit
        </Link>
      )}
    </header>

    {/* Content */}
    <main style={{
      position: "relative", zIndex: 10, minHeight: "100dvh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "calc(56px + 2rem) clamp(1rem, 4vw, 2rem) 3rem",
    }}>
      {children}
    </main>
  </div>
);

export default AuthShell;
```

- [ ] **Step 3: Overwrite `src/components/apply/PhaseTransition.jsx`** (replaces the Three.js dissolve entirely)

```jsx
import { useRef, useEffect } from "react";
import gsap from "gsap";

const PhaseTransition = ({ direction = "forward", children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const x = direction === "back" ? -28 : 28;
    gsap.fromTo(ref.current,
      { opacity: 0, x },
      { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }
    );
  }, [direction]);

  return (
    <div ref={ref} style={{ width: "100%", display: "flex", justifyContent: "center", opacity: 0 }}>
      {children}
    </div>
  );
};

export default PhaseTransition;
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/components/apply/ui.jsx src/components/apply/AuthShell.jsx src/components/apply/PhaseTransition.jsx
git commit -m "feat: auth shell, ui primitives, gsap phase transition"
```

---

### Task 3: Login + Signup pages and routes

**Files:**
- Create: `src/components/apply/pages/LoginPage.jsx`
- Create: `src/components/apply/pages/SignupPage.jsx`
- Modify: `src/App.jsx` (add `/login`, `/signup` routes)

**Interfaces:**
- Consumes: `api.login`, `api.signup`, `api.googleInit`, `ApiError` (Task 1); `saveAuth` (Task 1); `AuthShell`, `PhaseTransition`, `ui.jsx` components (Task 2); `TerminalInput` (existing — props: `label`, `error`, plus native input props).
- Produces: default-export page components `LoginPage`, `SignupPage`, routed at `/login` and `/signup`. LoginPage reads `location.state.notice` (string) — Task 4's ResetPage navigates here with it.

- [ ] **Step 1: Write `src/components/apply/pages/LoginPage.jsx`**

```jsx
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../AuthShell";
import PhaseTransition from "../PhaseTransition";
import TerminalInput from "../inputs/TerminalInput";
import {
  Panel, Eyebrow, Title, ErrorLine, NoticeLine,
  PrimaryButton, GoogleButton, MonoLink, Divider,
} from "../ui";
import { api } from "../../../lib/startathon";
import { saveAuth, isAuthed } from "../../../lib/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthed()) return <Navigate to="/apply" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("email and password are required");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await api.login(email.trim().toLowerCase(), password);
      saveAuth(data);
      navigate("/apply", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError("");
    try {
      const { auth_url } = await api.googleInit();
      window.location.assign(auth_url);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell label="AUTHENTICATE">
      <PhaseTransition>
        <Panel>
          <Eyebrow>AUTHENTICATE</Eyebrow>
          <Title>Log in to Startathon</Title>
          <NoticeLine>{state?.notice}</NoticeLine>
          <form onSubmit={submit} noValidate>
            <TerminalInput
              label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TerminalInput
              label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <ErrorLine>{error}</ErrorLine>
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? "authenticating…" : "Log in"}
            </PrimaryButton>
          </form>
          <Divider />
          <GoogleButton onClick={google} disabled={busy} />
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "baseline", marginTop: "1.5rem",
          }}>
            <MonoLink to="/forgot">forgot password?</MonoLink>
            <MonoLink to="/signup">no account? sign up →</MonoLink>
          </div>
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default LoginPage;
```

- [ ] **Step 2: Write `src/components/apply/pages/SignupPage.jsx`**

```jsx
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../AuthShell";
import PhaseTransition from "../PhaseTransition";
import TerminalInput from "../inputs/TerminalInput";
import {
  Panel, Eyebrow, Title, ErrorLine,
  PrimaryButton, GoogleButton, MonoLink, Divider,
} from "../ui";
import { api } from "../../../lib/startathon";
import { saveAuth, isAuthed } from "../../../lib/auth";

const validate = ({ name, email, password, phone, college }) => {
  if (!name.trim() || name.trim().length > 100) return "name must be 1–100 characters";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "enter a valid email";
  if (password.length < 8 || password.length > 100) return "password must be 8–100 characters";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return "phone must be 10–15 digits";
  if (!college.trim() || college.trim().length > 150) return "college must be 1–150 characters";
  return null;
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    name: "", email: "", password: "", phone: "", college: "",
  });
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isAuthed()) return <Navigate to="/apply" replace />;

  const set = (key) => (e) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const invalid = validate(fields);
    if (invalid) {
      setError(invalid);
      setConflict(false);
      return;
    }
    setBusy(true);
    setError("");
    setConflict(false);
    try {
      const data = await api.signup({
        name: fields.name.trim(),
        email: fields.email.trim().toLowerCase(),
        password: fields.password,
        phone: fields.phone.replace(/\D/g, ""),
        college: fields.college.trim(),
      });
      saveAuth(data);
      navigate("/apply", { replace: true });
    } catch (err) {
      setError(err.message);
      setConflict(err.status === 409);
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError("");
    try {
      const { auth_url } = await api.googleInit();
      window.location.assign(auth_url);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell label="NEW OPERATIVE">
      <PhaseTransition>
        <Panel maxWidth="480px">
          <Eyebrow>NEW OPERATIVE</Eyebrow>
          <Title>Create your account</Title>
          <form onSubmit={submit} noValidate>
            <TerminalInput
              label="Full name" value={fields.name}
              onChange={set("name")} autoComplete="name"
            />
            <TerminalInput
              label="Email" type="email" value={fields.email}
              onChange={set("email")} autoComplete="email"
            />
            <TerminalInput
              label="Password (min 8 characters)" type="password"
              value={fields.password} onChange={set("password")}
              autoComplete="new-password"
            />
            <TerminalInput
              label="Phone" type="tel" value={fields.phone}
              onChange={set("phone")} autoComplete="tel"
            />
            <TerminalInput
              label="College" value={fields.college}
              onChange={set("college")} autoComplete="organization"
            />
            <ErrorLine>
              {error}
              {conflict && <> — <MonoLink to="/login">log in instead</MonoLink></>}
            </ErrorLine>
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? "creating…" : "Sign up"}
            </PrimaryButton>
          </form>
          <Divider />
          <GoogleButton onClick={google} disabled={busy} />
          <div style={{ textAlign: "right", marginTop: "1.5rem" }}>
            <MonoLink to="/login">have an account? log in →</MonoLink>
          </div>
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default SignupPage;
```

- [ ] **Step 3: Add routes in `src/App.jsx`**

Add imports below the existing `ApplyPage` import:

```jsx
import LoginPage from "./components/apply/pages/LoginPage";
import SignupPage from "./components/apply/pages/SignupPage";
```

Add routes inside `<Routes>` after the `/apply` route:

```jsx
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/components/apply/pages/LoginPage.jsx src/components/apply/pages/SignupPage.jsx src/App.jsx
git commit -m "feat: login and signup pages with google oauth entry"
```

---

### Task 4: Forgot + Reset pages and routes

**Files:**
- Create: `src/components/apply/pages/ForgotPage.jsx`
- Create: `src/components/apply/pages/ResetPage.jsx`
- Modify: `src/App.jsx` (add `/forgot`, `/reset` routes)

**Interfaces:**
- Consumes: `api.requestReset`, `api.verifyReset` (Task 1); Task 2 components; `TerminalInput`.
- Produces: pages at `/forgot` and `/reset?token=…`. ResetPage on success navigates to `/login` with `state.notice = "password set — log in with it below"`.

- [ ] **Step 1: Write `src/components/apply/pages/ForgotPage.jsx`**

```jsx
import { useState } from "react";
import AuthShell from "../AuthShell";
import PhaseTransition from "../PhaseTransition";
import TerminalInput from "../inputs/TerminalInput";
import { Panel, Eyebrow, Title, ErrorLine, NoticeLine, PrimaryButton, MonoLink } from "../ui";
import { api } from "../../../lib/startathon";

const ForgotPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("enter a valid email");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.requestReset(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      // API always 200s for valid requests; only network/500 land here
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell label="RESET ACCESS">
      <PhaseTransition>
        <Panel>
          <Eyebrow>RESET ACCESS</Eyebrow>
          <Title>Forgot your password?</Title>
          {sent ? (
            <>
              <NoticeLine>
                if that account exists, a reset link is on its way — check your inbox
              </NoticeLine>
              <div style={{ marginTop: "1.5rem" }}>
                <MonoLink to="/login">← back to login</MonoLink>
              </div>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              <TerminalInput
                label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <ErrorLine>{error}</ErrorLine>
              <PrimaryButton type="submit" disabled={busy}>
                {busy ? "sending…" : "Send reset link"}
              </PrimaryButton>
              <div style={{ textAlign: "right", marginTop: "1.5rem" }}>
                <MonoLink to="/login">← back to login</MonoLink>
              </div>
            </form>
          )}
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default ForgotPage;
```

- [ ] **Step 2: Write `src/components/apply/pages/ResetPage.jsx`**

```jsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../AuthShell";
import PhaseTransition from "../PhaseTransition";
import TerminalInput from "../inputs/TerminalInput";
import { Panel, Eyebrow, Title, ErrorLine, PrimaryButton, MonoLink } from "../ui";
import { api } from "../../../lib/startathon";

const ResetPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8 || password.length > 100) {
      setError("password must be 8–100 characters");
      return;
    }
    if (password !== confirm) {
      setError("passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.verifyReset(token, password);
      navigate("/login", {
        replace: true,
        state: { notice: "password set — log in with it below" },
      });
    } catch (err) {
      setError(err.message);
      setExpired(err.status === 400);
      setBusy(false);
    }
  };

  return (
    <AuthShell label="SET PASSWORD">
      <PhaseTransition>
        <Panel>
          <Eyebrow>SET PASSWORD</Eyebrow>
          <Title>Choose a new password</Title>
          {!token ? (
            <>
              <ErrorLine>this link is missing its token — request a new one</ErrorLine>
              <MonoLink to="/forgot">request a new reset link →</MonoLink>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              <TerminalInput
                label="New password (min 8 characters)" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <TerminalInput
                label="Confirm password" type="password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              <ErrorLine>
                {error}
                {expired && <> — <MonoLink to="/forgot">request a new link</MonoLink></>}
              </ErrorLine>
              <PrimaryButton type="submit" disabled={busy}>
                {busy ? "saving…" : "Set password"}
              </PrimaryButton>
            </form>
          )}
        </Panel>
      </PhaseTransition>
    </AuthShell>
  );
};

export default ResetPage;
```

- [ ] **Step 3: Add routes in `src/App.jsx`**

```jsx
import ForgotPage from "./components/apply/pages/ForgotPage";
import ResetPage from "./components/apply/pages/ResetPage";
```

```jsx
<Route path="/forgot" element={<ForgotPage />} />
<Route path="/reset" element={<ResetPage />} />
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/components/apply/pages/ForgotPage.jsx src/components/apply/pages/ResetPage.jsx src/App.jsx
git commit -m "feat: forgot and reset password pages"
```

---

### Task 5: Google OAuth callback page

**Files:**
- Create: `src/components/apply/pages/CallbackPage.jsx`
- Modify: `src/App.jsx` (add `/auth/callback` route)

**Interfaces:**
- Consumes: `api.googleCallback(code, state)` (Task 1), `saveAuth` (Task 1), Task 2 components.
- Produces: page at `/auth/callback` — exchanges `?code=&state=` for a JWT, stores it, redirects to `/apply`. (Backend requirement, already noted in spec: Google's redirect_uri must point at this route.)

- [ ] **Step 1: Write `src/components/apply/pages/CallbackPage.jsx`**

```jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../AuthShell";
import { Panel, Eyebrow, Title, ErrorLine, NoticeLine, MonoLink } from "../ui";
import { api } from "../../../lib/startathon";
import { saveAuth } from "../../../lib/auth";

const CallbackPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const ran = useRef(false); // guard StrictMode double-invoke

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) {
      setError("missing code or state in the callback URL");
      return;
    }

    api.googleCallback(code, state)
      .then((data) => {
        saveAuth(data);
        navigate("/apply", { replace: true });
      })
      .catch((err) => setError(err.message));
  }, [params, navigate]);

  return (
    <AuthShell label="GOOGLE AUTH">
      <Panel>
        <Eyebrow>GOOGLE AUTH</Eyebrow>
        {error ? (
          <>
            <Title>Sign-in failed</Title>
            <ErrorLine>{error}</ErrorLine>
            <MonoLink to="/login">← back to login</MonoLink>
          </>
        ) : (
          <>
            <Title>Signing you in…</Title>
            <NoticeLine>exchanging credentials with Google</NoticeLine>
          </>
        )}
      </Panel>
    </AuthShell>
  );
};

export default CallbackPage;
```

- [ ] **Step 2: Add route in `src/App.jsx`**

```jsx
import CallbackPage from "./components/apply/pages/CallbackPage";
```

```jsx
<Route path="/auth/callback" element={<CallbackPage />} />
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/apply/pages/CallbackPage.jsx src/App.jsx
git commit -m "feat: google oauth callback page"
```

---

### Task 6: RequireAuth guard, /apply hub, Onboarding page

**Files:**
- Create: `src/components/apply/RequireAuth.jsx`
- Create: `src/components/apply/team/InviteCards.jsx`
- Create: `src/components/apply/pages/OnboardingPage.jsx`
- Rewrite (overwrite entirely): `src/components/apply/ApplyPage.jsx`
- Modify: `src/App.jsx` (guarded `/onboarding` route)

**Interfaces:**
- Consumes: `api.getTeam`, `api.listInvites`, `api.acceptInvite`, `api.declineInvite`, `api.createTeam`, `api.joinTeam` (Task 1); `isAuthed`, `getUser`, `clearAuth` (Task 1); Task 2 components; `TerminalInput`.
- Produces:
  - `RequireAuth` — layout route (`<Outlet />` when authed, else `<Navigate to="/login" replace />`). Task 7 reuses it for `/team`.
  - `InviteCards({ invites, onAccept, onDecline, busyId })` — `invites` is the API's `Invite[]` (`invite_id`, `team_name`, `invited_by`, `created_at`).
  - `ApplyPage` — redirect hub only (spec §1).
  - `OnboardingPage` at `/onboarding`.
  - Shared logout pattern: header-right `GhostButton` calling `clearAuth()` then `navigate("/login", { replace: true })` — Task 7 repeats it.

- [ ] **Step 1: Write `src/components/apply/RequireAuth.jsx`**

```jsx
import { Navigate, Outlet } from "react-router-dom";
import { isAuthed } from "../../lib/auth";

const RequireAuth = () => (isAuthed() ? <Outlet /> : <Navigate to="/login" replace />);

export default RequireAuth;
```

- [ ] **Step 2: Overwrite `src/components/apply/ApplyPage.jsx`** — the whole 6-phase wizard + method dialog + success screen goes away; this file becomes only the redirect hub. (Old imports of `BackgroundCanvas`, phases, `ApplyMethodDialog` disappear here; the files themselves are deleted in Task 8.)

```jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";
import { Panel, Eyebrow, Title, ErrorLine, MONO, PrimaryButton } from "./ui";
import { api } from "../../lib/startathon";
import { isAuthed } from "../../lib/auth";

const ApplyPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isAuthed()) {
      navigate("/login", { replace: true });
      return;
    }
    let cancelled = false;
    setError("");
    api.getTeam()
      .then(() => { if (!cancelled) navigate("/team", { replace: true }); })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) navigate("/onboarding", { replace: true });
        else if (err.status === 401) navigate("/login", { replace: true });
        else setError(err.message);
      });
    return () => { cancelled = true; };
  }, [navigate, attempt]);

  return (
    <AuthShell label="APPLY">
      <Panel>
        <Eyebrow>APPLY</Eyebrow>
        {error ? (
          <>
            <Title>Connection trouble</Title>
            <ErrorLine>{error}</ErrorLine>
            <PrimaryButton onClick={() => setAttempt((a) => a + 1)}>Retry</PrimaryButton>
          </>
        ) : (
          <p style={{ fontFamily: MONO, fontSize: "0.8rem", color: "rgba(200,255,0,0.7)" }}>
            {"// checking your status…"}
          </p>
        )}
      </Panel>
    </AuthShell>
  );
};

export default ApplyPage;
```

- [ ] **Step 3: Write `src/components/apply/team/InviteCards.jsx`**

```jsx
import { MONO, SANS, GhostButton, PrimaryButton } from "../ui";

const InviteCards = ({ invites, onAccept, onDecline, busyId }) => {
  if (!invites.length) return null;
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <p style={{
        fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.14em",
        color: "rgba(200,255,0,0.75)", marginBottom: "0.75rem",
      }}>
        [PENDING INVITES]
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {invites.map((inv) => (
          <div key={inv.invite_id} style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: "0.75rem",
            padding: "0.9rem 1.1rem",
            background: "rgba(200,255,0,0.04)",
            border: "0.5px solid rgba(200,255,0,0.25)", borderRadius: "6px",
          }}>
            <div>
              <p style={{ fontFamily: MONO, fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                {inv.team_name}
              </p>
              <p style={{ fontFamily: SANS, fontSize: "0.75rem", color: "rgba(255,255,255,0.55)" }}>
                invited by {inv.invited_by}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "110px" }}>
                <PrimaryButton
                  disabled={busyId === inv.invite_id}
                  onClick={() => onAccept(inv.invite_id)}
                >
                  Accept
                </PrimaryButton>
              </div>
              <GhostButton
                danger
                disabled={busyId === inv.invite_id}
                onClick={() => onDecline(inv.invite_id)}
              >
                decline
              </GhostButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviteCards;
```

- [ ] **Step 4: Write `src/components/apply/pages/OnboardingPage.jsx`**

```jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../AuthShell";
import PhaseTransition from "../PhaseTransition";
import TerminalInput from "../inputs/TerminalInput";
import InviteCards from "../team/InviteCards";
import {
  MONO, SANS, Panel, Eyebrow, Title, ErrorLine,
  PrimaryButton, GhostButton,
} from "../ui";
import { api } from "../../../lib/startathon";
import { getUser, clearAuth } from "../../../lib/auth";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [invites, setInvites] = useState([]);
  const [inviteError, setInviteError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [teamName, setTeamName] = useState("");
  const [createError, setCreateError] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadInvites = useCallback(() => {
    api.listInvites()
      .then((data) => setInvites(data.invites))
      .catch(() => {}); // invites list failing is non-fatal
  }, []);

  useEffect(() => {
    // Already on a team? Direct-navigation guard: bounce to the dashboard.
    api.getTeam()
      .then(() => navigate("/team", { replace: true }))
      .catch((err) => {
        if (err.status === 401) navigate("/login", { replace: true });
        // 404 = teamless, the expected state — stay here
      });
    loadInvites();
  }, [navigate, loadInvites]);

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const accept = async (id) => {
    setBusyId(id);
    setInviteError("");
    try {
      await api.acceptInvite(id);
      navigate("/team", { replace: true });
    } catch (err) {
      setInviteError(err.message);
      setBusyId(null);
      loadInvites();
    }
  };

  const decline = async (id) => {
    setBusyId(id);
    setInviteError("");
    try {
      await api.declineInvite(id);
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setBusyId(null);
      loadInvites();
    }
  };

  const createTeam = async (e) => {
    e.preventDefault();
    const name = teamName.trim();
    if (name.length < 2 || name.length > 60) {
      setCreateError("team name must be 2–60 characters");
      return;
    }
    setBusy(true);
    setCreateError("");
    try {
      await api.createTeam(name);
      navigate("/team", { replace: true });
    } catch (err) {
      setCreateError(err.message);
      setBusy(false);
    }
  };

  const joinTeam = async (e) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setJoinError("enter a join code");
      return;
    }
    setBusy(true);
    setJoinError("");
    try {
      await api.joinTeam(code);
      navigate("/team", { replace: true });
    } catch (err) {
      setJoinError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell
      label="FORM YOUR TEAM"
      right={<GhostButton onClick={logout}>logout</GhostButton>}
    >
      <PhaseTransition>
        <div style={{ width: "100%", maxWidth: "760px" }}>
          <p style={{
            fontFamily: MONO, fontSize: "0.78rem",
            color: "rgba(200,255,0,0.7)", marginBottom: "1.5rem",
          }}>
            {"// logged in as "}{user?.name ?? "operative"}
          </p>

          <InviteCards
            invites={invites}
            onAccept={accept}
            onDecline={decline}
            busyId={busyId}
          />
          <ErrorLine>{inviteError}</ErrorLine>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}>
            <Panel maxWidth="none">
              <Eyebrow>CREATE A TEAM</Eyebrow>
              <Title>Lead your own crew</Title>
              <form onSubmit={createTeam} noValidate>
                <TerminalInput
                  label="Team name (2–60 characters)" value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
                <ErrorLine>{createError}</ErrorLine>
                <PrimaryButton type="submit" disabled={busy}>
                  Create team
                </PrimaryButton>
              </form>
            </Panel>

            <Panel maxWidth="none">
              <Eyebrow>JOIN A TEAM</Eyebrow>
              <Title>Have a join code?</Title>
              <form onSubmit={joinTeam} noValidate>
                <TerminalInput
                  label="Join code" value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  style={{ fontFamily: MONO, letterSpacing: "0.2em", textTransform: "uppercase" }}
                />
                <ErrorLine>{joinError}</ErrorLine>
                <PrimaryButton type="submit" disabled={busy}>
                  Join team
                </PrimaryButton>
              </form>
            </Panel>
          </div>

          <p style={{
            fontFamily: SANS, fontSize: "0.8rem",
            color: "rgba(255,255,255,0.45)", marginTop: "1.75rem", lineHeight: 1.6,
          }}>
            Applications open soon — form or join a team now; once submissions open,
            your team will apply with its idea.
          </p>
        </div>
      </PhaseTransition>
    </AuthShell>
  );
};

export default OnboardingPage;
```

- [ ] **Step 5: Add guarded route in `src/App.jsx`**

```jsx
import RequireAuth from "./components/apply/RequireAuth";
import OnboardingPage from "./components/apply/pages/OnboardingPage";
```

```jsx
<Route element={<RequireAuth />}>
  <Route path="/onboarding" element={<OnboardingPage />} />
</Route>
```

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 7: Commit**

```bash
git add src/components/apply/RequireAuth.jsx src/components/apply/ApplyPage.jsx src/components/apply/team/InviteCards.jsx src/components/apply/pages/OnboardingPage.jsx src/App.jsx
git commit -m "feat: apply redirect hub, auth guard, onboarding page"
```

---

### Task 7: Team dashboard

**Files:**
- Create: `src/components/apply/team/JoinCodePanel.jsx`
- Create: `src/components/apply/team/RosterList.jsx`
- Create: `src/components/apply/team/InvitePanel.jsx`
- Create: `src/components/apply/team/PaymentPanel.jsx`
- Create: `src/components/apply/pages/TeamPage.jsx`
- Modify: `src/App.jsx` (guarded `/team` route)

**Interfaces:**
- Consumes: `api.getTeam`, `api.invite`, `api.kickMember`, `api.leaveTeam`, `api.submitPayment` (Task 1); `clearAuth` (Task 1); Task 2 components; `RequireAuth` (Task 6); `TerminalInput`. Team shape from the API: `{ team_id, team_name, join_code, status: "payment-pending"|"confirmed", transaction_ref, created_at, your_role: "leader"|"member", members: [{user_id, name, email, role}] }`.
- Produces:
  - `JoinCodePanel({ code })`
  - `RosterList({ team, onKick, busyId })` — renders 4 slots; kick buttons only when `team.your_role === "leader"`, `member.role !== "leader"`, and `team.status !== "confirmed"`.
  - `InvitePanel({ onInvite, busy, error, sentTo })` — calls `onInvite(email, name)`.
  - `PaymentPanel({ team, onSubmit, busy, error })` — leader sees UPI details + ref input; member sees waiting note.
  - `TeamPage` at `/team`.

- [ ] **Step 1: Write `src/components/apply/team/JoinCodePanel.jsx`**

```jsx
import { useState } from "react";
import { MONO, LIME, Panel, Eyebrow, GhostButton } from "../ui";

const JoinCodePanel = ({ code }) => {
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
      <Eyebrow>JOIN CODE</Eyebrow>
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
        fontFamily: MONO, fontSize: "0.7rem",
        color: "rgba(255,255,255,0.4)", marginTop: "0.75rem", lineHeight: 1.6,
      }}>
        {"// share this code — teammates enter it on the join screen"}
      </p>
    </Panel>
  );
};

export default JoinCodePanel;
```

- [ ] **Step 2: Write `src/components/apply/team/RosterList.jsx`**

```jsx
import { MONO, SANS, Panel, Eyebrow, GhostButton } from "../ui";

const MAX_SLOTS = 4;

const RosterList = ({ team, onKick, busyId }) => {
  const canKick = team.your_role === "leader" && team.status !== "confirmed";
  const emptySlots = MAX_SLOTS - team.members.length;

  return (
    <Panel maxWidth="none">
      <Eyebrow>ROSTER — {team.members.length}/{MAX_SLOTS}</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
        {team.members.map((m) => (
          <div key={m.user_id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "0.75rem", padding: "0.75rem 1rem",
            background: "rgba(255,255,255,0.02)",
            border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "6px",
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: SANS, fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>
                {m.name}
                {m.role === "leader" && (
                  <span style={{
                    fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.12em",
                    color: "#C8FF00", marginLeft: "0.6rem",
                  }}>
                    [LEADER]
                  </span>
                )}
              </p>
              <p style={{
                fontFamily: MONO, fontSize: "0.7rem", color: "rgba(255,255,255,0.4)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {m.email}
              </p>
            </div>
            {canKick && m.role !== "leader" && (
              <GhostButton
                danger
                disabled={busyId === m.user_id}
                onClick={() => onKick(m)}
              >
                kick
              </GhostButton>
            )}
          </div>
        ))}
        {Array.from({ length: emptySlots }, (_, i) => (
          <div key={`empty-${i}`} style={{
            padding: "0.75rem 1rem",
            border: "1px dashed rgba(255,255,255,0.12)", borderRadius: "6px",
          }}>
            <p style={{ fontFamily: MONO, fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
              {"// open slot"}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default RosterList;
```

- [ ] **Step 3: Write `src/components/apply/team/InvitePanel.jsx`**

```jsx
import { useState } from "react";
import TerminalInput from "../inputs/TerminalInput";
import { Panel, Eyebrow, ErrorLine, NoticeLine, PrimaryButton } from "../ui";

const InvitePanel = ({ onInvite, busy, error, sentTo }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onInvite(email.trim().toLowerCase(), name.trim(), () => {
      setEmail("");
      setName("");
    });
  };

  return (
    <Panel maxWidth="none">
      <Eyebrow>INVITE A TEAMMATE</Eyebrow>
      <form onSubmit={submit} noValidate style={{ marginTop: "0.75rem" }}>
        <TerminalInput
          label="Email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TerminalInput
          label="Name (required if they don't have an account yet)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <ErrorLine>{error}</ErrorLine>
        <NoticeLine>{sentTo && `invite sent to ${sentTo} — they'll get an email`}</NoticeLine>
        <PrimaryButton type="submit" disabled={busy}>
          {busy ? "sending…" : "Send invite"}
        </PrimaryButton>
      </form>
    </Panel>
  );
};

export default InvitePanel;
```

- [ ] **Step 4: Write `src/components/apply/team/PaymentPanel.jsx`**

```jsx
import { useState } from "react";
import TerminalInput from "../inputs/TerminalInput";
import { MONO, SANS, LIME, Panel, Eyebrow, ErrorLine, PrimaryButton, GhostButton } from "../ui";

const UPI_ID = import.meta.env.VITE_UPI_ID;
const UPI_QR = import.meta.env.VITE_UPI_QR;

const PaymentPanel = ({ team, onSubmit, busy, error }) => {
  const [ref, setRef] = useState("");
  const [copied, setCopied] = useState(false);
  const isLeader = team.your_role === "leader";

  if (!isLeader) {
    return (
      <Panel maxWidth="none">
        <Eyebrow>PAYMENT — ₹100</Eyebrow>
        <p style={{
          fontFamily: MONO, fontSize: "0.78rem",
          color: "rgba(255,255,255,0.5)", marginTop: "0.75rem", lineHeight: 1.6,
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

  return (
    <Panel maxWidth="none">
      <Eyebrow>PAYMENT — ₹100</Eyebrow>
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
            Pay <b style={{ color: LIME }}>₹100</b> to the UPI ID below (or scan the QR),
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

- [ ] **Step 5: Write `src/components/apply/pages/TeamPage.jsx`**

```jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../AuthShell";
import PhaseTransition from "../PhaseTransition";
import JoinCodePanel from "../team/JoinCodePanel";
import RosterList from "../team/RosterList";
import InvitePanel from "../team/InvitePanel";
import PaymentPanel from "../team/PaymentPanel";
import { MONO, SANS, LIME, Panel, ErrorLine, PrimaryButton, GhostButton } from "../ui";
import { api } from "../../../lib/startathon";
import { clearAuth } from "../../../lib/auth";

const StatusBadge = ({ status }) => {
  const confirmed = status === "confirmed";
  return (
    <span style={{
      fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.14em",
      padding: "0.35rem 0.7rem", borderRadius: "100px",
      color: confirmed ? "#0a0a0a" : "#ffb454",
      background: confirmed ? LIME : "rgba(255,180,84,0.12)",
      border: confirmed ? "none" : "0.5px solid rgba(255,180,84,0.5)",
      fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {confirmed ? "✓ CONFIRMED" : "PAYMENT PENDING"}
    </span>
  );
};

const IdeaNotice = ({ prominent }) => (
  <div style={{
    padding: "0.9rem 1.1rem", borderRadius: "6px",
    background: prominent ? "rgba(200,255,0,0.06)" : "rgba(255,255,255,0.02)",
    border: `0.5px solid ${prominent ? "rgba(200,255,0,0.3)" : "rgba(255,255,255,0.08)"}`,
  }}>
    <p style={{
      fontFamily: MONO, fontSize: "0.75rem", lineHeight: 1.6,
      color: prominent ? "rgba(200,255,0,0.85)" : "rgba(255,255,255,0.5)",
    }}>
      {"// APPLICATIONS OPEN SOON — once submissions open, your team will apply with its idea here."}
    </p>
  </div>
);

const TeamPage = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSentTo, setInviteSentTo] = useState("");
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState("");
  const [kickBusyId, setKickBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [leaveBusy, setLeaveBusy] = useState(false);

  const refresh = useCallback(() => {
    setLoadError("");
    return api.getTeam()
      .then(setTeam)
      .catch((err) => {
        if (err.status === 404) navigate("/onboarding", { replace: true });
        else if (err.status === 401) navigate("/login", { replace: true });
        else setLoadError(err.message);
      });
  }, [navigate]);

  useEffect(() => { refresh(); }, [refresh]);

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const invite = async (email, name, onSent) => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setInviteError("enter a valid email");
      return;
    }
    setInviteBusy(true);
    setInviteError("");
    setInviteSentTo("");
    try {
      await api.invite(email, name || undefined);
      setInviteSentTo(email);
      onSent();
      await refresh();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteBusy(false);
    }
  };

  const kick = async (member) => {
    if (!window.confirm(`Kick ${member.name} from the team?`)) return;
    setKickBusyId(member.user_id);
    setActionError("");
    try {
      await api.kickMember(member.user_id);
      await refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setKickBusyId(null);
    }
  };

  const pay = async (transactionId) => {
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

  const leave = async () => {
    const isLeader = team.your_role === "leader";
    const msg = isLeader
      ? "Disband the team? This deletes it and frees every member. This cannot be undone."
      : "Leave this team?";
    if (!window.confirm(msg)) return;
    setLeaveBusy(true);
    setActionError("");
    try {
      await api.leaveTeam();
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setActionError(err.message);
      setLeaveBusy(false);
    }
  };

  if (loadError) {
    return (
      <AuthShell label="TEAM" right={<GhostButton onClick={logout}>logout</GhostButton>}>
        <Panel>
          <ErrorLine>{loadError}</ErrorLine>
          <PrimaryButton onClick={refresh}>Retry</PrimaryButton>
        </Panel>
      </AuthShell>
    );
  }

  if (!team) {
    return (
      <AuthShell label="TEAM">
        <p style={{ fontFamily: MONO, fontSize: "0.8rem", color: "rgba(200,255,0,0.7)" }}>
          {"// loading team…"}
        </p>
      </AuthShell>
    );
  }

  const isLeader = team.your_role === "leader";
  const confirmed = team.status === "confirmed";

  return (
    <AuthShell label="TEAM" right={<GhostButton onClick={logout}>logout</GhostButton>}>
      <PhaseTransition>
        <div style={{
          width: "100%", maxWidth: "760px",
          display: "flex", flexDirection: "column", gap: "1.25rem",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: "0.75rem",
          }}>
            <h1 style={{
              fontFamily: MONO, fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
              fontWeight: 700, color: "#fff", letterSpacing: "0.02em",
            }}>
              {team.team_name}
            </h1>
            <StatusBadge status={team.status} />
          </div>

          {confirmed && (
            <p style={{ fontFamily: SANS, fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>
              Your team is locked in — the roster that paid is the roster that competes.
            </p>
          )}

          <IdeaNotice prominent={confirmed} />

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

          <ErrorLine>{actionError}</ErrorLine>

          {!confirmed && (
            <div style={{ paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <GhostButton danger disabled={leaveBusy} onClick={leave}>
                {isLeader ? "disband team (deletes it for everyone)" : "leave team"}
              </GhostButton>
            </div>
          )}
        </div>
      </PhaseTransition>
    </AuthShell>
  );
};

export default TeamPage;
```

- [ ] **Step 6: Add guarded route in `src/App.jsx`**

```jsx
import TeamPage from "./components/apply/pages/TeamPage";
```

Inside the existing `RequireAuth` route group from Task 6:

```jsx
<Route element={<RequireAuth />}>
  <Route path="/onboarding" element={<OnboardingPage />} />
  <Route path="/team" element={<TeamPage />} />
</Route>
```

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 8: Commit**

```bash
git add src/components/apply/team src/components/apply/pages/TeamPage.jsx src/App.jsx
git commit -m "feat: team dashboard with roster, invites, payment"
```

---

### Task 8: Delete legacy form code + final sweep

**Files:**
- Delete: `src/components/apply/ApplyMethodDialog.jsx`
- Delete: `src/components/apply/BackgroundCanvas.jsx`
- Delete: `src/components/apply/PhaseShared.jsx`
- Delete: `src/components/apply/phases/` (all 6 files)
- Delete: `src/components/apply/inputs/MemberRow.jsx`
- Delete: `src/components/apply/inputs/TagInput.jsx`
- Delete: `src/components/apply/inputs/TerminalTextarea.jsx`
- Maybe delete: `src/lib/useTypewriter.js` (only if nothing outside `PhaseShared.jsx` imports it — check first)

**Interfaces:**
- Consumes: nothing. Precondition: Tasks 2–7 already removed every import of these files.
- Produces: a tree where no module under `src/components/apply/` references Three.js or the old form.

- [ ] **Step 1: Verify nothing imports the doomed files**

Run (Git Bash):
```bash
grep -rn --include='*.jsx' --include='*.js' -E "ApplyMethodDialog|BackgroundCanvas|PhaseShared|phases/Phase|MemberRow|TagInput|TerminalTextarea" src/
```
Expected: matches only inside the files being deleted. If anything else matches, fix that import before deleting.

- [ ] **Step 2: Check `useTypewriter` usage**

Run: `grep -rn "useTypewriter" src/`
Expected: only `src/lib/useTypewriter.js` itself and `PhaseShared.jsx`. If so, delete `src/lib/useTypewriter.js` too; if other components use it, keep it.

- [ ] **Step 3: Delete the files**

```bash
git rm src/components/apply/ApplyMethodDialog.jsx 2>/dev/null || rm src/components/apply/ApplyMethodDialog.jsx
git rm src/components/apply/BackgroundCanvas.jsx
git rm src/components/apply/PhaseShared.jsx
git rm -r src/components/apply/phases
git rm src/components/apply/inputs/MemberRow.jsx src/components/apply/inputs/TagInput.jsx src/components/apply/inputs/TerminalTextarea.jsx
```
(`ApplyMethodDialog.jsx` may be untracked — plain `rm` then.)

- [ ] **Step 4: Verify no Three.js in the apply tree**

Run: `grep -rn -E "three|@react-three" src/components/apply/`
Expected: no matches.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 6: Commit**

```bash
git add -A src/components/apply src/lib
git commit -m "chore: remove legacy apply form, phases, and three.js background"
```

---

### Task 9: Manual walkthrough (user-driven)

No code. Present the spec §5 checklist to the user and ask them to run `npm run dev` themselves (CLAUDE.md: do not start it unprompted):

- Email signup → lands on `/onboarding`; login round-trip; wrong password shows the generic 401 message.
- Google sign-in via `/auth/callback` (requires backend redirect_uri configured to the frontend callback).
- Forgot → email link → `/reset` → new password → `/login` shows the notice.
- Create team → join code visible; second account joins via code; third invited (accept), plus one decline.
- Leader kick, member leave, leader disband — confirm dialogs appear, team dissolves correctly.
- Payment: valid ref flips badge to `✓ CONFIRMED`, roster locks (kick/leave/invite/payment hidden); bad ref shows the 400 message inline.
- Delete the token in devtools → any guarded page bounces to `/login`.
- Verify env vars are set in `.env` and the UPI QR asset exists at the `VITE_UPI_QR` path in `public/`.
