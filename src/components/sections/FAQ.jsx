import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";

const faqs = [
  {
    q: "Who can apply?",
    a: "Any college student. Developer, designer, aspiring founder. Doesn't matter. If you want to build something real and you're serious about it, apply.",
  },
  {
    q: "How big is the team?",
    a: "3 to 4 people.",
  },
  {
    q: "Is this in-person?",
    a: "Yes. Fully in-person at SCTCE, Thiruvananthapuram. You have to be in the room. That's the whole point.",
  },
  {
    q: "What are the problem statements?",
    a: (
      <>
        There aren&apos;t any — you bring the problem. We publish four domains: preventive
        health, intelligent operations, inclusive access, and digital trust. Pick the one your
        problem lives in.{" "}
        <Link
          to="/domains"
          className="text-lime/90 underline underline-offset-[3px] hover:text-lime"
        >
          Read the four domains
        </Link>
        .
      </>
    ),
  },
  {
    q: "How do you pick teams?",
    a: "We look at your idea and your team. 20 spots. We're looking for people who are already building, not people who want to start someday.",
  },
  {
    q: "What's the prize pool?",
    a: "₹2,00,000 total. First place takes ₹1,00,000, second ₹60,000, third ₹40,000. Biggest builder prize in Kerala's student circuit.",
  },
  {
    q: "What happens at Demo Day?",
    a: "You present to judges, sponsors, and ecosystem partners. Everyone shows their work. The top teams compete for prizes. Companies in the room are there to find builders.",
  },
];

/* ── Mobile accordion item (used below 768px) ─────────────────────────────── */
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef(null);
  const tl = useRef(null);

  const toggle = () => {
    const body = bodyRef.current;
    if (!body) return;
    if (tl.current) tl.current.kill();
    if (!open) {
      gsap.set(body, { height: "auto", opacity: 1 });
      const fullHeight = body.scrollHeight;
      gsap.set(body, { height: 0, opacity: 0 });
      tl.current = gsap.to(body, { height: fullHeight, opacity: 1, duration: 0.4, ease: "power3.out" });
    } else {
      tl.current = gsap.to(body, { height: 0, opacity: 0, duration: 0.3, ease: "power3.in" });
    }
    setOpen((prev) => !prev);
  };

  return (
    <div style={{
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      borderLeft: open ? "2px solid rgba(200,255,0,0.45)" : "2px solid transparent",
      paddingLeft: "1rem", marginLeft: "-1rem",
      transition: "border-color 0.3s ease",
    }}>
      <button onClick={toggle} className="w-full text-left" data-lens-label={question} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.5rem 0", background: "none", border: "none", cursor: "pointer", gap: "1.25rem",
      }}>
        <span className="font-general" style={{
          fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)",
          color: open ? "#fff" : "rgba(255,255,255,0.8)",
          transition: "color 0.2s", lineHeight: 1.4,
        }}>{question}</span>
        <span style={{
          flexShrink: 0, width: "24px", height: "24px", borderRadius: "50%",
          border: open ? "1px solid rgba(200,255,0,0.5)" : "1px solid rgba(255,255,255,0.15)",
          background: open ? "rgba(200,255,0,0.08)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "#C8FF00" : "rgba(255,255,255,0.35)",
          fontSize: "1rem", lineHeight: 1,
          transition: "color 0.25s, border-color 0.25s, background 0.25s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}>+</span>
      </button>
      <div ref={bodyRef} style={{ height: 0, overflow: "hidden", opacity: 0 }}>
        <p className="font-general" style={{
          fontSize: "0.95rem", color: "rgba(255,255,255,0.8)",
          lineHeight: 1.8, paddingBottom: "1.5rem", maxWidth: "680px",
        }}>{answer}</p>
      </div>
    </div>
  );
};

/* ── Main FAQ component ──────────────────────────────────────────────────── */
const FAQ = () => {
  const [selected, setSelected] = useState(0);
  const answerRef = useRef(null);

  const handleSelect = (i) => {
    if (i === selected) return;
    setSelected(i);
  };

  useEffect(() => {
    if (!answerRef.current) return;
    gsap.fromTo(
      answerRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.32, ease: "power3.out" }
    );
  }, [selected]);

  return (
    <section
      id="faq"
      data-lens="faq"
      className="w-screen"
      style={{ background: "#050505", padding: "6rem 0" }}
    >
      <div className="container mx-auto px-5 md:px-10">
        <div style={{ marginBottom: "4rem" }}>
          <span className="eyebrow" style={{ marginBottom: "1.2rem" }}>FAQ</span>
          <h2
            className="bento-title special-font"
            style={{ color: "#fff", fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "-0.02em" }}
          >
            Got quest<b>i</b>ons?
          </h2>
        </div>

        {/* ── Desktop 2-column panel ───────────────────────────── */}
        <div className="faq-desktop" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(2.5rem, 6vw, 5rem)",
          alignItems: "start",
        }}>
          {/* Left: question list */}
          <div>
            {faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className="faq-q"
                data-lens-label={faq.q}
                style={{
                  width: "100%", textAlign: "left",
                  display: "flex", alignItems: "baseline", gap: "1.25rem",
                  padding: "1.25rem 0 1.25rem 1rem",
                  marginLeft: "-1rem",
                  background: "none", outline: "none",
                  borderTop: "none", borderRight: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  borderLeft: selected === i
                    ? "2px solid rgba(200,255,0,0.5)"
                    : "2px solid transparent",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, transform 0.5s cubic-bezier(0.32,0.72,0,1)",
                }}
              >
                <span className="faq-q-num" style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem", fontWeight: 500,
                  color: selected === i ? "rgba(200,255,0,0.8)" : "rgba(255,255,255,0.4)",
                  minWidth: "1.8rem", flexShrink: 0,
                  transition: "color 0.2s",
                  letterSpacing: "0.08em",
                }}>0{i + 1}</span>
                <span className="font-general faq-q-text" style={{
                  fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
                  color: selected === i ? "#fff" : "rgba(255,255,255,0.75)",
                  lineHeight: 1.45,
                  transition: "color 0.2s",
                }}>{faq.q}</span>
              </button>
            ))}
          </div>

          {/* Right: sticky answer panel */}
          <div style={{ position: "sticky", top: "8rem" }}>
            <div ref={answerRef}>
              <p className="font-general" style={{
                fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)",
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.9,
              }}>
                {faqs[selected].a}
              </p>
              <div style={{
                marginTop: "2.5rem", height: "1px",
                background: "linear-gradient(90deg, rgba(200,255,0,0.3), transparent)",
              }} />
            </div>
          </div>
        </div>

        {/* ── Mobile accordion ─────────────────────────────────── */}
        <div className="faq-mobile" style={{ maxWidth: "760px" }}>
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>

      <style>{`
        .faq-desktop { display: grid; }
        .faq-mobile  { display: none; }
        .faq-q:hover { transform: translateX(6px); }
        .faq-q:hover .faq-q-num  { color: rgba(200,255,0,0.85) !important; }
        .faq-q:hover .faq-q-text { color: #fff !important; }
        @media (max-width: 767px) {
          .faq-desktop { display: none !important; }
          .faq-mobile  { display: block !important; }
        }
      `}</style>
    </section>
  );
};

export default FAQ;
