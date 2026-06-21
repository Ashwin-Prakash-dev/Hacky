# Apply Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `/apply` route — a full-screen, 6-phase cinematic application form with terminal + mission-briefing aesthetics, backed by a migrated shared API client.

**Architecture:** `ApplyPage.jsx` owns all form state and phase routing. Each phase is an isolated component receiving `formData`, `updateForm`, `onNext`, `onBack`. `PhaseTransition` wraps each phase with a GSAP slide-in keyed to the current phase number (React key forces remount → entrance animation on every transition). Shared input primitives (`TerminalInput`, `TerminalTextarea`, `TagInput`, `MemberRow`) are reused across phases.

**Tech Stack:** React 18, GSAP (already installed), React Router (already installed), `src/lib/api.js` (new).

## Global Constraints

- Background: `#0a0a0a` (never `#000000`)
- Accent: `#C8FF00` (lime)
- Font: `var(--font-general, sans-serif)` for UI text; `monospace` for terminal labels, prompts, errors
- Error format: `// error: <message>` — monospace, `rgba(255,100,100,0.8)`, `0.68rem`
- `>_` prefix on all field labels — colour `rgba(200,255,0,0.55)`
- Input focus: `borderColor: "rgba(200,255,0,0.45)"`, `background: "rgba(200,255,0,0.03)"`
- Input blur: `borderColor: "rgba(255,255,255,0.1)"`, `background: "rgba(255,255,255,0.04)"`
- No test framework in project — verification is manual (run `npm run dev`, navigate, interact)
- Do NOT run `npm run build` or `npm run deploy` — dev server only
- GSAP is `gsap` (already in `package.json`); import `ScrollTrigger` only when needed (not needed here)

---

## File Map

```
src/
  lib/
    api.js                          ← NEW: shared API client
    useTypewriter.js                ← NEW: typewriter hook
  components/
    apply/
      ApplyPage.jsx                 ← NEW: shell, progress bar, phase router, all form state
      PhaseTransition.jsx           ← NEW: GSAP enter-animation wrapper (keyed per phase)
      PhaseShared.jsx               ← NEW: PhaseHeader, PhaseNav, PhaseLayout exports
      phases/
        Phase01Identity.jsx         ← NEW
        Phase02Crew.jsx             ← NEW
        Phase03Mission.jsx          ← NEW
        Phase04Arsenal.jsx          ← NEW
        Phase05Statement.jsx        ← NEW
        Phase06Deploy.jsx           ← NEW (dossier print + submit + success screen)
      inputs/
        TerminalInput.jsx           ← NEW
        TerminalTextarea.jsx        ← NEW
        TagInput.jsx                ← NEW
        MemberRow.jsx               ← NEW
    WaitlistForm.jsx                ← MODIFY: replace raw fetch with api.waitlist()
    Navbar.jsx                      ← MODIFY: CTA button → <a href="/apply">
    Hero.jsx                        ← MODIFY: hero button → /apply, text → "Apply Now"
  App.jsx                           ← MODIFY: add /apply route
.env                                ← MODIFY: replace VITE_WAITLIST_API with VITE_API_BASE
```

---

### Task 1: API client + env migration

**Files:**
- Create: `src/lib/api.js`
- Modify: `.env`
- Modify: `src/components/WaitlistForm.jsx` (lines 15–22)

**Interfaces:**
- Produces: `api.waitlist(data)`, `api.apply(data)` — both return a `Promise<Response>`

- [ ] **Step 1: Create `src/lib/api.js`**

```js
const BASE = import.meta.env.VITE_API_BASE;

function post(path, data) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export const api = {
  waitlist: (data) => post("/waitlist", data),
  apply:    (data) => post("/apply", data),
};
```

- [ ] **Step 2: Update `.env`**

Replace:
```
VITE_WAITLIST_API=https://api.sctcoding.club/api/v3/events/startathon/waitlist
```
With:
```
VITE_API_BASE=https://api.sctcoding.club/api/v3/events/startathon
```

- [ ] **Step 3: Update `WaitlistForm.jsx`**

Add import at top of `src/components/WaitlistForm.jsx`:
```js
import { api } from "../lib/api";
```

Replace the `fetch(...)` call inside `handleSubmit` (currently lines 15–22):
```js
// OLD:
const res = await fetch(import.meta.env.VITE_WAITLIST_API, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// NEW:
const res = await api.waitlist(body);
```

- [ ] **Step 4: Verify**

Run `npm run dev`. Fill in the waitlist form on the landing page and submit. The request should still reach `https://api.sctcoding.club/api/v3/events/startathon/waitlist` (check Network tab in DevTools). Status 201 shows the success state, 409 shows "already registered".

- [ ] **Step 5: Commit**

```bash
git add src/lib/api.js src/components/WaitlistForm.jsx .env
git commit -m "feat: add shared api client, migrate waitlist to VITE_API_BASE"
```

---

### Task 2: `useTypewriter` hook + shared input primitives

**Files:**
- Create: `src/lib/useTypewriter.js`
- Create: `src/components/apply/inputs/TerminalInput.jsx`
- Create: `src/components/apply/inputs/TerminalTextarea.jsx`

**Interfaces:**
- Produces: `useTypewriter(text, speed?) → string`
- Produces: `<TerminalInput label error ...nativeInputProps />`
- Produces: `<TerminalTextarea label maxWords minWords error value onChange rows />`

- [ ] **Step 1: Create `src/lib/useTypewriter.js`**

```js
import { useState, useEffect } from "react";

export const useTypewriter = (text, speed = 22) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text]);

  return displayed;
};
```

- [ ] **Step 2: Create `src/components/apply/inputs/TerminalInput.jsx`**

```jsx
const TerminalInput = ({ label, error, style: extStyle, onFocus, onBlur, ...props }) => (
  <div style={{ marginBottom: "1.5rem" }}>
    <label style={{
      display: "block",
      fontFamily: "monospace",
      fontSize: "0.7rem",
      letterSpacing: "0.08em",
      color: "rgba(200,255,0,0.55)",
      marginBottom: "0.5rem",
      userSelect: "none",
    }}>
      &gt;_ {label}
    </label>
    <input
      {...props}
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        padding: "0.75rem 1rem",
        color: "#fff",
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "0.88rem",
        outline: "none",
        transition: "border-color 0.2s, background 0.2s",
        boxSizing: "border-box",
        caretColor: "#C8FF00",
        ...extStyle,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "rgba(200,255,0,0.45)";
        e.target.style.background = "rgba(200,255,0,0.03)";
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "rgba(255,255,255,0.1)";
        e.target.style.background = "rgba(255,255,255,0.04)";
        onBlur?.(e);
      }}
    />
    {error && (
      <p style={{
        fontFamily: "monospace",
        fontSize: "0.68rem",
        color: "rgba(255,100,100,0.8)",
        marginTop: "0.4rem",
        letterSpacing: "0.03em",
      }}>
        // error: {error}
      </p>
    )}
  </div>
);

export default TerminalInput;
```

- [ ] **Step 3: Create `src/components/apply/inputs/TerminalTextarea.jsx`**

```jsx
const wordCount = (str) =>
  str ? str.trim().split(/\s+/).filter(Boolean).length : 0;

const TerminalTextarea = ({
  label, maxWords, error, value = "", onChange, rows = 5,
  onFocus, onBlur, ...props
}) => {
  const count = wordCount(value);
  const over = maxWords && count > maxWords;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label style={{
        display: "block",
        fontFamily: "monospace",
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        color: "rgba(200,255,0,0.55)",
        marginBottom: "0.5rem",
        userSelect: "none",
      }}>
        &gt;_ {label}
      </label>
      <div style={{ position: "relative" }}>
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          {...props}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${over ? "rgba(255,100,100,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "6px",
            padding: "0.75rem 1rem 2rem",
            color: "#fff",
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.88rem",
            outline: "none",
            resize: "vertical",
            transition: "border-color 0.2s, background 0.2s",
            boxSizing: "border-box",
            caretColor: "#C8FF00",
            lineHeight: 1.7,
          }}
          onFocus={(e) => {
            if (!over) {
              e.target.style.borderColor = "rgba(200,255,0,0.45)";
              e.target.style.background = "rgba(200,255,0,0.03)";
            }
            onFocus?.(e);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = over
              ? "rgba(255,100,100,0.4)"
              : "rgba(255,255,255,0.1)";
            e.target.style.background = "rgba(255,255,255,0.04)";
            onBlur?.(e);
          }}
        />
        {maxWords && (
          <span style={{
            position: "absolute",
            bottom: "0.55rem",
            right: "0.8rem",
            fontFamily: "monospace",
            fontSize: "0.6rem",
            color: over ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.2)",
            pointerEvents: "none",
          }}>
            {count} / {maxWords} words
          </span>
        )}
      </div>
      {error && (
        <p style={{
          fontFamily: "monospace",
          fontSize: "0.68rem",
          color: "rgba(255,100,100,0.8)",
          marginTop: "0.4rem",
          letterSpacing: "0.03em",
        }}>
          // error: {error}
        </p>
      )}
    </div>
  );
};

export default TerminalTextarea;
```

- [ ] **Step 4: Verify**

No visual test yet — these components are not rendered anywhere until Task 5. Confirm the files exist and have no syntax errors by checking that `npm run dev` still compiles without error.

- [ ] **Step 5: Commit**

```bash
git add src/lib/useTypewriter.js src/components/apply/inputs/TerminalInput.jsx src/components/apply/inputs/TerminalTextarea.jsx
git commit -m "feat: add useTypewriter hook and terminal input primitives"
```

---

### Task 3: `TagInput` + `MemberRow` input components

**Files:**
- Create: `src/components/apply/inputs/TagInput.jsx`
- Create: `src/components/apply/inputs/MemberRow.jsx`

**Interfaces:**
- Produces: `<TagInput label value={string[]} onChange={fn} error />`
- Produces: `<MemberRow index value={{ name, email }} onChange={fn} onRemove={fn} />`

- [ ] **Step 1: Create `src/components/apply/inputs/TagInput.jsx`**

```jsx
import { useState } from "react";

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  padding: "0.75rem 1rem",
  color: "#fff",
  fontFamily: "var(--font-general, sans-serif)",
  fontSize: "0.88rem",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
  boxSizing: "border-box",
  caretColor: "#C8FF00",
};

const TagInput = ({ label, value = [], onChange, error }) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput("");
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label style={{
        display: "block",
        fontFamily: "monospace",
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        color: "rgba(200,255,0,0.55)",
        marginBottom: "0.5rem",
        userSelect: "none",
      }}>
        &gt;_ {label}
      </label>

      {value.length > 0 && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.65rem",
        }}>
          {value.map((tag) => (
            <span key={tag} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "#C8FF00",
              border: "0.5px solid rgba(200,255,0,0.4)",
              borderRadius: "3px",
              padding: "3px 8px",
              background: "rgba(200,255,0,0.06)",
            }}>
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(200,255,0,0.5)",
                  fontSize: "0.65rem",
                  padding: 0,
                  lineHeight: 1,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,100,100,0.8)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,255,0,0.5)")}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); addTag(); }
        }}
        placeholder="type and press Enter to add"
        style={inputStyle}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(200,255,0,0.45)";
          e.target.style.background = "rgba(200,255,0,0.03)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.1)";
          e.target.style.background = "rgba(255,255,255,0.04)";
        }}
      />
      {error && (
        <p style={{
          fontFamily: "monospace",
          fontSize: "0.68rem",
          color: "rgba(255,100,100,0.8)",
          marginTop: "0.4rem",
          letterSpacing: "0.03em",
        }}>
          // error: {error}
        </p>
      )}
    </div>
  );
};

export default TagInput;
```

- [ ] **Step 2: Create `src/components/apply/inputs/MemberRow.jsx`**

```jsx
const fieldStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  padding: "0.65rem 0.85rem",
  color: "#fff",
  fontFamily: "var(--font-general, sans-serif)",
  fontSize: "0.84rem",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
  boxSizing: "border-box",
  caretColor: "#C8FF00",
};

const MemberRow = ({ index, value, onChange, onRemove }) => {
  const id = String(index + 1).padStart(2, "0");

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr auto",
      gap: "0.65rem",
      marginBottom: "0.75rem",
      alignItems: "end",
    }}>
      <div>
        <label style={{
          display: "block",
          fontFamily: "monospace",
          fontSize: "0.62rem",
          letterSpacing: "0.08em",
          color: "rgba(200,255,0,0.5)",
          marginBottom: "0.35rem",
          userSelect: "none",
        }}>
          &gt;_ member_{id} name
        </label>
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="full name"
          style={fieldStyle}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(200,255,0,0.45)";
            e.target.style.background = "rgba(200,255,0,0.03)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.1)";
            e.target.style.background = "rgba(255,255,255,0.04)";
          }}
        />
      </div>
      <div>
        <label style={{
          display: "block",
          fontFamily: "monospace",
          fontSize: "0.62rem",
          letterSpacing: "0.08em",
          color: "rgba(200,255,0,0.5)",
          marginBottom: "0.35rem",
          userSelect: "none",
        }}>
          &gt;_ member_{id} email
        </label>
        <input
          type="email"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="email address"
          style={fieldStyle}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(200,255,0,0.45)";
            e.target.style.background = "rgba(200,255,0,0.03)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.1)";
            e.target.style.background = "rgba(255,255,255,0.04)";
          }}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: "none",
          border: "0.5px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.25)",
          cursor: "pointer",
          borderRadius: "4px",
          padding: "0.5rem 0.65rem",
          fontSize: "0.75rem",
          transition: "color 0.2s, border-color 0.2s",
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(255,100,100,0.7)";
          e.currentTarget.style.borderColor = "rgba(255,100,100,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.25)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default MemberRow;
```

- [ ] **Step 3: Verify**

`npm run dev` compiles without error.

- [ ] **Step 4: Commit**

```bash
git add src/components/apply/inputs/TagInput.jsx src/components/apply/inputs/MemberRow.jsx
git commit -m "feat: add TagInput and MemberRow apply form components"
```

---

### Task 4: `PhaseTransition`, `PhaseShared`, and `ApplyPage` shell

**Files:**
- Create: `src/components/apply/PhaseTransition.jsx`
- Create: `src/components/apply/PhaseShared.jsx`
- Create: `src/components/apply/ApplyPage.jsx`

**Interfaces:**
- Produces: `<PhaseTransition direction="forward|back">` — wraps phase content; use `key={phase}` on the parent to trigger remount + entrance animation on each phase change
- Produces: `<PhaseLayout>`, `<PhaseHeader label tagline />`, `<PhaseNav onNext onBack isFirst nextLabel disabled />`
- Produces: `<ApplyPage />` — complete shell; renders correctly at `/apply` (top bar, progress bar, placeholder for phases)

- [ ] **Step 1: Create `src/components/apply/PhaseTransition.jsx`**

```jsx
import { useRef, useEffect } from "react";
import gsap from "gsap";

const PhaseTransition = ({ direction = "forward", children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const x = direction === "back" ? -50 : 50;
    gsap.fromTo(
      el,
      { x, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" }
    );
  }, []); // runs once on mount — parent uses key={phase} to force remount per transition

  return (
    <div ref={ref} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {children}
    </div>
  );
};

export default PhaseTransition;
```

- [ ] **Step 2: Create `src/components/apply/PhaseShared.jsx`**

```jsx
import { useTypewriter } from "../../lib/useTypewriter";

export const PhaseLayout = ({ children }) => (
  <div style={{
    width: "100%",
    maxWidth: "600px",
    padding: "clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)",
  }}>
    {children}
  </div>
);

export const PhaseHeader = ({ label, tagline }) => {
  const typed = useTypewriter(label, 20);
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <p style={{
        fontFamily: "monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.2em",
        color: "#C8FF00",
        textTransform: "uppercase",
        marginBottom: "0.6rem",
        minHeight: "1em",
      }}>
        {typed}
      </p>
      <p style={{
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "1rem",
        fontStyle: "italic",
        color: "rgba(255,255,255,0.3)",
        lineHeight: 1.5,
      }}>
        {tagline}
      </p>
    </div>
  );
};

export const PhaseNav = ({
  onNext,
  onBack,
  isFirst = false,
  nextLabel = "next phase →",
  disabled = false,
}) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: isFirst ? "flex-end" : "space-between",
    marginTop: "2.25rem",
  }}>
    {!isFirst && (
      <button
        type="button"
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.3)",
          cursor: "pointer",
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.62rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: 0,
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
      >
        ← prev
      </button>
    )}
    <button
      type="button"
      onClick={onNext}
      disabled={disabled}
      style={{
        padding: "0.85rem 2rem",
        background: "#C8FF00",
        color: "#000",
        border: "none",
        borderRadius: "6px",
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "0.62rem",
        letterSpacing: "0.14em",
        fontWeight: 700,
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, opacity 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(200,255,0,0.25)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {nextLabel}
    </button>
  </div>
);
```

- [ ] **Step 3: Create `src/components/apply/ApplyPage.jsx`**

```jsx
import { useState } from "react";
import PhaseTransition from "./PhaseTransition";
import Phase01Identity from "./phases/Phase01Identity";
import Phase02Crew     from "./phases/Phase02Crew";
import Phase03Mission  from "./phases/Phase03Mission";
import Phase04Arsenal  from "./phases/Phase04Arsenal";
import Phase05Statement from "./phases/Phase05Statement";
import Phase06Deploy   from "./phases/Phase06Deploy";

const TOTAL = 6;
const PHASES = [
  Phase01Identity,
  Phase02Crew,
  Phase03Mission,
  Phase04Arsenal,
  Phase05Statement,
  Phase06Deploy,
];

const EMPTY_FORM = {
  teamName: "",
  lead: { name: "", email: "", phone: "" },
  members: [],
  solo: false,
  ideaSummary: "",
  idea: "",
  techStack: [],
  links: [],
  whyUs: "",
  shipped: "",
};

const ApplyPage = () => {
  const [phase, setPhase]       = useState(1);
  const [direction, setDirection] = useState("forward");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const updateForm = (patch) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const goNext = () => { setDirection("forward"); setPhase((p) => p + 1); };
  const goPrev = () => { setDirection("back");    setPhase((p) => p - 1); };

  const progress = ((phase - 1) / (TOTAL - 1)) * 100;

  const CurrentPhase = PHASES[phase - 1];

  if (submitted) {
    return (
      <div style={{
        minHeight: "100dvh", background: "#0a0a0a",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem",
      }}>
        <SuccessScreen />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a" }}>
      {/* Progress line */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: "2px", background: "rgba(255,255,255,0.06)", zIndex: 200,
      }}>
        <div style={{
          height: "100%", background: "#C8FF00",
          width: `${progress}%`,
          transition: "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: "0 0 8px rgba(200,255,0,0.5)",
        }} />
      </div>

      {/* Top bar */}
      <header style={{
        position: "fixed", top: "2px", left: 0, right: 0,
        height: "56px", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(1.25rem, 4vw, 2.5rem)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <a href="/" style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.95rem", fontWeight: 700,
          letterSpacing: "-0.01em", color: "#fff", textDecoration: "none",
        }}>
          Startathon<span style={{ color: "#888" }}>.</span>
        </a>

        <span style={{
          fontFamily: "monospace", fontSize: "0.6rem",
          letterSpacing: "0.2em", color: "rgba(200,255,0,0.6)",
          textTransform: "uppercase",
        }}>
          PHASE {String(phase).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </span>

        <a href="/" style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.65rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
          textDecoration: "none", transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
        >
          ✕ Exit
        </a>
      </header>

      {/* Phase area */}
      <main style={{
        paddingTop: "58px",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "calc(58px + 2rem) clamp(1rem, 4vw, 2rem) 3rem",
      }}>
        <PhaseTransition key={phase} direction={direction}>
          <CurrentPhase
            formData={formData}
            updateForm={updateForm}
            onNext={goNext}
            onBack={goPrev}
            isFirst={phase === 1}
            onSubmitted={() => setSubmitted(true)}
          />
        </PhaseTransition>
      </main>
    </div>
  );
};

const SuccessScreen = () => {
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const linkRef  = useRef(null);
  const { useRef, useEffect } = require("react"); // replaced below

  return null; // placeholder — implemented in Task 8
};

export default ApplyPage;
```

**Important:** The `SuccessScreen` above is a placeholder — it will be completed in Task 8. For now it just renders `null`. Also add `import { useRef } from "react"` at the top of the file.

Full corrected top of `ApplyPage.jsx`:
```jsx
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import PhaseTransition from "./PhaseTransition";
import Phase01Identity  from "./phases/Phase01Identity";
import Phase02Crew      from "./phases/Phase02Crew";
import Phase03Mission   from "./phases/Phase03Mission";
import Phase04Arsenal   from "./phases/Phase04Arsenal";
import Phase05Statement from "./phases/Phase05Statement";
import Phase06Deploy    from "./phases/Phase06Deploy";
```

And replace the SuccessScreen in ApplyPage.jsx with this (to be fully implemented in Task 8):
```jsx
const SuccessScreen = () => (
  <div style={{ textAlign: "center" }}>
    <p style={{ fontFamily: "monospace", color: "#C8FF00", fontSize: "1.2rem", letterSpacing: "0.1em" }}>
      ✓ ACCESS GRANTED.
    </p>
  </div>
);
```

Create stub phase files so ApplyPage.jsx can import them without crashing.

- [ ] **Step 4: Create stub phase files**

Create each of these with the exact same stub content — replace `Phase01Identity` with the matching name for each file:

`src/components/apply/phases/Phase01Identity.jsx`:
```jsx
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";

const Phase01Identity = ({ onNext, isFirst }) => (
  <PhaseLayout>
    <PhaseHeader label="PHASE 01 — IDENTITY CLEARANCE" tagline='"Establish your presence in the system."' />
    <PhaseNav onNext={onNext} isFirst={isFirst} />
  </PhaseLayout>
);

export default Phase01Identity;
```

Create identical stubs for `Phase02Crew.jsx` through `Phase06Deploy.jsx`, updating the label/tagline per phase:
- Phase02: `"PHASE 02 — CREW MANIFEST"` / `'"Who\'s in the room with you."'`
- Phase03: `"PHASE 03 — THE MISSION"` / `'"What are you going to build."'`
- Phase04: `"PHASE 04 — ARSENAL"` / `'"What you\'re bringing to the fight."'`
- Phase05: `"PHASE 05 — FINAL STATEMENT"` / `'"Make your case."'`
- Phase06: `"PHASE 06 — DEPLOY"` / `'"Review and transmit."'`

- [ ] **Step 5: Verify shell renders**

`npm run dev` → navigate to `http://localhost:5173/apply`. You should see:
- Dark `#0a0a0a` background
- Thin lime progress bar at top (at 0%)
- Top bar with `Startathon.` left, `PHASE 01 / 06` center, `✕ Exit` right
- Phase 01 label typewriting in, tagline below, a "next phase →" lime button

Click "next phase →" several times — progress bar advances, phase counter increments, new phase slides in from the right.

- [ ] **Step 6: Commit**

```bash
git add src/components/apply/
git commit -m "feat: apply page shell with phase transition and progress bar"
```

---

### Task 5: Phase 01 — Identity Clearance + Phase 02 — Crew Manifest

**Files:**
- Modify: `src/components/apply/phases/Phase01Identity.jsx`
- Modify: `src/components/apply/phases/Phase02Crew.jsx`

**Interfaces:**
- Consumes: `formData.teamName`, `formData.lead`, `formData.members`, `formData.solo`
- Consumes: `updateForm`, `onNext`, `onBack`, `isFirst`

- [ ] **Step 1: Implement `Phase01Identity.jsx`**

```jsx
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";
import TerminalInput from "../inputs/TerminalInput";

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v) => /^\d{10}$/.test(v.replace(/\D/g, ""));

const Phase01Identity = ({ formData, updateForm, onNext, isFirst }) => {
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);

  useEffect(() => {
    const els = contentRef.current?.querySelectorAll(".fi");
    if (!els?.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.09, ease: "power3.out", delay: 0.35 }
    );
  }, []);

  const validate = () => {
    const e = {};
    const name = formData.teamName.trim();
    if (!name || name.length < 2) e.teamName = "team name must be at least 2 characters";
    else if (name.length > 40)    e.teamName = "team name must be under 40 characters";
    if (!formData.lead.name.trim()) e.leadName = "lead name is required";
    if (!isValidEmail(formData.lead.email)) e.leadEmail = "valid email required";
    if (!isValidPhone(formData.lead.phone)) e.leadPhone = "10-digit phone number required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 01 — IDENTITY CLEARANCE"
        tagline='"Establish your presence in the system."'
      />
      <div ref={contentRef}>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalInput
            label="team name"
            value={formData.teamName}
            onChange={(e) => updateForm({ teamName: e.target.value })}
            maxLength={40}
            error={errors.teamName}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalInput
            label="team lead name"
            value={formData.lead.name}
            onChange={(e) => updateForm({ lead: { ...formData.lead, name: e.target.value } })}
            error={errors.leadName}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalInput
            label="team lead email"
            type="email"
            value={formData.lead.email}
            onChange={(e) => updateForm({ lead: { ...formData.lead, email: e.target.value } })}
            error={errors.leadEmail}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalInput
            label="team lead phone"
            type="tel"
            value={formData.lead.phone}
            onChange={(e) => updateForm({ lead: { ...formData.lead, phone: e.target.value } })}
            error={errors.leadPhone}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <PhaseNav onNext={handleNext} onBack={() => {}} isFirst={isFirst} />
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase01Identity;
```

- [ ] **Step 2: Implement `Phase02Crew.jsx`**

```jsx
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";
import MemberRow from "../inputs/MemberRow";

const Phase02Crew = ({ formData, updateForm, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);

  useEffect(() => {
    const els = contentRef.current?.querySelectorAll(".fi");
    if (!els?.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.09, ease: "power3.out", delay: 0.35 }
    );
  }, []);

  const addMember = () => {
    if (formData.members.length >= 3) return;
    updateForm({ members: [...formData.members, { name: "", email: "" }] });
  };

  const updateMember = (i, val) => {
    const updated = [...formData.members];
    updated[i] = val;
    updateForm({ members: updated });
  };

  const removeMember = (i) =>
    updateForm({ members: formData.members.filter((_, idx) => idx !== i) });

  const validate = () => {
    const e = {};
    formData.members.forEach((m, i) => {
      if ((m.name.trim() && !m.email.trim()) || (!m.name.trim() && m.email.trim())) {
        e[`member_${i}`] = "both name and email required";
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 02 — CREW MANIFEST"
        tagline='"Who\'s in the room with you."'
      />
      <div ref={contentRef}>
        {/* Solo toggle */}
        <div className="fi" style={{ opacity: 0, marginBottom: "1.75rem" }}>
          <button
            type="button"
            onClick={() => updateForm({ solo: !formData.solo, members: formData.solo ? formData.members : [] })}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}
          >
            <span style={{
              width: "36px", height: "20px", borderRadius: "10px",
              background: formData.solo ? "#C8FF00" : "rgba(255,255,255,0.1)",
              position: "relative", transition: "background 0.25s",
              flexShrink: 0,
            }}>
              <span style={{
                position: "absolute",
                top: "3px",
                left: formData.solo ? "19px" : "3px",
                width: "14px", height: "14px",
                borderRadius: "50%",
                background: formData.solo ? "#000" : "rgba(255,255,255,0.4)",
                transition: "left 0.25s, background 0.25s",
              }} />
            </span>
            <span style={{
              fontFamily: "monospace", fontSize: "0.7rem",
              letterSpacing: "0.08em", color: "rgba(200,255,0,0.55)",
              userSelect: "none",
            }}>
              going solo (no additional members)
            </span>
          </button>
        </div>

        {/* Member rows */}
        {!formData.solo && (
          <div className="fi" style={{ opacity: 0 }}>
            {formData.members.map((m, i) => (
              <div key={i}>
                <MemberRow
                  index={i}
                  value={m}
                  onChange={(val) => updateMember(i, val)}
                  onRemove={() => removeMember(i)}
                />
                {errors[`member_${i}`] && (
                  <p style={{
                    fontFamily: "monospace", fontSize: "0.68rem",
                    color: "rgba(255,100,100,0.8)", marginBottom: "0.5rem",
                  }}>
                    // error: {errors[`member_${i}`]}
                  </p>
                )}
              </div>
            ))}

            {formData.members.length < 3 && (
              <button
                type="button"
                onClick={addMember}
                style={{
                  background: "none",
                  border: "0.5px solid rgba(200,255,0,0.25)",
                  color: "rgba(200,255,0,0.55)",
                  cursor: "pointer",
                  borderRadius: "4px",
                  padding: "0.55rem 1rem",
                  fontFamily: "monospace",
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  marginBottom: "0.5rem",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(200,255,0,0.55)";
                  e.currentTarget.style.color = "#C8FF00";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(200,255,0,0.25)";
                  e.currentTarget.style.color = "rgba(200,255,0,0.55)";
                }}
              >
                + add member ({formData.members.length}/3)
              </button>
            )}
          </div>
        )}

        <div className="fi" style={{ opacity: 0 }}>
          <PhaseNav onNext={handleNext} onBack={onBack} />
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase02Crew;
```

- [ ] **Step 3: Verify**

`npm run dev` → `/apply`:
- Phase 01: fill team name, lead name, email, phone. Leave one empty → click "next phase →" → error messages appear. Fill all correctly → advances to Phase 02.
- Phase 02: toggle "going solo" → member rows hide/show. Add members (up to 3). "+ add member" disables at 3. "← prev" goes back to Phase 01 with data preserved.

- [ ] **Step 4: Commit**

```bash
git add src/components/apply/phases/Phase01Identity.jsx src/components/apply/phases/Phase02Crew.jsx
git commit -m "feat: apply page phases 01 and 02 — identity and crew"
```

---

### Task 6: Phase 03 — The Mission + Phase 04 — Arsenal

**Files:**
- Modify: `src/components/apply/phases/Phase03Mission.jsx`
- Modify: `src/components/apply/phases/Phase04Arsenal.jsx`

**Interfaces:**
- Consumes: `formData.ideaSummary`, `formData.idea`, `formData.techStack`, `formData.links`

- [ ] **Step 1: Implement `Phase03Mission.jsx`**

```jsx
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";
import TerminalInput    from "../inputs/TerminalInput";
import TerminalTextarea from "../inputs/TerminalTextarea";

const wordCount = (str) =>
  str ? str.trim().split(/\s+/).filter(Boolean).length : 0;

const Phase03Mission = ({ formData, updateForm, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);

  useEffect(() => {
    const els = contentRef.current?.querySelectorAll(".fi");
    if (!els?.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.09, ease: "power3.out", delay: 0.35 }
    );
  }, []);

  const validate = () => {
    const e = {};
    if (!formData.ideaSummary.trim()) e.ideaSummary = "idea summary is required";
    else if (formData.ideaSummary.trim().length > 80) e.ideaSummary = "keep it under 80 characters";
    const wc = wordCount(formData.idea);
    if (wc < 50)  e.idea = `too short — write at least 50 words (${wc} so far)`;
    if (wc > 250) e.idea = `too long — keep it under 250 words (${wc} so far)`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  const summaryLen = formData.ideaSummary.length;

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 03 — THE MISSION"
        tagline='"What are you going to build."'
      />
      <div ref={contentRef}>
        <div className="fi" style={{ opacity: 0 }}>
          <div style={{ position: "relative" }}>
            <TerminalInput
              label="idea summary"
              value={formData.ideaSummary}
              onChange={(e) => updateForm({ ideaSummary: e.target.value })}
              maxLength={80}
              placeholder="describe it like a headline"
              error={errors.ideaSummary}
            />
            <span style={{
              position: "absolute",
              top: "2.1rem",
              right: "0.8rem",
              fontFamily: "monospace",
              fontSize: "0.6rem",
              color: summaryLen > 72 ? "rgba(255,100,100,0.6)" : "rgba(255,255,255,0.18)",
              pointerEvents: "none",
            }}>
              {summaryLen} / 80
            </span>
          </div>
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalTextarea
            label="idea pitch"
            value={formData.idea}
            onChange={(e) => updateForm({ idea: e.target.value })}
            maxWords={250}
            rows={6}
            placeholder="what problem, who has it, how you solve it"
            error={errors.idea}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <PhaseNav onNext={handleNext} onBack={onBack} />
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase03Mission;
```

- [ ] **Step 2: Implement `Phase04Arsenal.jsx`**

```jsx
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";
import TagInput from "../inputs/TagInput";
import TerminalInput from "../inputs/TerminalInput";

const isValidUrl = (v) => {
  try { new URL(v); return true; } catch { return false; }
};

const Phase04Arsenal = ({ formData, updateForm, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);

  // Ensure links array has at least 1 slot
  const links = formData.links.length > 0 ? formData.links : [""];

  useEffect(() => {
    const els = contentRef.current?.querySelectorAll(".fi");
    if (!els?.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.09, ease: "power3.out", delay: 0.35 }
    );
  }, []);

  const updateLink = (i, val) => {
    const updated = [...links];
    updated[i] = val;
    // strip trailing empty slots beyond the first
    updateForm({ links: updated });
  };

  const addLink = () => {
    if (links.length >= 3) return;
    updateForm({ links: [...links, ""] });
  };

  const validate = () => {
    const e = {};
    if (formData.techStack.length === 0) e.techStack = "add at least one technology";
    links.forEach((l, i) => {
      if (l.trim() && !isValidUrl(l.trim())) e[`link_${i}`] = "must be a valid URL";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    updateForm({ links: links.filter((l) => l.trim()) }); // clean empty slots
    if (validate()) onNext();
  };

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 04 — ARSENAL"
        tagline='"What you\'re bringing to the fight."'
      />
      <div ref={contentRef}>
        <div className="fi" style={{ opacity: 0 }}>
          <TagInput
            label="tech stack"
            value={formData.techStack}
            onChange={(tags) => updateForm({ techStack: tags })}
            error={errors.techStack}
          />
        </div>

        <div className="fi" style={{ opacity: 0 }}>
          <p style={{
            fontFamily: "monospace", fontSize: "0.7rem",
            letterSpacing: "0.08em", color: "rgba(200,255,0,0.55)",
            marginBottom: "0.75rem", userSelect: "none",
          }}>
            &gt;_ past work — optional
          </p>
          {links.map((link, i) => (
            <div key={i}>
              <TerminalInput
                label={`link_${String(i + 1).padStart(2, "0")}`}
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
                type="url"
                placeholder="https://..."
                error={errors[`link_${i}`]}
              />
            </div>
          ))}
          {links.length < 3 && (
            <button
              type="button"
              onClick={addLink}
              style={{
                background: "none",
                border: "0.5px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                borderRadius: "4px",
                padding: "0.5rem 0.9rem",
                fontFamily: "monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.07em",
                marginBottom: "0.75rem",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              + add link ({links.length}/3)
            </button>
          )}
        </div>

        <div className="fi" style={{ opacity: 0 }}>
          <PhaseNav onNext={handleNext} onBack={onBack} />
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase04Arsenal;
```

- [ ] **Step 3: Verify**

`npm run dev` → `/apply`:
- Phase 03: type in idea summary (char counter updates). Leave pitch empty → error mentions word count. Type 50+ words → can advance.
- Phase 04: add tags with Enter, remove with ✕. "add link" reveals next URL slot (max 3). Leave tech stack empty → blocks advance. Enter invalid URL → error.

- [ ] **Step 4: Commit**

```bash
git add src/components/apply/phases/Phase03Mission.jsx src/components/apply/phases/Phase04Arsenal.jsx
git commit -m "feat: apply page phases 03 and 04 — mission and arsenal"
```

---

### Task 7: Phase 05 — Final Statement

**Files:**
- Modify: `src/components/apply/phases/Phase05Statement.jsx`

**Interfaces:**
- Consumes: `formData.whyUs`, `formData.shipped`

- [ ] **Step 1: Implement `Phase05Statement.jsx`**

```jsx
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";
import TerminalTextarea from "../inputs/TerminalTextarea";

const wordCount = (str) =>
  str ? str.trim().split(/\s+/).filter(Boolean).length : 0;

const Phase05Statement = ({ formData, updateForm, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);

  useEffect(() => {
    const els = contentRef.current?.querySelectorAll(".fi");
    if (!els?.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.09, ease: "power3.out", delay: 0.35 }
    );
  }, []);

  const validate = () => {
    const e = {};
    const wc = wordCount(formData.whyUs);
    if (!formData.whyUs.trim()) e.whyUs = "this field is required";
    else if (wc > 200)          e.whyUs = `too long — keep it under 200 words (${wc} so far)`;
    if (!formData.shipped.trim()) e.shipped = "this field is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 05 — FINAL STATEMENT"
        tagline='"Make your case."'
      />
      <div ref={contentRef}>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalTextarea
            label="why your team"
            value={formData.whyUs}
            onChange={(e) => updateForm({ whyUs: e.target.value })}
            maxWords={200}
            rows={5}
            placeholder="why does this team deserve a spot?"
            error={errors.whyUs}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalTextarea
            label="last ship"
            value={formData.shipped}
            onChange={(e) => updateForm({ shipped: e.target.value })}
            rows={4}
            placeholder="what's the last thing you shipped? what broke first?"
            error={errors.shipped}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <PhaseNav onNext={handleNext} onBack={onBack} nextLabel="review →" />
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase05Statement;
```

- [ ] **Step 2: Verify**

`npm run dev` → `/apply` → advance to Phase 05:
- Word count on "why your team" updates live; over-limit turns red.
- "last ship" has no word limit.
- Empty fields block advance with inline errors.
- "← prev" goes back to Phase 04 with data intact.
- "review →" (instead of "next phase →") advances to Phase 06.

- [ ] **Step 3: Commit**

```bash
git add src/components/apply/phases/Phase05Statement.jsx
git commit -m "feat: apply page phase 05 — final statement"
```

---

### Task 8: Phase 06 — Deploy (dossier + submit + success screen)

**Files:**
- Modify: `src/components/apply/phases/Phase06Deploy.jsx`
- Modify: `src/components/apply/ApplyPage.jsx` (replace placeholder SuccessScreen)

**Interfaces:**
- Consumes: all `formData` fields, `onBack`, `onSubmitted`
- Consumes: `api.apply(payload)` from `src/lib/api.js`

- [ ] **Step 1: Implement `Phase06Deploy.jsx`**

```jsx
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader } from "../PhaseShared";
import { api } from "../../../lib/api";

const buildPayload = (f) => ({
  teamName:    f.teamName.trim(),
  lead: {
    name:  f.lead.name.trim(),
    email: f.lead.email.trim(),
    phone: f.lead.phone.replace(/\D/g, ""),
  },
  members: f.solo
    ? []
    : f.members
        .filter((m) => m.name.trim() || m.email.trim())
        .map((m) => ({ name: m.name.trim(), email: m.email.trim() })),
  ideaSummary: f.ideaSummary.trim(),
  idea:        f.idea.trim(),
  techStack:   f.techStack,
  links:       f.links.filter(Boolean).map((l) => l.trim()),
  whyUs:       f.whyUs.trim(),
  shipped:     f.shipped.trim(),
});

const truncate = (str, n = 72) =>
  str.length > n ? str.slice(0, n) + "…" : str;

const Phase06Deploy = ({ formData, onBack, onSubmitted }) => {
  const [status, setStatus]     = useState("idle"); // idle | loading | error | duplicate
  const [errMsg, setErrMsg]     = useState("");
  const submitRef               = useRef(null);
  const linesRef                = useRef([]);
  const contentRef              = useRef(null);

  const dossierLines = [
    { k: "TEAM",    v: formData.teamName },
    { k: "LEAD",    v: `${formData.lead.name} · ${formData.lead.email} · ${formData.lead.phone}` },
    ...(formData.solo || formData.members.length === 0
      ? [{ k: "CREW", v: "solo" }]
      : formData.members
          .filter((m) => m.name.trim())
          .map((m, i) => ({ k: `MEMBER_${String(i + 1).padStart(2, "0")}`, v: `${m.name} · ${m.email}` }))
    ),
    { k: "MISSION", v: truncate(formData.ideaSummary) },
    { k: "PITCH",   v: truncate(formData.idea) },
    { k: "STACK",   v: formData.techStack.join(", ") },
    ...formData.links
        .filter(Boolean)
        .map((l, i) => ({ k: `LINK_${String(i + 1).padStart(2, "0")}`, v: truncate(l, 55) })),
    { k: "WHY_US",  v: truncate(formData.whyUs) },
    { k: "SHIPPED", v: truncate(formData.shipped) },
  ];

  useEffect(() => {
    const els = linesRef.current.filter(Boolean);
    if (!els.length) return;
    gsap.fromTo(els,
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.28, stagger: 0.04, ease: "power2.out", delay: 0.3 }
    );
    // Fade in the submit area after dossier prints
    const delay = 0.3 + els.length * 0.04 + 0.2;
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", delay }
    );
  }, []);

  const handleSubmit = async () => {
    if (status === "loading") return;
    setErrMsg("");

    // Pulse button
    await new Promise((res) => {
      gsap.to(submitRef.current, {
        scale: 1.02, duration: 0.14, yoyo: true, repeat: 1,
        ease: "power2.inOut", onComplete: res,
      });
    });

    setStatus("loading");
    try {
      const res = await api.apply(buildPayload(formData));
      if (res.status === 201) {
        onSubmitted();
      } else if (res.status === 409) {
        setStatus("duplicate");
        setErrMsg("this email is already in the system.");
      } else {
        setStatus("error");
        setErrMsg("transmission failed. try again.");
      }
    } catch {
      setStatus("error");
      setErrMsg("transmission failed. try again.");
    } finally {
      if (status !== "idle") setStatus("idle");
    }
  };

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 06 — DEPLOY"
        tagline='"Review and transmit."'
      />

      {/* Dossier */}
      <div style={{
        background: "rgba(200,255,0,0.018)",
        border: "0.5px solid rgba(200,255,0,0.12)",
        borderRadius: "6px",
        padding: "1.25rem 1.5rem",
        marginBottom: "2rem",
        fontFamily: "monospace",
      }}>
        {dossierLines.map((line, i) => (
          <div
            key={i}
            ref={(el) => (linesRef.current[i] = el)}
            style={{
              display: "flex", gap: "1rem",
              padding: "0.28rem 0",
              borderBottom: i < dossierLines.length - 1
                ? "0.5px solid rgba(255,255,255,0.04)"
                : "none",
              opacity: 0,
            }}
          >
            <span style={{
              fontSize: "0.6rem", letterSpacing: "0.1em",
              color: "rgba(200,255,0,0.45)",
              minWidth: "6.5rem", flexShrink: 0, paddingTop: "0.05rem",
            }}>
              {line.k}
            </span>
            <span style={{
              fontSize: "0.72rem", color: "rgba(255,255,255,0.6)",
              lineHeight: 1.5, wordBreak: "break-all",
            }}>
              {line.v}
            </span>
          </div>
        ))}
      </div>

      {/* Submit area */}
      <div ref={contentRef} style={{ opacity: 0 }}>
        {errMsg && (
          <p style={{
            fontFamily: "monospace", fontSize: "0.68rem",
            color: "rgba(255,100,100,0.8)", marginBottom: "1rem",
            letterSpacing: "0.03em",
          }}>
            // error: {errMsg}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.62rem", letterSpacing: "0.1em",
              textTransform: "uppercase", padding: 0,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            ← prev
          </button>

          <button
            ref={submitRef}
            type="button"
            onClick={handleSubmit}
            disabled={status === "loading"}
            style={{
              padding: "0.9rem 2rem",
              background: status === "loading" ? "rgba(200,255,0,0.6)" : "#C8FF00",
              color: "#000",
              border: "none", borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "0.7rem", letterSpacing: "0.12em",
              fontWeight: 700,
              cursor: status === "loading" ? "not-allowed" : "pointer",
              transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              if (status !== "loading") {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(200,255,0,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {status === "loading"
              ? ">_ transmitting..."
              : ">_ transmit application --confirm"}
          </button>
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase06Deploy;
```

- [ ] **Step 2: Replace SuccessScreen in `ApplyPage.jsx`**

Find the placeholder `SuccessScreen` in `ApplyPage.jsx` and replace it with:

```jsx
const SuccessScreen = () => {
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const linkRef  = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(line1Ref.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }
    )
    .fromTo(line2Ref.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" },
      "+=0.15"
    )
    .fromTo(linkRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      "+=1.5"
    );
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p
        ref={line1Ref}
        style={{
          fontFamily: "monospace",
          fontSize: "clamp(1rem, 3vw, 1.5rem)",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#C8FF00",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
          opacity: 0,
        }}
      >
        ✓ ACCESS GRANTED. APPLICATION TRANSMITTED.
      </p>
      <p
        ref={line2Ref}
        style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.38)",
          opacity: 0,
        }}
      >
        We'll be in touch.
      </p>
      <a
        ref={linkRef}
        href="/"
        style={{
          display: "inline-block",
          marginTop: "2.5rem",
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
          textDecoration: "none",
          transition: "color 0.2s",
          opacity: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
      >
        ← Back to Startathon
      </a>
    </div>
  );
};
```

Make sure `useRef`, `useEffect`, and `gsap` are already imported at the top of `ApplyPage.jsx` (they should be from Task 4).

- [ ] **Step 3: Verify**

`npm run dev` → `/apply` → fill all 5 phases → reach Phase 06:
- Dossier lines print in one by one (staggered).
- "← prev" goes back to Phase 05.
- `>_ transmit application --confirm` button pulses on click, shows `>_ transmitting...` during loading.
- On success (201): screen transitions to centered "✓ ACCESS GRANTED. APPLICATION TRANSMITTED." with "← Back to Startathon" appearing after ~2s.
- To test without a live API: temporarily mock `api.apply` to return `{ status: 201 }`.

- [ ] **Step 4: Commit**

```bash
git add src/components/apply/phases/Phase06Deploy.jsx src/components/apply/ApplyPage.jsx
git commit -m "feat: apply page phase 06 — dossier, submit, and success screen"
```

---

### Task 9: Route wiring + nav + hero CTAs

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Navbar.jsx`
- Modify: `src/components/Hero.jsx`

**Interfaces:**
- Produces: `/apply` route renders `<ApplyPage />`
- Produces: Navbar CTA links to `/apply`
- Produces: Hero button links to `/apply`

- [ ] **Step 1: Add `/apply` route to `App.jsx`**

Add import at the top of `src/App.jsx`:
```jsx
import ApplyPage from "./components/apply/ApplyPage";
```

Add route inside `<Routes>` (after the sponsors route):
```jsx
<Route path="/apply" element={<ApplyPage />} />
```

- [ ] **Step 2: Update Navbar CTA**

In `src/components/Navbar.jsx`, replace the CTA button (currently `<button onClick={() => scrollTo("contact")} className="nav-cta">Get Notified</button>`) with:

```jsx
<a href="/apply" className="nav-cta" style={{ textDecoration: "none" }}>
  Apply Now
</a>
```

- [ ] **Step 3: Update Hero button**

In `src/components/Hero.jsx`, change the `<a href="#contact">` wrapper to `<a href="/apply">` and update the button label from `Register Interest` to `Apply Now`:

```jsx
<a href="/apply" style={{ textDecoration: "none", display: "inline-block" }}>
  <button className="group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full bg-[#C8FF00] px-7 py-3 text-black flex items-center gap-1">
    <span className="relative inline-flex overflow-hidden font-general text-xs uppercase">
      <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">
        Apply Now
      </div>
      <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
        Apply Now
      </div>
    </span>
    <TiLocationArrow />
  </button>
</a>
```

- [ ] **Step 4: Verify end-to-end**

`npm run dev`:
1. Landing page loads. Navbar shows "Apply Now" button. Hero shows "Apply Now" button.
2. Click either → navigates to `/apply` (no page reload — React Router SPA navigation).
3. Complete all 6 phases. Submit.
4. Success screen appears. "← Back to Startathon" navigates home.
5. Mobile: hamburger → menu appears → tap "Apply Now" in mobile nav → `/apply` loads.
6. On `/apply`, "✕ Exit" and the `Startathon.` logo both navigate to `/`.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/Navbar.jsx src/components/Hero.jsx
git commit -m "feat: wire /apply route, update nav and hero CTAs to Apply Now"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ `/apply` standalone route — Task 9
- ✅ Top bar (logo, phase indicator, exit) — Task 4
- ✅ 2px lime progress bar — Task 4
- ✅ Phase 01 Identity — Task 5
- ✅ Phase 02 Crew (dynamic rows, solo toggle, max 3) — Task 5
- ✅ Phase 03 Mission (summary + pitch word count) — Task 6
- ✅ Phase 04 Arsenal (tag input + optional links) — Task 6
- ✅ Phase 05 Statement (whyUs + shipped) — Task 7
- ✅ Phase 06 Deploy (dossier print + submit + success) — Task 8
- ✅ GSAP transitions between phases — Task 4
- ✅ GSAP stagger within each phase — Tasks 5–8
- ✅ Typewriter on phase label — Task 2 (hook) + Task 4 (PhaseHeader)
- ✅ `// error:` inline validation — Tasks 2, 5, 6, 7, 8
- ✅ Back navigation (prev button, data preserved in parent) — Tasks 4–8
- ✅ `api.waitlist()` migration — Task 1
- ✅ `api.apply()` payload — Task 8
- ✅ `.env` VITE_API_BASE — Task 1
- ✅ Navbar CTA → /apply — Task 9
- ✅ Hero button → /apply — Task 9
- ✅ Success screen with delayed back link — Task 8
- ✅ 409 duplicate and generic error states — Task 8

**Type consistency:**
- `formData` shape defined in `ApplyPage.jsx` `EMPTY_FORM` — all phases read the same keys
- `updateForm(patch)` — partial object, merged with `{ ...prev, ...patch }` — used identically across all phases
- `api.apply(payload)` — called in Phase06Deploy with `buildPayload(formData)` — payload shape matches spec
- `PhaseNav` props: `onNext`, `onBack`, `isFirst`, `nextLabel`, `disabled` — used consistently

**No placeholders:** None found.
