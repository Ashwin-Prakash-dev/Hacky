import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import "./VideoCards.css";

gsap.registerPlugin(ScrollTrigger);

/* ── Bento tilt wrapper ─────────────────────────────────────────────────── */
export const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!itemRef.current) return;
    const { left, top, width, height } = itemRef.current.getBoundingClientRect();
    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;
    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;
    setTransformStyle(
      `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.98, .98, .98)`
    );
  };

  const handleMouseLeave = () => setTransformStyle("");

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {children}
    </div>
  );
};

const CARDS = [
  {
    title: <>ANTHR<b>O</b>PIC</>,
    label: "BUILDER",
    category: "A few people who believed AI should be built carefully. Now they're shaping the whole industry.",
    src: "/videos/feature-1.webm",
  },
  {
    title: <>SP<b>A</b>CEX</>,
    label: "BUILDER",
    category: "Everyone said private rockets were impossible. They just started building anyway.",
    src: "/videos/feature-2.webm",
  },
  {
    title: <>PAL<b>A</b>NTIR</>,
    label: "BUILDER",
    category: "Boring data infrastructure. Until governments couldn't run without it.",
    src: "/videos/feature-3.webm",
  },
  {
    title: <>OP<b>E</b>NAI</>,
    label: "BUILDER",
    category: "Started in a room with a research paper. Changed what a billion people think is possible.",
    src: "/videos/feature-4.webm",
  },
  {
    title: <><b>A</b>NDURIL</>,
    label: "BUILDER",
    category: "Defense tech hadn't changed in decades. They walked in like it was a startup.",
    src: "/videos/feature-5.webm",
  },
];

/* ── VideoCard ────────────────────────────────────────────────────────────── */
const VideoCard = ({ src, title, label, category }) => {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className="group relative size-full overflow-hidden"
      onMouseMove={(e) => {
        const r = cardRef.current?.getBoundingClientRect();
        if (r) setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      {/* Video background */}
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 size-full object-cover object-center transition-transform duration-[950ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform group-hover:scale-105"
      />

      {/* Base cinematic veil */}
      <div className="absolute inset-0 bg-black/[0.32] transition-colors duration-[550ms] group-hover:bg-black/[0.22]" />

      {/* Bottom gradient — text readability */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.84)_0%,rgba(0,0,0,0.22)_55%,transparent_100%)] transition-[background] duration-[550ms] group-hover:bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.42)_45%,rgba(0,0,0,0.08)_100%)]" />

      {/* Top gradient — label legibility */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,transparent_38%)]" />

      {/* Cursor-reactive lime glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100"
        style={{ background: `radial-gradient(260px circle at ${cursor.x}px ${cursor.y}px, rgba(200,255,0,0.09), transparent 68%)` }}
      />

      {/* Inner border — lime tint on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_0.75px_rgba(255,255,255,0.07)] transition-shadow duration-500 group-hover:shadow-[inset_0_0_0_0.75px_rgba(200,255,0,0.22),inset_0_0_50px_rgba(200,255,0,0.04)]" />

      {/* Content layer */}
      <div className="relative z-10 flex h-full flex-col justify-between p-[clamp(1.1rem,2.4vw,1.9rem)]">
        {/* Top: label + arrow */}
        <div className="flex items-start justify-between">
          <span className="rounded-full border border-white/[0.14] bg-black/[0.22] px-3 py-1 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-white/75 transition-colors duration-[400ms] [backdrop-filter:blur(6px)] group-hover:border-lime/[0.42] group-hover:text-lime">
            {label}
          </span>

          <span className="inline-flex translate-x-[-5px] translate-y-[5px] font-mono text-[0.82rem] leading-none text-lime opacity-0 transition-[opacity,transform] delay-[60ms] duration-[380ms] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={13} strokeWidth={2.25} />
          </span>
        </div>

        {/* Bottom: category + title */}
        <div>
          <p className="mb-2 translate-y-[6px] font-general text-[0.78rem] uppercase tracking-[0.14em] text-white/[0.72] opacity-0 transition-[opacity,transform] delay-[70ms] duration-[350ms] group-hover:translate-y-0 group-hover:opacity-100">
            {category}
          </p>

          <h2 className="bento-title special-font text-[clamp(1.9rem,4.8vw,4.4rem)] leading-[0.9] tracking-[-0.01em] text-white transition-[text-shadow] duration-500 [text-shadow:0_2px_22px_rgba(0,0,0,0.7)] group-hover:[text-shadow:0_2px_32px_rgba(0,0,0,0.9),0_0_55px_rgba(200,255,0,0.13)]">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
};

/* ── VideoCards Section ───────────────────────────────────────────────────── */
const VideoCards = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useGSAP(
    () => {
      // Header reveal
      const headerEls = headerRef.current?.querySelectorAll(".vc-reveal");
      if (headerEls?.length) {
        gsap.fromTo(
          headerEls,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.88,
            stagger: 0.13,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Card wrappers — staggered entrance
      const cards = sectionRef.current?.querySelectorAll(".vc-card-wrap");
      if (cards?.length) {
        gsap.set(cards, { opacity: 0, y: 36 });
        cards.forEach((card) => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.78,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        });
      }
    },
    { scope: sectionRef }
  );

  const GAP = "clamp(0.55rem, 1.1vw, 0.95rem)";

  return (
    <section
      ref={sectionRef}
      id="showcase"
      data-lens="showcase"
      className="bg-[#050505] pb-0"
    >
      <div className="container mx-auto px-3 md:px-10">

        {/* ── Section Header ───────────────────────────────── */}
        <div
          ref={headerRef}
          className="relative px-5 pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(5rem,10vw,8rem)]"
        >
          <span className="vc-reveal eyebrow mb-[1.4rem] opacity-0">
            Our inspiration
          </span>

          <h2 className="vc-reveal special-font mb-6 max-w-[18ch] font-display text-[clamp(2.4rem,6vw,5.2rem)] font-normal leading-[0.95] tracking-[-0.02em] text-white opacity-0">
            We took notes from the <b>b</b>uilders who ch<b>a</b>nged everything
          </h2>

          <p className="vc-reveal max-w-[31rem] font-general text-base leading-[1.78] text-white/[0.82] opacity-0">
            We drew inspiration from the builders behind companies like these
            and the startup ecosystem they created. Startathon exists to find
            the next ones.
          </p>
        </div>

        {/* ── Desktop bento grid ───────────────────────────── */}
        <div className="vc-desktop-grid relative">
          {/* Hero Card: ANTHROPIC (full width) */}
          <div
            className="vc-card-wrap h-[clamp(300px,58vh,660px)]"
            style={{ marginBottom: GAP }}
          >
            <BentoTilt className="h-full overflow-hidden rounded-2xl transition-transform duration-300 ease-out">
              <VideoCard {...CARDS[0]} />
            </BentoTilt>
          </div>

          {/* 2-col grid: SPACEX (tall) + PALANTIR / OPENAI */}
          <div className="vc-grid" style={{ gap: GAP, marginBottom: GAP }}>
            <div className="vc-card-wrap vc-spacex">
              <BentoTilt className="h-full overflow-hidden rounded-2xl transition-transform duration-300 ease-out">
                <VideoCard {...CARDS[1]} />
              </BentoTilt>
            </div>
            <div className="vc-card-wrap h-[clamp(220px,34vh,360px)]">
              <BentoTilt className="h-full overflow-hidden rounded-2xl transition-transform duration-300 ease-out">
                <VideoCard {...CARDS[2]} />
              </BentoTilt>
            </div>
            <div className="vc-card-wrap h-[clamp(220px,34vh,360px)]">
              <BentoTilt className="h-full overflow-hidden rounded-2xl transition-transform duration-300 ease-out">
                <VideoCard {...CARDS[3]} />
              </BentoTilt>
            </div>
          </div>

          {/* ANDURIL — full width footer card */}
          <div className="vc-card-wrap h-[clamp(220px,38vh,400px)]">
            <BentoTilt className="h-full overflow-hidden rounded-2xl transition-transform duration-300 ease-out">
              <VideoCard {...CARDS[4]} />
            </BentoTilt>
          </div>
        </div>

        {/* ── Mobile carousel (single swipeable tile) ──────── */}
        <div className="vc-mobile-carousel">
          <div className="vc-carousel-track">
            {CARDS.map((card) => (
              <div key={card.src} className="vc-carousel-slide">
                <VideoCard {...card} />
              </div>
            ))}
          </div>
          {/* Scroll hint */}
          <p className="mt-3 text-center font-general text-xs uppercase tracking-[0.14em] text-white/60">
            swipe to explore
          </p>
        </div>

        {/* ── Hackathon intro — bridge into stats ──────────── */}
        <div
          id="what-is-it"
          className="vc-card-wrap relative grid grid-cols-1 items-end gap-[clamp(2rem,6vw,6rem)] px-5 pb-[clamp(2rem,4vw,3rem)] pt-[clamp(5rem,10vw,8rem)] md:grid-cols-2"
        >
          {/* Left: heading */}
          <div>
            <span className="eyebrow mb-6">
              What is it actually?
            </span>
            <h2 className="special-font font-display text-[clamp(2.2rem,5vw,4.4rem)] font-normal leading-[0.95] tracking-[-0.02em] text-white">
              What <b>is</b><br />
              <span className="text-lime">Start<b>a</b>thon?</span>
            </h2>
          </div>

          {/* Right: body */}
          <div className="self-end border-l border-lime/25 pb-[0.2rem] pl-[clamp(1.25rem,2.5vw,2rem)]">
            <p className="font-general text-[clamp(0.95rem,1.3vw,1.05rem)] leading-[1.9] text-white/[0.82]">
              Startathon is Kerala&apos;s most curated builder hackathon. We don&apos;t take
              everyone. We pick 20 teams, pair them with expert mentors from day one,
              and give them 30 hours to ship working software. No pitch decks.
              No half-built prototypes. Real products only.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default VideoCards;
