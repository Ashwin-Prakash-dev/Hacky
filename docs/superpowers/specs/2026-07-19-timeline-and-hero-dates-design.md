# Timeline section + hero event dates

## Context

The site currently has no visible event dates or process timeline. The event is Sep 5–6, 2026. There's a full sequence of milestones between now and the event (waitlist launch, registration, idea submission windows, shortlisting, payment, the event itself) that nothing on the page currently communicates.

`Hero.jsx` already has a reserved-but-empty slot for date/venue facts (a JSX comment at the top-right of the hero overlay), evidently built for exactly this and never filled in.

## Goals

1. Fill the hero's empty facts slot with the event date and venue.
2. Add a new scroll-revealed Timeline section between `Prizes` and `VideoCards` that walks through all seven milestones leading to the event.

## Non-goals

- No changes to `/apply` flow or any backend/date-driven business logic (payment deadlines, submission cutoffs) — this is presentation only.
- No new fonts, colors, or dependencies.

## 1. Hero facts slot

`Hero.jsx` lines ~149–153 currently render an empty `<div>` where `{/* facts */}` is commented out. Fill it with:

- `SEP 5–6, 2026`
- `SCTCE, Thiruvananthapuram` (the venue already established in `FAQ.jsx`'s "Is this in-person?" answer)

Styled as small-caps mono text consistent with the hero's existing caption treatment (matches the `font-mono`, uppercase, tracked style used elsewhere in the hero/badge disc), right-aligned per the existing container's `items-end text-right` classes.

## 2. Timeline component

New file: `src/components/Timeline.jsx`. Imported into `src/pages/MainPage.jsx`, placed between `<Prizes />` and `<VideoCards />`.

### Data

Seven milestones, each with a real `Date`, a short label (plain-verb, sentence case, no filler), and a `finale` flag on the last one:

| Date | Label |
|---|---|
| 2026-05-31 | Waitlist & website go live |
| 2026-07-19 | Registration opens · dates announced |
| 2026-07-29 | Idea submissions open |
| 2026-08-05 | Submissions close — last day to enter |
| 2026-08-10 | Shortlisted teams announced |
| 2026-08-20 | Payment deadline |
| 2026-09-05 – 2026-09-06 | **Startathon** (finale) |

### Live status (per-milestone, based on real today)

Each milestone is computed once on mount (`useMemo(() => new Date(), [])`) into one of three states by comparing to its date:

- `done` — date has passed. Dot: filled, dim lime.
- `active` — the most recent milestone whose date has passed but the next one hasn't (i.e. "we are here"). Dot: filled lime with a pulse (reuse the existing `pulse` keyframe already defined in `index.css`, currently used for the hero badge dot).
- `upcoming` — date hasn't arrived. Dot: hollow, low-opacity white ring.

This status governs dot fill and label opacity permanently — it does not change with scroll position.

### Layout

Follows the site's established row/hairline idiom (seen in `Prizes`' ladder and `StudentHook`'s outcome rows) rather than a bespoke card layout:

- CSS grid per row: `[dot gutter] [date] [label]`, alternating which side content sits on by index (odd/even) to read as a zigzag on desktop.
- `<640px`: single-column, dot gutter fixed left, content always right — the winding shape needs horizontal room mobile doesn't have.
- The finale row (Startathon) is visually emphasized — larger type, full lime, diamond marker instead of a circle — same finale treatment language as Prizes' pool figure.

### The winding path (decorative SVG backdrop)

- An `<svg>` positioned absolutely behind the dot gutter column, `preserveAspectRatio="none"` so it stretches to the row list's actual rendered height (rows are the source of truth for vertical spacing, not the SVG).
- The path `d` is hand-authored with 7 zigzag waypoints at evenly-spaced fractions (`i / 6` for `i` in 0–6) alternating between a left-third and right-third x-position — chosen to roughly line up with the alternating dot gutter position at each row. Not pixel-coupled to DOM coordinates; approximate by design, consistent with how the rest of the site treats decorative elements as furniture rather than physics.
- Drawn via the standard `stroke-dasharray`/`stroke-dashoffset` scroll-draw technique: `strokeDasharray = pathLength`, `dashoffset` animated from `pathLength → 0` scrubbed against the section's own scroll range (`start: "top 75%", end: "bottom 25%", scrub: true`), no pin.
- `<640px`: path swaps to a straight vertical line (simpler `d`, same draw mechanic).

### The ticking date readout (signature moment)

A `position: sticky` mono readout near the section heading that advances through calendar dates as the user scrolls — the section's one signature moment (per the "one moment per section" rule, no other flourish is added on top of this).

- Milestones sit at evenly-spaced scroll-progress stops (`i / 6`), matching the path waypoints — not spaced proportionally to real day-gaps. This keeps total scroll length reasonable (target ~250–300vh for the section) regardless of the uneven real gaps between milestones (49 days between May 31 → Jul 19 vs. 5 days between Aug 5 → Aug 10).
- Within each segment, the displayed date is linearly interpolated between the two bounding milestones' real dates against scroll progress, then rounded to the nearest whole day.
- This rounding is what makes days "skip" — no explicit skip logic needed. A normal scroll delta during a long segment (e.g. May 31 → Jul 19) advances several calendar days at once; during a short segment (Aug 5 → Aug 10) it advances closer to one day at a time.
- The readout always lands exactly on the true milestone date the instant scroll progress reaches that milestone's stop fraction.
- This is a narrative device, independent of the real-world `done`/`active`/`upcoming` dot coloring described above — no conflict, since the ticker never claims to represent "today."
- Implementation: driven by the same `ScrollTrigger` `onUpdate` callback that drives the path's dashoffset, using `gsap.utils.interpolate` or manual linear interpolation between segment bounds — a plain DOM text update, not a digit-flip mechanic (that visual signature already belongs to `Prizes`' reel counter; reusing it here would duplicate that section's moment).

### Motion & accessibility

- All work goes through `useGSAP()` with cleanup, `gsap.registerPlugin(ScrollTrigger)` at module scope — matches existing component conventions.
- `stroke-dashoffset` is a paint-only SVG presentation attribute; it does not trigger layout reflow, so it stays within the spirit of the "animate transform/opacity only, never layout" rule even though it isn't literally `transform`/`opacity`.
- Reduced motion (`gsap.matchMedia`): path renders fully drawn at rest (`dashoffset: 0`), all rows visible at opacity 1, no scrub. The sticky ticker HUD is omitted entirely (it's meaningless without scroll-driven motion) — dot colors still reflect real-world status since that part is not animation-dependent.
- Typography: this component uses `font-general` (Open Sauce Sans) throughout, including the section heading — explicitly not `font-display`/`bento-title` (Cabinet Grotesk), per direct instruction for this component only. Every other section on the site keeps its existing Cabinet Grotesk headings unchanged.

## Open copy to review

- Section eyebrow + heading text (not yet finalized — will write specific copy during implementation and flag it, e.g. something like "the road to September").
- Confirm hero venue string matches any updates elsewhere on the site before shipping.
