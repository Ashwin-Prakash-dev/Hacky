# Apply Page Rework — Design

**Date:** 2026-07-10
**Scope:** `/apply` route only. Main page untouched.

## Goals

1. Show an apply-method dialog immediately when `/apply` loads, offering four ways to apply: with Claude, with ChatGPT, with Gemini, or by filling the existing form.
2. Remove all Three.js / shader usage from the apply page (animated warp background and 5s dissolve phase transition), replacing them with lightweight CSS + GSAP equivalents.

## 1. Apply-method dialog

**New file:** `src/components/apply/ApplyMethodDialog.jsx`

- Rendered by `ApplyPage` as a full-screen overlay on mount (`method` state, initially unset). Terminal aesthetic matching the page: dark panel on `#0a0a0a`, monospace, lime `#C8FF00` accents, GSAP entrance animation.
- Options:
  - **Apply with Claude** — opens `https://claude.ai/new?q=<encodeURIComponent(prompt)>` in a new tab.
  - **Apply with ChatGPT** — opens `https://chatgpt.com/?q=<encodeURIComponent(prompt)>` in a new tab.
  - **Apply with Gemini** — Gemini has no reliable prompt-prefill URL param: copy the prompt to the clipboard, show a "prompt copied — paste it into Gemini" hint, and open `https://gemini.google.com/app` in a new tab.
  - **Fill the form** — dismisses the dialog into the existing 6-phase wizard (unchanged).
- After choosing an AI option the dialog stays open (the AI opens in a new tab), showing a "changed your mind? fill the form instead" link.
- Collapsible **"// or call the API yourself"** section: shows the endpoint `${VITE_API_BASE}/apply` and a ready-to-edit `curl` command with the full JSON payload schema, noting `201` = accepted, `409` = duplicate email.
- The dialog can only be dismissed by choosing an option.

## 2. Shared AI prompt

One prompt string (built with the API base from `import.meta.env.VITE_API_BASE`) used by all three AI options. It instructs the assistant to:

- Interview the applicant one question at a time for every payload field: `teamName`, `lead {name, email, phone}`, `members[] {name, email}` (or solo), `ideaSummary`, `idea`, `techStack[]`, `links[]`, `whyUs`, `shipped`.
- Assemble the JSON payload and output a ready-to-run `curl` POST to `${VITE_API_BASE}/apply` with `Content-Type: application/json`.
- Explain the responses: `201` = application accepted, `409` = email already applied.

## 3. Three.js / shader removal

- **Delete** `src/components/apply/BackgroundCanvas.jsx` and its usages in `ApplyPage.jsx` (both the wizard and the submitted screen).
- **Background replacement:** solid `#0a0a0a` plus a subtle fixed CSS radial lime glow (e.g. `radial-gradient` at low opacity). The CRT scanline overlay stays.
- **Rewrite** `src/components/apply/PhaseTransition.jsx` as a pure GSAP ~0.5s direction-aware fade + slide (forward slides from right, back from left). Same component API (`direction`, `children`), so no phase component changes.
- Result: no module under `src/components/apply/` imports `three` or `@react-three/fiber`. The npm packages stay (main-page components use them).

## Error handling

- Clipboard copy (Gemini) wrapped in try/catch; on failure, show the prompt in a selectable block with a "copy manually" fallback message.
- Existing form submission error handling unchanged.

## Testing

- Manual: load `/apply`, verify dialog shows first; each AI option opens the right URL with the prompt; Gemini copies to clipboard; "fill the form" reveals phase 1; phase transitions animate via GSAP; no Three.js network chunks load on `/apply`; `npm run lint` passes.
