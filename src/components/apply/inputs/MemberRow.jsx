const fieldStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: 0,
  padding: "0.5rem 0",
  color: "#fff",
  fontFamily: "var(--font-general, sans-serif)",
  fontSize: "0.9rem",
  outline: "none",
  transition: "border-color 0.25s",
  boxSizing: "border-box",
  caretColor: "#C8FF00",
};

const MemberRow = ({ index, value, onChange, onRemove }) => {
  const id = String(index + 1).padStart(2, "0");

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr auto",
      gap: "1.25rem",
      marginBottom: "1.25rem",
      alignItems: "end",
    }}>
      <div>
        <label style={{
          display: "block",
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.58rem",
          letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          marginBottom: "0.4rem",
          userSelect: "none",
        }}>
          Member {id} — Name
        </label>
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="full name"
          style={fieldStyle}
          onFocus={(e) => (e.target.style.borderBottomColor = "#C8FF00")}
          onBlur={(e) => (e.target.style.borderBottomColor = "rgba(255,255,255,0.12)")}
        />
      </div>
      <div>
        <label style={{
          display: "block",
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.58rem",
          letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          marginBottom: "0.4rem",
          userSelect: "none",
        }}>
          Member {id} — Email
        </label>
        <input
          type="email"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="email address"
          style={fieldStyle}
          onFocus={(e) => (e.target.style.borderBottomColor = "#C8FF00")}
          onBlur={(e) => (e.target.style.borderBottomColor = "rgba(255,255,255,0.12)")}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          cursor: "pointer",
          padding: "0.4rem",
          fontSize: "0.8rem",
          transition: "color 0.2s",
          lineHeight: 1,
          marginBottom: "0.1rem",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,75,75,0.8)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
      >
        ✕
      </button>
    </div>
  );
};

export default MemberRow;
