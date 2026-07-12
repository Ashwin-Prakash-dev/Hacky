import { useRef, useEffect } from "react";
import gsap from "gsap";

const PhaseTransition = ({ direction = "forward", children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const x = direction === "back" ? -28 : 28;
    gsap.fromTo(ref.current,
      { opacity: 0, x },
      { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }
    );
  }, [direction]);

  return (
    <div ref={ref} style={{ width: "100%", display: "flex", justifyContent: "center", opacity: 0 }}>
      {children}
    </div>
  );
};

export default PhaseTransition;
