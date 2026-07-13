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
    fontFamily: MONO, fontSize: "0.85rem", letterSpacing: "0.16em",
    color: "rgba(200,255,0,0.9)", marginBottom: "0.6rem",
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
      fontFamily: MONO, fontSize: "0.9rem", lineHeight: 1.6,
      color: "rgba(255,120,120,0.95)", margin: "0.25rem 0 1rem",
    }}>
      {"// "}{children}
    </p>
  ) : null;

export const NoticeLine = ({ children }) =>
  children ? (
    <p style={{
      fontFamily: MONO, fontSize: "0.9rem", lineHeight: 1.6,
      color: "rgba(200,255,0,0.9)", margin: "0.25rem 0 1rem",
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
        fontFamily: MONO, fontSize: "0.8rem", letterSpacing: "0.14em",
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
  const base = danger ? "rgba(255,140,140,0.9)" : "rgba(255,255,255,0.78)";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "none", border: "none", padding: 0,
        fontFamily: MONO, fontSize: "0.85rem", letterSpacing: "0.06em",
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

export const MonoLink = ({ to, children }) => (
  <Link
    to={to}
    style={{
      fontFamily: MONO, fontSize: "0.85rem", letterSpacing: "0.03em",
      color: "rgba(200,255,0,0.9)", textDecoration: "underline",
      textUnderlineOffset: "3px",
    }}
  >
    {children}
  </Link>
);

export const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", margin: "1.4rem 0" }}>
    <span style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
    <span style={{ fontFamily: MONO, fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>or</span>
    <span style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
  </div>
);
