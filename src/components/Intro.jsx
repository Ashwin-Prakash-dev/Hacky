import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const quotes = [
  { text: "Most hackathons optimize for scale.", weight: 300 },
  { text: "Very few optimize for execution.", weight: 300 },
  { text: "We're changing that.", weight: 400 },
  { text: "startathon.", weight: 700 },
];

const Intro = ({ onComplete }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const skippedRef = useRef(false);

  const skip = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    gsap.killTweensOf([containerRef.current, textRef.current]);
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: onComplete,
    });
  };

  useEffect(() => {
    const onKey = () => skip();
    const onClick = () => skip();
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    if (!textRef.current || skippedRef.current) return;

    const isLast = currentIndex === quotes.length - 1;
    const tl = gsap.timeline();

    // Fade in
    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }
    );

    if (!isLast) {
      // Linger then fade out, then next
      tl.to(textRef.current, {
        opacity: 0,
        y: -14,
        duration: 0.55,
        ease: "power2.in",
        delay: currentIndex === quotes.length - 2 ? 1.4 : 1.1,
        onComplete: () => {
          if (!skippedRef.current) setCurrentIndex((i) => i + 1);
        },
      });
    } else {
      // Last quote — linger, then fade whole screen
      tl.to(textRef.current, { opacity: 0, duration: 0.5, delay: 1.9 }).to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            if (!skippedRef.current) onComplete();
          },
        }
      );
    }

    return () => tl.kill();
  }, [currentIndex]);

  const current = quotes[currentIndex];

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "none",
      }}
    >
      <p
        ref={textRef}
        style={{
          fontFamily: "'General Sans', sans-serif",
          fontSize: "clamp(1.3rem, 3.5vw, 2.8rem)",
          color: "#fff",
          fontWeight: current.weight,
          letterSpacing:
            currentIndex === quotes.length - 1 ? "-0.05em" : "0.01em",
          textAlign: "center",
          maxWidth: "680px",
          padding: "0 2rem",
          lineHeight: 1.2,
          opacity: 0,
        }}
      >
        {current.text}
      </p>

      <p
        style={{
          position: "absolute",
          bottom: "2.5rem",
          fontFamily: "'General Sans', sans-serif",
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.18)",
          textTransform: "uppercase",
        }}
      >
        click or press any key to skip
      </p>
    </div>
  );
};

export default Intro;
