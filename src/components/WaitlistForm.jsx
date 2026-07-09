import { useState } from "react";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/FvoDSxKfOAE8Nuzw1Tar4D?mode=gi_t";

const WhatsAppLink = () => (
  <a
    href={WHATSAPP_GROUP_URL}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: "0.5rem",
      width: "100%", padding: "0.85rem",
      background: "transparent",
      border: "1px solid rgba(37,211,102,0.35)",
      borderRadius: "8px",
      color: "#25D366",
      fontFamily: "var(--font-general, sans-serif)",
      fontSize: "0.65rem", letterSpacing: "0.14em",
      fontWeight: 700, textTransform: "uppercase",
      textDecoration: "none",
      boxSizing: "border-box",
      transition: "background 0.2s, border-color 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(37,211,102,0.08)";
      e.currentTarget.style.borderColor = "rgba(37,211,102,0.6)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.borderColor = "rgba(37,211,102,0.35)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    Join the WhatsApp Updates Group
  </a>
);

const WaitlistForm = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", college: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | duplicate | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setStatus("loading");
    const body = { name: form.name.trim(), email: form.email.trim() };
    if (form.phone.trim()) body.phone = form.phone.trim();
    if (form.college.trim()) body.college = form.college.trim();
    try {
      const res = await fetch("https://api.sctcoding.club/api/v3/events/startathon/waitlist", {
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
          Check your email for a confirmation from us.
          <br />We'll be in touch when registrations open.
        </p>
        <div style={{ marginTop: "1.75rem" }}>
          <WhatsAppLink />
        </div>
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
        No spam. Just one email when we're ready.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1rem" }}>
          {[
            { key: "name",    type: "text",  placeholder: "Your name"           },
            { key: "email",   type: "email", placeholder: "Your email"          },
            { key: "college", type: "text",  placeholder: "Your college"        },
            { key: "phone",   type: "tel",   placeholder: "Phone (optional)"    },
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

      <div style={{
        display: "flex", alignItems: "center", gap: "0.85rem",
        margin: "1.25rem 0",
      }}>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        <span style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.55rem", letterSpacing: "0.18em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
        }}>or</span>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
      </div>

      <WhatsAppLink />

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
