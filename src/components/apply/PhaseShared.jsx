import { useTypewriter } from "../../lib/useTypewriter";

export const PhaseLayout = ({ children }) => (
  <div style={{
    width: "100%",
    maxWidth: "600px",
    padding: "clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)",
  }}>
    {children}
  </div>
);

export const PhaseHeader = ({ label, tagline }) => {
  const typed = useTypewriter(label, 20);
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <p style={{
        fontFamily: "monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.2em",
        color: "#C8FF00",
        textTransform: "uppercase",
        marginBottom: "0.6rem",
        minHeight: "1em",
      }}>
        {typed}
      </p>
      <p style={{
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "1rem",
        fontStyle: "italic",
        color: "rgba(255,255,255,0.3)",
        lineHeight: 1.5,
      }}>
        {tagline}
      </p>
    </div>
  );
};

export const PhaseNav = ({
  onNext,
  onBack,
  isFirst = false,
  nextLabel = "next phase →",
  disabled = false,
}) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: isFirst ? "flex-end" : "space-between",
    marginTop: "2.25rem",
  }}>
    {!isFirst && (
      <button
        type="button"
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.3)",
          cursor: "pointer",
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.62rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: 0,
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
      >
        ← prev
      </button>
    )}
    <button
      type="button"
      onClick={onNext}
      disabled={disabled}
      style={{
        padding: "0.85rem 2rem",
        background: "#C8FF00",
        color: "#000",
        border: "none",
        borderRadius: "6px",
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "0.62rem",
        letterSpacing: "0.14em",
        fontWeight: 700,
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, opacity 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(200,255,0,0.25)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {nextLabel}
    </button>
  </div>
);
