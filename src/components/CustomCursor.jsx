import { useEffect, useRef } from "react";
import gsap from "gsap";

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (window.matchMedia("(hover: none)").matches) return;
    document.body.classList.add("custom-cursor");
    gsap.set([dot, ring], { x: -100, y: -100 });

    const onMouseMove = (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08, ease: "none" });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.45, ease: "power3.out" });
    };

    // Single delegated listener instead of per-element listeners
    const onEnter = (e) => {
      if (!e.target.closest("a, button, [data-hover]")) return;
      gsap.to(ring, { scale: 1.8, opacity: 0.5, duration: 0.2 });
      gsap.to(dot, { scale: 0.5, duration: 0.2 });
    };

    const onLeave = (e) => {
      if (!e.target.closest("a, button, [data-hover]")) return;
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.2 });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    return () => {
      document.body.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

export default CustomCursor;
