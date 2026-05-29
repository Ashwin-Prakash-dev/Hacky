import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BentoTilt } from "./Features";
import "./VideoCards.css";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    title: <>ANTHR<b>O</b>PIC</>,
    label: "AI SAFETY",
    category: "Frontier Artificial Intelligence",
    src: "/videos/feature-1.mp4",
  },
  {
    title: <>SP<b>A</b>CEX</>,
    label: "AEROSPACE",
    category: "Space Exploration Technology",
    src: "/videos/feature-2.mp4",
  },
  {
    title: <>PAL<b>A</b>NTIR</>,
    label: "DATA INTEL",
    category: "Data & Intelligence",
    src: "/videos/feature-3.mp4",
  },
  {
    title: <>OP<b>E</b>NAI</>,
    label: "AI RESEARCH",
    category: "General Purpose AI",
    src: "/videos/feature-4.mp4",
  },
  {
    title: <><b>A</b>NDURIL</>,
    label: "DEFENSE TECH",
    category: "Autonomous Defense Systems",
    src: "/videos/feature-5.mp4",
  },
];

/* ── VideoCard ────────────────────────────────────────────────────────────── */
const VideoCard = ({ src, title, label, category }) => {
  const [hovered, setHovered] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className="relative size-full overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => {
        const r = cardRef.current?.getBoundingClientRect();
        if (r) setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      {/* Video background */}
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          transform: hovered ? "scale(1.05)" : "scale(1.0)",
          transition: "transform 0.95s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
        }}
      />

      {/* Base cinematic veil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.32)",
          transition: "background 0.55s ease",
        }}
      />

      {/* Bottom gradient — text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered
            ? "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.42) 45%, rgba(0,0,0,0.08) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.22) 55%, transparent 100%)",
          transition: "background 0.55s ease",
        }}
      />

      {/* Top gradient — label legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 38%)",
          pointerEvents: "none",
        }}
      />

      {/* Cursor-reactive lime glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(260px circle at ${cursor.x}px ${cursor.y}px, rgba(200,255,0,0.09), transparent 68%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      />

      {/* Inner border — lime tint on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: hovered
            ? "inset 0 0 0 0.75px rgba(200,255,0,0.22), inset 0 0 50px rgba(200,255,0,0.04)"
            : "inset 0 0 0 0.75px rgba(255,255,255,0.07)",
          borderRadius: "inherit",
          transition: "box-shadow 0.5s ease",
          pointerEvents: "none",
        }}
      />

      {/* Content layer */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(1.1rem, 2.4vw, 1.9rem)",
        }}
      >
        {/* Top: label + arrow */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span
            style={{
              fontFamily: "var(--font-general, 'General Sans', sans-serif)",
              fontSize: "0.56rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: hovered ? "#C8FF00" : "rgba(255,255,255,0.42)",
              border: `0.5px solid ${hovered ? "rgba(200,255,0,0.42)" : "rgba(255,255,255,0.14)"}`,
              borderRadius: "2px",
              padding: "3px 10px",
              backdropFilter: "blur(6px)",
              background: "rgba(0,0,0,0.22)",
              transition: "color 0.4s ease, border-color 0.4s ease",
            }}
          >
            {label}
          </span>

          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.82rem",
              color: "#C8FF00",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translate(0,0)" : "translate(-5px, 5px)",
              transition: "opacity 0.38s ease 0.06s, transform 0.38s ease 0.06s",
              lineHeight: 1,
            }}
          >
            ↗
          </span>
        </div>

        {/* Bottom: category + title */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-general, 'General Sans', sans-serif)",
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.32)",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.35s ease 0.07s, transform 0.35s ease 0.07s",
            }}
          >
            {category}
          </p>

          <h2
            className="bento-title special-font"
            style={{
              color: "#ffffff",
              lineHeight: 0.9,
              fontSize: "clamp(1.9rem, 4.8vw, 4.4rem)",
              letterSpacing: "-0.01em",
              textShadow: hovered
                ? "0 2px 32px rgba(0,0,0,0.9), 0 0 55px rgba(200,255,0,0.13)"
                : "0 2px 22px rgba(0,0,0,0.7)",
              transition: "text-shadow 0.5s ease",
            }}
          >
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
};

/* ── VideoCards Section ───────────────────────────────────────────────────── */
const VideoCards = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useGSAP(
    () => {
      // Header reveal
      const headerEls = headerRef.current?.querySelectorAll(".vc-reveal");
      if (headerEls?.length) {
        gsap.fromTo(
          headerEls,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.88,
            stagger: 0.13,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Card wrappers — staggered entrance
      const cards = sectionRef.current?.querySelectorAll(".vc-card-wrap");
      if (cards?.length) {
        gsap.set(cards, { opacity: 0, y: 36 });
        cards.forEach((card) => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.78,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        });
      }
    },
    { scope: sectionRef }
  );

  const GAP = "clamp(0.55rem, 1.1vw, 0.95rem)";

  return (
    <section
      ref={sectionRef}
      id="showcase"
      style={{ backgroundColor: "#000", paddingBottom: "clamp(4rem, 8vw, 7rem)" }}
    >
      <div className="container mx-auto px-3 md:px-10">

        {/* ── Section Header ───────────────────────────────── */}
        <div
          ref={headerRef}
          style={{ padding: "clamp(5rem, 10vw, 8rem) 1.25rem clamp(2.5rem, 5vw, 4rem)" }}
        >
          <p
            className="vc-reveal"
            style={{
              fontFamily: "var(--font-general, 'General Sans', sans-serif)",
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C8FF00",
              marginBottom: "1.25rem",
              opacity: 0,
            }}
          >
            The Frontier
          </p>

          <h2
            className="vc-reveal special-font"
            style={{
              fontFamily: "'zentry', sans-serif",
              fontSize: "clamp(2.4rem, 6vw, 5.2rem)",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 0.92,
              maxWidth: "18ch",
              marginBottom: "1.5rem",
              opacity: 0,
            }}
          >
            Some of the startups shaping the future of technology 
          </h2>

          <p
            className="vc-reveal"
            style={{
              fontFamily: "var(--font-general, 'General Sans', sans-serif)",
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.28)",
              lineHeight: 1.78,
              maxWidth: "31rem",
              opacity: 0,
            }}
          >
            The companies shaping what comes next — in AI, space, data intelligence,
            and autonomous systems. These are the builders of the next era.
          </p>
        </div>

        {/* ── Hero Card: ANTHROPIC (full width) ────────────── */}
        <div
          className="vc-card-wrap"
          style={{ marginBottom: GAP, height: "clamp(300px, 58vh, 660px)" }}
        >
          <BentoTilt className="h-full border-hsla overflow-hidden rounded-xl transition-transform duration-300 ease-out">
            <VideoCard {...CARDS[0]} />
          </BentoTilt>
        </div>

        {/* ── 2-col grid: SPACEX (tall) + PALANTIR / OPENAI ── */}
        <div className="vc-grid" style={{ gap: GAP, marginBottom: GAP }}>
          {/* SPACEX — spans 2 rows */}
          <div className="vc-card-wrap vc-spacex">
            <BentoTilt className="h-full border-hsla overflow-hidden rounded-xl transition-transform duration-300 ease-out">
              <VideoCard {...CARDS[1]} />
            </BentoTilt>
          </div>

          {/* PALANTIR */}
          <div className="vc-card-wrap" style={{ height: "clamp(220px, 34vh, 360px)" }}>
            <BentoTilt className="h-full border-hsla overflow-hidden rounded-xl transition-transform duration-300 ease-out">
              <VideoCard {...CARDS[2]} />
            </BentoTilt>
          </div>

          {/* OPENAI */}
          <div className="vc-card-wrap" style={{ height: "clamp(220px, 34vh, 360px)" }}>
            <BentoTilt className="h-full border-hsla overflow-hidden rounded-xl transition-transform duration-300 ease-out">
              <VideoCard {...CARDS[3]} />
            </BentoTilt>
          </div>
        </div>

        {/* ── ANDURIL — full width footer card ─────────────── */}
        <div
          className="vc-card-wrap"
          style={{ height: "clamp(220px, 38vh, 400px)" }}
        >
          <BentoTilt className="h-full border-hsla overflow-hidden rounded-xl transition-transform duration-300 ease-out">
            <VideoCard {...CARDS[4]} />
          </BentoTilt>
        </div>

      </div>
    </section>
  );
};

export default VideoCards;
