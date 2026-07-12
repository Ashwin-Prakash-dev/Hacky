import { Link } from "react-router-dom";
import { MONO, SANS } from "./ui";

const AuthShell = ({ label, right = null, children }) => (
  <div style={{ minHeight: "100dvh", background: "#0a0a0a", position: "relative" }}>
    {/* Lime glow */}
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
      background: "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(200,255,0,0.05), transparent 70%)",
    }} />

    {/* CRT scanlines */}
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none",
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)",
    }} />

    {/* Top bar */}
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: "56px", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(1.25rem, 4vw, 2.5rem)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(10,10,10,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}>
      <Link to="/" style={{
        fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700,
        letterSpacing: "-0.01em", color: "#fff", textDecoration: "none",
      }}>
        Startathon<span style={{ color: "#888" }}>.</span>
      </Link>

      <span style={{
        fontFamily: MONO, fontSize: "0.65rem",
        letterSpacing: "0.12em", color: "rgba(200,255,0,0.55)",
      }}>
        [{label}]
      </span>

      {right ?? (
        <Link to="/" style={{
          fontFamily: SANS, fontSize: "0.65rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
          textDecoration: "none",
        }}>
          ✕ Exit
        </Link>
      )}
    </header>

    {/* Content */}
    <main style={{
      position: "relative", zIndex: 10, minHeight: "100dvh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "calc(56px + 2rem) clamp(1rem, 4vw, 2rem) 3rem",
    }}>
      {children}
    </main>
  </div>
);

export default AuthShell;
