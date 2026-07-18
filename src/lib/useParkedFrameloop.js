import { useEffect, useState } from "react";

// "always" while the wrapper is on screen, "never" when it is not — with
// two defenses learned in the hero: GSAP's pin re-parents the section
// into a pin-spacer during mount, which can feed the IntersectionObserver
// one stale "not intersecting" record and then go quiet. So a bare false
// is double-checked against the live rect, and a one-shot recheck runs
// after the pin has settled.
export default function useParkedFrameloop(wrapRef) {
  const [frameloop, setFrameloop] = useState("always");

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const onScreen = (r) => r.bottom > 0 && r.top < window.innerHeight;
    const io = new IntersectionObserver(([entry]) => {
      setFrameloop(
        entry.isIntersecting || onScreen(el.getBoundingClientRect())
          ? "always"
          : "never"
      );
    });
    io.observe(el);
    const settle = setTimeout(() => {
      if (onScreen(el.getBoundingClientRect())) setFrameloop("always");
    }, 400);
    return () => {
      io.disconnect();
      clearTimeout(settle);
    };
  }, [wrapRef]);

  return frameloop;
}
