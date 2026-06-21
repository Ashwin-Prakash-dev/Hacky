import { useRef, useEffect } from "react";
import gsap from "gsap";

// Colored horizontal strips — positions, heights, colors
const SLICES = [
  { top: "7%",  h: "3px", c: "#ff0033" },
  { top: "19%", h: "2px", c: "#00ffff" },
  { top: "28%", h: "5px", c: "#C8FF00" },
  { top: "41%", h: "2px", c: "#ff0033" },
  { top: "53%", h: "4px", c: "#00ffff" },
  { top: "64%", h: "2px", c: "#ff0033" },
  { top: "72%", h: "6px", c: "#C8FF00" },
  { top: "81%", h: "2px", c: "#ffffff" },
  { top: "91%", h: "3px", c: "#00ffff" },
];

const rnd = (lo, hi) => lo + Math.random() * (hi - lo);

const PhaseTransition = ({ direction = "forward", children }) => {
  const contentRef = useRef(null);
  const flashRef   = useRef(null);
  const sliceRefs  = useRef([]);

  useEffect(() => {
    const el     = contentRef.current;
    const flash  = flashRef.current;
    const slices = sliceRefs.current.filter(Boolean);
    const dx     = direction === "back" ? -50 : 50;

    gsap.set(el,     { opacity: 0, x: dx });
    gsap.set(flash,  { opacity: 0 });
    gsap.set(slices, { opacity: 0, x: 0 });

    // Randomise a frame of slice positions/opacities
    const frame = (minOp, maxOp, maxShift, dropRate = 0.35) =>
      slices.forEach((s) => gsap.set(s, {
        opacity: Math.random() > dropRate ? rnd(minOp, maxOp) : 0,
        x:       rnd(-maxShift, maxShift),
      }));

    gsap.timeline()
      // — Glitch frames —
      .call(() => frame(0.55, 0.9,  28))
      .to({}, { duration: 0.07 })

      .call(() => frame(0.65, 1.0,  52))
      .to({}, { duration: 0.055 })

      .call(() => frame(0.8,  1.0,  75, 0.15)) // almost all visible
      .to({}, { duration: 0.04 })

      // — White flash —
      .to(flash, { opacity: 0.92, duration: 0.035, ease: "none" })
      .to(flash, { opacity: 0,    duration: 0.08,  ease: "none" })

      // — Kill slices —
      .call(() => gsap.set(slices, { opacity: 0 }))

      // — Content enters —
      .to(el, { opacity: 1, x: 0, duration: 0.7, ease: "expo.out" }, "-=0.04");
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>

      {/* Full-screen white flash */}
      <div
        ref={flashRef}
        style={{
          position: "fixed", inset: 0,
          background: "#fff",
          opacity: 0, zIndex: 600, pointerEvents: "none",
        }}
      />

      {/* Coloured glitch strips */}
      {SLICES.map((s, i) => (
        <div
          key={i}
          ref={(el) => (sliceRefs.current[i] = el)}
          style={{
            position: "fixed", left: 0, right: 0,
            top: s.top, height: s.h,
            background: s.c,
            opacity: 0, zIndex: 500, pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />
      ))}

      {/* Phase content */}
      <div
        ref={contentRef}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        {children}
      </div>
    </div>
  );
};

export default PhaseTransition;
