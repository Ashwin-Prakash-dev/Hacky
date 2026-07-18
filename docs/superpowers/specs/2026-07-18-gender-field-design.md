# Gender field on profile (creation + editing)

## Problem

Profile creation (`SignupPage.jsx`) and editing (`ProfilePage.jsx`) collect name, email, phone, and college but have no gender field. Add one with options Male / Female / Other.

## Scope

- Signup form (creation)
- Profile edit form (editing, also used as first-time completion for Google sign-ins)
- Backend already accepts/stores a `gender` field on `/auth/signup` and `PATCH /me` — no backend work here.
- Out of scope: showing gender on `TeammatesPanel` roster, any new route guard/gate component.

## UI

New `src/components/apply/inputs/TerminalSelect.jsx`: a native `<select>` styled to match `TerminalInput.jsx` (same label, border, focus-ring treatment as the rest of the "terminal" form language), with `appearance-none` and a small `ChevronDown` (lucide-react, already a project dependency) positioned over the native arrow. Options:

- `""` — disabled placeholder, "Select gender"
- `"male"` — Male
- `"female"` — Female
- `"other"` — Other

This establishes the first select/dropdown pattern in the codebase; no radio-group or pill-toggle alternative was chosen, to keep visual language consistent with the existing bordered-box inputs.

## Behavior

**SignupPage.jsx** (creation)
- Add `gender: ""` to `fields` state.
- `validate()`: error if `gender` is not one of `male`/`female`/`other`.
- Render `TerminalSelect` after the College field.
- Send `gender: fields.gender` in the `api.signup(...)` call.

**ProfilePage.jsx** (editing / completion)
- Add `gender: ""` to `fields` state, pre-filled from `me.gender` on load.
- Unlike name/phone/college — which only validate if the user touched them, since edits are partial/optional-per-field — `gender` validates unconditionally on every save. This is required by design: existing users who currently have no `gender` value get prompted to set it the next time they save any edit, without introducing a new forced-redirect gate (like `RequirePhone`) for a single field.
- Include `gender` in the `updateMe` request body whenever it's set.

## Non-goals

- No new "required field" route guard (no `RequireGender.jsx`).
- No display of gender in `TeammatesPanel` or anywhere else besides the owner's own profile form.
- No backend changes (assumed already supported).
