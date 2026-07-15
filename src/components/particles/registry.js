// Shared, render-loop-friendly registry of DOM targets for the particle
// director. Plain module state — read imperatively inside useFrame, never
// through React, so nothing here causes re-renders.
//
// Sections mark themselves with `data-particles="<id>"`; interactive
// elements with `data-particle-target="<id>"` (position only) or
// `data-particle-hover="<id>"` (position + delegated hover tracking).
// Rects are stored in document space (top includes scrollY), so they stay
// valid between rescans while the user scrolls.

const docRects = new Map(); // id -> { top, left, width, height }
const els = new Map(); // id -> element, for imperative class toggles
let sections = []; // [{ id, top, bottom }] sorted by top
let hovered = null;
let faqOpen = 0;
const events = [];

export function scan() {
  const sy = window.scrollY;
  sections = [];
  docRects.clear();
  els.clear();
  document.querySelectorAll("[data-particles]").forEach((el) => {
    const r = el.getBoundingClientRect();
    const id = el.dataset.particles;
    sections.push({ id, top: r.top + sy, bottom: r.bottom + sy });
    docRects.set(`section:${id}`, {
      top: r.top + sy,
      left: r.left,
      width: r.width,
      height: r.height,
    });
  });
  sections.sort((a, b) => a.top - b.top);
  document
    .querySelectorAll("[data-particle-target],[data-particle-hover]")
    .forEach((el) => {
      const id = el.dataset.particleTarget || el.dataset.particleHover;
      const r = el.getBoundingClientRect();
      docRects.set(id, { top: r.top + sy, left: r.left, width: r.width, height: r.height });
      els.set(id, el);
    });
}

export const sectionAt = (docY) => {
  for (const s of sections) if (docY >= s.top && docY < s.bottom) return s.id;
  return null;
};

export const getRect = (id) => docRects.get(id) || null;
export const getEl = (id) => els.get(id) || null;
export const getHovered = () => hovered;
export const setHovered = (id) => {
  hovered = id;
};
export const isFaqOpen = () => faqOpen > 0;
export const faqDelta = (d) => {
  faqOpen = Math.max(0, faqOpen + d);
};

export const emit = (name) => {
  events.push({ name, at: performance.now() });
};
// One-shot: returns true (and removes the event) if `name` fired in the
// last few seconds — behaviors poll this from the frame loop.
export function consume(name) {
  const cutoff = performance.now() - 5000;
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].at < cutoff) events.splice(i, 1);
    else if (events[i].name === name) {
      events.splice(i, 1);
      return true;
    }
  }
  return false;
}

let inited = false;
export function initRegistry() {
  if (inited) return;
  inited = true;
  scan();
  // Layout settles asynchronously (fonts, images, GSAP intros) — rescan a
  // few times early, then keep a slow heartbeat for late layout shifts.
  setTimeout(scan, 1000);
  setTimeout(scan, 3000);
  setInterval(scan, 2500);
  window.addEventListener("resize", scan);
  document.addEventListener(
    "mouseover",
    (e) => {
      const el = e.target?.closest?.("[data-particle-hover]");
      if (el) hovered = el.dataset.particleHover;
    },
    { passive: true }
  );
  document.addEventListener(
    "mouseout",
    (e) => {
      const el = e.target?.closest?.("[data-particle-hover]");
      if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) hovered = null;
    },
    { passive: true }
  );
}
