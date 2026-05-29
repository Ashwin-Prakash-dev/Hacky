import { useRef, useState } from "react";
import gsap from "gsap";

const faqs = [
  {
    q: "Who can participate?",
    a: "Startathon is open to students from engineering colleges across Kerala. We welcome developers, designers, and aspiring founders — anyone who wants to build something real.",
  },
  {
    q: "Do I need a full team to register?",
    a: "You can register individually or as a partial team. Teams can have up to 4 members. We'll help with team formation during the pre-event phase if needed.",
  },
  {
    q: "Is it in-person or online?",
    a: "Startathon is a fully in-person event at SCTCE, Thiruvananthapuram. We believe the energy of building in a room with other ambitious people is irreplaceable.",
  },
  {
    q: "What are the problem statements?",
    a: "Problem tracks will be announced closer to the event. Expect open-ended, real-world challenges — not toy problems. Some tracks may be sponsored by partner companies.",
  },
  {
    q: "How are teams selected?",
    a: "We curate for ambition and execution potential — not just GPA or college name. The ₹100 idea submission fee is designed to filter for serious teams. Selection is based on your idea brief and team profile.",
  },
  {
    q: "What do the participation fees cover?",
    a: "The ₹750 early bird / ₹1200 regular fee covers food, materials, and hospitality for the full 30-hour event. The ₹100 idea registration is a separate, earlier step to submit your concept.",
  },
  {
    q: "What happens at Demo Day?",
    a: "The top 5–8 teams (selected through two mid-event evaluations) pitch their products to judges, sponsors, and ecosystem partners. All teams get to showcase; top teams compete for prizes.",
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
          className="font-circular-web"
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
          className="font-circular-web"
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
          className="special-font bento-title"
          style={{ color: "#fff", fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "-0.03em" }}
        >
          Got qu<b>e</b>stions?
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
