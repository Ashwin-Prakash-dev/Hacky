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

const SponsorCard = ({ sponsor, idx }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noopener noreferrer"
      className="sponsor-card"
      data-particle-hover={`sponsor-${idx}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 260px",
        maxWidth: "340px",
        // above the fixed particle canvas (z-30): the orbiting swarm passes
        // behind the card and peeks out around its edges
        position: "relative",
        zIndex: 31,
        textDecoration: "none",
        display: "block",
        // outer machined shell
        padding: "0.375rem",
        borderRadius: "1.5rem",
        background: "rgba(255,255,255,0.03)",
        boxShadow: hovered
          ? "inset 0 0 0 1px rgba(200,255,0,0.22), 0 24px 60px rgba(0,0,0,0.5)"
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
          background: hovered ? "#0e0e0c" : "#0b0b0b",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.04)",
          transition: "background 0.6s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <img
          src={sponsor.src}
          alt={sponsor.name}
          style={{
            height: `${sponsor.h}px`,
            width: "auto",
            objectFit: "contain",
            transform: hovered ? "translateY(-3px) scale(1.04)" : "none",
            transition: "transform 0.6s cubic-bezier(0.32,0.72,0,1)",
          }}
        />
        <p
          className="font-general"
          style={{
            fontSize: "0.88rem",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.7,
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
            color: hovered ? "#C8FF00" : "rgba(255,255,255,0.45)",
            transition: "color 0.4s ease",
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
              background: hovered ? "rgba(200,255,0,0.12)" : "rgba(255,255,255,0.06)",
              transform: hovered ? "translate(1px,-1px)" : "none",
              transition:
                "background 0.4s ease, transform 0.5s cubic-bezier(0.32,0.72,0,1)",
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
      data-particles="sponsors"
      style={{ background: "#050505", width: "100%" }}
    >
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
          data-particle-target="sponsor-group"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1.25rem",
          }}
        >
          {SPONSORS.map((s, i) => (
            <SponsorCard key={s.name} sponsor={s} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
