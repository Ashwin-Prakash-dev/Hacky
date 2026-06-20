const wordCount = (str) =>
  str ? str.trim().split(/\s+/).filter(Boolean).length : 0;

const TerminalTextarea = ({
  label, maxWords, error, value = "", onChange, rows = 5,
  onFocus, onBlur, ...props
}) => {
  const count = wordCount(value);
  const over = maxWords && count > maxWords;

  return (
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
      <div style={{ position: "relative" }}>
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          {...props}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${over ? "rgba(255,100,100,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "6px",
            padding: "0.75rem 1rem 2rem",
            color: "#fff",
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.88rem",
            outline: "none",
            resize: "vertical",
            transition: "border-color 0.2s, background 0.2s",
            boxSizing: "border-box",
            caretColor: "#C8FF00",
            lineHeight: 1.7,
          }}
          onFocus={(e) => {
            if (!over) {
              e.target.style.borderColor = "rgba(200,255,0,0.45)";
              e.target.style.background = "rgba(200,255,0,0.03)";
            }
            onFocus?.(e);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = over
              ? "rgba(255,100,100,0.4)"
              : "rgba(255,255,255,0.1)";
            e.target.style.background = "rgba(255,255,255,0.04)";
            onBlur?.(e);
          }}
        />
        {maxWords && (
          <span style={{
            position: "absolute",
            bottom: "0.55rem",
            right: "0.8rem",
            fontFamily: "monospace",
            fontSize: "0.6rem",
            color: over ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.2)",
            pointerEvents: "none",
          }}>
            {count} / {maxWords} words
          </span>
        )}
      </div>
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
};

export default TerminalTextarea;
