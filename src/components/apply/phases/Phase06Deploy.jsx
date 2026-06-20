import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { PhaseLayout, PhaseHeader } from "../PhaseShared";
import { api } from "../../../lib/api";

const buildPayload = (f) => ({
  teamName:    f.teamName.trim(),
  lead: {
    name:  f.lead.name.trim(),
    email: f.lead.email.trim(),
    phone: f.lead.phone.replace(/\D/g, ""),
  },
  members: f.solo
    ? []
    : f.members
        .filter((m) => m.name.trim() || m.email.trim())
        .map((m) => ({ name: m.name.trim(), email: m.email.trim() })),
  ideaSummary: f.ideaSummary.trim(),
  idea:        f.idea.trim(),
  techStack:   f.techStack,
  links:       f.links.filter(Boolean).map((l) => l.trim()),
  whyUs:       f.whyUs.trim(),
  shipped:     f.shipped.trim(),
});

const truncate = (str, n = 72) =>
  str.length > n ? str.slice(0, n) + "…" : str;

const Phase06Deploy = ({ formData, onBack, onSubmitted }) => {
  const [status, setStatus]     = useState("idle"); // idle | loading | error | duplicate
  const [errMsg, setErrMsg]     = useState("");
  const submitRef               = useRef(null);
  const linesRef                = useRef([]);
  const contentRef              = useRef(null);

  const dossierLines = [
    { k: "TEAM",    v: formData.teamName },
    { k: "LEAD",    v: `${formData.lead.name} · ${formData.lead.email} · ${formData.lead.phone}` },
    ...(formData.solo || formData.members.length === 0
      ? [{ k: "CREW", v: "solo" }]
      : formData.members
          .filter((m) => m.name.trim())
          .map((m, i) => ({ k: `MEMBER_${String(i + 1).padStart(2, "0")}`, v: `${m.name} · ${m.email}` }))
    ),
    { k: "MISSION", v: truncate(formData.ideaSummary) },
    { k: "PITCH",   v: truncate(formData.idea) },
    { k: "STACK",   v: formData.techStack.join(", ") },
    ...formData.links
        .filter(Boolean)
        .map((l, i) => ({ k: `LINK_${String(i + 1).padStart(2, "0")}`, v: truncate(l, 55) })),
    { k: "WHY_US",  v: truncate(formData.whyUs) },
    { k: "SHIPPED", v: truncate(formData.shipped) },
  ];

  useEffect(() => {
    const els = linesRef.current.filter(Boolean);
    if (!els.length) return;
    gsap.fromTo(els,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, ease: "power2.out", delay: 0.55 }
    );
    // Fade in the submit area after dossier prints
    const delay = 0.55 + els.length * 0.07 + 0.3;
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", delay }
    );
  }, []);

  const handleSubmit = async () => {
    if (status === "loading") return;
    setErrMsg("");
    setStatus("idle"); // clear prior error/duplicate before new attempt

    // Pulse button
    await new Promise((res) => {
      gsap.to(submitRef.current, {
        scale: 1.02, duration: 0.14, yoyo: true, repeat: 1,
        ease: "power2.inOut", onComplete: res,
      });
    });

    setStatus("loading");
    try {
      const res = await api.apply(buildPayload(formData));
      if (res.status === 201) {
        onSubmitted();
      } else if (res.status === 409) {
        setStatus("duplicate");
        setErrMsg("this email is already in the system.");
      } else {
        setStatus("error");
        setErrMsg("transmission failed. try again.");
      }
    } catch {
      setStatus("error");
      setErrMsg("transmission failed. try again.");
    }
  };

  return (
    <PhaseLayout>
      <PhaseHeader
        label="PHASE 06 — DEPLOY"
        tagline='"Review and transmit."'
      />

      {/* Dossier */}
      <div style={{
        background: "rgba(200,255,0,0.018)",
        border: "0.5px solid rgba(200,255,0,0.12)",
        borderRadius: "6px",
        padding: "1.25rem 1.5rem",
        marginBottom: "2rem",
        fontFamily: "monospace",
      }}>
        {dossierLines.map((line, i) => (
          <div
            key={i}
            ref={(el) => (linesRef.current[i] = el)}
            style={{
              display: "flex", gap: "1rem",
              padding: "0.28rem 0",
              borderBottom: i < dossierLines.length - 1
                ? "0.5px solid rgba(255,255,255,0.04)"
                : "none",
              opacity: 0,
            }}
          >
            <span style={{
              fontSize: "0.6rem", letterSpacing: "0.1em",
              color: "rgba(200,255,0,0.45)",
              minWidth: "6.5rem", flexShrink: 0, paddingTop: "0.05rem",
            }}>
              {line.k}
            </span>
            <span style={{
              fontSize: "0.72rem", color: "rgba(255,255,255,0.6)",
              lineHeight: 1.5, wordBreak: "break-all",
            }}>
              {line.v}
            </span>
          </div>
        ))}
      </div>

      {/* Submit area */}
      <div ref={contentRef} style={{ opacity: 0 }}>
        {errMsg && (
          <p style={{
            fontFamily: "monospace", fontSize: "0.68rem",
            color: "rgba(255,100,100,0.8)", marginBottom: "1rem",
            letterSpacing: "0.03em",
          }}>
            {"// error: "}{errMsg}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontFamily: "var(--font-general, sans-serif)",
              fontSize: "0.62rem", letterSpacing: "0.1em",
              textTransform: "uppercase", padding: 0,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            ← prev
          </button>

          <button
            ref={submitRef}
            type="button"
            onClick={handleSubmit}
            disabled={status === "loading"}
            style={{
              padding: "0.9rem 2rem",
              background: status === "loading" ? "rgba(200,255,0,0.6)" : "#C8FF00",
              color: "#000",
              border: "none", borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "0.7rem", letterSpacing: "0.12em",
              fontWeight: 700,
              cursor: status === "loading" ? "not-allowed" : "pointer",
              transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              if (status !== "loading") {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(200,255,0,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {status === "loading"
              ? ">_ transmitting..."
              : ">_ transmit application --confirm"}
          </button>
        </div>
      </div>
    </PhaseLayout>
  );
};

export default Phase06Deploy;
