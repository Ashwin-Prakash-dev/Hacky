const TerminalInput = ({ label, error, style: extStyle, onFocus, onBlur, ...props }) => (
  <div style={{ marginBottom: "1.5rem" }}>
    <label style={{
      display: "block",
      fontFamily: "monospace",
      fontSize: "0.7rem",
      letterSpacing: "0.08em",
      color: "rgba(200,255,0,0.55)",
      marginBottom: "0.5rem",
      userSelect: "none",
    }}>
      &gt;_ {label}
    </label>
    <input
      {...props}
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        padding: "0.75rem 1rem",
        color: "#fff",
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "0.88rem",
        outline: "none",
        transition: "border-color 0.2s, background 0.2s",
        boxSizing: "border-box",
        caretColor: "#C8FF00",
        ...extStyle,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "rgba(200,255,0,0.45)";
        e.target.style.background = "rgba(200,255,0,0.03)";
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "rgba(255,255,255,0.1)";
        e.target.style.background = "rgba(255,255,255,0.04)";
        onBlur?.(e);
      }}
    />
    {error && (
      <p style={{
        fontFamily: "monospace",
        fontSize: "0.68rem",
        color: "rgba(255,100,100,0.8)",
        marginTop: "0.4rem",
        letterSpacing: "0.03em",
      }}>
        {`// error: ${error}`}
      </p>
    )}
  </div>
);

export default TerminalInput;
