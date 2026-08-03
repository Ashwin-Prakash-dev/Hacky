import { useRef, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const outcomes = [
  {
    num: "01",
    tag: "Career",
    headline: "Be seen before anyone else.",
    body: "Companies at the event watch you build for 30 hours. If something clicks, that's a conversation that doesn't happen anywhere else.",
  },
  {
    num: "02",
    tag: "Access",
    headline: "Talk to people who've done it.",
    body: "Founders, CTOs, operators. Not a keynote from 50 rows back. They're in the room, and you can walk up and talk to them.",
  },
  {
    num: "03",
    tag: "Network",
    headline: "Stand out to the right people.",
    body: "The people in this room remember who impressed them. That's not something a CV can do.",
  },
];

const StudentHook = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        },
      );

      rowRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
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
      data-lens="builders"
      className="w-full bg-[#050505] pb-0 pt-28"
    >
      <div className="container mx-auto px-5 md:px-10">
        {/* Headline + video side by side */}
        <div
          ref={headlineRef}
          className="relative mb-20 flex flex-wrap items-start gap-[clamp(2rem,5vw,4rem)] opacity-0"
        >
          {/* Left: text */}
          <div className="flex-[1_1_300px]">
            <span className="eyebrow mb-[1.4rem]">
              you&apos;re next
            </span>

            <h2 className="special-font bento-title mb-6 text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.95] tracking-[-0.03em] text-white">
              Still <b>i</b>n college.
              <br />
              Already <b>b</b>uilding<b>.</b>
            </h2>

            <p className="mb-8 font-general text-base leading-[1.8] text-white/[0.82]">
              Every person behind those companies was a student once. They just
              didn&apos;t stop building. Startathon is how we find those people in
              Kerala. If that&apos;s you, you should be here.
            </p>
            <p className="mb-6 font-general text-[clamp(0.95rem,1.4vw,1.05rem)] leading-[1.75] text-white/75">
              If you&apos;re a builder and you resonated with that, there&apos;s no reason
              you shouldn&apos;t apply. Read the four problem domains first — walk in
              knowing what you want to build.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/apply" className="cta-pill group">
                <span className="relative inline-flex overflow-hidden">
                  <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
                    Apply Now
                  </span>
                  <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
                    Apply Now
                  </span>
                </span>
                <span className="cta-pill-icon" aria-hidden="true">
                  <ArrowUpRight size={15} strokeWidth={2.25} />
                </span>
              </Link>
              <Link to="/domains" className="cta-pill cta-pill--ghost group">
                Choose your domain
                <span className="cta-pill-icon" aria-hidden="true">
                  <ArrowUpRight size={15} strokeWidth={2.25} />
                </span>
              </Link>
            </div>
          </div>

          {/* Right: video */}
          <div className="min-w-0 flex-[1_1_340px]">
            <div className="relative w-full overflow-hidden rounded-[1.25rem] border border-white/[0.08] pb-[56.25%] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <iframe
                src="https://player.vimeo.com/video/1197348906?autoplay=0&title=0&byline=0&portrait=0"
                className="absolute inset-0 size-full border-none"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* ── Outcome rows ─────────────────────────────────────── */}
        <div className="hidden border-t border-white/[0.06]">
          {outcomes.map((item, i) => (
            <OutcomeRow
              key={i}
              item={item}
              ref={(el) => (rowRefs.current[i] = el)}
            />
          ))}
        </div>

        {/* Pull-quote */}
        <div className="mt-16 hidden items-start gap-5 border-t border-white/[0.06] pt-12">
          <div className="mt-[0.2rem] h-10 w-[3px] shrink-0 rounded-sm bg-[linear-gradient(180deg,#C8FF00,transparent)]" />
          <p className="font-general text-[clamp(0.95rem,2vw,1.3rem)] italic leading-[1.6] text-white/85">
            &quot;Kerala has the talent. It&apos;s always had it. We&apos;re just putting it in
            one room and letting it run.&quot;
          </p>
        </div>
      </div>
    </section>
  );
};

/* ── Individual outcome row ──────────────────────────────────────────────── */
const OutcomeRow = forwardRef(({ item }, ref) => (
  <div
    ref={ref}
    className="group grid grid-cols-[2.5rem_1fr] items-center gap-[clamp(1.25rem,3vw,3rem)] border-b border-white/[0.06] bg-transparent py-[clamp(1.5rem,3vw,2.25rem)] opacity-0 transition-[background] duration-300 hover:bg-lime/[0.018] sm:grid-cols-[3.5rem_1fr_1.6fr]"
  >
    {/* Number */}
    <span className="select-none font-display text-[clamp(2.2rem,3.5vw,3rem)] font-normal leading-none tracking-[-0.03em] text-lime/[0.12] transition-colors duration-300 group-hover:text-lime/30">
      {item.num}
    </span>

    {/* Tag + headline */}
    <div className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-2">
      <span className="mb-[0.65rem] inline-block rounded-full border border-white/10 px-[11px] py-1 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-white/65 transition-[color,border-color] duration-300 group-hover:border-lime/30 group-hover:text-lime/85">
        {item.tag}
      </span>
      <h3 className="font-general text-[clamp(1.1rem,2vw,1.45rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-white">
        {item.headline}
      </h3>
    </div>

    {/* Body */}
    <p className="col-span-2 pl-10 pt-2 font-general text-[0.95rem] leading-[1.78] text-white/75 transition-colors duration-[0.4s] group-hover:text-white/[0.92] sm:col-auto sm:pl-0 sm:pt-0">
      {item.body}
    </p>
  </div>
));

OutcomeRow.displayName = "OutcomeRow";

export default StudentHook;
