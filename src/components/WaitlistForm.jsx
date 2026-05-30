import { useState } from "react";

const WaitlistForm = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | duplicate | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setStatus("loading");
    const body = { name: form.name.trim(), email: form.email.trim() };
    if (form.phone.trim()) body.phone = form.phone.trim();
    try {
      const res = await fetch(import.meta.env.VITE_WAITLIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 201) setStatus("success");
      else if (res.status === 409) setStatus("duplicate");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
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
    );
  }

  return (
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
            { key: "name",  type: "text",  placeholder: "Your name"        },
            { key: "email", type: "email", placeholder: "Your email"       },
            { key: "phone", type: "tel",   placeholder: "Phone (optional)" },
          ].map(({ key, type, placeholder }) => (
            <input
              key={key}
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={key !== "phone"}
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

        {status === "duplicate" && (
          <p style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.7rem", color: "#ff6b6b", marginBottom: "0.75rem" }}>
            This email is already registered.
          </p>
        )}
        {status === "error" && (
          <p style={{ fontFamily: "var(--font-general, sans-serif)", fontSize: "0.7rem", color: "#ff6b6b", marginBottom: "0.75rem" }}>
            Something went wrong. Please try again.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            width: "100%", padding: "0.9rem",
            background: "#C8FF00", color: "#000",
            border: "none", borderRadius: "8px",
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.65rem", letterSpacing: "0.14em",
            fontWeight: 700, textTransform: "uppercase",
            cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: status === "loading" ? 0.6 : 1,
            transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            if (status !== "loading") {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(200,255,0,0.25)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {status === "loading" ? "Sending…" : "Notify Me When Registrations Open"}
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
  );
};

export default WaitlistForm;
