import WaitlistForm from "./WaitlistForm";

const Contact = () => {
  return (
    <>
      <div
        id="contact"
        className="w-screen"
        style={{ background: "#0a0a0a", padding: "7rem 0" }}
      >
        <div className="container mx-auto px-5 md:px-10">
          <div style={{ maxWidth: "580px", margin: "0 auto" }}>
            <WaitlistForm />
          </div>
        </div>
      </div>

      {/* ── Sponsor teaser ───────────────────────────────────────────────── */}
      <div id="sponsors" style={{ padding: "0 clamp(1rem, 4vw, 2.5rem) 5rem", background: "#0a0a0a" }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          background: "#141412",
          border: "1px solid rgba(255,255,255,0.12)",
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
            background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.45), transparent)",
          }} />
          {/* Ambient glow */}
          <div style={{
            position: "absolute", top: "-100px", right: "-100px",
            width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(200,255,0,0.08), transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ flex: "1 1 300px" }}>
            <p style={{
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.75rem", letterSpacing: "0.18em",
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
              Kerala's best<br />talent. <b>O</b>ne room.
            </h2>
            <p style={{
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.92rem", color: "rgba(255,255,255,0.75)",
              lineHeight: 1.75, maxWidth: "360px",
            }}>
              20 curated teams. 30 hours of building. Direct access to the most
              ambitious student builders in Kerala, all in one place.
            </p>
          </div>

          <a href="/sponsors" style={{ textDecoration: "none", flexShrink: 0 }}>
            <button style={{
              padding: "0.9rem 2.25rem",
              background: "transparent",
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50px",
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.78rem", letterSpacing: "0.12em",
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
              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
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
