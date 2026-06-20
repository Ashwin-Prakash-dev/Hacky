import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";
import MemberRow from "../inputs/MemberRow";

const Phase02Crew = ({ formData, updateForm, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);
  const memberSectionRef = useRef(null);

  useEffect(() => {
    const els = contentRef.current?.querySelectorAll(".fi");
    if (!els?.length) return;
    gsap.fromTo(
      els,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.09, ease: "power3.out", delay: 0.35 }
    );
  }, []);

  useEffect(() => {
    if (!formData.solo && memberSectionRef.current) {
      gsap.fromTo(
        memberSectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [formData.solo]);

  const addMember = () => {
    if (formData.members.length >= 3) return;
    updateForm({ members: [...formData.members, { name: "", email: "" }] });
  };

  const updateMember = (i, val) => {
    const updated = [...formData.members];
    updated[i] = val;
    updateForm({ members: updated });
  };

  const removeMember = (i) =>
    updateForm({ members: formData.members.filter((_, idx) => idx !== i) });

  const validate = () => {
    const e = {};
    formData.members.forEach((m, i) => {
      if ((m.name.trim() && !m.email.trim()) || (!m.name.trim() && m.email.trim())) {
        e[`member_${i}`] = "both name and email required";
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 02 — CREW MANIFEST"
        tagline={`"Who's in the room with you."`}
      />
      <div ref={contentRef}>
        {/* Solo toggle — only updates solo flag, never clears members */}
        <div className="fi" style={{ opacity: 0, marginBottom: "1.75rem" }}>
          <button
            type="button"
            onClick={() => updateForm({ solo: !formData.solo })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span
              style={{
                width: "36px",
                height: "20px",
                borderRadius: "10px",
                background: formData.solo ? "#C8FF00" : "rgba(255,255,255,0.1)",
                position: "relative",
                transition: "background 0.25s",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: formData.solo ? "19px" : "3px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: formData.solo ? "#000" : "rgba(255,255,255,0.4)",
                  transition: "left 0.25s, background 0.25s",
                }}
              />
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                color: "rgba(200,255,0,0.55)",
                userSelect: "none",
              }}
            >
              going solo (no additional members)
            </span>
          </button>
        </div>

        {/* Member rows — hidden when solo, but members state persists */}
        {!formData.solo && (
          <div className="fi" ref={memberSectionRef} style={{ opacity: 0 }}>
            {formData.members.map((m, i) => (
              <div key={i}>
                <MemberRow
                  index={i}
                  value={m}
                  onChange={(val) => updateMember(i, val)}
                  onRemove={() => removeMember(i)}
                />
                {errors[`member_${i}`] && (
                  <p
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.68rem",
                      color: "rgba(255,100,100,0.8)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {"// error: "}
                    {errors[`member_${i}`]}
                  </p>
                )}
              </div>
            ))}

            {formData.members.length < 3 && (
              <button
                type="button"
                onClick={addMember}
                style={{
                  background: "none",
                  border: "0.5px solid rgba(200,255,0,0.25)",
                  color: "rgba(200,255,0,0.55)",
                  cursor: "pointer",
                  borderRadius: "4px",
                  padding: "0.55rem 1rem",
                  fontFamily: "monospace",
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  marginBottom: "0.5rem",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(200,255,0,0.55)";
                  e.currentTarget.style.color = "#C8FF00";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(200,255,0,0.25)";
                  e.currentTarget.style.color = "rgba(200,255,0,0.55)";
                }}
              >
                + add member ({formData.members.length}/3)
              </button>
            )}
          </div>
        )}

        <div className="fi" style={{ opacity: 0 }}>
          <PhaseNav onNext={handleNext} onBack={onBack} />
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase02Crew;
