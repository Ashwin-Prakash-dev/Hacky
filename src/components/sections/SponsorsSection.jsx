import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SPONSORS = [
  {
    name: "VoiceStack",
    href: "https://voicestack.com?utm_source=startathon",
    src: "/img/sponsors/voicestack.png",
    h: 40,
    blurb: "AI phone systems that capture every missed call for healthcare practices.",
  },
  {
    name: "CareStack",
    href: "https://carestack.com?utm_source=startathon",
    src: "/img/sponsors/carestack-white.png",
    h: 34,
    blurb: "Cloud-based practice management software for dental teams.",
  },
  {
    name: "CareRevenue",
    href: "https://carerevenue.com?utm_source=startathon",
    src: "/img/sponsors/carerevenue-white.png",
    h: 34,
    blurb: "Dental revenue cycle management — billing, claims, and collections.",
  },
];

const SponsorCard = ({ sponsor }) => (
  <a
    href={sponsor.href}
    target="_blank"
    rel="noopener noreferrer"
    className="sponsor-card group relative block max-w-[340px] flex-[1_1_260px] rounded-3xl bg-white/[0.03] p-1.5 no-underline shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[box-shadow,transform] duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_rgba(200,255,0,0.45),0_24px_60px_rgba(0,0,0,0.5),0_8px_42px_rgba(200,255,0,0.18)]"
    data-lens-label={sponsor.name}
  >
    {/* inner core — hover floods the core lime, the same inverted world the
        hero's liquid blob reveals */}
    <div className="flex h-full flex-col items-start gap-[1.1rem] rounded-[calc(1.5rem-0.375rem)] bg-[#0b0b0b] p-[1.9rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.04)] transition-[background,box-shadow] duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-lime group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]">
      <img
        src={sponsor.src}
        alt={sponsor.name}
        style={{ height: `${sponsor.h}px` }}
        // invert + hue-rotate(180) flips white to ink on the lime flood
        // while roughly restoring the original hue on chromatic pixels
        // (hue-rotate is a no-op on white/black, so it only cancels out
        // invert's hue-flip on colors like VoiceStack's violet mark) —
        // one filter that works for both plain-white and full-color logos
        className="w-auto object-contain transition-[transform,filter] duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-[-3px] group-hover:scale-[1.04] group-hover:hue-rotate-180 group-hover:invert"
      />
      <p className="font-general text-[0.88rem] leading-[1.7] text-white/70 transition-colors duration-[450ms] group-hover:text-[rgba(5,5,5,0.8)]">
        {sponsor.blurb}
      </p>
      <span className="mt-auto inline-flex items-center gap-[0.6em] font-general text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white/45 transition-colors duration-[450ms] group-hover:text-[#050505]">
        Visit site
        <span
          aria-hidden="true"
          className="inline-flex size-6 items-center justify-center rounded-full bg-white/[0.06] transition-[background,transform] duration-[450ms] group-hover:-translate-y-px group-hover:translate-x-px group-hover:bg-[rgba(0,0,0,0.14)]"
        >
          <ArrowUpRight size={13} strokeWidth={2.25} />
        </span>
      </span>
    </div>
  </a>
);

const SponsorsSection = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".sponsor-card",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-lens="sponsors"
      className="relative w-full bg-[#050505]"
    >
      {/* lime ambience: a faint glow pooling behind the card group */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_62%,rgba(200,255,0,0.07),transparent_70%)]"
      />
      <div className="h-px bg-white/[0.06]" />

      <div className="container mx-auto px-[clamp(1.25rem,4vw,2.5rem)] py-[clamp(6rem,10vw,8rem)]">
        <div ref={headerRef} className="mb-14 text-center">
          <span className="eyebrow mb-[1.1rem]">
            Our Sponsors
          </span>
          <h2 className="bento-title special-font text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-white">
            Companies b<b>a</b>cking Startathon
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {SPONSORS.map((s) => (
            <SponsorCard key={s.name} sponsor={s} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
