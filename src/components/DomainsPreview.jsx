import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { DOMAINS } from "../lib/domains";
import AmpTitle from "./domains/AmpTitle";

gsap.registerPlugin(ScrollTrigger);

// The home page's route into /domains. Deliberately a comparison list, not
// a card grid — the picker page already owns the card treatment, and here
// the job is to let someone weigh four outcomes against each other in one
// glance and leave. Rows carry `outcome` rather than `hook` so the phrase
// "Choose this if your primary outcome is" doesn't repeat four times.
const DomainsPreview = () => {
  const headRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    const rows = rowRefs.current.filter(Boolean);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        headRef.current,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 84%", toggleActions: "play none none reverse" },
        }
      );
      rows.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            delay: i * 0.07,
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },
          }
        );
      });
    });

    // Without this the rows would stay at their opacity-0 start state.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([headRef.current, ...rows], { opacity: 1, y: 0 });
    });

    return () => mm.revert();
  }, []);

  return (
    <section data-lens="domains" className="w-full bg-[#050505] pt-28">
      <div className="container mx-auto px-5 md:px-10">
        <div
          ref={headRef}
          className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8 opacity-0"
        >
          <div className="max-w-2xl">
            <span className="eyebrow mb-6">Problem domains</span>
            <h2 className="special-font bento-title mb-6 text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[0.95] tracking-[-0.03em] text-white">
              Find a pr<b>o</b>blem worth 30 hours<b>.</b>
            </h2>
            <p className="font-general text-base leading-[1.8] text-white/[0.82]">
              Startathon is problem-first. Four opportunity areas, not fixed problem
              statements. Each brief defines what counts as one problem, who experiences it,
              how judges measure success, and which ideas won&rsquo;t survive. Pick the one
              whose primary outcome matches what you want to improve.
            </p>
          </div>
          <Link to="/domains" className="cta-pill group">
            <span className="relative inline-flex overflow-hidden">
              <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
                Read the briefs
              </span>
              <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
                Read the briefs
              </span>
            </span>
            <span className="cta-pill-icon" aria-hidden="true">
              <ArrowUpRight size={15} strokeWidth={2.25} />
            </span>
          </Link>
        </div>

        <div className="mt-16 border-t border-white/[0.06]">
          {DOMAINS.map((d, i) => {
            const Icon = d.icon;
            return (
              <Link
                key={d.slug}
                to={`/domains/${d.slug}`}
                ref={(el) => (rowRefs.current[i] = el)}
                className="group grid grid-cols-[2.75rem_1fr] items-start gap-x-5 gap-y-3 border-b border-white/[0.06] py-7 no-underline opacity-0 outline-none transition-colors duration-300 focus-visible:bg-lime/[0.05] hover:bg-lime/[0.018] md:grid-cols-[3.25rem_1.05fr_1.35fr] md:items-center md:gap-x-10 md:py-8"
              >
                <span className="flex size-11 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors duration-500 group-hover:border-lime/30 group-hover:text-lime">
                  <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="special-font font-display text-[clamp(1.3rem,2.4vw,1.8rem)] leading-[1.1] tracking-[-0.02em] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-2">
                  <AmpTitle title={d.title} />
                </h3>
                <p className="col-span-2 font-general text-[0.95rem] leading-[1.75] text-white/60 md:col-auto">
                  {d.outcome}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DomainsPreview;
