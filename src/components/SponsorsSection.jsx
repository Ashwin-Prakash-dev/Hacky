import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SPONSORS = [
  {
    name: "VoiceStack",
    href: "https://voicestack.com?utm_source=startathon",
    src: "/img/sponsors/voicestack.png",
    h: 40,
    blurb: "AI phone systems that capture every missed call for healthcare practices.",
  },
  {
    name: "CareStack",
    href: "https://carestack.com?utm_source=startathon",
    src: "/img/sponsors/carestack-white.png",
    h: 34,
    blurb: "Cloud-based practice management software for dental teams.",
  },
  {
    name: "CareRevenue",
    href: "https://carerevenue.com?utm_source=startathon",
    src: "/img/sponsors/carerevenue-white.png",
    h: 34,
    blurb: "Dental revenue cycle management — billing, claims, and collections.",
  },
];

const SponsorCard = ({ sponsor }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noopener noreferrer"
      className="sponsor-card"
      data-lens-label={sponsor.name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 260px",
        maxWidth: "340px",
        position: "relative",
        textDecoration: "none",
        display: "block",
        // outer machined shell
        padding: "0.375rem",
        borderRadius: "1.5rem",
        background: "rgba(255,255,255,0.03)",
        boxShadow: hovered
          ? "inset 0 0 0 1px rgba(200,255,0,0.45), 0 24px 60px rgba(0,0,0,0.5), 0 8px 42px rgba(200,255,0,0.18)"
          : "inset 0 0 0 1px rgba(255,255,255,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition:
          "box-shadow 0.6s cubic-bezier(0.32,0.72,0,1), transform 0.6s cubic-bezier(0.32,0.72,0,1)",
      }}
    >
      {/* inner core */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "1.1rem",
          height: "100%",
          padding: "1.9rem",
          borderRadius: "calc(1.5rem - 0.375rem)",
          // hover floods the core lime — the same inverted world the
          // hero's liquid blob reveals
          background: hovered ? "#C8FF00" : "#0b0b0b",
          boxShadow: hovered
            ? "inset 0 1px 1px rgba(255,255,255,0.35)"
            : "inset 0 1px 1px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.04)",
          transition: "background 0.6s cubic-bezier(0.32,0.72,0,1), box-shadow 0.6s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <img
          src={sponsor.src}
          alt={sponsor.name}
          style={{
            height: `${sponsor.h}px`,
            width: "auto",
            objectFit: "contain",
            // white logos flip to ink on the lime flood
            filter: hovered ? "brightness(0)" : "none",
            transform: hovered ? "translateY(-3px) scale(1.04)" : "none",
            transition:
              "transform 0.6s cubic-bezier(0.32,0.72,0,1), filter 0.45s ease",
          }}
        />
        <p
          className="font-general"
          style={{
            fontSize: "0.88rem",
            color: hovered ? "rgba(5,5,5,0.8)" : "rgba(255,255,255,0.7)",
            lineHeight: 1.7,
            transition: "color 0.45s ease",
          }}
        >
          {sponsor.blurb}
        </p>
        <span
          className="font-general"
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: hovered ? "#050505" : "rgba(255,255,255,0.45)",
            transition: "color 0.45s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6em",
            marginTop: "auto",
          }}
        >
          Visit site
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "1.5rem",
              height: "1.5rem",
              borderRadius: "50%",
              background: hovered ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.06)",
              transform: hovered ? "translate(1px,-1px)" : "none",
              transition:
                "background 0.45s ease, transform 0.5s cubic-bezier(0.32,0.72,0,1)",
              fontSize: "0.78rem",
            }}
          >
            ↗
          </span>
        </span>
      </div>
    </a>
  );
};

const SponsorsSection = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".sponsor-card",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
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
      data-lens="sponsors"
      style={{ background: "#050505", width: "100%", position: "relative" }}
    >
      {/* lime ambience: a faint glow pooling behind the card group */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 55% 45% at 50% 62%, rgba(200,255,0,0.07), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      <div
        className="container mx-auto px-5 md:px-10"
        style={{ padding: "clamp(6rem, 10vw, 8rem) clamp(1.25rem, 4vw, 2.5rem)" }}
      >
        <div ref={headerRef} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span className="eyebrow" style={{ marginBottom: "1.1rem" }}>
            Our Sponsors
          </span>
          <h2
            className="bento-title special-font"
            style={{
              color: "#fff",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Companies b<b>a</b>cking Startathon
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1.25rem",
          }}
        >
          {SPONSORS.map((s) => (
            <SponsorCard key={s.name} sponsor={s} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
