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
  const tailRef = useRef(null);   // "tartathon" — collapses in phase 5
  const dotRef  = useRef(null);   // "."         — radial wipe origin in phase 6
  const proxyTweenRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const skippedRef = useRef(false);

  const skip = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    gsap.killTweensOf([containerRef.current, textRef.current, bgRef.current, tailRef.current]);
    if (proxyTweenRef.current) proxyTweenRef.current.kill();
    containerRef.current.style.maskImage = '';
    containerRef.current.style.webkitMaskImage = '';
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
      // Phase 5: linger 1.5s, then clip-wipe "tartathon" rightward → leaves "S."
      tl.to({}, { duration: 1.5 }).call(() => {
        if (skippedRef.current) return;

        // Pin the natural width so GSAP has a numeric from-value to tween from
        tailRef.current.style.width = tailRef.current.scrollWidth + "px";

        gsap.to(tailRef.current, {
          width: 0,
          duration: 0.6,
          ease: "power2.in",
          onComplete: () => {
            if (skippedRef.current) return;

            // Phase 6: radial wipe — grow a transparent hole from the dot outward
            if (!dotRef.current) return;
            const dotRect = dotRef.current.getBoundingClientRect();
            const cx = dotRect.left + dotRect.width / 2;
            const cy = dotRect.top  + dotRect.height / 2;
            const proxy = { r: 0 };
            proxyTweenRef.current = gsap.to(proxy, {
              r: 2200,          // safely covers any viewport diagonal
              delay: 0.3,       // brief pause on "S." before the wipe
              duration: 0.9,
              ease: "power2.in",
              onUpdate() {
                const val = `radial-gradient(circle at ${cx}px ${cy}px, transparent 0px, transparent ${proxy.r}px, black ${proxy.r}px)`;
                containerRef.current.style.maskImage       = val;
                containerRef.current.style.webkitMaskImage = val;
              },
              onComplete() {
                if (!skippedRef.current) onComplete();
              },
            });
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
      {/* Background layer — kept separate so opacity can be managed independently if needed */}
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
        {isLast ? (
          <>
            S
            <span
              ref={tailRef}
              style={{
                display: "inline-block",
                overflow: "hidden",
                whiteSpace: "nowrap",
                verticalAlign: "top",
              }}
            >
              tartathon
            </span>
            <span ref={dotRef} style={{ color: "#3a3a3a" }}>.</span>
          </>
        ) : (
          <>
            {current.text}
            {current.dot && <span style={{ color: "#3a3a3a" }}>.</span>}
          </>
        )}
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
