import { useState } from "react";

const TagInput = ({ label, value = [], onChange, error }) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput("");
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

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

      {value.length > 0 && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.4rem",
          marginBottom: "0.75rem",
        }}>
          {value.map((tag) => (
            <span key={tag} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.72rem",
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              background: "rgba(255,255,255,0.07)",
              borderRadius: "4px",
              padding: "4px 10px",
              letterSpacing: "0.02em",
            }}>
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "0.6rem",
                  padding: 0,
                  lineHeight: 1,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,75,75,0.8)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); addTag(); }
        }}
        placeholder="type and press Enter"
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
          outline: "none",
          transition: "border-color 0.25s",
          boxSizing: "border-box",
          caretColor: "#C8FF00",
        }}
        onFocus={(e) => (e.target.style.borderBottomColor = "#C8FF00")}
        onBlur={(e) => (e.target.style.borderBottomColor = "rgba(255,255,255,0.12)")}
      />
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

export default TagInput;
