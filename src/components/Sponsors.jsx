import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ──────────────────────────────────────────────────────────────── */

const VALUE_PROPS = [
  { icon: "◎", title: "Talent Discovery",      desc: "Identify high-agency technical talent through real 30-hour product execution — not CVs." },
  { icon: "◈", title: "Startup Discovery",      desc: "Gain early visibility into promising student ideas and high-potential builder teams." },
  { icon: "◉", title: "Ecosystem Positioning",  desc: "Build genuine relationships with Kerala's next generation of engineers and founders." },
  { icon: "◆", title: "Product Adoption",       desc: "Get developers building with your APIs, tools, and platforms during the sprint itself." },
];

const TIERS = [
  {
    id: "title", name: "Title Sponsor", price: "₹1.5L+", tag: "Primary Partner",
    highlight: true,
    perks: [
      "Event naming rights (exclusive)", "Primary logo on all materials",
      "15-min keynote / stage time",     "Full resume database access",
      "Talent scouting session",         "Sponsored problem statement",
      "API / tool integration",          "Mentorship slot",
      "Social media features (custom)",  "Introductions to all teams",
    ],
  },
  {
    id: "hiring", name: "Hiring Partner", price: "₹75k+", tag: "Talent Access",
    highlight: false,
    perks: [
      "Secondary logo on all materials", "Full resume database access",
      "Talent scouting session",         "3 social media posts",
      "Introductions to top 10 teams",
    ],
  },
  {
    id: "challenge", name: "Challenge Sponsor", price: "₹30k+", tag: "Technical Track",
    highlight: false,
    perks: [
      "Secondary logo on all materials", "Branded problem statement",
      "API / tool integration",          "Branded prize track",
      "2 social media posts",
    ],
  },
  {
    id: "ecosystem", name: "Ecosystem Partner", price: "Flexible", tag: "Community",
    highlight: false,
    perks: [
      "Secondary logo on all materials", "Workshop / keynote slot",
      "Mentorship slot",                 "1 social media post",
    ],
  },
];

const BENEFITS = [
  { label: "Event naming rights",   title: "Exclusive",  hiring: "—",        challenge: "—",       ecosystem: "—" },
  { label: "Logo on all materials", title: "Primary",    hiring: "Secondary", challenge: "Secondary", ecosystem: "Secondary" },
  { label: "Keynote / stage time",  title: "15 min",     hiring: "—",        challenge: "—",       ecosystem: "Workshop" },
  { label: "Resume database",       title: "Full",       hiring: "Full",     challenge: "—",       ecosystem: "—" },
  { label: "Talent scouting",       title: "✓",          hiring: "✓",        challenge: "—",       ecosystem: "—" },
  { label: "Sponsored problem",     title: "✓",          hiring: "—",        challenge: "✓",       ecosystem: "—" },
  { label: "API/tool integration",  title: "✓",          hiring: "—",        challenge: "✓",       ecosystem: "—" },
  { label: "Mentorship slot",       title: "✓",          hiring: "—",        challenge: "—",       ecosystem: "✓" },
  { label: "Social media",          title: "Custom",     hiring: "3 posts",  challenge: "2 posts", ecosystem: "1 post" },
  { label: "Team introductions",    title: "All teams",  hiring: "Top 10",   challenge: "—",       ecosystem: "—" },
];

const MARQUEE_ITEMS = [
  "TALENT DISCOVERY", "BUILDER-FIRST", "STARTUP SCOUTING", "REAL MENTORSHIP",
  "PRODUCT BUILDS", "ALL KERALA", "30 HOURS", "CURATED TEAMS",
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
        }}>Most Complete</div>
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
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 900,
          color: tier.highlight ? "#C8FF00" : "#fff",
          lineHeight: 1, marginTop: "0.4rem",
        }}>{tier.price}</div>
        <div style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.78rem", fontWeight: 600,
          color: "rgba(255,255,255,0.5)", marginTop: "0.3rem",
        }}>{tier.name}</div>
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
          Get in touch →
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
  const tableRef  = useRef(null);

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
      gsap.fromTo(".sp-table-row",
        { opacity: 0, x: -14 },
        {
          opacity: 1, x: 0, duration: 0.4, stagger: 0.04, ease: "power2.out",
          scrollTrigger: { trigger: tableRef.current, start: "top 85%", toggleActions: "play none none reverse" },
        }
      );
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
          Startathon gives you meaningful access to Kerala's most ambitious student
          builders — through mentorship, challenge tracks, and genuine engagement.
          Not just logo placement.
        </p>

        {/* Stat pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "2.5rem", justifyContent: "center" }}>
          {[["20", "Curated teams"], ["30 HRS", "Build sprint"], ["₹1L", "Prize pool"], ["All Kerala", "Reach"]].map(([n, l]) => (
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

        {/* Scroll cue */}
        <div style={{
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
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1.1rem" }}>
            {TIERS.map((t) => <TierCard key={t.id} tier={t} />)}
          </div>
        </div>

        {/* Benefits table */}
        <div ref={tableRef} style={{ marginBottom: "6rem" }}>
          <p style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.22)", marginBottom: "2rem",
          }}>Full comparison</p>
          <div style={{
            background: "#080808", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "10px", overflow: "hidden",
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "580px" }}>
                <thead>
                  <tr style={{ background: "#0f0f0f" }}>
                    <th style={{
                      textAlign: "left", padding: "1rem 1.25rem",
                      fontFamily: "var(--font-general, sans-serif)",
                      fontSize: "0.52rem", letterSpacing: "0.18em",
                      textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
                      borderBottom: "1px solid rgba(255,255,255,0.07)", width: "30%",
                    }}>Benefit</th>
                    {[["Title", "₹1.5L+", true], ["Hiring", "₹75k+", false], ["Challenge", "₹30k+", false], ["Ecosystem", "Flexible", false]].map(([label, price, accent]) => (
                      <th key={label} style={{
                        textAlign: "center", padding: "1rem 0.75rem",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                      }}>
                        <div style={{
                          fontFamily: "var(--font-general, sans-serif)",
                          fontSize: "0.58rem", fontWeight: 700,
                          color: accent ? "#C8FF00" : "rgba(255,255,255,0.45)",
                          textTransform: "uppercase", letterSpacing: "0.06em",
                        }}>{label}</div>
                        <div style={{
                          fontFamily: "var(--font-general)",
                          fontSize: "0.72rem",
                          color: accent ? "rgba(200,255,0,0.6)" : "rgba(255,255,255,0.22)",
                          marginTop: "2px",
                        }}>{price}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BENEFITS.map((row, i) => (
                    <tr key={row.label} className="sp-table-row" style={{
                      opacity: 0,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{
                        padding: "0.85rem 1.25rem",
                        fontFamily: "var(--font-general, sans-serif)",
                        fontSize: "0.66rem", color: "rgba(255,255,255,0.35)",
                        borderBottom: i < BENEFITS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}>{row.label}</td>
                      {(["title", "hiring", "challenge", "ecosystem"]).map((col) => (
                        <td key={col} style={{
                          textAlign: "center", padding: "0.85rem 0.75rem",
                          borderBottom: i < BENEFITS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                          fontFamily: "var(--font-general, sans-serif)",
                          fontSize: "0.62rem",
                          color: row[col] === "—"
                            ? "rgba(255,255,255,0.1)"
                            : col === "title"
                            ? "#C8FF00"
                            : "rgba(255,255,255,0.42)",
                        }}>{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div id="sponsor-contact" style={{
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
          }}>Ready to partner?</p>

          <h2
            className="special-font bento-title"
            style={{
              color: "#fff", fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              letterSpacing: "-0.03em", lineHeight: 0.9,
              marginBottom: "1.25rem",
            }}
          >
            Let's <b>b</b>uild<br />t<b>o</b>gether.
          </h2>

          <p style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.75rem", color: "rgba(255,255,255,0.3)",
            maxWidth: "400px", margin: "0 auto 2.5rem", lineHeight: 1.75,
          }}>
            We're actively looking for partners across all tiers.
            Reach out and we'll build a custom package for you.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
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
      `}</style>
    </div>
  );
};

export default Sponsors;
