import { useState } from "react";
import { Link } from "react-router-dom";

export const MONO = "monospace";
export const SANS = "var(--font-general, sans-serif)";
export const LIME = "#C8FF00";

export const Panel = ({ maxWidth = "440px", children }) => (
  <div style={{
    width: "100%", maxWidth,
    background: "rgba(12,12,12,0.96)",
    border: "0.5px solid rgba(200,255,0,0.14)",
    borderRadius: "8px",
    padding: "clamp(1.5rem, 4vw, 2.5rem)",
  }}>
    {children}
  </div>
);

export const Eyebrow = ({ children }) => (
  <p style={{
    fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.16em",
    color: "rgba(200,255,0,0.75)", marginBottom: "0.6rem",
  }}>
    [{children}]
  </p>
);

export const Title = ({ children }) => (
  <p style={{
    fontFamily: SANS, fontSize: "clamp(1.4rem, 4vw, 1.9rem)", fontWeight: 700,
    color: "#fff", letterSpacing: "-0.01em", marginBottom: "1.5rem",
  }}>
    {children}
  </p>
);

export const ErrorLine = ({ children }) =>
  children ? (
    <p style={{
      fontFamily: MONO, fontSize: "0.75rem", lineHeight: 1.6,
      color: "rgba(255,107,107,0.9)", margin: "0.25rem 0 1rem",
    }}>
      {"// "}{children}
    </p>
  ) : null;

export const NoticeLine = ({ children }) =>
  children ? (
    <p style={{
      fontFamily: MONO, fontSize: "0.75rem", lineHeight: 1.6,
      color: "rgba(200,255,0,0.8)", margin: "0.25rem 0 1rem",
    }}>
      {"// "}{children}
    </p>
  ) : null;

export const PrimaryButton = ({ type = "button", disabled = false, onClick, children }) => {
  const [hover, setHover] = useState(false);
  const lifted = hover && !disabled;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%", padding: "0.9rem 2rem",
        background: disabled ? "rgba(200,255,0,0.35)" : LIME,
        color: "#000", border: "none", borderRadius: "4px",
        fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.14em",
        fontWeight: 700, textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s",
        transform: lifted ? "translateY(-2px)" : "translateY(0)",
        boxShadow: lifted ? "0 10px 28px rgba(200,255,0,0.22)" : "none",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
};

export const GhostButton = ({ onClick, disabled = false, danger = false, children }) => {
  const [hover, setHover] = useState(false);
  const base = danger ? "rgba(255,107,107,0.7)" : "rgba(255,255,255,0.45)";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "none", border: "none", padding: 0,
        fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.06em",
        color: hover && !disabled ? (danger ? "#ff6b6b" : "#fff") : base,
        cursor: disabled ? "not-allowed" : "pointer",
        textDecoration: "underline", textUnderlineOffset: "3px",
        transition: "color 0.2s",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
};

export const GoogleButton = ({ onClick, disabled = false }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        gap: "0.6rem", padding: "0.85rem 2rem",
        background: hover && !disabled ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        border: hover && !disabled ? "0.5px solid rgba(255,255,255,0.35)" : "0.5px solid rgba(255,255,255,0.16)",
        borderRadius: "4px",
        color: "#fff", fontFamily: SANS, fontSize: "0.85rem", fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/>
        <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/>
      </svg>
      Continue with Google
    </button>
  );
};

export const MonoLink = ({ to, children }) => (
  <Link
    to={to}
    style={{
      fontFamily: MONO, fontSize: "0.75rem", letterSpacing: "0.03em",
      color: "rgba(200,255,0,0.7)", textDecoration: "underline",
      textUnderlineOffset: "3px",
    }}
  >
    {children}
  </Link>
);

export const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", margin: "1.4rem 0" }}>
    <span style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
    <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>or</span>
    <span style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
  </div>
);
