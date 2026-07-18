import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight, Check, CircleDot, Diamond, Gem, Target } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ──────────────────────────────────────────────────────────────── */

const VALUE_PROPS = [
  { icon: CircleDot, title: "Watch them build",      desc: "30 hours of live execution. You don't read a CV, you watch them solve hard problems in real time. The signal is unambiguous." },
  { icon: Diamond, title: "Kerala's best, one room", desc: "We curate 20 teams from across Kerala. The most ambitious student builders in the state, all in one place." },
  { icon: Target, title: "Access, not ads",       desc: "Every tier is built around proximity to the builders. Walk the floor, sit with teams, make offers on the spot." },
  { icon: Gem, title: "Hire before anyone else", desc: "You see them build before any other company does. Spot offers, PPOs, internships, all made in context." },
];

const TIERS = [
  {
    id: "t1", name: "T1", price: "₹1.5L+", tag: "On-Campus Access",
    slots: null, highlight: true,
    perks: [
      "Access the complete participant resume database and connect directly with any team.",
      "On-spot offers: internships, PPOs, full-time",
      "Embedded as judge or mentor during the sprint",
      "Dedicated stage time with all 20 teams",
      "First look at every builder in the room",
      "Sponsored problem statement + branded prize track",
      "Primary logo on all event materials",
      "Custom social media campaign",
    ],
  },
  {
    id: "t2", name: "T2", price: "₹75K+", tag: "Off-Campus Access",
    slots: null, highlight: false,
    perks: [
      "Curated shortlist with top team intros post-event",
      "Intern / PPO offers through off-campus outreach",
      "Up to 2 mentor slots during the sprint",
      "Structured interview slots arranged post-event",
      "Secondary logo on all event materials",
      "3 social media posts",
    ],
  },
  {
    id: "strategic", name: "Custom", price: "Quote on request", tag: "Bespoke",
    slots: null, highlight: false, bespoke: true,
    cta: "Tell us what you need",
    perks: [
      "Don't fit T1 or T2?",
      "Tell us what you're looking for",
      "We'll scope something that works",
    ],
  },
];

const MARQUEE_ITEMS = [
  "ON-CAMPUS ACCESS", "CURATED TALENT", "SPOT OFFERS", "30 HOURS OF SIGNAL",
  "PPO READY", "INTERN PIPELINE", "ALL KERALA", "2 SLOTS ONLY",
];

/* ─── Animated noise canvas ─────────────────────────────────────────────── */
function GrainOverlay() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame;
    const render = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const { data } = imageData;
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 12; // very faint
      }
      ctx.putImageData(imageData, 0, 0);
      frame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 size-full mix-blend-overlay"
    />
  );
}

/* ─── Infinite marquee strip ────────────────────────────────────────────── */
function MarqueeStrip({ reverse = false }) {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden border-y border-white/[0.06]">
      <div
        className={`flex w-max gap-12 ${
          reverse ? "animate-[marqueeScrollR_22s_linear_infinite]" : "animate-[marqueeScroll_22s_linear_infinite]"
        }`}
      >
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-12 whitespace-nowrap py-[0.85rem] font-general text-[0.72rem] uppercase tracking-[0.22em] text-white/60">
            {t}
            <span className="inline-flex text-lime">
              <Diamond size={9} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Tier card ─────────────────────────────────────────────────────────── */
function TierCard({ tier }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mx", `${x}%`);
    cardRef.current.style.setProperty("--my", `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      className={`sp-tier-card group relative flex flex-col overflow-hidden rounded-[10px] p-8 opacity-0 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 ${
        tier.highlight
          ? "border border-lime/40 bg-[#0f0f0f] hover:shadow-[0_20px_60px_rgba(200,255,0,0.12),0_0_0_1px_rgba(200,255,0,0.5)]"
          : "border border-white/[0.07] bg-[#080808] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight follow effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[10px] bg-[radial-gradient(300px_circle_at_var(--mx,50%)_var(--my,50%),rgba(200,255,0,0.05),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Top gradient line */}
      <div
        className={`absolute inset-x-0 top-0 h-0.5 ${
          tier.highlight
            ? "bg-[linear-gradient(90deg,transparent,#C8FF00,transparent)]"
            : "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)]"
        }`}
      />

      {tier.highlight && (
        <div className="absolute right-[1.1rem] top-[1.1rem] rounded-sm bg-lime px-[9px] py-[3px] font-general text-[0.65rem] uppercase tracking-[0.14em] text-black">
          Full Access
        </div>
      )}

      {/* Price + name */}
      <div className="mb-6">
        <span className="font-general text-[0.72rem] uppercase tracking-[0.14em] text-white/60">{tier.tag}</span>
        <div
          className={`mt-[0.4rem] font-general font-black leading-none ${
            tier.bespoke
              ? "text-[clamp(1.1rem,2.5vw,1.6rem)] italic text-white/70"
              : `text-[clamp(2rem,4vw,3rem)] ${tier.highlight ? "text-lime" : "text-white"}`
          }`}
        >
          {tier.price}
        </div>
        {tier.bespoke && (
          <div className="mt-[0.3rem] font-general text-[0.68rem] uppercase tracking-[0.12em] text-white/55">
            Quoted per engagement
          </div>
        )}
        <div className="mt-[0.3rem] font-general text-[0.85rem] font-semibold text-white/75">{tier.name}</div>
        {tier.slots && (
          <div
            className={`mt-[0.55rem] inline-block rounded-sm border px-[7px] py-0.5 font-general text-[0.68rem] uppercase tracking-[0.12em] ${
              tier.highlight ? "border-lime/25 text-lime" : "border-white/10 text-white/65"
            }`}
          >
            {tier.slots}
          </div>
        )}
      </div>

      {/* Perks */}
      <div className="flex-1">
        {tier.perks.map((p) => (
          <div key={p} className="flex items-start gap-[10px] border-b-[0.5px] border-white/[0.04] py-[0.45rem]">
            <span className="mt-0.5 shrink-0 text-lime">
              <Check size={13} strokeWidth={3} />
            </span>
            <span className="font-general text-[0.82rem] leading-relaxed text-white/80">{p}</span>
          </div>
        ))}
      </div>

      <a href="#sponsor-contact" className="mt-6 no-underline">
        <button
          className={`w-full rounded-[5px] border py-3 font-general text-[0.75rem] font-bold uppercase tracking-[0.12em] transition-[background,color,border-color] duration-200 ${
            tier.highlight
              ? "border-none bg-lime text-black hover:opacity-85"
              : "border-white/10 bg-transparent text-white/80 hover:border-lime/40 hover:text-lime"
          }`}
        >
          <span className="inline-flex items-center gap-[0.4rem]">
            {tier.cta || "Get in touch"} <ArrowRight size={13} />
          </span>
        </button>
      </a>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
const Sponsors = () => {
  const navigate = useNavigate();
  const pageRef   = useRef(null);
  const heroRef   = useRef(null);
  const valRef    = useRef(null);
  const tiersRef  = useRef(null);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(".sp-hero-line",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(".sp-hero-sub",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.5 }
      );
      gsap.fromTo(".sp-hero-stat",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.7 }
      );

      // Value props
      gsap.fromTo(".sp-val-card",
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: valRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        }
      );

      // Tier cards
      gsap.fromTo(".sp-tier-card",
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.65, stagger: 0.13, ease: "power3.out",
          scrollTrigger: { trigger: tiersRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        }
      );

      // Table rows
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="relative min-h-screen bg-black">
      <GrainOverlay />

      {/* ── Back nav ──────────────────────────────────────────────────── */}
      <div className="fixed left-6 top-6 z-[100] flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded-[50px] border border-white/10 bg-black/60 px-4 py-2 font-general text-[0.75rem] uppercase tracking-widest text-white/80 backdrop-blur-md transition-[color,border-color] duration-200 hover:border-lime/35 hover:text-lime"
        >
          <ArrowLeft size={13} /> Startathon
        </button>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative flex min-h-screen flex-col items-center justify-center px-[clamp(1.5rem,6vw,5rem)] pb-20 pt-32 text-center"
      >
        {/* Radial glow behind text */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[min(700px,90vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(200,255,0,0.07)_0%,transparent_70%)]" />

        <span className="sp-hero-sub mb-10 inline-block rounded-sm border-[0.5px] border-lime/25 bg-lime/[0.08] px-[14px] py-1 font-general text-[0.72rem] uppercase tracking-[0.22em] text-lime opacity-0">
          Sponsor Startathon 2026
        </span>

        <div className="relative">
          {["Backing", "the Builders."].map((line, i) => (
            <div
              key={i}
              className="sp-hero-line font-general text-[clamp(4rem,12vw,10rem)] font-black leading-[0.9] tracking-[-0.03em] text-white opacity-0"
            >
              {i === 1
                ? <><span className="text-lime">the </span>Builders.</>
                : line
              }
            </div>
          ))}
        </div>

        <p className="sp-hero-sub mt-8 max-w-[520px] font-general text-[clamp(0.9rem,1.3vw,1.02rem)] leading-[1.85] text-white/80 opacity-0">
          The best student builders from across Kerala, in one room, building for 30 hours straight.
          You get direct access to them. Watch them work, talk to them, hire them on the spot.
        </p>
        <p className="mx-auto mt-[0.9rem] max-w-[520px] font-general text-[clamp(0.82rem,1.4vw,0.92rem)] leading-[1.65] text-white/65">
          Limited slots per tier. The closer you want to be, the sooner you should reach out.
        </p>

        {/* Stat pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {[["20", "Curated teams"], ["30 HRS", "Build sprint"], ["₹2L+", "Prize pool"], ["All Kerala", "Reach"]].map(([n, l]) => (
            <div key={l} className="sp-hero-stat flex items-center gap-2 rounded-[50px] border border-white/[0.08] bg-white/[0.04] px-5 py-2 opacity-0">
              <span className="font-general text-base font-black text-lime">{n}</span>
              <span className="font-general text-[0.72rem] uppercase tracking-widest text-white/70">{l}</span>
            </div>
          ))}
        </div>

        {/* Scroll cue — hidden on mobile to avoid overlap */}
        <div className="sp-scroll-cue absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-[6px] sm:flex">
          <span className="font-general text-[0.68rem] uppercase tracking-[0.14em] text-white/55">Scroll</span>
          <div className="h-9 w-px animate-[scrollPulse_2s_ease-in-out_infinite] bg-[linear-gradient(to_bottom,rgba(200,255,0,0.4),transparent)]" />
        </div>
      </div>

      {/* ── Marquee strip ─────────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── Page body ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1140px] px-[clamp(1.5rem,5vw,3.5rem)] py-24">

        {/* Value props */}
        <div ref={valRef} className="mb-24">
          <p className="mb-8 font-general text-[0.72rem] uppercase tracking-[0.18em] text-white/65">Why sponsor</p>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-white/[0.06] bg-white/[0.06] min-[601px]:grid-cols-[repeat(auto-fit,minmax(230px,1fr))]">
            {VALUE_PROPS.map((v) => (
              <div
                key={v.title}
                className="sp-val-card bg-[#0a0a0a] p-8 opacity-0 transition-colors duration-200 hover:bg-[#0f0f0f]"
              >
                <v.icon size={19} strokeWidth={1.75} className="mb-[1.1rem] block text-lime" />
                <h3 className="mb-[0.6rem] font-general text-[0.8rem] font-bold tracking-[0.01em] text-white">{v.title}</h3>
                <p className="font-general text-[0.85rem] leading-[1.75] text-white/[0.72]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tier cards */}
        <div ref={tiersRef} className="mb-24">
          <p className="mb-8 font-general text-[0.72rem] uppercase tracking-[0.18em] text-white/65">Sponsorship tiers</p>
          <div className="grid grid-cols-1 gap-[1.1rem] min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
            {TIERS.map((t) => <TierCard key={t.id} tier={t} />)}
          </div>
        </div>

        {/* CTA */}
        <div
          id="sponsor-contact"
          className="sp-cta-box relative overflow-hidden rounded-xl border border-white/[0.08] bg-[linear-gradient(135deg,#0d0d0d_0%,#111_100%)] px-5 py-10 text-center min-[601px]:px-12 min-[601px]:py-16"
        >
          {/* Lime glow */}
          <div className="pointer-events-none absolute left-1/2 top-[-80px] h-[300px] w-[400px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(200,255,0,0.09)_0%,transparent_70%)]" />
          {/* Top + bottom accent lines */}
          <div className="absolute inset-x-[15%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(200,255,0,0.35),transparent)]" />
          <div className="absolute inset-x-[15%] bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(200,255,0,0.15),transparent)]" />

          <p className="mb-4 font-general text-[0.72rem] uppercase tracking-[0.2em] text-lime">Get in the room</p>

          <h2 className="special-font bento-title mb-5 text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[-0.03em] text-white">
            Meet Kerala&apos;s<br />best <b>b</b>uilders.
          </h2>

          <p className="mx-auto mb-10 max-w-[420px] font-general text-[0.9rem] leading-[1.75] text-white/75">
            This is the densest concentration of top student builder talent in Kerala.
            Reach out and we&apos;ll get you in.
          </p>

          <div className="sp-cta-btns flex flex-col items-stretch justify-center gap-4 min-[601px]:flex-row min-[601px]:flex-wrap min-[601px]:items-center">
            <a
              href="mailto:hello@sctcoding.club?subject=Sponsorship%20Inquiry%20-%20Startathon%202026"
              className="w-full no-underline min-[601px]:w-auto"
            >
              <button className="w-full rounded-[5px] border-none bg-lime px-10 py-[0.9rem] font-general text-[0.78rem] font-bold uppercase tracking-[0.12em] text-black transition-opacity duration-200 hover:opacity-85 min-[601px]:w-auto">
                <span className="inline-flex items-center gap-[0.4rem]">
                  Email us <ArrowRight size={13} />
                </span>
              </button>
            </a>
            <a href="tel:+917909190948" className="w-full no-underline min-[601px]:w-auto">
              <button className="w-full rounded-[5px] border border-white/[0.12] bg-transparent px-10 py-[0.9rem] font-general text-[0.78rem] font-bold uppercase tracking-[0.12em] text-white/80 transition-[border-color,color] duration-200 hover:border-lime/40 hover:text-lime min-[601px]:w-auto">
                +91 79091 90948
              </button>
            </a>
          </div>

          <p className="mt-8 font-general text-[0.75rem] tracking-[0.04em] text-white/55">
            Organized by Coding Club · SCTCE · Thiruvananthapuram
          </p>
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marqueeScrollR { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @keyframes scrollPulse    { 0%,100% { opacity: 0.6; } 50% { opacity: 0.15; } }
      `}</style>
    </div>
  );
};

export default Sponsors;
