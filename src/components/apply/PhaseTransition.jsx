import { useRef, useEffect } from "react";
import gsap from "gsap";

const PhaseTransition = ({ direction = "forward", children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const x = direction === "back" ? -50 : 50;
    gsap.fromTo(
      el,
      { x, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" }
    );
  }, []); // runs once on mount — parent uses key={phase} to force remount per transition

  return (
    <div ref={ref} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {children}
    </div>
  );
};

export default PhaseTransition;
