import { useRef, useState } from "react";
import gsap from "gsap";

const faqs = [
  {
    q: "Who can apply?",
    a: "Any student in Kerala. Developer, designer, aspiring founder. Doesn't matter. If you want to build something real and you're serious about it, apply.",
  },
  {
    q: "How big is the team?",
    a: "1 to 4 people. Solo entries are welcome.",
  },
  {
    q: "Is this in-person?",
    a: "Yes. Fully in-person at SCTCE, Thiruvananthapuram. You have to be in the room. That's the whole point.",
  },
  {
    q: "What are the problem statements?",
    a: "Announced when applications open. Real-world problems with real stakes. Not the kind of thing you can solve with a tutorial.",
  },
  {
    q: "How do you pick teams?",
    a: "We look at your idea and your team. 20 spots. We're looking for people who are already building, not people who want to start someday.",
  },
  {
    q: "What's the prize pool?",
    a: "₹2L+ total*. First place takes ₹1L+. Biggest builder prize in Kerala's student circuit. (*subject to changes)",
  },
  {
    q: "What happens at Demo Day?",
    a: "You present to judges, sponsors, and ecosystem partners. Everyone shows their work. The top teams compete for prizes. Sponsors make offers.",
  },
];

const FAQItem = ({ question, answer, index }) => {
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
      tl.current = gsap.to(body, {
        height: fullHeight,
        opacity: 1,
        duration: 0.4,
        ease: "power3.out",
      });
    } else {
      tl.current = gsap.to(body, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      });
    }

    setOpen((prev) => !prev);
  };

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        borderLeft: open ? "2px solid rgba(200,255,0,0.45)" : "2px solid transparent",
        paddingLeft: "1rem",
        marginLeft: "-1rem",
        transition: "border-color 0.3s ease",
      }}
    >
      <button
        onClick={toggle}
        className="w-full text-left"
        style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "1.5rem 0",
          background: "none", border: "none", cursor: "pointer",
          gap: "1.25rem",
        }}
      >
        <span
          className="font-general"
          style={{
            fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
            color: open ? "#fff" : "rgba(255,255,255,0.65)",
            transition: "color 0.2s",
            lineHeight: 1.4,
          }}
        >
          {question}
        </span>
        <span style={{
          flexShrink: 0, width: "24px", height: "24px",
          borderRadius: "50%",
          border: open ? "1px solid rgba(200,255,0,0.5)" : "1px solid rgba(255,255,255,0.15)",
          background: open ? "rgba(200,255,0,0.08)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "#C8FF00" : "rgba(255,255,255,0.35)",
          fontSize: "1rem", lineHeight: 1,
          transition: "color 0.25s, border-color 0.25s, background 0.25s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}>
          +
        </span>
      </button>

      <div ref={bodyRef} style={{ height: 0, overflow: "hidden", opacity: 0 }}>
        <p
          className="font-general"
          style={{
            fontSize: "0.92rem",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.8,
            paddingBottom: "1.5rem",
            maxWidth: "680px",
          }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ = () => (
  <section
    id="faq"
    className="w-screen"
    style={{ background: "#000000", padding: "6rem 0" }}
  >
    <div className="container mx-auto px-5 md:px-10">
      <div className="mb-12">
        <p
          className="font-general text-xs uppercase tracking-widest mb-3"
          style={{ color: "#C8FF00", letterSpacing: "0.15em" }}
        >
          FAQ
        </p>
        <h2
          className="bento-title"
          style={{ color: "#fff", fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "-0.02em" }}
        >
          Got questions?
        </h2>
      </div>

      <div style={{ maxWidth: "760px" }}>
        {faqs.map((faq, i) => (
          <FAQItem key={i} index={i} question={faq.q} answer={faq.a} />
        ))}
      </div>
    </div>
  </section>
);

export default FAQ;
