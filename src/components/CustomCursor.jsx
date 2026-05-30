import { useEffect, useRef } from "react";
import gsap from "gsap";

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    document.body.classList.add("custom-cursor");

    // Set initial position off-screen
    gsap.set([dot, ring], { x: -100, y: -100 });

    const onMouseMove = (e) => {
      // Dot follows instantly
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        ease: "none",
      });
      // Ring lags behind
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.45,
        ease: "power3.out",
      });
    };

    // Expand ring on hover over interactables
    const onEnter = () => {
      gsap.to(ring, { scale: 1.8, opacity: 0.5, duration: 0.2 });
      gsap.to(dot, { scale: 0.5, duration: 0.2 });
    };

    const onLeave = () => {
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.2 });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", onMouseMove);

    // Attach to all interactable elements after mount
    const attach = () => {
      const els = document.querySelectorAll("a, button, [data-hover]");
      els.forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    // Give DOM time to settle
    const timer = setTimeout(attach, 500);

    return () => {
      document.body.classList.remove("custom-cursor");
      clearTimeout(timer);
      window.removeEventListener("mousemove", onMouseMove);
      document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "8px",
          height: "8px",
          background: "#fff",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99999,
          transform: "translate(-50%, -50%)",
          willChange: "transform",
        }}
      />
      {/* Outer lagging ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "28px",
          height: "28px",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99998,
          transform: "translate(-50%, -50%)",
          willChange: "transform",
        }}
      />
    </>
  );
};

export default CustomCursor;
