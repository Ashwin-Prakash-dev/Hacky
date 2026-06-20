# Apply Page — Design Spec
**Date:** 2026-06-20  
**Status:** Approved

---

## Overview

A standalone `/apply` route — a full-screen, multi-phase application form for Startathon. Teams apply as a unit. The experience is cinematic: terminal aesthetics fused with a mission-briefing tone. Each phase owns exactly one viewport and transitions via GSAP wipe animations. No scroll; no nav distractions.

---

## Route & Page Shell

- **Route:** `/apply` added to `App.jsx`
- **Layout:** Standalone — does not render `NavBar`, `Footer`, or any landing page section
- **Top bar (fixed):**
  - Left: `Startathon.` logo (links back to `/`)
  - Center: phase indicator `PHASE 01 / 06`
  - Right: `✕ Exit` link → `/`
- **Back navigation:** `← prev` text button bottom-left of each phase panel (hidden on Phase 01); triggers reverse wipe transition; all entered data is preserved in parent state
- **Progress:** Thin 2px lime (`#C8FF00`) line spanning full width at very top, advances with spring ease on each phase transition
- **Background:** `#0a0a0a`, grain overlay inherited from global CSS

---

## The 6 Phases

Each phase is a full-screen panel. Content staggers in on entry: phase label typewriters in (~300ms), tagline fades up, then input fields cascade with 80ms stagger. All field labels use `>_` terminal prompt prefix.

### PHASE 01 — IDENTITY CLEARANCE
> *"Establish your presence in the system."*

Fields:
- `>_ team name` — text input
- `>_ team lead name` — text input
- `>_ team lead email` — email input
- `>_ team lead phone` — tel input

### PHASE 02 — CREW MANIFEST
> *"Who's in the room with you."*

Fields:
- Dynamic member rows — up to 3 additional members, each: name + email
- `+ Add member` button (disabled when 3 members added)
- `Going solo` toggle — collapses all member rows within Phase 02 (phase is not skipped); marks `members: []` in payload; toggling back restores previously entered rows

### PHASE 03 — THE MISSION
> *"What are you going to build."*

Fields:
- `>_ idea summary` — text input, max 80 chars, helper: *"Describe it like a headline."*
- `>_ idea pitch` — textarea, 50–250 words, helper: *"What problem, who has it, how you solve it."*

### PHASE 04 — ARSENAL
> *"What you're bringing to the fight."*

Fields:
- `>_ tech stack` — tag input (type + Enter to add tags, click to remove), no limit
- `>_ past work` — up to 3 optional URL inputs, labelled `link_01`, `link_02`, `link_03`; `+ Add link` reveals next

### PHASE 05 — FINAL STATEMENT
> *"Make your case."*

Fields:
- `>_ why your team` — textarea, max 200 words
- `>_ last ship` — textarea for: *"What's the last thing you shipped? What broke first?"* — no word limit

### PHASE 06 — DEPLOY
> *"Review and transmit."*

- Full read-only dossier of all entered data, printed line by line as if being read back by the system
- Single submit button styled as terminal command:
  ```
  >_ transmit application --confirm
  ```
- On success: screen clears, centered message prints line by line:
  ```
  ✓ ACCESS GRANTED. APPLICATION TRANSMITTED.
  We'll be in touch.
  ```
  After 1.5s delay, a `← Back to Startathon` link fades in below
- On duplicate (409): `// error: this email is already in the system.`
- On error (other): `// error: transmission failed. try again.`

---

## Transitions & Animation

- **Between phases:** GSAP clip-path horizontal wipe. Exit: `clipPath` collapses right-to-left (0.5s, `power3.inOut`). Enter: new phase wipes in from right simultaneously.
- **Within phase:** stagger — label typewriter → tagline fade → fields cascade (80ms each)
- **Back navigation:** reverse wipe (right-to-left exit, left-to-right enter); data preserved in state
- **Progress bar:** GSAP spring ease to new width on phase advance
- **Validation errors:** appear inline as `// error: <message>` in `rgba(255,100,100,0.8)`, no blocking modals
- **Submit pulse:** the deploy button pulses once (scale 1→1.02→1) before loading state

---

## Validation Rules

| Field | Rule |
|---|---|
| Team name | Required, 2–40 chars |
| Lead name | Required |
| Lead email | Required, valid email format |
| Lead phone | Required, numeric, 10 digits |
| Members | Each row: name required if email given (and vice versa) |
| Idea summary | Required, max 80 chars |
| Idea pitch | Required, 50–250 words (word count shown live) |
| Tech stack | At least 1 tag required |
| Past work links | Optional, valid URL format if provided |
| Why us | Required, max 200 words (word count shown live) |
| Shipped | Required |

---

## API Client Migration

**New file:** `src/lib/api.js`

```js
const BASE = import.meta.env.VITE_API_BASE;

export const api = {
  waitlist: (data) => post('/waitlist', data),
  apply:    (data) => post('/apply', data),
};

function post(path, data) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
```

**`.env` change:**
- Remove: `VITE_WAITLIST_API`
- Add: `VITE_API_BASE=<base url>`

**`WaitlistForm.jsx` update:**
- Replace `fetch(import.meta.env.VITE_WAITLIST_API, ...)` with `api.waitlist(body)`

---

## Application Payload

```json
{
  "teamName": "string",
  "lead": {
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "members": [
    { "name": "string", "email": "string" }
  ],
  "ideaSummary": "string",
  "idea": "string",
  "techStack": ["string"],
  "links": ["string"],
  "whyUs": "string",
  "shipped": "string"
}
```

---

## File Structure

```
src/
  lib/
    api.js                     ← new: shared API client
  components/
    apply/
      ApplyPage.jsx            ← new: root shell (top bar, progress, phase router)
      PhaseTransition.jsx      ← new: GSAP wipe transition wrapper
      phases/
        Phase01Identity.jsx
        Phase02Crew.jsx
        Phase03Mission.jsx
        Phase04Arsenal.jsx
        Phase05Statement.jsx
        Phase06Deploy.jsx
      inputs/
        TerminalInput.jsx      ← new: styled >_ input field
        TerminalTextarea.jsx   ← new: styled >_ textarea
        TagInput.jsx           ← new: tag/chip input
        MemberRow.jsx          ← new: name + email row for crew
```

---

## Aesthetic Notes

- All inputs: dark fill (`rgba(255,255,255,0.04)`), lime border on focus (`rgba(200,255,0,0.45)`), `>_` prefix label in `rgba(200,255,0,0.5)`
- Phase label: `PHASE 0X — NAME` in `0.6rem` uppercase, lime, `0.2em` tracking
- Tagline: `1rem` italic, `rgba(255,255,255,0.35)`
- Error messages: `// error: message` below field, `rgba(255,100,100,0.75)`, `0.72rem` monospace
- Word count: `NNN / 200 words` in `rgba(255,255,255,0.2)`, bottom-right of textarea
- Tag chips: lime border, lime text on dark fill; `✕` to remove
- Deploy phase dossier: monospace, entries print line by line at 30ms intervals
