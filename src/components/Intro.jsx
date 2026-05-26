import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const quotes = [
  { text: "Most hackathons optimize for scale.", weight: 300 },
  { text: "Very few optimize for execution.", weight: 300 },
  { text: "We're changing that.", weight: 400 },
  { text: "Startathon", weight: 700, dot: true },
];

const Intro = ({ onComplete }) => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const textRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const skippedRef = useRef(false);

  const skip = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    gsap.killTweensOf([containerRef.current, textRef.current, bgRef.current]);
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete,
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

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }
    );

    if (!isLast) {
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
      // Linger 1.9s then morph text to hero title position
      tl.to({}, { duration: 1.9 }).call(() => {
        if (skippedRef.current) return;

        const heroTitle = document.getElementById("hero-title");
        if (!heroTitle) {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => { if (!skippedRef.current) onComplete(); },
          });
          return;
        }

        const srcRect = textRef.current.getBoundingClientRect();
        const dstRect = heroTitle.getBoundingClientRect();

        // Same font-size as hero h1 — pure translation, no scale needed
        const dx = dstRect.left - srcRect.left;
        const dy = dstRect.top - srcRect.top;

        // Fade background while text flies to hero position
        gsap.to(bgRef.current, {
          opacity: 0,
          duration: 0.75,
          ease: "power2.inOut",
        });

        // Fly text to hero title — translation only, pixel-perfect
        gsap.to(textRef.current, {
          x: dx,
          y: dy,
          duration: 0.95,
          ease: "power3.inOut",
          onComplete: () => {
            if (!skippedRef.current) {
              gsap.to(textRef.current, { opacity: 0, duration: 0 });
              onComplete();
            }
          },
        });
      });
    }

    return () => tl.kill();
  }, [currentIndex]);

  const current = quotes[currentIndex];
  const isLast = currentIndex === quotes.length - 1;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "none",
      }}
    >
      {/* Background — separate so we can fade it independently during morph */}
      <div
        ref={bgRef}
        style={{ position: "absolute", inset: 0, background: "#000", zIndex: 0 }}
      />

      <p
        ref={textRef}
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "'Open Sauce One', sans-serif",
          // Last quote matches hero h1 exactly — morph becomes pure translation, no scale blur
          fontSize: isLast ? "clamp(4rem, 11vw, 10rem)" : "clamp(1.3rem, 3.5vw, 2.8rem)",
          color: isLast ? "#c8c8c4" : "#fff",
          fontWeight: current.weight,
          letterSpacing: isLast ? "-0.03em" : "0.01em",
          lineHeight: isLast ? 0.9 : 1.2,
          maxWidth: isLast ? "none" : "min(680px, calc(100vw - 3rem))",
          opacity: 0,
          display: "inline-block",
          textAlign: isLast ? "left" : "center",
          whiteSpace: isLast ? "nowrap" : "normal",
        }}
      >
        {current.text}
        {current.dot && <span style={{ color: "#3a3a3a" }}>.</span>}
      </p>

      <p
        style={{
          position: "absolute",
          bottom: "2.5rem",
          zIndex: 1,
          fontFamily: "'Open Sauce One', sans-serif",
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
