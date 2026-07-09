import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SPONSORS = [
  { name: "VoiceStack", src: "/img/sponsors/voicestack.png", h: 34 },
  { name: "CareStack", src: "/img/sponsors/carestack-white.png", h: 30 },
  { name: "CareRevenue", src: "/img/sponsors/carerevenue-white.png", h: 30 },
];

const SponsorStrip = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".sponsor-logo",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ background: "#0a0a0a", width: "100%", opacity: 0 }}
    >
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      <div
        className="container mx-auto px-5 md:px-10"
        style={{
          padding: "3rem clamp(1.25rem, 4vw, 2.5rem)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.75rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.55rem",
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          Backed by
        </span>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(2rem, 6vw, 4rem)",
          }}
        >
          {SPONSORS.map((s) => (
            <img
              key={s.name}
              src={s.src}
              alt={s.name}
              className="sponsor-logo"
              style={{
                height: `${s.h}px`,
                width: "auto",
                opacity: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorStrip;
