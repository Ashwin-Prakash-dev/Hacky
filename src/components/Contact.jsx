import { useState } from "react";
import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";

/* ── Sponsor teaser section ──────────────────────────────────────────────── */
const SponsorTeaser = () => (
  <div
    id="sponsors"
    className="my-20 min-h-48 w-screen px-10"
  >
    <div
      className="relative rounded-lg py-16 text-blue-50 overflow-hidden"
      style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Subtle top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0, left: "10%", right: "10%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(200,255,0,0.3), transparent)",
        }}
      />

      <div className="flex flex-col items-center text-center px-6">
        <p
          className="mb-4 font-general text-xs uppercase tracking-widest"
          style={{ color: "#C8FF00", letterSpacing: "0.15em" }}
        >
          For companies & startups
        </p>

        <AnimatedTitle
          title="Are you looking to hire,<br />build, or back the builders?"
          className="special-font !md:text-[4rem] w-full font-zentry !text-3xl !font-black !leading-[.9]"
        />

        <p
          className="mt-6 max-w-lg font-circular-web text-sm"
          style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.75 }}
        >
          Startathon gives you meaningful access to Kerala's most ambitious
          student builders — through mentorship, challenge tracks, and genuine
          engagement. Not just logo placement.
        </p>

        <a href="/sponsors" target="_blank" rel="noreferrer">
          <Button
            title="View Sponsor Opportunities →"
            containerClass="mt-8 cursor-pointer border border-white/20 bg-transparent text-white hover:bg-white/5"
          />
        </a>
      </div>
    </div>
  </div>
);

/* ── Interest form ───────────────────────────────────────────────────────── */
const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    // TODO: wire up to your backend / Formspree / Google Forms
    setSubmitted(true);
  };

  return (
    <>
      <div
        id="contact"
        className="w-screen"
        style={{ background: "#000000", padding: "6rem 0" }}
      >
        <div className="container mx-auto px-5 md:px-10">
          <div
            className="rounded-lg px-8 py-16 md:px-16"
            style={{
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.06)",
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            {!submitted ? (
              <>
                <p
                  className="font-general text-xs uppercase tracking-widest mb-4"
                  style={{ color: "#C8FF00", letterSpacing: "0.15em" }}
                >
                  Stay in the loop
                </p>
                <h2
                  className="special-font bento-title mb-2"
                  style={{ color: "#fff", fontSize: "clamp(2rem,5vw,3rem)", letterSpacing: "-0.03em" }}
                >
                  Be <b>f</b>irst in line.
                </h2>
                <p
                  className="font-circular-web text-sm mb-10"
                  style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}
                >
                  We'll reach out the moment registrations open.
                  <br />
                  No spam. Just one email when we're ready.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="flex-1 rounded px-4 py-3 font-general text-sm outline-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(200,255,0,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="flex-1 rounded px-4 py-3 font-general text-sm outline-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(200,255,0,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded px-6 py-3 font-general text-sm font-bold uppercase tracking-widest transition-opacity duration-200 hover:opacity-85"
                    style={{ background: "#C8FF00", color: "#000", cursor: "pointer" }}
                  >
                    Notify Me When Registrations Open
                  </button>
                </form>

                <p
                  className="mt-4 text-center font-general text-xs"
                  style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}
                >
                  Organized by Coding Club · SCTCE · Thiruvananthapuram
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <div
                  style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: "rgba(200,255,0,0.1)",
                    border: "1px solid rgba(200,255,0,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    fontSize: "1.2rem", color: "#C8FF00",
                  }}
                >
                  ✓
                </div>
                <h3
                  className="special-font bento-title mb-3"
                  style={{ color: "#fff", fontSize: "clamp(1.5rem,4vw,2.5rem)" }}
                >
                  You're <b>i</b>n.
                </h3>
                <p
                  className="font-circular-web text-sm"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  We'll email you when registrations open.
                  <br />
                  Stay curious. Keep building.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SponsorTeaser />
    </>
  );
};

export default Contact;
