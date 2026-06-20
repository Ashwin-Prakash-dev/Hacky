const fieldStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  padding: "0.65rem 0.85rem",
  color: "#fff",
  fontFamily: "var(--font-general, sans-serif)",
  fontSize: "0.84rem",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
  boxSizing: "border-box",
  caretColor: "#C8FF00",
};

const MemberRow = ({ index, value, onChange, onRemove }) => {
  const id = String(index + 1).padStart(2, "0");

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr auto",
      gap: "0.65rem",
      marginBottom: "0.75rem",
      alignItems: "end",
    }}>
      <div>
        <label style={{
          display: "block",
          fontFamily: "monospace",
          fontSize: "0.62rem",
          letterSpacing: "0.08em",
          color: "rgba(200,255,0,0.5)",
          marginBottom: "0.35rem",
          userSelect: "none",
        }}>
          &gt;_ member_{id} name
        </label>
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="full name"
          style={fieldStyle}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(200,255,0,0.45)";
            e.target.style.background = "rgba(200,255,0,0.03)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.1)";
            e.target.style.background = "rgba(255,255,255,0.04)";
          }}
        />
      </div>
      <div>
        <label style={{
          display: "block",
          fontFamily: "monospace",
          fontSize: "0.62rem",
          letterSpacing: "0.08em",
          color: "rgba(200,255,0,0.5)",
          marginBottom: "0.35rem",
          userSelect: "none",
        }}>
          &gt;_ member_{id} email
        </label>
        <input
          type="email"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="email address"
          style={fieldStyle}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(200,255,0,0.45)";
            e.target.style.background = "rgba(200,255,0,0.03)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.1)";
            e.target.style.background = "rgba(255,255,255,0.04)";
          }}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: "none",
          border: "0.5px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.25)",
          cursor: "pointer",
          borderRadius: "4px",
          padding: "0.5rem 0.65rem",
          fontSize: "0.75rem",
          transition: "color 0.2s, border-color 0.2s",
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(255,100,100,0.7)";
          e.currentTarget.style.borderColor = "rgba(255,100,100,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.25)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default MemberRow;
