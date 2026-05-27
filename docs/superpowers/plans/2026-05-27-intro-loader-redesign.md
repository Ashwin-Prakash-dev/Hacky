# Intro Loader Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "fly text to hero-title" outro in `Intro.jsx` with a two-phase collapse: "Startathon." squishes to "S." then the dot radially wipes the overlay away, revealing the hero.

**Architecture:** All changes are self-contained in `Intro.jsx`. Two new refs (`tailRef`, `dotRef`) are added to split the last quote's text into animatable parts. The `isLast` animation branch in `useEffect` is replaced entirely — the GSAP timeline drives the collapse, then standalone `gsap.to()` calls handle the radial wipe via a CSS `mask-image` proxy.

**Tech Stack:** React 18, GSAP 3, CSS `mask-image` / `-webkit-mask-image`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/components/Intro.jsx` | Modify | Add `tailRef` + `dotRef` refs; restructure last-quote JSX; rewrite `isLast` branch; update `skip()` |

---

### Task 1: Add refs and restructure last-quote JSX

**Files:**
- Modify: `src/components/Intro.jsx`

This task is purely structural — the component should still render and look identical after it. No animation logic changes yet.

- [ ] **Step 1: Add `tailRef` and `dotRef` refs**

In `src/components/Intro.jsx`, add two refs immediately after the existing `textRef` declaration:

```js
const textRef = useRef(null);
const tailRef = useRef(null);   // "tartathon" — collapses in phase 5
const dotRef  = useRef(null);   // "."         — radial wipe origin in phase 6
```

- [ ] **Step 2: Replace the `<p>` body with split spans for the last quote**

Find the `<p ref={textRef} ...>` element. Replace its children from:

```jsx
{current.text}
{current.dot && <span style={{ color: "#3a3a3a" }}>.</span>}
```

to:

```jsx
{isLast ? (
  <>
    S
    <span
      ref={tailRef}
      style={{
        display: "inline-block",
        overflow: "hidden",
        whiteSpace: "nowrap",
        verticalAlign: "top",
      }}
    >
      tartathon
    </span>
    <span ref={dotRef} style={{ color: "#3a3a3a" }}>.</span>
  </>
) : (
  <>
    {current.text}
    {current.dot && <span style={{ color: "#3a3a3a" }}>.</span>}
  </>
)}
```

- [ ] **Step 3: Verify the app still renders correctly**

Run the dev server (`npm run dev` / `vite`) and open the app. The intro should play exactly as before — "Startathon." should still look identical (the span split is invisible to the reader). Confirm phases 1–3 are unaffected.

---

### Task 2: Rewrite the `isLast` animation branch

**Files:**
- Modify: `src/components/Intro.jsx`

Replace the old `else` block (the hero-title morph) with the new collapse + radial wipe.

- [ ] **Step 1: Delete the old `isLast` else block**

In the `useEffect` that watches `currentIndex`, find and remove everything inside the `else` block (the linger, `heroTitle` lookup, `getBoundingClientRect`, `bgRef` fade, and `textRef` fly). Leave the `else {` and `}` in place so you have an empty else to fill.

- [ ] **Step 2: Write the new `isLast` branch**

Replace the empty `else` block with:

```js
} else {
  // Phase 5: linger 1.5s, then clip-wipe "tartathon" rightward → leaves "S."
  tl.to({}, { duration: 1.5 }).call(() => {
    if (skippedRef.current) return;

    // Pin the natural width so GSAP has a numeric from-value to tween from
    tailRef.current.style.width = tailRef.current.scrollWidth + "px";

    gsap.to(tailRef.current, {
      width: 0,
      duration: 0.6,
      ease: "power2.in",
      onComplete: () => {
        if (skippedRef.current) return;

        // Phase 6: radial wipe — grow a transparent hole from the dot outward
        const dotRect = dotRef.current.getBoundingClientRect();
        const cx = dotRect.left + dotRect.width / 2;
        const cy = dotRect.top  + dotRect.height / 2;

        const proxy = { r: 0 };
        gsap.to(proxy, {
          r: 2200,          // safely covers any viewport diagonal
          delay: 0.3,       // brief pause on "S." before the wipe
          duration: 0.9,
          ease: "power2.in",
          onUpdate() {
            const val = `radial-gradient(circle at ${cx}px ${cy}px, transparent 0px, transparent ${proxy.r}px, black ${proxy.r}px)`;
            containerRef.current.style.maskImage       = val;
            containerRef.current.style.webkitMaskImage = val;
          },
          onComplete() {
            if (!skippedRef.current) onComplete();
          },
        });
      },
    });
  });
}
```

- [ ] **Step 3: Verify the new outro in the browser**

Open the app and let the intro play through all four quotes. Confirm:
1. "Startathon." fades in at hero scale
2. After ~1.5s, "tartathon" squishes rightward — leaving "S."
3. After a beat, a hole expands from the dot outward, eating the black overlay
4. The hero section is revealed cleanly beneath

---

### Task 3: Update `skip()` to kill `tailRef` tweens

**Files:**
- Modify: `src/components/Intro.jsx`

The `skip()` function kills tweens by element reference. `tailRef` wasn't in the original kill list.

- [ ] **Step 1: Add `tailRef.current` to the `killTweensOf` call**

Find the `skip` function and update the `gsap.killTweensOf` call from:

```js
gsap.killTweensOf([containerRef.current, textRef.current, bgRef.current]);
```

to:

```js
gsap.killTweensOf([containerRef.current, textRef.current, bgRef.current, tailRef.current]);
```

- [ ] **Step 2: Verify skip at each phase**

Test all three skip scenarios manually:
1. **Skip during early quotes** (click during quote 1 or 2) → overlay fades instantly, hero appears
2. **Skip during "Startathon." linger** → overlay fades instantly
3. **Skip mid-collapse** (click while "tartathon" is squishing) → collapse stops, overlay fades, hero appears
4. **Skip mid-wipe** (click while hole is expanding) → wipe stops, overlay fades to opacity 0

In all cases the hero should be fully visible and interactive after the fade.

---

### Task 4: Commit

- [ ] **Step 1: Stage and commit**

```bash
git add src/components/Intro.jsx
git commit -m "feat: intro loader — collapse to S. then radial dot wipe"
```

Expected output: `1 file changed` on branch `gm`.

---

## Self-Review Notes

- **Spec coverage:** All six phases accounted for. Phase 5 (collapse) → Task 2 Step 2 `gsap.to(tailRef)`. Phase 6 (radial wipe) → Task 2 Step 2 proxy tween. Skip behaviour update → Task 3.
- **No placeholders:** All code blocks are complete and runnable.
- **Type consistency:** `tailRef`, `dotRef`, `containerRef`, `skippedRef`, `onComplete` — names are consistent across all tasks.
- **`bgRef` fade:** The old code faded `bgRef` independently during the morph. The new code does not fade `bgRef` — the mask wipe handles the entire reveal. The black background (via `bgRef`) disappears naturally as the mask shrinks it to nothing. No gap.
