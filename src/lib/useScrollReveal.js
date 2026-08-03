import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Fades + lifts every [data-reveal] element under `rootRef` as it enters the
// viewport. No-ops under prefers-reduced-motion. `active` gates the effect
// off while the section is mounted but off-screen (e.g. the picker while a
// domain detail covers it) so ScrollTrigger isn't tracking hidden elements.
export function useScrollReveal(rootRef, active, deps = []) {
  useEffect(() => {
    if (!active || !rootRef.current) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      rootRef.current.querySelectorAll("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });
    ScrollTrigger.refresh();
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ...deps]);
}
