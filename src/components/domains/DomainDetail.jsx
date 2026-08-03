import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowLeft, ArrowUpRight, BookOpen, FileDown, X } from "lucide-react";
import AmpTitle from "./AmpTitle";

gsap.registerPlugin(ScrollTrigger);

// Section headings share one type treatment and one id scheme, so every
// <section> below can name itself with aria-labelledby. `reveal` is off when
// the caller already wraps the head in its own [data-reveal] block.
const SectionHead = ({ id, title, sub, reveal = true }) => (
  <div data-reveal={reveal ? "" : undefined}>
    <h2
      id={id}
      className="max-w-[24ch] text-balance font-display text-[clamp(1.9rem,4vw,2.9rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white"
    >
      {title}
    </h2>
    {sub && (
      <p className="mt-3 max-w-[38rem] font-general text-[0.95rem] leading-[1.75] text-white/60">
        {sub}
      </p>
    )}
  </div>
);

// The long-form brief a card expands into. The hero panel carries the same
// data-flip-id as its card so the page can morph one into the other; the
// [data-hero-fade] elements are what the expand timeline crossfades in.
// Scroll reveals only mount once the page has settled into normal flow.
const DomainDetail = ({ domain, settled, heroPanelRef, onBack }) => {
  const rootRef = useRef(null);
  const Icon = domain.icon;
  const hasLinks = Boolean(domain.links?.guide || domain.links?.pdf);

  useEffect(() => {
    if (!settled) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      rootRef.current?.querySelectorAll("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });
    ScrollTrigger.refresh();
    return () => mm.revert();
  }, [settled, domain.slug]);

  return (
    <article ref={rootRef} aria-labelledby="domain-title">
      {/* ── Hero: the expanded card ─────────────────────────────────────── */}
      <div className="flex min-h-dvh flex-col px-3 pb-3 pt-24 md:px-4 md:pb-4 md:pt-28">
        <div
          ref={heroPanelRef}
          data-flip-id={`domain-${domain.slug}`}
          tabIndex={-1}
          className="relative flex w-full flex-1 flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0b0b] p-6 outline-none sm:p-8 md:p-12"
        >
          <div className="pointer-events-none absolute -right-32 -top-40 size-[30rem] rounded-full bg-lime/[0.04] blur-3xl" />

          <div data-hero-fade className="relative flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[0.66rem] uppercase tracking-[0.22em] text-white/60 outline-none transition-colors duration-300 focus-visible:border-lime/50 focus-visible:ring-2 focus-visible:ring-lime/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b] hover:border-white/25 hover:text-white"
            >
              <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
              All domains
            </button>
            <span className="flex size-12 items-center justify-center rounded-full border border-lime/20 bg-lime/[0.06] text-lime md:size-14">
              <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
            </span>
          </div>

          <div className="relative">
            <p data-hero-fade className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-lime/80">
              Domain brief
            </p>
            <h1
              id="domain-title"
              data-hero-fade
              className="special-font mt-4 max-w-[16ch] text-balance font-display text-[clamp(2.4rem,6.5vw,5.5rem)] leading-[0.98] tracking-[-0.02em] text-white"
            >
              <AmpTitle title={domain.title} />
            </h1>
            <p
              data-hero-fade
              className="mt-5 max-w-[40rem] font-general text-base leading-[1.8] text-white/75 md:text-lg"
            >
              {domain.hook}
            </p>
            <p
              data-hero-fade
              className="mt-10 flex items-center gap-2.5 font-mono text-[0.66rem] uppercase tracking-[0.22em] text-white/60"
            >
              <ArrowDown size={12} strokeWidth={2} aria-hidden="true" className="motion-safe:animate-pulse" />
              Scroll for the brief
            </p>
          </div>
        </div>
      </div>

      {/* ── Lead ────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-5 pt-24 md:px-10 md:pt-32">
        <div data-reveal className="max-w-[46rem]">
          <p className="font-general text-[1.05rem] leading-[1.8] text-white/85 md:text-[1.15rem]">
            {domain.intro[0]}
          </p>
          <p className="mt-5 font-general text-[0.95rem] leading-[1.75] text-white/70">
            {domain.intro[1]}
          </p>
        </div>
      </section>

      {/* ── Who you're building for ─────────────────────────────────────── */}
      <section
        aria-labelledby="domain-audiences"
        className="container mx-auto px-5 pt-24 md:px-10 md:pt-32"
      >
        <SectionHead
          id="domain-audiences"
          title="Who you're building for"
          sub="Not personas — people you can find and talk to before the event."
        />
        <ul role="list" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domain.audiences.map((a) => (
            <li
              key={a.label}
              data-reveal
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
            >
              <h3 className="font-general text-[1rem] font-bold text-white">{a.label}</h3>
              <p className="mt-1.5 font-general text-[0.88rem] leading-[1.7] text-white/60">
                {a.note}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Example problems ────────────────────────────────────────────── */}
      <section
        aria-labelledby="domain-problems"
        className="container mx-auto px-5 pt-24 md:px-10 md:pt-32"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead id="domain-problems" title="Problems worth 30 hours" />
          <p data-reveal className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-white/60">
            Representative, not exhaustive
          </p>
        </div>
        <ul role="list" className="mt-10 border-t border-white/[0.06]">
          {domain.problems.map((p) => (
            <li
              key={p.title}
              data-reveal
              className="group grid gap-3 border-b border-white/[0.06] py-8 transition-colors duration-300 hover:bg-lime/[0.018] md:grid-cols-[1fr_1.8fr] md:gap-12 md:py-10"
            >
              <h3 className="font-general text-[clamp(1.1rem,2vw,1.35rem)] font-extrabold leading-[1.2] tracking-[-0.01em] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-2">
                {p.title}
              </h3>
              <p className="font-general text-[0.95rem] leading-[1.75] text-white/70">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Primary measure of success ──────────────────────────────────── */}
      <section
        aria-labelledby="domain-success"
        className="container mx-auto px-5 pt-24 md:px-10 md:pt-32"
      >
        <div data-reveal className="bezel bezel--lime">
          <div className="bezel-core p-8 md:p-14">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-lime/80">
              Primary measure of success
            </p>
            <h2
              id="domain-success"
              className="mt-5 max-w-[22ch] text-balance font-display text-[clamp(1.7rem,3.6vw,2.9rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white"
            >
              {domain.success.statement}
            </h2>
            <p className="mt-5 max-w-[44rem] font-general text-[0.95rem] leading-[1.75] text-white/70">
              {domain.success.detail}
            </p>
            <ul role="list" className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
              {domain.success.signals.map((s) => (
                <li
                  key={s}
                  className="flex gap-3 font-general text-[0.88rem] leading-[1.7] text-white/60"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.55em] size-[5px] shrink-0 rounded-full bg-lime shadow-[0_0_6px_rgba(200,255,0,0.8)]"
                  />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Common pitfalls ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="domain-pitfalls"
        className="container mx-auto px-5 pt-24 md:px-10 md:pt-32"
      >
        <SectionHead
          id="domain-pitfalls"
          title="Ideas that won't survive judging"
          sub="Some are merely insufficient without a substantial new capability; some are not permitted at all. If your idea is on this list, push it one level deeper."
        />
        <ul role="list" className="mt-10 grid gap-4 sm:grid-cols-2">
          {domain.pitfalls.map((p) => (
            <li
              key={p.title}
              data-reveal
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors duration-300 hover:border-white/[0.16]"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60">
                  <X size={13} strokeWidth={2.25} aria-hidden="true" />
                </span>
                <h3 className="font-general text-[1rem] font-bold text-white">{p.title}</h3>
              </div>
              <p className="mt-3 font-general text-[0.88rem] leading-[1.7] text-white/60">
                {p.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Close ───────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="domain-close"
        className="container mx-auto px-5 pb-28 pt-24 md:px-10 md:py-32"
      >
        <div
          data-reveal
          className="flex flex-col items-start gap-8 border-t border-white/[0.06] pt-16 md:flex-row md:items-end md:justify-between md:pt-20"
        >
          <SectionHead
            id="domain-close"
            reveal={false}
            title={hasLinks ? "Want more detail?" : "Found your problem?"}
            sub={
              hasLinks
                ? "This brief is the short version. The complete guide goes deeper — evaluation rubric, scope boundaries and example datasets — on the web or as a PDF for offline reading."
                : "You'll pick your domain on the application form — walk in knowing where your idea lives. If this brief matched the problem you can't stop thinking about, this is it."
            }
          />
          <div className="flex flex-wrap items-center gap-4">
            {domain.links?.guide && (
              <a href={domain.links.guide} className="cta-pill cta-pill--ghost group">
                Read the full guide
                <span className="cta-pill-icon" aria-hidden="true">
                  <BookOpen size={15} strokeWidth={2} />
                </span>
              </a>
            )}
            {domain.links?.pdf && (
              <a href={domain.links.pdf} download className="cta-pill cta-pill--ghost group">
                Download PDF
                <span className="cta-pill-icon" aria-hidden="true">
                  <FileDown size={15} strokeWidth={2} />
                </span>
              </a>
            )}
            <Link to="/apply" className="cta-pill group">
              <span className="relative inline-flex overflow-hidden">
                <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
                  Apply with your idea
                </span>
                <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
                  Apply with your idea
                </span>
              </span>
              <span className="cta-pill-icon" aria-hidden="true">
                <ArrowUpRight size={15} strokeWidth={2.25} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
};

export default DomainDetail;
