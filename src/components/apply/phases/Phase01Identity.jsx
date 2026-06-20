import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader, PhaseNav } from "../PhaseShared";
import TerminalInput from "../inputs/TerminalInput";

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v) => /^\d{10}$/.test(v.replace(/\D/g, ""));

const Phase01Identity = ({ formData, updateForm, onNext, isFirst }) => {
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);

  useEffect(() => {
    const els = contentRef.current?.querySelectorAll(".fi");
    if (!els?.length) return;
    gsap.fromTo(
      els,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.14, ease: "power3.out", delay: 0.7 }
    );
  }, []);

  const validate = () => {
    const e = {};
    const name = formData.teamName.trim();
    if (!name || name.length < 2) e.teamName = "team name must be at least 2 characters";
    else if (name.length > 40) e.teamName = "team name must be under 40 characters";
    if (!formData.lead.name.trim()) e.leadName = "lead name is required";
    if (!isValidEmail(formData.lead.email)) e.leadEmail = "valid email required";
    if (!isValidPhone(formData.lead.phone)) e.leadPhone = "10-digit phone number required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 01 — IDENTITY CLEARANCE"
        tagline='"Establish your presence in the system."'
      />
      <div ref={contentRef}>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalInput
            label="team name"
            value={formData.teamName}
            onChange={(e) => updateForm({ teamName: e.target.value })}
            maxLength={40}
            error={errors.teamName}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalInput
            label="team lead name"
            value={formData.lead.name}
            onChange={(e) => updateForm({ lead: { ...formData.lead, name: e.target.value } })}
            error={errors.leadName}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalInput
            label="team lead email"
            type="email"
            value={formData.lead.email}
            onChange={(e) => updateForm({ lead: { ...formData.lead, email: e.target.value } })}
            error={errors.leadEmail}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <TerminalInput
            label="team lead phone"
            type="tel"
            value={formData.lead.phone}
            onChange={(e) => updateForm({ lead: { ...formData.lead, phone: e.target.value } })}
            error={errors.leadPhone}
          />
        </div>
        <div className="fi" style={{ opacity: 0 }}>
          <PhaseNav onNext={handleNext} onBack={() => {}} isFirst={isFirst} />
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase01Identity;
