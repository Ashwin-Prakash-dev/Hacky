import { useRef, useState } from "react";
import gsap from "gsap";

const faqs = [
  {
    q: "Who can participate?",
    a: "Startathon is open to students from any college across Kerala. Developer, designer, aspiring founder. If you want to build something real, you're welcome here.",
  },
  {
    q: "What is the team size?",
    a: "Teams must have 3 to 4 members. Solo entries aren't accepted. Collaboration is core to what we're building here.",
  },
  {
    q: "Is it in-person or online?",
    a: "Fully in-person at SCTCE, Thiruvananthapuram. The energy of building in a room with other ambitious people is hard to replicate online.",
  },
  {
    q: "What are the problem statements?",
    a: "Problem tracks will be announced when applications open. Expect open-ended, real-world challenges. Not toy problems.",
  },
  {
    q: "How are teams selected?",
    a: "We pick 20 teams based on ambition and execution potential. Your idea brief and team profile are what matter.",
  },
  {
    q: "What are the prizes?",
    a: "The prize pool is ₹2L+*. First place takes ₹1L+, the biggest builder prize in Kerala's student hackathon circuit. Remaining prizes are announced closer to the event. (*subject to changes)",
  },
  {
    q: "What happens at Demo Day?",
    a: "Shortlisted teams pitch their products to judges and ecosystem partners. Everyone gets to showcase. Top teams compete for prizes.",
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
