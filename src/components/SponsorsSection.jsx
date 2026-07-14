import { useRef, useEffect, useState } from "react";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 260px",
        maxWidth: "340px",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "1.1rem",
        padding: "2rem",
        borderRadius: "12px",
        background: hovered ? "#111111" : "#0e0e0e",
        border: hovered ? "1px solid rgba(200,255,0,0.4)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: hovered ? "0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,255,0,0.15)" : "none",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease, transform 0.3s ease",
      }}
    >
      <img
        src={sponsor.src}
        alt={sponsor.name}
        style={{ height: `${sponsor.h}px`, width: "auto", objectFit: "contain" }}
      />
      <p
        className="font-general"
        style={{
          fontSize: "0.88rem",
          color: "rgba(255,255,255,0.7)",
          lineHeight: 1.6,
        }}
      >
        {sponsor.blurb}
      </p>
      <span
        className="font-general"
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: hovered ? "#C8FF00" : "rgba(255,255,255,0.45)",
          transition: "color 0.25s ease",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35em",
        }}
      >
        Visit site {hovered ? <FiArrowRight aria-hidden="true" /> : <FiArrowUpRight aria-hidden="true" />}
      </span>
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
    <section ref={sectionRef} style={{ background: "#0a0a0a", width: "100%" }}>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      <div
        className="container mx-auto px-5 md:px-10"
        style={{ padding: "5rem clamp(1.25rem, 4vw, 2.5rem) 6rem" }}
      >
        <div ref={headerRef} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p
            className="font-general"
            style={{
              fontSize: "0.78rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#C8FF00",
              marginBottom: "0.75rem",
            }}
          >
            Our Sponsors
          </p>
          <h2
            className="bento-title special-font"
            style={{
              color: "#fff",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
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
