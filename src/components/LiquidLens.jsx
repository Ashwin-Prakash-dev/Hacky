import { useEffect, useMemo, useRef, useState } from "react";
import {
  SHAPE_W,
  SHAPE_H,
  clamp01,
  fittedTextPx,
  loadDisplayFont,
} from "../lib/wordmark";

// The site's liquid x-ray lens, in two parts:
//
//   · base ink   — solid lime wordmark over the dark hero, always visible.
//     This IS the hero headline: droplets of ink writhe, congeal into
//     "S.", then fuse into "Startathon." through a gooey blur-threshold
//     filter.
//   · lens layer — a fixed, full-viewport x-ray filter that shows through
//     an organic blob chasing the cursor ANYWHERE on the page. It is
//     translucent: a backdrop-filter chain recolors the live page inside
//     the blob (whites turn lime, the ground stays dark), so all content
//     stays crisp and readable "on top of" the blob while wearing its
//     effect. Over that float a drafting grid, the hero wordmark as a
//     HOLLOW stroked wireframe on an opaque patch (the blob swaps the
//     solid fill for border-only glyphs) playing the same sequence, and
//     survey boxes (dashed bounds, section labels, pixel dimensions)
//     around every `data-lens` section. A document-space container counter-translates
//     the page scroll each frame, so the x-ray annotations stay
//     registered with the content they anatomize.
//
// The blob is movement-driven: it grows where the cursor moves, collapses
// after a beat of stillness, and swells back the moment movement resumes.
// It also behaves like oil in water: fast strokes bud droplets off its
// trailing edge — each swelling out of the blob's own mass, pinching off,
// and collapsing over ~½s as its own wobbly mini-blob (clip-path
// subpaths, so they merge with the mother blob while overlapping).
//
// Hovering any actionable element (links, buttons, fields) target-locks
// the lens: the blob collapses out of the way (bursting into lobes as it
// drains) while corner brackets snap around the element, a bent leader
// line draws out to a label naming the target, and the custom cursor
// squares into a reticle. `data-lens-label` / `data-lens-verb` override
// the label text; `data-lens-skip` opts an element out of the lock
// furniture entirely.

const BLOB_POINTS = 10;
const IDLE_MS = 200; // cursor still for this long -> blob melts away
const TAP_MS = 1500; // touch: a tapped blob lives this long
const DROPS = 5; // ink droplets writhing before the S. congeals

// Ink timeline (own clock, starts when the intro hands off)
const FORM_AT = 0.5; // goo droplets -> "S."
const FORM_DUR = 2.6;
const FUSE_AT = 4.2; // "S." -> "Startathon."
const FUSE_DUR = 3.6;

function canUse() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const isFinePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const smooth = (x) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

// Closed Catmull-Rom spline through the sample points -> cubic Béziers.
function blobPath(p) {
  const n = p.length;
  let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

// A detached droplet as its own wobbly mini-blob — 7 spline points with
// per-droplet noise, appended as a subpath so it clips in the same pass
// as (and merges with) the mother blob.
function shedPath(s, r, t) {
  const pts = [];
  for (let i = 0; i < 7; i++) {
    const th = (i / 7) * Math.PI * 2;
    const rr =
      r *
      (1 +
        0.22 * Math.sin(t * (3.1 + s.w1) + i * 2.3 + s.ph) +
        0.14 * Math.cos(t * (2.2 + s.w2) + i * 3.9));
    pts.push([s.x + Math.cos(th) * rr, s.y + Math.sin(th) * rr]);
  }
  return ` ${blobPath(pts)}`;
}

const HIDDEN_CLIP = 'circle(0px at -200px -200px)';
const CX = SHAPE_W / 2;
const CY = SHAPE_H / 2;

// Lock label for an element: a verb matched to what the element DOES,
// then its name. Name source, best first: explicit label, aria,
// placeholder (fields), visible text. Roll-up CTAs duplicate their text
// in stacked spans ("apply nowapply now") — the halved-string check
// collapses that back to one copy.
function lensVerb(el) {
  const explicit = el.getAttribute("data-lens-verb");
  if (explicit) return explicit;
  const tag = el.tagName.toLowerCase();
  if (tag === "a") {
    const href = el.getAttribute("href") || "";
    if (href === "/apply") return "target locked";
    if (/^https?:/i.test(href)) return "external asset";
    if (href.startsWith("#")) return "waypoint set";
    return "route found";
  }
  if (tag === "button") {
    return el.type === "submit" && el.closest("form")
      ? "transmit ready"
      : "action armed";
  }
  if (tag === "select") return "selector open";
  if (tag === "input" || tag === "textarea") return "input channel";
  return "target locked";
}

function lensName(el) {
  const raw =
    el.getAttribute("data-lens-label") ||
    el.getAttribute("aria-label") ||
    (typeof el.placeholder === "string" && el.placeholder) ||
    el.textContent ||
    "";
  let name = raw
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[↗›→+·]+$/g, "")
    .trim();
  const h = Math.floor(name.length / 2);
  if (name.length && name.length % 2 === 0 && name.slice(0, h) === name.slice(h))
    name = name.slice(0, h).trim();
  if (name.length > 26) name = `${name.slice(0, 26).trim()}…`;
  if (!name) {
    const tag = el.tagName.toLowerCase();
    name = tag === "a" ? "link" : tag === "button" ? "button" : "field";
  }
  return `${lensVerb(el)} · ${name}`;
}

const monoTag = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.62rem",
  letterSpacing: "0.26em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const LiquidLens = ({ started = true }) => {
  const layerRef = useRef(null);
  const worldRef = useRef(null);
  const glareRef = useRef(null);
  const rimRef = useRef(null);
  const readoutRef = useRef(null);
  // target-lock furniture (outside the blob clip, so it can extend past
  // the halo): corner brackets, bent leader line, node dot, label
  const lockUiRef = useRef(null);
  const lockBracketsRef = useRef(null);
  const lockLineRef = useRef(null);
  const lockDotRef = useRef(null);
  const lockLabelRef = useRef(null);
  // Per-layer node registries: index 0 = base ink, 1 = lens wireframe.
  const nodes = useRef({
    svg: [],
    tag: [],
    goo: [],
    drops: [],
    sText: [],
    wText: [],
    blur: [],
  });
  const startedRef = useRef(started);
  startedRef.current = started;
  const enabled = useMemo(canUse, []);
  // Survey boxes: document-space rects of every [data-lens] section.
  const [zones, setZones] = useState([]);

  // Size both SVGs identically (a 60vw band anchored 10% from the left,
  // capped against viewport height so the line never towers on narrow-
  // and-tall screens), and fit the font sizes through the shared rule.
  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;

    loadDisplayFont().then(() => {
      if (!alive) return;
      const sPx = fittedTextPx("S.", 460);
      const wPx = fittedTextPx("Startathon.", 330);
      nodes.current.sText.forEach((el) => el?.setAttribute("font-size", sPx));
      nodes.current.wText.forEach((el) => el?.setAttribute("font-size", wPx));
    });

    const size = () => {
      // desktop: a 60vw band anchored 10% from the left; mobile: an 84vw
      // band, centered — 60% would shrink the wordmark into a corner
      const mobile = window.innerWidth < 768;
      const frac = mobile ? 0.84 : 0.6;
      const leftPct = mobile ? 8 : 10;
      const cssW = Math.min(
        window.innerWidth * frac,
        window.innerHeight * frac * 2.48
      );
      const cssH = (cssW * SHAPE_H) / SHAPE_W;
      nodes.current.svg.forEach((svg) => {
        if (!svg) return;
        svg.style.width = `${cssW}px`;
        svg.style.height = `${cssH}px`;
        svg.style.left = `${leftPct}%`;
      });
      nodes.current.tag.forEach((tag) => {
        if (!tag) return;
        tag.style.top = `calc(50% + ${cssH / 2 + 18}px)`;
        tag.style.left = `${leftPct}%`;
      });
    };
    size();
    window.addEventListener("resize", size);
    return () => {
      alive = false;
      window.removeEventListener("resize", size);
    };
  }, [enabled]);

  // Measure the sections the lens anatomizes. Layout settles late (fonts,
  // media) — rescan a couple of times early, then on resize.
  useEffect(() => {
    if (!enabled) return undefined;
    const scan = () => {
      const sy = window.scrollY;
      const list = [];
      document.querySelectorAll("[data-lens]").forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.width < 40 || r.height < 40) return;
        list.push({
          id: el.dataset.lens,
          n: i + 2, // the hero is sec 01
          top: r.top + sy,
          left: r.left,
          w: r.width,
          h: r.height,
        });
      });
      setZones(list);
    };
    scan();
    const t1 = setTimeout(scan, 1200);
    const t2 = setTimeout(scan, 3500);
    window.addEventListener("resize", scan);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", scan);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const layer = layerRef.current;
    if (!layer) return undefined;

    const pos = { x: -400, y: -400 };
    const target = { x: -400, y: -400 };
    const state = {
      within: false,
      interactive: false,
      lastMove: -1e9,
      lock: null,
      lockName: "",
      lockStamp: 0, // when the current lock engaged (draw/type clocks)
    };
    let shownText = ""; // last label text written to the DOM
    const fine = isFinePointer();
    const idleMs = fine ? IDLE_MS : TAP_MS;
    let vx = 0;
    let vy = 0;
    let rCur = 0;
    let rVel = 0;
    let t = 0;
    let inkT = 0; // the ink's own movie clock
    let raf = 0;
    let lastPhase = "";
    let fluid = 0; // smoothed hover-energy driving the rest-state smear
    let skew = 0; // smoothed velocity skew on the resting text
    // detached oil droplets: torn off by fast strokes or a collapsing
    // blob, each collapsing on its own within a few hundred ms
    const sheds = [];
    let shedAcc = 0; // distance travelled since the last droplet tore off
    let prevOpen = false;
    // target lock: hovering any actionable element magnetizes the blob
    // onto it and morphs it into a pill-shaped halo pinned to the element
    let lockAmt = 0; // smoothed 0..1 morph between free blob and halo
    let lastLockRect = null; // kept through the release fade-out
    let lockClass = false;

    const tf = (sx, sy, sk) =>
      `translate(${CX} ${CY}) skewX(${sk.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-CX} ${-CY})`;

    const baseR = () =>
      Math.min(Math.max(window.innerWidth * 0.11, 110), 190);

    // apply an attribute to the same node in both layers
    const both = (kind, fn) => {
      const list = nodes.current[kind];
      for (let i = 0; i < list.length; i++) if (list[i]) fn(list[i], i);
    };
    // the base ink runs the full goo blur; the lens wireframe is thin
    // strokes, so it takes a scaled-down defocus instead (a heavy blur
    // would dissolve it entirely)
    const setBlur = (v) =>
      both("blur", (el, i) =>
        el.setAttribute(
          "stdDeviation",
          (i ? Math.min(v * 0.35, 6) : v).toFixed(1)
        )
      );

    const track = (e) => {
      // the lens layer is fixed, so it works in raw viewport coordinates
      state.within = true;
      state.lastMove = performance.now();
      target.x = e.clientX;
      target.y = e.clientY;
      if (pos.x < -200) {
        pos.x = e.clientX;
        pos.y = e.clientY;
      }
      // every actionable element locks the lens on: the blob pins to it
      // as a halo instead of hiding it. `data-lens-skip` opts an element
      // back into the plain collapse.
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const skip = el?.closest?.("[data-lens-skip]");
      const lockHit = skip
        ? null
        : el?.closest?.("a,button,input,textarea,select,[data-lens-lock]");
      if (lockHit !== state.lock) {
        state.lock = lockHit || null;
        if (lockHit) {
          state.lockName = lensName(lockHit);
          // retrigger the draw-in + typewriter for the new target
          state.lockStamp = performance.now();
        }
      }
      state.interactive = !!skip;
    };
    // fine pointer: the blob follows movement; touch: it blooms at the tap
    // point (and rides a drag), then melts away after TAP_MS on its own
    const onMove = fine ? track : null;
    const onTouch = fine ? null : track;
    const onGone = () => {
      state.within = false;
    };

    const tick = () => {
      t += 1 / 60;
      if (startedRef.current) inkT += 1 / 60;

      // the x-ray world counter-scrolls so its annotations stay registered
      // with the content they anatomize
      if (worldRef.current) {
        worldRef.current.style.transform = `translate3d(0, ${(-window.scrollY).toFixed(1)}px, 0)`;
      }

      // ---- target lock -------------------------------------------------
      // while an actionable element is hovered, the blob COLLAPSES out of
      // the way (bursting into lobes as it drains) and the lock furniture
      // — brackets, leader line, label — pins to the element's rect
      const wantLock = !!state.lock && state.lock.isConnected;
      if (wantLock) {
        lastLockRect = state.lock.getBoundingClientRect();
      }
      lockAmt += ((wantLock ? 1 : 0) - lockAmt) * 0.1;
      if (wantLock !== lockClass) {
        lockClass = wantLock;
        // the custom cursor reshapes into a reticle while locked
        document.body.classList.toggle("lens-lock", wantLock);
      }

      // ---- pointer + blob radius (spring: ~1s bloom/collapse) ---------
      const px = pos.x;
      const py = pos.y;
      pos.x += (target.x - pos.x) * 0.13;
      pos.y += (target.y - pos.y) * 0.13;
      vx = pos.x - px;
      vy = pos.y - py;
      const idle = performance.now() - state.lastMove > idleMs;
      const rTarget =
        state.within && !wantLock && !state.interactive && !idle
          ? baseR()
          : 0;
      // under-damped spring (ω≈6, ζ≈0.75): settles in ~1s with a soft
      // overshoot, so the bloom swells and the collapse drains
      rVel += ((rTarget - rCur) * 36 - rVel * 9) / 60;
      rCur += rVel / 60;
      if (rCur < 0) {
        rCur = 0;
        rVel *= 0.3;
      }

      // ---- oil break-up ------------------------------------------------
      // fast strokes bud droplets off the trailing edge: each one swells
      // out of the blob's own mass while still attached, pinches off as
      // the blob moves on, then collapses over ~½s
      const spd = Math.hypot(vx, vy);
      if (rCur > 24 && !wantLock) {
        shedAcc += spd;
        if (spd > 6 && shedAcc > 90 && sheds.length < 8) {
          shedAcc = 0;
          const back = Math.atan2(-vy, -vx) + (Math.random() - 0.5) * 1.1;
          const d = rCur * (0.72 + Math.random() * 0.25);
          sheds.push({
            x: pos.x + Math.cos(back) * d,
            y: pos.y + Math.sin(back) * d,
            vx: vx * 0.1 + (Math.random() - 0.5) * 1.0,
            vy: vy * 0.1 + (Math.random() - 0.5) * 1.0,
            r0: rCur * (0.26 + Math.random() * 0.16),
            life: 0,
            dur: 0.45 + Math.random() * 0.25,
            ph: Math.random() * Math.PI * 2,
            w1: Math.random() * 2,
            w2: Math.random() * 2,
          });
        }
      }
      // the film breaks on collapse: a few large lobes emerge from the
      // draining mass, drift apart, and dissolve
      const openNow = rTarget > 0;
      if (prevOpen && !openNow && rCur > 40) {
        for (let i = 0; i < 5 && sheds.length < 10; i++) {
          const a = (i / 5) * Math.PI * 2 + Math.random() * 0.9;
          const d = rCur * (0.5 + Math.random() * 0.3);
          sheds.push({
            x: pos.x + Math.cos(a) * d,
            y: pos.y + Math.sin(a) * d,
            vx: Math.cos(a) * (0.6 + Math.random()),
            vy: Math.sin(a) * (0.6 + Math.random()),
            r0: rCur * (0.2 + Math.random() * 0.14),
            life: 0,
            dur: 0.5 + Math.random() * 0.3,
            ph: Math.random() * Math.PI * 2,
            w1: Math.random() * 2,
            w2: Math.random() * 2,
          });
        }
      }
      prevOpen = openNow;

      // ---- ink dynamics (drives both layers in lockstep) ---------------
      // Timeline: goo droplets -> "S." -> "Startathon.", every hand-off a
      // liquid fuse, never a cut.
      const g0 = clamp01((inkT - FORM_AT) / FORM_DUR); // droplets -> S.
      const q = clamp01((inkT - FUSE_AT) / FUSE_DUR); // S. -> word
      const open = rCur > 2;
      const phase =
        q >= 1 ? "restW" : q > 0 ? "fuse" : g0 >= 1 ? "restS" : "goo";
      if (phase !== lastPhase) {
        lastPhase = phase;
        both("drops", (el) => el.setAttribute("opacity", phase === "goo" ? "1" : "0"));
        if (phase === "restW") {
          both("sText", (el) => el.setAttribute("opacity", "0"));
          both("wText", (el) => el.setAttribute("opacity", "1"));
        }
        if (phase === "restS") {
          both("sText", (el) => el.setAttribute("opacity", "1"));
        }
        fluid = 0;
        skew = 0;
      }

      if (phase === "goo") {
        // before the S. exists, the ink is only a writhing cluster of
        // droplets; they converge and the S. congeals out of them
        const conv = smooth(g0);
        both("drops", (group) => {
          const kids = group.children;
          for (let i = 0; i < kids.length; i++) {
            const ph = i * 1.9;
            const ax = (270 - i * 40) * (1 - conv);
            const ay = (115 - i * 13) * (1 - conv);
            const dx =
              CX +
              Math.cos(t * (0.7 + i * 0.23) + ph) * ax +
              Math.sin(t * 1.4 + i * 2.2) * 16 * (1 - conv);
            const dy = CY + Math.sin(t * (0.9 + i * 0.19) + ph * 2) * ay;
            const dr =
              (56 + 24 * Math.sin(t * (1.1 + i * 0.3) + ph)) *
              (1 - 0.72 * conv);
            kids[i].setAttribute("cx", dx.toFixed(1));
            kids[i].setAttribute("cy", dy.toFixed(1));
            kids[i].setAttribute("r", Math.max(dr, 4).toFixed(1));
          }
          group.setAttribute(
            "opacity",
            g0 > 0.82 ? ((1 - g0) / 0.18).toFixed(3) : "1"
          );
        });
        // the S. surfaces out of the goo late in the gather
        const sOp = smooth((g0 - 0.45) / 0.45).toFixed(3);
        const sS = 0.72 + 0.28 * conv;
        const sTf = tf(
          sS * (1 + Math.cos(t * 2.1) * 0.04),
          sS * (1 + Math.sin(t * 2.7) * 0.05),
          0
        );
        both("sText", (el) => {
          el.setAttribute("opacity", sOp);
          el.setAttribute("transform", sTf);
        });
        both("wText", (el) => el.setAttribute("opacity", "0"));
        // heavy goo while forming, releasing as the S. sets
        setBlur(3 + 17 * (1 - smooth((g0 - 0.6) / 0.4)) + Math.sin(t * 3.4) * 2);
        both("goo", (el, i) => el.setAttribute("filter", `url(#hero-goo-${i})`));
      } else if (phase === "fuse") {
        // the fuse: slow, wide goo envelope with living undulation —
        // "S." melts outward while the word congeals in underneath
        const wave = Math.sin(q * Math.PI);
        const sOp = (1 - smooth((q - 0.08) / 0.62)).toFixed(3);
        const wOp = smooth((q - 0.28) / 0.6).toFixed(3);
        const sTf = tf(1 + smooth(q) * 2.6, 1 + Math.sin(t * 3.1) * 0.06 * wave, 0);
        const wTf = tf(
          0.5 + 0.5 * smooth(q * 1.05),
          1 + Math.sin(t * 2.6 + 1.7) * 0.05 * wave,
          0
        );
        both("sText", (el) => {
          el.setAttribute("opacity", sOp);
          el.setAttribute("transform", sTf);
        });
        both("wText", (el) => {
          el.setAttribute("opacity", wOp);
          el.setAttribute("transform", wTf);
        });
        const env = Math.pow(wave, 0.7); // wide, lingering liquid peak
        setBlur(env * 26 + Math.sin(t * 4.2) * 2 * env);
        both("goo", (el, i) => el.setAttribute("filter", `url(#hero-goo-${i})`));
      } else {
        // resting ink ("S." before the fuse, the word after): a gentle
        // idle undulation keeps it liquid, and a moving cursor smears it
        // like wet oil — goo blur + skew follow pointer energy
        const kind = phase === "restS" ? "sText" : "wText";
        fluid += ((open ? Math.min(spd * 0.5, 7) : 0) - fluid) * 0.09;
        skew +=
          ((open ? Math.max(-6, Math.min(6, vx * 0.35)) : 0) - skew) * 0.09;
        const energy = fluid / 7;
        const iTf = tf(
          1 + Math.cos(t * 1.9) * 0.012 + Math.cos(t * 4.4) * 0.03 * energy,
          1 + Math.sin(t * 2.3) * 0.014 + Math.sin(t * 5.2) * 0.035 * energy,
          skew
        );
        both(kind, (el) => el.setAttribute("transform", iTf));
        if (fluid > 0.15) {
          setBlur(fluid);
          both("goo", (el, i) => el.setAttribute("filter", `url(#hero-goo-${i})`));
        } else {
          both("goo", (el) => el.removeAttribute("filter")); // crisp when still
        }
      }

      // the mono tagline settles in as the word rests
      const tagOp = smooth((q - 0.55) / 0.45).toFixed(3);
      both("tag", (el) => {
        el.style.opacity = tagOp;
      });

      // scan-light lags slightly behind the motion, like a lens catching up
      if (glareRef.current) {
        glareRef.current.style.transform = `translate(${(pos.x - vx * 5).toFixed(1)}px, ${(pos.y - vy * 5).toFixed(1)}px)`;
      }
      // lens rim hugging the blob edge, scaled to its radius (fades out
      // while the halo is locked — the brackets take over as the frame)
      if (rimRef.current) {
        const rs = (rCur * 2.35) / 300;
        rimRef.current.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px) scale(${rs.toFixed(3)})`;
        rimRef.current.style.opacity = (1 - lockAmt).toFixed(2);
      }
      // live coordinate readout riding beside the lens (the lock label
      // replaces it while locked)
      if (readoutRef.current) {
        const ro = readoutRef.current;
        ro.style.transform = `translate(${(pos.x + 26).toFixed(1)}px, ${(pos.y + 30).toFixed(1)}px)`;
        ro.style.opacity = (1 - lockAmt).toFixed(2);
        ro.textContent = `x ${String(Math.max(0, Math.round(pos.x))).padStart(4, "0")} · y ${String(Math.max(0, Math.round(pos.y + window.scrollY))).padStart(4, "0")}`;
      }
      // target-lock furniture: brackets snap around the button, a bent
      // leader line runs from the halo's shoulder out to the label —
      // everything pinned to the button rect, not the cursor
      if (lockUiRef.current) {
        const lr = lastLockRect;
        if (lockAmt > 0.01 && lr) {
          const pad = 12;
          const arm = 14;
          const L = lr.left - pad;
          const T = lr.top - pad;
          const R = lr.right + pad;
          const B = lr.bottom + pad;
          lockBracketsRef.current?.setAttribute(
            "d",
            `M ${L} ${T + arm} L ${L} ${T} L ${L + arm} ${T}` +
              ` M ${R - arm} ${T} L ${R} ${T} L ${R} ${T + arm}` +
              ` M ${R} ${B - arm} L ${R} ${B} L ${R - arm} ${B}` +
              ` M ${L + arm} ${B} L ${L} ${B} L ${L} ${B - arm}`
          );
          // leader line elbows away from the nearest screen edges:
          // left/right, and downward for targets near the top (nav) so
          // the callout never runs off-screen
          const side =
            lr.left + lr.width / 2 < window.innerWidth - 300 ? 1 : -1;
          const vert = lr.top < 130 ? 1 : -1;
          const sx = side > 0 ? R : L;
          const sy = vert > 0 ? B - 2 : T + 2;
          const ex = sx + 38 * side;
          const ey = sy + 28 * vert;
          const fx = ex + 86 * side;
          // draw-in: the line's two segments have fixed lengths
          // (hypot(38,28) + 86 ≈ 134), so a dash-offset sweep draws it
          // from the bracket outward on every fresh lock
          const age = (performance.now() - state.lockStamp) / 1000;
          const LINE_LEN = 134;
          const drawn = smooth(Math.min(age / 0.35, 1));
          if (lockLineRef.current) {
            const ln = lockLineRef.current;
            ln.setAttribute("d", `M ${sx} ${sy} L ${ex} ${ey} L ${fx} ${ey}`);
            ln.setAttribute("stroke-dasharray", LINE_LEN);
            ln.setAttribute(
              "stroke-dashoffset",
              (LINE_LEN * (1 - drawn)).toFixed(1)
            );
          }
          if (lockDotRef.current) {
            const d = lockDotRef.current;
            d.setAttribute("cx", sx);
            d.setAttribute("cy", sy);
            d.setAttribute("r", (3 * drawn).toFixed(2)); // grows with the draw
          }
          if (lockLabelRef.current) {
            lockLabelRef.current.style.transform = `translate(${(fx + 10 * side).toFixed(1)}px, ${ey.toFixed(1)}px) translate(${side < 0 ? "-100%" : "0"}, -50%)`;
            // typewriter: the label writes itself once the line has
            // nearly landed (~40 chars/s), with a block caret while typing
            const full = state.lockName;
            const n =
              age < 0.24
                ? 0
                : Math.min(full.length, Math.floor((age - 0.24) * 40));
            const text =
              n <= 0 ? "" : n >= full.length ? full : `${full.slice(0, n)}▍`;
            if (text !== shownText) {
              shownText = text;
              lockLabelRef.current.textContent = text;
            }
          }
          lockUiRef.current.style.opacity = smooth(lockAmt).toFixed(2);
        } else {
          lockUiRef.current.style.opacity = "0";
        }
      }

      // ---- assemble the clip: mother blob + detached droplets ----------
      // multiple closed subpaths in one path() union together, so droplets
      // merge with the blob while overlapping and pinch off as they part
      let clip = "";
      if (rCur >= 1.5) {
        const speed = Math.min(spd / 26, 1);
        const phi = Math.atan2(vy, vx);
        const pts = [];
        for (let i = 0; i < BLOB_POINTS; i++) {
          const th = (i / BLOB_POINTS) * Math.PI * 2;
          const dTh = th - phi;
          const r =
            rCur *
              (1 +
                0.42 * speed * Math.cos(2 * dTh) + // stretch along motion
                0.16 * speed * Math.cos(dTh - Math.PI)) + // drag behind
            rCur * 0.07 * Math.sin(t * 2.3 + i * 2.1) + // idle liquid wobble
            rCur * 0.05 * Math.cos(t * 1.7 + i * 3.7);
          pts.push([pos.x + Math.cos(th) * r, pos.y + Math.sin(th) * r]);
        }
        clip = blobPath(pts);
      }
      for (let i = sheds.length - 1; i >= 0; i--) {
        const s = sheds[i];
        s.life += 1 / 60;
        if (s.life >= s.dur) {
          sheds.splice(i, 1);
          continue;
        }
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        // envelope: swell out of the mother blob over the first ~18% of
        // life (still overlapping, so it reads as budding), then a slow
        // liquid decay
        const p = s.life / s.dur;
        const r =
          s.r0 * smooth(Math.min(p / 0.18, 1)) * Math.pow(1 - p, 1.35);
        if (r >= 2) clip += shedPath(s, r, t);
      }
      if (clip) {
        layer.style.clipPath = `path("${clip}")`;
      } else if (layer.style.clipPath !== HIDDEN_CLIP) {
        layer.style.clipPath = HIDDEN_CLIP;
      }
      raf = requestAnimationFrame(tick);
    };

    if (onMove) window.addEventListener("pointermove", onMove, { passive: true });
    if (onTouch) window.addEventListener("pointerdown", onTouch, { passive: true });
    document.documentElement.addEventListener("mouseleave", onGone);
    window.addEventListener("blur", onGone);
    raf = requestAnimationFrame(tick);
    return () => {
      if (onMove) window.removeEventListener("pointermove", onMove);
      if (onTouch) window.removeEventListener("pointerdown", onTouch);
      document.documentElement.removeEventListener("mouseleave", onGone);
      window.removeEventListener("blur", onGone);
      document.body.classList.remove("lens-lock");
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  // One ink pass: identical geometry both times, only the medium flips —
  // solid lime ink for the base, a stroked lime wireframe for the lens.
  const renderInk = (idx, variant) => {
    const xray = variant === "xray";
    const reg = (kind) => (el) => {
      nodes.current[kind][idx] = el;
    };
    const inkFill = xray ? "none" : "#C8FF00";
    const inkStroke = xray ? { stroke: "#C8FF00", strokeWidth: 3 } : {};
    const textProps = {
      x: CX,
      y: CY,
      textAnchor: "middle",
      dominantBaseline: "central",
      fill: inkFill,
      ...inkStroke,
      letterSpacing: "14",
      style: { fontFamily: "var(--font-display)", fontWeight: 400 },
    };
    return (
      <>
        <svg
          ref={reg("svg")}
          viewBox={`0 0 ${SHAPE_W} ${SHAPE_H}`}
          style={{
            position: "absolute",
            left: "10%", // kept current by size()
            top: "50%",
            transform: "translate(0, -50%)",
            overflow: "visible",
          }}
        >
          <defs>
            {/* base: blur + alpha threshold = metaball goo; lens: plain
                defocus (the threshold would dissolve thin strokes) */}
            <filter
              id={`hero-goo-${idx}`}
              x="-20%"
              y="-60%"
              width="140%"
              height="220%"
            >
              <feGaussianBlur ref={reg("blur")} in="SourceGraphic" stdDeviation="0" />
              {!xray && (
                <feColorMatrix
                  type="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                />
              )}
            </filter>
          </defs>
          {xray && (
            // opaque patch behind the wireframe: hides the (filtered)
            // solid fill underneath, so inside the blob the wordmark
            // reads as hollow — border only
            <rect
              x="-40"
              y="-40"
              width={SHAPE_W + 80}
              height={SHAPE_H + 80}
              fill="#070803"
            />
          )}
          <g ref={reg("goo")}>
            {/* ink droplets: the pre-S. goo cluster (driven per-frame) */}
            <g ref={reg("drops")}>
              {Array.from({ length: DROPS }, (_, i) => (
                <circle key={i} cx={CX} cy={CY} r="0" fill={inkFill} {...inkStroke} />
              ))}
            </g>
            <text ref={reg("sText")} {...textProps} fontSize="460" opacity="0">
              S.
            </text>
            <text ref={reg("wText")} {...textProps} fontSize="330" opacity="0">
              Startathon.
            </text>
          </g>
          {xray && (
            // static drafting furniture: corner brackets, metric guides,
            // spec labels — crisp, outside the goo group
            <>
              <g stroke="rgba(200,255,0,0.4)" strokeWidth="2" fill="none">
                <path d="M 20 70 V 20 H 70" />
                <path d="M 1730 20 H 1780 V 70" />
                <path d="M 1780 450 V 500 H 1730" />
                <path d="M 70 500 H 20 V 450" />
                <line
                  x1="20" y1="95" x2="1780" y2="95"
                  strokeWidth="1" strokeDasharray="4 14" opacity="0.5"
                />
                <line
                  x1="20" y1="425" x2="1780" y2="425"
                  strokeWidth="1" strokeDasharray="4 14" opacity="0.5"
                />
                <line x1={CX} y1="8" x2={CX} y2="34" opacity="0.6" />
                <line x1={CX} y1="486" x2={CX} y2="512" opacity="0.6" />
              </g>
              <g
                fill="rgba(200,255,0,0.6)"
                fontSize="19"
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.3em" }}
              >
                <text x="96" y="56">STARTATHON.SYS — BUILD 2026</text>
                <text x="1704" y="488" textAnchor="end">
                  SCTCE · 8.47°N / 76.97°E
                </text>
              </g>
            </>
          )}
        </svg>
        <span
          ref={reg("tag")}
          style={{
            position: "absolute",
            left: "50%", // kept current by size()
            top: "72%",
            paddingLeft: "5em",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.6rem, 1vw, 0.78rem)",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: xray ? "rgba(200,255,0,0.7)" : "rgba(255,255,255,0.55)",
            whiteSpace: "nowrap",
            userSelect: "none",
            opacity: 0,
          }}
        >
          30 hours · 20 teams · ship something real
        </span>
      </>
    );
  };

  return (
    <>
      {/* base ink: the hero headline itself — lime on the dark ground,
          anchored over the hero (first viewport of <main>), above
          #video-frame (z-10), below the lens (45) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100dvh",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        {renderInk(0, "solid")}
      </div>

      {/* lens layer: the site-wide x-ray world, clipped to the cursor
          blob — fixed to the viewport, below the nav (z-60). It is a
          translucent filter, not an opaque cover: the backdrop chain
          pushes the live page's whites to lime (sepia grays the hues,
          saturate amplifies, hue-rotate lands on lime), so every text and
          element recolors exactly inside the blob while staying crisp. */}
      <div
        ref={layerRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 45,
          background: "rgba(7, 10, 2, 0.28)",
          backdropFilter:
            "sepia(1) saturate(2.6) hue-rotate(28deg) brightness(1.08)",
          WebkitBackdropFilter:
            "sepia(1) saturate(2.6) hue-rotate(28deg) brightness(1.08)",
          clipPath: HIDDEN_CLIP,
          pointerEvents: "none",
          willChange: "clip-path",
        }}
      >
        {/* lens surface: drafting grid, a scan-light trailing the blob
            center, a rim hugging the blob edge (positioned per-frame),
            and a live coordinate readout */}
        <div className="lens-grid" aria-hidden="true" />
        <div ref={glareRef} className="lens-glare" aria-hidden="true" />
        <div ref={rimRef} className="lens-rim" aria-hidden="true" />

        {/* document-space world: counter-scrolled each frame so the x-ray
            stays registered with the page content */}
        <div
          ref={worldRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            willChange: "transform",
          }}
        >
          {/* the hero's wireframe wordmark (sec 01) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100dvh",
            }}
          >
            {renderInk(1, "xray")}
          </div>

          {/* survey boxes around every data-lens section */}
          {zones.map((z) => (
            <div
              key={`${z.id}-${Math.round(z.top)}`}
              style={{
                position: "absolute",
                top: z.top + 12,
                left: z.left + 12,
                width: Math.max(z.w - 24, 0),
                height: Math.max(z.h - 24, 0),
                border: "1px dashed rgba(200,255,0,0.3)",
                borderRadius: "14px",
              }}
            >
              <span
                style={{
                  ...monoTag,
                  position: "absolute",
                  top: 10,
                  left: 14,
                  color: "rgba(200,255,0,0.7)",
                }}
              >
                sec {String(z.n).padStart(2, "0")} · {z.id}
              </span>
              <span
                style={{
                  ...monoTag,
                  position: "absolute",
                  bottom: 10,
                  right: 14,
                  color: "rgba(200,255,0,0.45)",
                }}
              >
                {Math.round(z.w)} × {Math.round(z.h)}
              </span>
            </div>
          ))}
        </div>

        <span ref={readoutRef} className="lens-readout" />
      </div>

      {/* target-lock furniture: OUTSIDE the blob clip so the brackets and
          the bent leader line can extend past the halo. Geometry is pinned
          to the hovered element each frame; opacity follows the lock
          morph. Above the nav (60) so brackets stay crisp over its glass. */}
      <div
        ref={lockUiRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 70,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
          fill="none"
          stroke="#C8FF00"
        >
          <path ref={lockBracketsRef} strokeWidth="2" opacity="0.9" />
          <path ref={lockLineRef} strokeWidth="1.5" opacity="0.7" />
          <circle ref={lockDotRef} r="3" fill="#C8FF00" stroke="none" />
        </svg>
        <span
          ref={lockLabelRef}
          style={{
            ...monoTag,
            position: "absolute",
            left: 0,
            top: 0,
            color: "rgba(200,255,0,0.9)",
          }}
        />
      </div>
    </>
  );
};

export default LiquidLens;
