import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";
import TerminalTextarea from "../inputs/TerminalTextarea";

const wordCount = (str) =>
  str ? str.trim().split(/\s+/).filter(Boolean).length : 0;

const Phase05Statement = ({ formData, updateForm, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);

  useEffect(() => {
    const els = contentRef.current?.querySelectorAll(".fi");
    if (!els?.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.14, ease: "power3.out", delay: 0.7 }
    );
  }, []);

  const validate = () => {
    const e = {};
    const wc = wordCount(formData.whyUs);
    if (!formData.whyUs.trim()) e.whyUs = "this field is required";
    else if (wc > 200)          e.whyUs = `too long — keep it under 200 words (${wc} so far)`;
    if (!formData.shipped.trim()) e.shipped = "this field is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 05 — FINAL STATEMENT"
        tagline='"Make your case."'
      />
      <div ref={contentRef}>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalTextarea
            label="why your team"
            value={formData.whyUs}
            onChange={(e) => updateForm({ whyUs: e.target.value })}
            maxWords={200}
            rows={5}
            placeholder="why does this team deserve a spot?"
            error={errors.whyUs}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalTextarea
            label="last ship"
            value={formData.shipped}
            onChange={(e) => updateForm({ shipped: e.target.value })}
            rows={4}
            placeholder="what's the last thing you shipped? what broke first?"
            error={errors.shipped}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <PhaseNav onNext={handleNext} onBack={onBack} nextLabel="review →" />
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase05Statement;
