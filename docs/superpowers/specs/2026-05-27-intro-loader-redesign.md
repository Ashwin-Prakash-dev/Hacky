# Intro Loader Redesign — Design Spec
_Date: 2026-05-27_

## Overview

Replace the current "fly text to hero-title" outro in `Intro.jsx` with a two-phase cinematic collapse:
1. "Startathon." clips to "S." via a rightward wipe
2. The dot expands as a radial clip-path wipe, revealing the hero beneath

No other files change.

---

## Animation Phases

### Phases 1–3 (unchanged)
The three opening quotes play exactly as today:
- Fade in (`opacity 0→1`, `y 18→0`, 0.75s `power3.out`)
- Linger (1.1s, or 1.4s for quote index 2)
- Fade out (`opacity→0`, `y→-14`, 0.55s `power2.in`) → increment `currentIndex`

### Phase 4 — "Startathon." appears (unchanged)
Same fade-in as earlier quotes. The text is now rendered as three sibling spans:
```jsx
<p ref={textRef} ...>
  S
  <span ref={tailRef} style={{ display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap' }}>
    tartathon
  </span>
  <span ref={dotRef} style={{ color: '#3a3a3a' }}>.</span>
</p>
```
This is invisible to the reader — it still looks like "Startathon."

### Phase 5 — Collapse to "S." (new)
After a linger of ~1.5s, animate `tailRef`'s `width` from its natural `offsetWidth` → `0`.
- Duration: 0.6s
- Ease: `power2.in`
- Effect: the word squishes rightward, characters disappear, leaving `S.`

### Phase 6 — Radial wipe from dot (new)
After a brief pause (~0.3s) on `S.`:

1. Compute dot center: `dotRef.current.getBoundingClientRect()` → `cx`, `cy`
2. Use a GSAP proxy to animate a radius value `r: 0 → 2200` (safe max to cover any viewport)
3. On each `onUpdate`, write to `containerRef.current.style`:
   ```
   maskImage: `radial-gradient(circle at ${cx}px ${cy}px, transparent 0px, transparent ${r}px, black ${r}px)`
   webkitMaskImage: (same)
   ```
   This creates a transparent hole at the dot that grows outward, eating the black overlay and revealing the hero beneath.
4. Duration: 0.9s, ease: `power2.in`
5. `onComplete` → call `onComplete()` prop

---

## Skip Behaviour (unchanged)
Any click or keypress fires `skip()`:
- `gsap.killTweensOf(...)` on all refs
- Fade `containerRef` opacity → 0 over 0.4s
- Call `onComplete()`
- `skippedRef` guards against double-fire

The mask is on `containerRef`, so killing tweens and fading opacity is sufficient — no extra cleanup needed.

---

## Scope

| File | Change |
|---|---|
| `src/components/Intro.jsx` | All changes live here |
| `src/components/Hero.jsx` | No changes — `#hero-title` morph target is simply unused now |
| Any other file | No changes |

---

## Key Constraints

- GSAP cannot tween `radial-gradient` strings directly → use a proxy object `{ r: 0 }` with `onUpdate`
- Both `maskImage` and `webkitMaskImage` must be set for cross-browser support
- `tailRef` span needs `whiteSpace: nowrap` so characters don't reflow during width collapse
- `dotRef` stays visible throughout phase 5 and becomes the wipe origin in phase 6
- The `isLast` font/style logic (hero-scale text, `#c8c8c4` color, etc.) remains unchanged
