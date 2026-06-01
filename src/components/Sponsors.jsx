import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ──────────────────────────────────────────────────────────────── */

const VALUE_PROPS = [
  { icon: "◎", title: "Watch them build",      desc: "30 hours of live execution. You don't read a CV, you watch them solve hard problems in real time. The signal is unambiguous." },
  { icon: "◈", title: "Kerala's best, one room", desc: "We curate 20 teams from across Kerala. The most ambitious student builders in the state, all in one place." },
  { icon: "◉", title: "Access, not ads",       desc: "Every tier is built around proximity to the builders. Walk the floor, sit with teams, make offers on the spot." },
  { icon: "◆", title: "Hire before anyone else", desc: "You see them build before any other company does. Spot offers, PPOs, internships, all made in context." },
];

const TIERS = [
  {
    id: "t1", name: "T1", price: "₹1.5L+", tag: "On-Campus Access",
    slots: null, highlight: true,
    perks: [
      "Walk the floor and approach any team directly",
      "On-spot offers: internships, PPOs, full-time",
      "Embedded as judge or mentor during the sprint",
      "Dedicated stage time with all 20 teams",
      "First look at every builder in the room",
      "Sponsored problem statement + branded prize track",
      "Primary logo on all event materials",
      "Custom social media campaign",
    ],
  },
  {
    id: "t2", name: "T2", price: "₹75K+", tag: "Off-Campus Access",
    slots: null, highlight: false,
    perks: [
      "Curated shortlist with top team intros post-event",
      "Intern / PPO offers through off-campus outreach",
      "Up to 2 mentor slots during the sprint",
      "Structured interview slots arranged post-event",
      "Secondary logo on all event materials",
      "3 social media posts",
    ],
  },
  {
    id: "strategic", name: "Custom", price: "Quote on request", tag: "Bespoke",
    slots: null, highlight: false, bespoke: true,
    cta: "Tell us what you need →",
    perks: [
      "Don't fit T1 or T2?",
      "Tell us what you're looking for",
      "We'll scope something that works",
    ],
  },
];

const MARQUEE_ITEMS = [
  "ON-CAMPUS ACCESS", "CURATED TALENT", "SPOT OFFERS", "30 HOURS OF SIGNAL",
  "PPO READY", "INTERN PIPELINE", "ALL KERALA", "2 SLOTS ONLY",
];

/* ─── Animated noise canvas ─────────────────────────────────────────────── */
function GrainOverlay() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame;
    const render = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const { data } = imageData;
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 12; // very faint
      }
      ctx.putImageData(imageData, 0, 0);
      frame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0, mixBlendMode: "overlay",
      }}
    />
  );
}

/* ─── Infinite marquee strip ────────────────────────────────────────────── */
function MarqueeStrip({ reverse = false }) {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{
        display: "flex", gap: "3rem",
        animation: `marqueeScroll${reverse ? "R" : ""} 22s linear infinite`,
        width: "max-content",
      }}>
        {items.map((t, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.55rem", letterSpacing: "0.28em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.18)",
            padding: "0.85rem 0", whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: "3rem",
          }}>
            {t}
            <span style={{ color: "#C8FF00", fontSize: "0.4rem" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Tier card ─────────────────────────────────────────────────────────── */
function TierCard({ tier }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mx", `${x}%`);
    cardRef.current.style.setProperty("--my", `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      className="sp-tier-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        background: tier.highlight ? "#0f0f0f" : "#080808",
        border: tier.highlight
          ? "1px solid rgba(200,255,0,0.4)"
          : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px",
        padding: "2rem",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
        opacity: 0,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? tier.highlight
            ? "0 20px 60px rgba(200,255,0,0.12), 0 0 0 1px rgba(200,255,0,0.5)"
            : "0 20px 40px rgba(0,0,0,0.6)"
          : "none",
      }}
    >
      {/* Spotlight follow effect */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "10px",
        background: `radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(200,255,0,0.05), transparent 70%)`,
        opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
        pointerEvents: "none",
      }} />

      {/* Top gradient line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: tier.highlight
          ? "linear-gradient(90deg, transparent, #C8FF00, transparent)"
          : "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
      }} />

      {tier.highlight && (
        <div style={{
          position: "absolute", top: "1.1rem", right: "1.1rem",
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.45rem", letterSpacing: "0.18em", textTransform: "uppercase",
          color: "#000", background: "#C8FF00",
          borderRadius: "2px", padding: "3px 9px",
        }}>Full Access</div>
      )}

      {/* Price + name */}
      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.22)",
        }}>{tier.tag}</span>
        <div style={{
          fontFamily: "var(--font-general)",
          fontSize: tier.bespoke ? "clamp(1.1rem, 2.5vw, 1.6rem)" : "clamp(2rem, 4vw, 3rem)",
          fontWeight: 900,
          color: tier.highlight ? "#C8FF00" : tier.bespoke ? "rgba(255,255,255,0.35)" : "#fff",
          fontStyle: tier.bespoke ? "italic" : "normal",
          lineHeight: 1, marginTop: "0.4rem",
        }}>{tier.price}</div>
        {tier.bespoke && (
          <div style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.45rem", letterSpacing: "0.16em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)", marginTop: "0.3rem",
          }}>Quoted per engagement</div>
        )}
        <div style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.78rem", fontWeight: 600,
          color: "rgba(255,255,255,0.5)", marginTop: "0.3rem",
        }}>{tier.name}</div>
        {tier.slots && (
          <div style={{
            display: "inline-block", marginTop: "0.55rem",
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.45rem", letterSpacing: "0.14em", textTransform: "uppercase",
            color: tier.highlight ? "#C8FF00" : "rgba(255,255,255,0.3)",
            border: `1px solid ${tier.highlight ? "rgba(200,255,0,0.25)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "2px", padding: "2px 7px",
          }}>{tier.slots}</div>
        )}
      </div>

      {/* Perks */}
      <div style={{ flex: 1 }}>
        {tier.perks.map((p) => (
          <div key={p} style={{
            display: "flex", gap: "10px", alignItems: "flex-start",
            padding: "0.45rem 0",
            borderBottom: "0.5px solid rgba(255,255,255,0.04)",
          }}>
            <span style={{ color: "#C8FF00", fontSize: "0.55rem", marginTop: "2px", flexShrink: 0 }}>✓</span>
            <span style={{
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5,
            }}>{p}</span>
          </div>
        ))}
      </div>

      <a
        href="#sponsor-contact"
        style={{ textDecoration: "none", marginTop: "1.5rem" }}
      >
        <button style={{
          width: "100%", padding: "0.75rem",
          background: tier.highlight ? "#C8FF00" : "transparent",
          color: tier.highlight ? "#000" : "rgba(255,255,255,0.45)",
          border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: "5px",
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.58rem", letterSpacing: "0.14em",
          fontWeight: 700, textTransform: "uppercase",
          cursor: "pointer", transition: "background 0.2s, color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!tier.highlight) {
            e.currentTarget.style.borderColor = "rgba(200,255,0,0.4)";
            e.currentTarget.style.color = "#C8FF00";
          } else {
            e.currentTarget.style.opacity = "0.85";
          }
        }}
        onMouseLeave={(e) => {
          if (!tier.highlight) {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(255,255,255,0.45)";
          } else {
            e.currentTarget.style.opacity = "1";
          }
        }}
        >
          {tier.cta || "Get in touch →"}
        </button>
      </a>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
const Sponsors = () => {
  const navigate = useNavigate();
  const pageRef   = useRef(null);
  const heroRef   = useRef(null);
  const valRef    = useRef(null);
  const tiersRef  = useRef(null);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(".sp-hero-line",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(".sp-hero-sub",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.5 }
      );
      gsap.fromTo(".sp-hero-stat",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.7 }
      );

      // Value props
      gsap.fromTo(".sp-val-card",
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: valRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        }
      );

      // Tier cards
      gsap.fromTo(".sp-tier-card",
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.65, stagger: 0.13, ease: "power3.out",
          scrollTrigger: { trigger: tiersRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        }
      );

      // Table rows
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} style={{ background: "#000", minHeight: "100vh", position: "relative" }}>
      <GrainOverlay />

      {/* ── Back nav ──────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", top: "1.5rem", left: "1.5rem",
        zIndex: 100, display: "flex", alignItems: "center", gap: "8px",
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            borderRadius: "50px", padding: "0.5rem 1rem",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.58rem", letterSpacing: "0.12em",
            textTransform: "uppercase", cursor: "pointer",
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#C8FF00"; e.currentTarget.style.borderColor = "rgba(200,255,0,0.35)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          ← Startathon
        </button>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div ref={heroRef} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", textAlign: "center",
        padding: "8rem clamp(1.5rem, 6vw, 5rem) 5rem",
        position: "relative",
      }}>
        {/* Radial glow behind text */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(700px, 90vw)", height: "400px",
          background: "radial-gradient(ellipse, rgba(200,255,0,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <span className="sp-hero-sub" style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase",
          color: "#C8FF00", background: "rgba(200,255,0,0.08)",
          border: "0.5px solid rgba(200,255,0,0.25)", borderRadius: "2px",
          padding: "4px 14px", marginBottom: "2.5rem", display: "inline-block",
          opacity: 0,
        }}>Sponsor Startathon 2026</span>

        <div style={{ position: "relative" }}>
          {["Backing", "the Builders."].map((line, i) => (
            <div
              key={i}
              className="sp-hero-line"
              style={{
                fontFamily: "var(--font-general)",
                fontSize: "clamp(4rem, 12vw, 10rem)",
                fontWeight: 900, color: "#fff",
                lineHeight: 0.9, letterSpacing: "-0.03em",
                opacity: 0,
              }}
            >
              {i === 1
                ? <><span style={{ color: "#C8FF00" }}>the </span>Builders.</>
                : line
              }
            </div>
          ))}
        </div>

        <p className="sp-hero-sub" style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "clamp(0.82rem, 1.3vw, 0.97rem)",
          color: "rgba(255,255,255,0.35)",
          maxWidth: "520px", lineHeight: 1.85,
          marginTop: "2rem", opacity: 0,
        }}>
          The best student builders from across Kerala, in one room, building for 30 hours straight.
          You get direct access to them. Watch them work, talk to them, hire them on the spot.
        </p>
        <p style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "clamp(0.7rem, 1.4vw, 0.85rem)",
          color: "rgba(255,255,255,0.28)",
          maxWidth: "520px", margin: "0.9rem auto 0",
          lineHeight: 1.65,
        }}>
          Limited slots per tier. The closer you want to be, the sooner you should reach out.
        </p>

        {/* Stat pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "2.5rem", justifyContent: "center" }}>
          {[["20", "Curated teams"], ["30 HRS", "Build sprint"], ["₹2L+", "Prize pool"], ["All Kerala", "Reach"]].map(([n, l]) => (
            <div key={l} className="sp-hero-stat" style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "50px", padding: "0.5rem 1.2rem",
              display: "flex", alignItems: "center", gap: "8px",
              opacity: 0,
            }}>
              <span style={{
                fontFamily: "var(--font-general)",
                fontSize: "1rem", fontWeight: 900, color: "#C8FF00",
              }}>{n}</span>
              <span style={{
                fontFamily: "var(--font-general, sans-serif)",
                fontSize: "0.55rem", letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
              }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Scroll cue — hidden on mobile to avoid overlap */}
        <div className="sp-scroll-cue" style={{
          position: "absolute", bottom: "2.5rem", left: "50%",
          transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
        }}>
          <span style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.5rem", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
          }}>Scroll</span>
          <div style={{
            width: "1px", height: "36px",
            background: "linear-gradient(to bottom, rgba(200,255,0,0.4), transparent)",
            animation: "scrollPulse 2s ease-in-out infinite",
          }} />
        </div>
      </div>

      {/* ── Marquee strip ─────────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── Page body ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "6rem clamp(1.5rem, 5vw, 3.5rem)" }}>

        {/* Value props */}
        <div ref={valRef} style={{ marginBottom: "6rem" }}>
          <p style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.22)", marginBottom: "2rem",
          }}>Why sponsor</p>
          <div className="sp-val-grid" style={{
            display: "grid",
            gap: "1px", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px",
            overflow: "hidden",
          }}>
            {VALUE_PROPS.map((v) => (
              <div key={v.title} className="sp-val-card" style={{
                background: "#0a0a0a", padding: "2.25rem 2rem", opacity: 0,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0f0f0f")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0a0a0a")}
              >
                <span style={{ fontSize: "1.1rem", color: "#C8FF00", display: "block", marginBottom: "1.1rem" }}>{v.icon}</span>
                <h3 style={{
                  fontFamily: "var(--font-general, sans-serif)",
                  fontSize: "0.8rem", fontWeight: 700, color: "#fff",
                  marginBottom: "0.6rem", letterSpacing: "0.01em",
                }}>{v.title}</h3>
                <p style={{
                  fontFamily: "var(--font-general, sans-serif)",
                  fontSize: "0.68rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.75,
                }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tier cards */}
        <div ref={tiersRef} style={{ marginBottom: "6rem" }}>
          <p style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.22)", marginBottom: "2rem",
          }}>Sponsorship tiers</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.1rem",
          }}
          className="sp-tiers-grid"
          >
            {TIERS.map((t) => <TierCard key={t.id} tier={t} />)}
          </div>
        </div>

        {/* CTA */}
        <div id="sponsor-contact" className="sp-cta-box" style={{
          background: "linear-gradient(135deg, #0d0d0d 0%, #111 100%)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
          padding: "4rem 3rem", textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          {/* Lime glow */}
          <div style={{
            position: "absolute", top: "-80px", left: "50%",
            transform: "translateX(-50%)",
            width: "400px", height: "300px",
            background: "radial-gradient(ellipse, rgba(200,255,0,0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          {/* Top + bottom accent lines */}
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.35), transparent)" }} />
          <div style={{ position: "absolute", bottom: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.15), transparent)" }} />

          <p style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase",
            color: "#C8FF00", marginBottom: "1rem",
          }}>Get in the room</p>

          <h2
            className="special-font bento-title"
            style={{
              color: "#fff", fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              letterSpacing: "-0.03em", lineHeight: 0.9,
              marginBottom: "1.25rem",
            }}
          >
            Meet Kerala's<br />best <b>b</b>uilders.
          </h2>

          <p style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.75rem", color: "rgba(255,255,255,0.3)",
            maxWidth: "420px", margin: "0 auto 2.5rem", lineHeight: 1.75,
          }}>
            This is the densest concentration of top student builder talent in Kerala.
            Reach out and we'll get you in.
          </p>

          <div className="sp-cta-btns" style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <a href="mailto:hello@sctcoding.club?subject=Sponsorship%20Inquiry%20-%20Startathon%202026" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "0.9rem 2.5rem",
                background: "#C8FF00", color: "#000",
                border: "none", borderRadius: "5px",
                fontFamily: "var(--font-general, sans-serif)",
                fontSize: "0.62rem", letterSpacing: "0.14em",
                fontWeight: 700, textTransform: "uppercase",
                cursor: "pointer", transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >Email us →</button>
            </a>
            <a href="tel:+917909190948" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "0.9rem 2.5rem",
                background: "transparent", color: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: "5px",
                fontFamily: "var(--font-general, sans-serif)",
                fontSize: "0.62rem", letterSpacing: "0.14em",
                fontWeight: 700, textTransform: "uppercase",
                cursor: "pointer", transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(200,255,0,0.4)"; e.currentTarget.style.color = "#C8FF00"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >+91 79091 90948</button>
            </a>
          </div>

          <p style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.58rem", color: "rgba(255,255,255,0.15)",
            marginTop: "2rem", letterSpacing: "0.06em",
          }}>Organized by Coding Club · SCTCE · Thiruvananthapuram</p>
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marqueeScrollR { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @keyframes scrollPulse    { 0%,100% { opacity: 0.6; } 50% { opacity: 0.15; } }

        @media (max-width: 640px) {
          .sp-scroll-cue { display: none !important; }
        }

        .sp-tiers-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        .sp-val-grid {
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        }

        @media (max-width: 900px) {
          .sp-tiers-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .sp-tiers-grid {
            grid-template-columns: 1fr !important;
          }
          .sp-val-grid {
            grid-template-columns: 1fr !important;
          }
          .sp-cta-box {
            padding: 2.5rem 1.25rem !important;
          }
          .sp-cta-btns {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .sp-cta-btns a {
            width: 100%;
          }
          .sp-cta-btns button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Sponsors;
