import { useTypewriter } from "../../lib/useTypewriter";

// Injected once — cursor blink keyframe
const CURSOR_STYLE = `@keyframes termCursor{0%,49%{opacity:1}50%,99%{opacity:0}}`;

export const PhaseLayout = ({ children }) => (
  <div style={{
    width: "100%",
    maxWidth: "640px",
    padding: "clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)",
    position: "relative",
    zIndex: 5,
  }}>
    {children}
  </div>
);

export const PhaseHeader = ({ label, tagline }) => {
  const phaseNum  = label.match(/\d+/)?.[0] ?? "";
  const rawName   = label.split("—")[1]?.trim() ?? label;
  // Terminal SNAKE_CASE display name
  const termName  = rawName.toUpperCase().replace(/\s+/g, "_");
  const typed     = useTypewriter(termName, 42);
  const done      = typed.length >= termName.length;
  // Strip surrounding quotes from tagline
  const cleanTag  = tagline?.replace(/^["']|["']$/g, "") ?? "";

  return (
    <>
      <style>{CURSOR_STYLE}</style>
      <div style={{ marginBottom: "3rem" }}>

        {/* Monospace path prompt */}
        <p style={{
          fontFamily: "monospace",
          fontSize: "0.72rem",
          letterSpacing: "0.04em",
          color: "#C8FF00",
          opacity: 0.65,
          marginBottom: "1.1rem",
          userSelect: "none",
        }}>
          ~/apply $ phase_{phaseNum}
        </p>

        {/* Phase name — typewriter + block cursor */}
        <h2 style={{
          fontFamily: "monospace",
          fontSize: "clamp(1.35rem, 4.5vw, 2.1rem)",
          fontWeight: 700,
          letterSpacing: "0.03em",
          color: "#fff",
          lineHeight: 1.1,
          marginBottom: "1rem",
        }}>
          {typed}
          <span style={{
            display: "inline-block",
            width: "0.55em",
            height: "1em",
            background: "#C8FF00",
            marginLeft: "3px",
            verticalAlign: "text-bottom",
            animation: done ? "termCursor 1s step-end infinite" : "none",
            opacity: done ? undefined : 1,
          }} />
        </h2>

        {/* Tagline */}
        <p style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.85rem",
          fontStyle: "italic",
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.65,
        }}>
          {cleanTag}
        </p>
      </div>
    </>
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
    borderTop: "1px solid rgba(255,255,255,0.06)",
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
          fontFamily: "monospace",
          fontSize: "0.72rem",
          letterSpacing: "0.06em",
          padding: 0,
          transition: "color 0.2s",
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
        borderRadius: "4px",
        fontFamily: "monospace",
        fontSize: "0.65rem",
        letterSpacing: "0.14em",
        fontWeight: 700,
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 10px 28px rgba(200,255,0,0.22)";
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
