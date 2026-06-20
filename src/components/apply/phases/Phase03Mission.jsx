import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";
import TerminalInput    from "../inputs/TerminalInput";
import TerminalTextarea from "../inputs/TerminalTextarea";

const wordCount = (str) =>
  str ? str.trim().split(/\s+/).filter(Boolean).length : 0;

const Phase03Mission = ({ formData, updateForm, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);

  useEffect(() => {
    const els = contentRef.current?.querySelectorAll(".fi");
    if (!els?.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.09, ease: "power3.out", delay: 0.35 }
    );
  }, []);

  const validate = () => {
    const e = {};
    if (!formData.ideaSummary.trim()) e.ideaSummary = "idea summary is required";
    else if (formData.ideaSummary.trim().length > 80) e.ideaSummary = "keep it under 80 characters";
    const wc = wordCount(formData.idea);
    if (wc < 50)  e.idea = `too short — write at least 50 words (${wc} so far)`;
    if (wc > 250) e.idea = `too long — keep it under 250 words (${wc} so far)`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  const summaryLen = formData.ideaSummary.length;

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 03 — THE MISSION"
        tagline='"What are you going to build."'
      />
      <div ref={contentRef}>
        <div className="fi" style={{ opacity: 0 }}>
          <div style={{ position: "relative" }}>
            <TerminalInput
              label="idea summary"
              value={formData.ideaSummary}
              onChange={(e) => updateForm({ ideaSummary: e.target.value })}
              maxLength={80}
              placeholder="describe it like a headline"
              error={errors.ideaSummary}
            />
            <span style={{
              position: "absolute",
              top: "2.1rem",
              right: "0.8rem",
              fontFamily: "monospace",
              fontSize: "0.6rem",
              color: summaryLen > 72 ? "rgba(255,100,100,0.6)" : "rgba(255,255,255,0.18)",
              pointerEvents: "none",
            }}>
              {summaryLen} / 80
            </span>
          </div>
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalTextarea
            label="idea pitch"
            value={formData.idea}
            onChange={(e) => updateForm({ idea: e.target.value })}
            maxWords={250}
            rows={6}
            placeholder="what problem, who has it, how you solve it"
            error={errors.idea}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <PhaseNav onNext={handleNext} onBack={onBack} />
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase03Mission;
