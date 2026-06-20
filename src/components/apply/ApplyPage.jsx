import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import PhaseTransition from "./PhaseTransition";
import Phase01Identity  from "./phases/Phase01Identity";
import Phase02Crew      from "./phases/Phase02Crew";
import Phase03Mission   from "./phases/Phase03Mission";
import Phase04Arsenal   from "./phases/Phase04Arsenal";
import Phase05Statement from "./phases/Phase05Statement";
import Phase06Deploy    from "./phases/Phase06Deploy";

const TOTAL = 6;
const PHASES = [
  Phase01Identity,
  Phase02Crew,
  Phase03Mission,
  Phase04Arsenal,
  Phase05Statement,
  Phase06Deploy,
];

const EMPTY_FORM = {
  teamName: "",
  lead: { name: "", email: "", phone: "" },
  members: [],
  solo: false,
  ideaSummary: "",
  idea: "",
  techStack: [],
  links: [],
  whyUs: "",
  shipped: "",
};

const ApplyPage = () => {
  const [phase, setPhase]         = useState(1);
  const [direction, setDirection] = useState("forward");
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const updateForm = (patch) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const goNext = () => { setDirection("forward"); setPhase((p) => Math.min(p + 1, TOTAL)); };
  const goPrev = () => { setDirection("back");    setPhase((p) => Math.max(p - 1, 1)); };

  const progress = ((phase - 1) / (TOTAL - 1)) * 100;

  const CurrentPhase = PHASES[phase - 1];

  if (submitted) {
    return (
      <div style={{
        minHeight: "100dvh", background: "#0a0a0a",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem",
      }}>
        <SuccessScreen />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0a0a0a",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient radial glow */}
      <div aria-hidden="true" style={{
        position: "fixed",
        top: "-20%",
        right: "-10%",
        width: "55vw",
        height: "55vw",
        maxWidth: "700px",
        maxHeight: "700px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,255,0,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      {/* Progress line */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: "2px", background: "rgba(255,255,255,0.06)", zIndex: 200,
      }}>
        <div style={{
          height: "100%", background: "#C8FF00",
          width: `${progress}%`,
          transition: "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: "0 0 8px rgba(200,255,0,0.5)",
        }} />
      </div>

      {/* Top bar */}
      <header style={{
        position: "fixed", top: "2px", left: 0, right: 0,
        height: "56px", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(1.25rem, 4vw, 2.5rem)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <a href="/" style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.95rem", fontWeight: 700,
          letterSpacing: "-0.01em", color: "#fff", textDecoration: "none",
        }}>
          Startathon<span style={{ color: "#888" }}>.</span>
        </a>

        <span style={{
          fontFamily: "var(--font-general, sans-serif)", fontSize: "0.6rem",
          letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)",
          textTransform: "uppercase",
        }}>
          {String(phase).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </span>

        <a href="/" style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.65rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
          textDecoration: "none", transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
        >
          ✕ Exit
        </a>
      </header>

      {/* Phase area */}
      <main style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "calc(58px + 2rem) clamp(1rem, 4vw, 2rem) 3rem",
      }}>
        <PhaseTransition key={phase} direction={direction}>
          <CurrentPhase
            formData={formData}
            updateForm={updateForm}
            onNext={goNext}
            onBack={goPrev}
            isFirst={phase === 1}
            onSubmitted={() => setSubmitted(true)}
          />
        </PhaseTransition>
      </main>
    </div>
  );
};

const SuccessScreen = () => {
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const linkRef  = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(line1Ref.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }
    )
    .fromTo(line2Ref.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" },
      "+=0.15"
    )
    .fromTo(linkRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      "+=1.5"
    );
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p
        ref={line1Ref}
        style={{
          fontFamily: "monospace",
          fontSize: "clamp(1rem, 3vw, 1.5rem)",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#C8FF00",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
          opacity: 0,
        }}
      >
        ✓ ACCESS GRANTED. APPLICATION TRANSMITTED.
      </p>
      <p
        ref={line2Ref}
        style={{
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.55)",
          opacity: 0,
        }}
      >
        We&apos;ll be in touch.
      </p>
      <a
        ref={linkRef}
        href="/"
        style={{
          display: "inline-block",
          marginTop: "2.5rem",
          fontFamily: "var(--font-general, sans-serif)",
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          textDecoration: "none",
          transition: "color 0.2s",
          opacity: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
      >
        ← Back to Startathon
      </a>
    </div>
  );
};

export default ApplyPage;
