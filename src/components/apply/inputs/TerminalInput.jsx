const TerminalInput = ({ label, error, style: extStyle, onFocus, onBlur, ...props }) => (
  <div style={{ marginBottom: "1.75rem" }}>
    <label style={{
      display: "block",
      fontFamily: "var(--font-general, sans-serif)",
      fontSize: "0.78rem",
      letterSpacing: "0.14em",
      color: "rgba(255,255,255,0.8)",
      textTransform: "uppercase",
      marginBottom: "0.55rem",
      userSelect: "none",
    }}>
      {label}
    </label>
    <input
      {...props}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        borderBottom: "1.5px solid rgba(255,255,255,0.12)",
        borderRadius: 0,
        padding: "0.55rem 0",
        color: "#fff",
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "0.95rem",
        fontWeight: 400,
        outline: "none",
        transition: "border-color 0.25s",
        boxSizing: "border-box",
        caretColor: "#C8FF00",
        ...extStyle,
      }}
      onFocus={(e) => {
        e.target.style.borderBottomColor = "#C8FF00";
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderBottomColor = "rgba(255,255,255,0.12)";
        onBlur?.(e);
      }}
    />
    {error && (
      <p style={{
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "0.85rem",
        color: "rgba(255,120,120,0.95)",
        marginTop: "0.45rem",
      }}>
        {error}
      </p>
    )}
  </div>
);

export default TerminalInput;
