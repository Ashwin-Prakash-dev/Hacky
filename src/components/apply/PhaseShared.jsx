import { useTypewriter } from "../../lib/useTypewriter";

export const PhaseLayout = ({ children }) => (
  <div style={{
    width: "100%",
    maxWidth: "640px",
    padding: "clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)",
  }}>
    {children}
  </div>
);

export const PhaseHeader = ({ label, tagline }) => {
  const phaseNum = label.match(/\d+/)?.[0] ?? "";
  const phaseName = label.split("—")[1]?.trim() ?? label;
  const typedNum = useTypewriter(phaseNum, 80);

  return (
    <div style={{ marginBottom: "3rem", position: "relative", overflow: "visible" }}>
      {/* Ghost number backdrop */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-1.5rem",
          right: "-1rem",
          fontSize: "clamp(7rem, 18vw, 12rem)",
          fontWeight: 900,
          color: "rgba(255,255,255,0.028)",
          letterSpacing: "-0.06em",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
          fontFamily: "var(--font-general, sans-serif)",
        }}
      >
        {typedNum}
      </div>

      {/* Phase tag */}
      <p style={{
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "0.58rem",
        letterSpacing: "0.22em",
        color: "rgba(255,255,255,0.45)",
        textTransform: "uppercase",
        marginBottom: "0.85rem",
      }}>
        Phase {phaseNum}
      </p>

      {/* Phase name — the bold headline */}
      <h2 style={{
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: "#fff",
        lineHeight: 1.1,
        marginBottom: "0.75rem",
        textTransform: "none",
      }}>
        {phaseName.charAt(0) + phaseName.slice(1).toLowerCase()}
      </h2>

      {/* Tagline */}
      <p style={{
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "0.85rem",
        fontStyle: "italic",
        color: "rgba(255,255,255,0.5)",
        lineHeight: 1.6,
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
  nextLabel = "Continue",
  disabled = false,
}) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: isFirst ? "flex-end" : "space-between",
    marginTop: "2.5rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  }}>
    {!isFirst && (
      <button
        type="button"
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.45)",
          cursor: "pointer",
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
          padding: 0,
          transition: "color 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
      >
        ← back
      </button>
    )}
    <button
      type="button"
      onClick={onNext}
      disabled={disabled}
      style={{
        padding: "0.9rem 2.25rem",
        background: disabled ? "rgba(200,255,0,0.35)" : "#C8FF00",
        color: "#000",
        border: "none",
        borderRadius: "5px",
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "0.65rem",
        letterSpacing: "0.16em",
        fontWeight: 700,
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s, background 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(200,255,0,0.2)";
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
