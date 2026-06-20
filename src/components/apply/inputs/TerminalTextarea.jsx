const wordCount = (str) =>
  str ? str.trim().split(/\s+/).filter(Boolean).length : 0;

const TerminalTextarea = ({
  label, maxWords, error, value = "", onChange, rows = 5,
  onFocus, onBlur, ...props
}) => {
  const count = wordCount(value);
  const over = maxWords && count > maxWords;

  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <label style={{
        display: "block",
        fontFamily: "var(--font-general, sans-serif)",
        fontSize: "0.6rem",
        letterSpacing: "0.18em",
        color: "rgba(255,255,255,0.55)",
        textTransform: "uppercase",
        marginBottom: "0.55rem",
        userSelect: "none",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          {...props}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderBottom: `2px solid ${over ? "rgba(255,75,75,0.5)" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "4px",
            padding: "0.85rem 1rem 2rem",
            color: "#fff",
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.9rem",
            outline: "none",
            resize: "vertical",
            transition: "border-color 0.25s",
            boxSizing: "border-box",
            caretColor: "#C8FF00",
            lineHeight: 1.75,
          }}
          onFocus={(e) => {
            if (!over) {
              e.target.style.borderBottomColor = "#C8FF00";
              e.target.style.borderColor = "rgba(200,255,0,0.15)";
              e.target.style.borderBottomWidth = "2px";
            }
            onFocus?.(e);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.07)";
            e.target.style.borderBottomColor = over ? "rgba(255,75,75,0.5)" : "rgba(255,255,255,0.12)";
            e.target.style.borderBottomWidth = "2px";
            onBlur?.(e);
          }}
        />
        {maxWords && (
          <span style={{
            position: "absolute",
            bottom: "0.6rem",
            right: "0.85rem",
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.6rem",
            letterSpacing: "0.06em",
            color: over ? "rgba(255,75,75,0.8)" : "rgba(255,255,255,0.38)",
            pointerEvents: "none",
          }}>
            {count} / {maxWords}
          </span>
        )}
      </div>
      {error && (
        <p style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.7rem",
          color: "rgba(255,75,75,0.8)",
          marginTop: "0.45rem",
        }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default TerminalTextarea;
