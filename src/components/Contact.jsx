import { useState } from "react";

/* ── Interest form ───────────────────────────────────────────────────────── */
const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    // TODO: wire up to your backend / Formspree / Google Forms
    setSubmitted(true);
  };

  return (
    <>
      <div
        id="contact"
        className="w-screen"
        style={{ background: "#000000", padding: "7rem 0" }}
      >
        <div className="container mx-auto px-5 md:px-10">
          <div style={{ maxWidth: "580px", margin: "0 auto" }}>

            {!submitted ? (
              <div style={{
                background: "linear-gradient(145deg, #0d0d0d, #0a0a0a)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                padding: "clamp(2rem, 5vw, 3.5rem)",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Top gradient accent */}
                <div style={{
                  position: "absolute", top: 0, left: "15%", right: "15%", height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.3), transparent)",
                }} />
                {/* Ambient glow */}
                <div style={{
                  position: "absolute", top: "-60px", left: "50%",
                  transform: "translateX(-50%)",
                  width: "300px", height: "200px",
                  background: "radial-gradient(ellipse, rgba(200,255,0,0.05) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />

                <p style={{
                  fontFamily: "var(--font-general, sans-serif)",
                  fontSize: "0.55rem", letterSpacing: "0.22em",
                  textTransform: "uppercase", color: "#C8FF00",
                  marginBottom: "0.75rem",
                }}>Stay in the loop</p>

                <h2
                  className="special-font bento-title"
                  style={{
                    color: "#fff",
                    fontSize: "clamp(2rem, 5vw, 3rem)",
                    letterSpacing: "-0.03em",
                    lineHeight: 0.92,
                    marginBottom: "0.85rem",
                  }}
                >
                  Be <b>f</b>irst<br />in line.
                </h2>

                <p style={{
                  fontFamily: "var(--font-general, sans-serif)",
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.35)",
                  lineHeight: 1.75, marginBottom: "2.25rem",
                }}>
                  We'll reach out the moment registrations open.
                  No spam — just one email when we're ready.
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1rem" }}>
                    {[
                      { key: "name",  type: "text",  placeholder: "Your name"  },
                      { key: "email", type: "email", placeholder: "Your email" },
                    ].map(({ key, type, placeholder }) => (
                      <input
                        key={key}
                        type={type}
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        required
                        style={{
                          width: "100%",
                          padding: "0.85rem 1rem",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                          fontFamily: "var(--font-general, sans-serif)",
                          fontSize: "0.78rem",
                          outline: "none",
                          transition: "border-color 0.2s, background 0.2s",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "rgba(200,255,0,0.45)";
                          e.target.style.background = "rgba(200,255,0,0.03)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "rgba(255,255,255,0.1)";
                          e.target.style.background = "rgba(255,255,255,0.04)";
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: "100%", padding: "0.9rem",
                      background: "#C8FF00", color: "#000",
                      border: "none", borderRadius: "8px",
                      fontFamily: "var(--font-general, sans-serif)",
                      fontSize: "0.65rem", letterSpacing: "0.14em",
                      fontWeight: 700, textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, opacity 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(200,255,0,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Notify Me When Registrations Open
                  </button>
                </form>

                <p style={{
                  marginTop: "1.25rem", textAlign: "center",
                  fontFamily: "var(--font-general, sans-serif)",
                  fontSize: "0.6rem", color: "rgba(255,255,255,0.15)",
                  letterSpacing: "0.06em",
                }}>
                  Organized by Coding Club · SCTCE · Thiruvananthapuram
                </p>
              </div>
            ) : (
              <div style={{
                background: "#0a0a0a",
                border: "1px solid rgba(200,255,0,0.18)",
                borderRadius: "14px",
                padding: "clamp(2rem, 5vw, 3.5rem)",
                textAlign: "center",
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: "rgba(200,255,0,0.08)",
                  border: "1px solid rgba(200,255,0,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  fontSize: "1.1rem", color: "#C8FF00",
                }}>✓</div>
                <h3
                  className="special-font bento-title"
                  style={{ color: "#fff", fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
                >
                  You're <b>i</b>n.
                </h3>
                <p style={{
                  fontFamily: "var(--font-general, sans-serif)",
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.35)",
                  marginTop: "0.75rem", lineHeight: 1.7,
                }}>
                  We'll email you when registrations open.
                  <br />Stay curious. Keep building.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sponsor teaser ───────────────────────────────────────────────── */}
      <div id="sponsors" style={{ padding: "0 clamp(1rem, 4vw, 2.5rem) 5rem", background: "#000" }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          background: "linear-gradient(135deg, #0d0d0d 0%, #0a0a0a 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "clamp(2.5rem, 6vw, 4rem)",
          display: "flex", flexWrap: "wrap",
          alignItems: "center", justifyContent: "space-between",
          gap: "2.5rem",
          position: "relative", overflow: "hidden",
        }}>
          {/* Top accent */}
          <div style={{
            position: "absolute", top: 0, left: "8%", right: "8%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.25), transparent)",
          }} />
          {/* Ambient glow */}
          <div style={{
            position: "absolute", top: "-100px", right: "-100px",
            width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(200,255,0,0.05), transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ flex: "1 1 300px" }}>
            <p style={{
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.55rem", letterSpacing: "0.22em",
              textTransform: "uppercase", color: "#C8FF00",
              marginBottom: "0.85rem",
            }}>For companies & startups</p>
            <h2
              className="special-font bento-title"
              style={{
                color: "#fff",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                letterSpacing: "-0.03em", lineHeight: 0.9,
                marginBottom: "1rem",
              }}
            >
              Back the<br /><b>B</b>uilders.
            </h2>
            <p style={{
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.75rem", color: "rgba(255,255,255,0.35)",
              lineHeight: 1.75, maxWidth: "360px",
            }}>
              Meaningful access to Kerala's most ambitious student builders
              — through mentorship, challenge tracks, and genuine engagement.
              Not just logo placement.
            </p>
          </div>

          <a href="/sponsors" style={{ textDecoration: "none", flexShrink: 0 }}>
            <button style={{
              padding: "0.9rem 2.25rem",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50px",
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.62rem", letterSpacing: "0.14em",
              fontWeight: 700, textTransform: "uppercase",
              cursor: "pointer",
              transition: "color 0.2s, border-color 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#C8FF00";
              e.currentTarget.style.borderColor = "rgba(200,255,0,0.4)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            >
              View Sponsor Opportunities →
            </button>
          </a>
        </div>
      </div>
    </>
  );
};

export default Contact;
