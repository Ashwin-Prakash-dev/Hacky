import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DOMAINS } from "../../lib/domains";

gsap.registerPlugin(ScrollTrigger);

// Homepage teaser for /domains. The site never said what you'd actually
// build here — this names the four opportunity areas and hands off.
const Domains = () => {
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        },
      );

      rowRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            delay: i * 0.07,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="domains"
      data-lens="domains"
      className="w-full bg-[#050505] py-[clamp(4rem,10vw,7rem)]"
    >
      <div className="container mx-auto px-5 md:px-10">
        <div ref={headRef} className="mb-14 max-w-[60ch] opacity-0">
          <span className="eyebrow mb-[1.4rem]">What you&apos;ll build</span>
          <h2 className="special-font bento-title mb-6 text-[clamp(2.2rem,5.5vw,4rem)] leading-none tracking-[-0.03em] text-white">
            Four doma<b>i</b>ns.
            <br />
            Bring the problem<b>.</b>
          </h2>
          <p className="font-general text-base leading-[1.8] text-white/[0.78]">
            No fixed problem statements. Pick the domain your problem lives in, then prove you
            understand the people it affects. Solutions don&apos;t have to use AI — choose the
            technology from the problem.
          </p>
        </div>

        <div className="border-t border-white/[0.06]">
          {DOMAINS.map((d, i) => (
            <Link
              key={d.slug}
              ref={(el) => (rowRefs.current[i] = el)}
              to={`/domains/${d.slug}`}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-[clamp(1.25rem,3vw,3rem)] border-b border-white/[0.06] py-[clamp(1.5rem,3vw,2rem)] no-underline opacity-0 transition-colors duration-300 hover:bg-lime/[0.018] sm:grid-cols-[3.5rem_1fr_1.5fr_auto]"
            >
              <span className="select-none font-display text-[clamp(2rem,3.5vw,2.8rem)] font-normal leading-none tracking-[-0.03em] text-lime/[0.14] transition-colors duration-300 group-hover:text-lime/40">
                {d.num}
              </span>

              <h3 className="font-general text-[clamp(1.05rem,2vw,1.35rem)] font-extrabold leading-[1.2] tracking-[-0.02em] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-2">
                {d.short}
              </h3>

              <p className="col-span-2 col-start-2 pt-2 font-general text-[0.9rem] leading-[1.7] text-white/60 transition-colors duration-[0.4s] group-hover:text-white/85 sm:col-span-1 sm:col-start-3 sm:pt-0">
                {d.compare.outcome}
              </p>

              <span
                aria-hidden="true"
                className="col-start-3 row-start-1 text-white/25 transition-[color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:text-lime sm:col-start-4"
              >
                <ArrowUpRight size={18} strokeWidth={1.75} />
              </span>
            </Link>
          ))}
        </div>

        <Link to="/domains" className="cta-pill cta-pill--ghost group mt-12">
          Compare the domains
          <span className="cta-pill-icon" aria-hidden="true">
            <ArrowUpRight size={15} strokeWidth={2.25} />
          </span>
        </Link>
      </div>
    </section>
  );
};

export default Domains;
