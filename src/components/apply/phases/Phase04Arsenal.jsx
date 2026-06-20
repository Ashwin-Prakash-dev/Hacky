import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";
import TagInput from "../inputs/TagInput";
import TerminalInput from "../inputs/TerminalInput";

const isValidUrl = (v) => {
  try { new URL(v); return true; } catch { return false; }
};

const Phase04Arsenal = ({ formData, updateForm, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);

  // Ensure links array has at least 1 slot
  const links = formData.links.length > 0 ? formData.links : [""];

  useEffect(() => {
    const els = contentRef.current?.querySelectorAll(".fi");
    if (!els?.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.14, ease: "power3.out", delay: 0.7 }
    );
  }, []);

  const updateLink = (i, val) => {
    const updated = [...links];
    updated[i] = val;
    // strip trailing empty slots beyond the first
    updateForm({ links: updated });
  };

  const addLink = () => {
    if (links.length >= 3) return;
    updateForm({ links: [...links, ""] });
  };

  const validate = (linksToCheck = links) => {
    const e = {};
    if (formData.techStack.length === 0) e.techStack = "add at least one technology";
    linksToCheck.forEach((l, i) => {
      if (l.trim() && !isValidUrl(l.trim())) e[`link_${i}`] = "must be a valid URL";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    const cleanedLinks = links.filter((l) => l.trim());
    updateForm({ links: cleanedLinks });
    if (validate(cleanedLinks)) onNext();
  };

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 04 — ARSENAL"
        tagline={`"What you're bringing to the fight."`}
      />
      <div ref={contentRef}>
        <div className="fi" style={{ opacity: 0 }}>
          <TagInput
            label="tech stack"
            value={formData.techStack}
            onChange={(tags) => updateForm({ techStack: tags })}
            error={errors.techStack}
          />
        </div>

        <div className="fi" style={{ opacity: 0 }}>
          <p style={{
            fontFamily: "var(--font-general, sans-serif)", fontSize: "0.58rem",
            letterSpacing: "0.18em", color: "rgba(255,255,255,0.22)",
            textTransform: "uppercase", marginBottom: "0.75rem", userSelect: "none",
          }}>
            Past Work — Optional
          </p>
          {links.map((link, i) => (
            <div key={i}>
              <TerminalInput
                label={`link_${String(i + 1).padStart(2, "0")}`}
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
                type="url"
                placeholder="https://..."
                error={errors[`link_${i}`]}
              />
            </div>
          ))}
          {links.length < 3 && (
            <button
              type="button"
              onClick={addLink}
              style={{
                background: "none",
                border: "0.5px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                borderRadius: "4px",
                padding: "0.5rem 0.9rem",
                fontFamily: "var(--font-general, sans-serif)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                marginBottom: "0.75rem",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              + add link ({links.length}/3)
            </button>
          )}
        </div>

        <div className="fi" style={{ opacity: 0 }}>
          <PhaseNav onNext={handleNext} onBack={onBack} />
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase04Arsenal;
