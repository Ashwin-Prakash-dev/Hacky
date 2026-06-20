import { useState } from "react";

const inputStyle = {
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
};

const TagInput = ({ label, value = [], onChange, error }) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput("");
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

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

      {value.length > 0 && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.65rem",
        }}>
          {value.map((tag) => (
            <span key={tag} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "#C8FF00",
              border: "0.5px solid rgba(200,255,0,0.4)",
              borderRadius: "3px",
              padding: "3px 8px",
              background: "rgba(200,255,0,0.06)",
            }}>
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(200,255,0,0.5)",
                  fontSize: "0.65rem",
                  padding: 0,
                  lineHeight: 1,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,100,100,0.8)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,255,0,0.5)")}
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
        placeholder="type and press Enter to add"
        style={inputStyle}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(200,255,0,0.45)";
          e.target.style.background = "rgba(200,255,0,0.03)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.1)";
          e.target.style.background = "rgba(255,255,255,0.04)";
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
};

export default TagInput;
