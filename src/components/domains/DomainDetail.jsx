import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUpRight, BookOpen, FileDown, X } from "lucide-react";
import DomainTitle from "./DomainTitle";
import SectionHead from "./SectionHead";
import { useScrollReveal } from "../../lib/useScrollReveal";

// The long-form brief a card expands into. The hero panel carries the same
// data-flip-id as its card so the page can morph one into the other; the
// [data-hero-fade] elements are what the expand timeline crossfades in.
// Scroll reveals only mount once the page has settled into normal flow.
const DomainDetail = ({ domain, settled, heroPanelRef, onBack }) => {
  const rootRef = useRef(null);
  const Icon = domain.icon;
  const hasLinks = Boolean(domain.links?.guide || domain.links?.pdf);
  useScrollReveal(rootRef, settled, [domain.slug]);

  return (
    <article ref={rootRef}>
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
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-white/60 outline-none transition-colors duration-300 focus-visible:border-lime/50 focus-visible:text-white hover:border-white/25 hover:text-white"
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
              Domain {String(domain.number).padStart(2, "0")}
            </p>
            <h1
              data-hero-fade
              className="special-font mt-4 max-w-[18ch] text-balance font-display text-[clamp(2.2rem,6vw,5rem)] leading-[0.98] tracking-[-0.02em] text-white"
            >
              <DomainTitle title={domain.fullTitle || domain.title} />
            </h1>
            <p
              data-hero-fade
              className="mt-5 max-w-[40rem] font-general text-base leading-[1.8] text-white/75 md:text-lg"
            >
              {domain.hook}
            </p>
            <div
              data-hero-fade
              className="mt-10 flex items-center gap-2.5 font-mono text-[0.64rem] uppercase tracking-[0.22em] text-white/40"
            >
              <ArrowDown size={12} strokeWidth={2} aria-hidden="true" className="motion-safe:animate-pulse" />
              Scroll for the brief
            </div>
          </div>
        </div>
      </div>

      {/* ── Lead: Overview → Central Challenge → What Counts as One Problem ── */}
      <section className="container mx-auto px-5 pt-20 md:px-10 md:pt-28">
        <div className="flex max-w-[46rem] flex-col gap-5">
          {domain.intro.map((paragraph, i) => (
            <p
              key={paragraph.slice(0, 24)}
              data-reveal
              className={
                i === 0
                  ? "font-general text-[1.05rem] leading-[1.85] text-white/85 md:text-[1.15rem]"
                  : "font-general text-[0.95rem] leading-[1.85] text-white/60 md:text-[1rem]"
              }
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* ── Who you're building for ─────────────────────────────────────── */}
      <section className="container mx-auto px-5 pt-24 md:px-10 md:pt-32">
        <SectionHead title="Who you're building for" sub={domain.audienceLine} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domain.audiences.map((a) => (
            <div
              key={a.label}
              data-reveal
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
            >
              <p className="font-general text-[0.98rem] font-bold text-white">{a.label}</p>
              <p className="mt-1.5 font-general text-[0.85rem] leading-[1.65] text-white/55">
                {a.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Representative problems ──────────────────────────────────────── */}
      <section className="container mx-auto px-5 pt-24 md:px-10 md:pt-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead title="Representative problems" />
          <p data-reveal className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-white/40">
            Illustrative, not exhaustive
          </p>
        </div>
        <div className="mt-10 border-t border-white/[0.06]">
          {domain.problems.map((p) => (
            <div
              key={p.title}
              data-reveal
              className="group grid gap-3 border-b border-white/[0.06] py-8 transition-colors duration-300 hover:bg-lime/[0.018] md:grid-cols-[1fr_1.8fr] md:gap-12 md:py-10"
            >
              <h3 className="font-general text-[clamp(1.1rem,2vw,1.35rem)] font-extrabold leading-[1.2] tracking-[-0.01em] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-2">
                {p.title}
              </h3>
              <div>
                <p className="font-general text-[0.95rem] leading-[1.78] text-white/70">{p.body}</p>
                <p className="mt-2.5 font-general text-[0.9rem] italic leading-[1.7] text-white/50">
                  {p.solution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What a strong solution must demonstrate ─────────────────────── */}
      <section className="container mx-auto px-5 pt-24 md:px-10 md:pt-32">
        <SectionHead
          title="What a strong solution must demonstrate"
          sub="The same six qualities apply in every domain; what changes is what each one means here."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domain.mustDemonstrate.map((m, i) => (
            <div
              key={m.label}
              data-reveal
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
            >
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-lime/70">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-general text-[0.95rem] font-bold text-white">{m.label}</p>
              <p className="mt-1.5 font-general text-[0.85rem] leading-[1.65] text-white/55">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Primary measure of success ──────────────────────────────────── */}
      <section className="container mx-auto px-5 pt-24 md:px-10 md:pt-32">
        <div data-reveal className="bezel bezel--lime">
          <div className="bezel-core p-8 md:p-14">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-lime/80">
              Primary measure of success
            </p>
            <p className="mt-5 max-w-[26ch] text-balance font-display text-[clamp(1.5rem,3.2vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-white">
              {domain.success.statement}
            </p>
            <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {domain.success.measures.map((s) => (
                <li
                  key={s}
                  className="flex gap-3 font-general text-[0.9rem] leading-[1.65] text-white/65"
                >
                  <span className="mt-[0.55em] size-[5px] shrink-0 rounded-full bg-lime shadow-[0_0_6px_rgba(200,255,0,0.8)]" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Scope & pitfalls ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-5 pt-24 md:px-10 md:pt-32">
        <div data-reveal className="mb-14">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/40">In scope</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {domain.inScope.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-general text-[0.78rem] text-white/60"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <SectionHead
          title="Ideas that won't survive judging"
          sub="Some are merely insufficient without a substantial new capability; some are not permitted at all."
        />

        <div data-reveal className="mt-10 rounded-2xl border border-lime/20 bg-lime/[0.04] p-6 md:p-7">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-lime/80">
            Most common way teams fail here
          </p>
          <p className="mt-2 font-general text-[1.02rem] font-bold text-white">
            {domain.pitfalls.mostCommon}
          </p>
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div data-reveal>
            <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/45">
              Insufficient without a substantial new capability
            </p>
            <ul className="flex flex-col gap-2.5">
              {domain.pitfalls.insufficient.map((item) => (
                <li key={item} className="flex gap-2.5 font-general text-[0.88rem] leading-[1.6] text-white/60">
                  <span className="mt-[0.5em] size-[5px] shrink-0 rounded-full bg-white/25" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal>
            <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/45">
              Not permitted in any form
            </p>
            <ul className="flex flex-col gap-2.5">
              {domain.pitfalls.notPermitted.map((item) => (
                <li key={item} className="flex gap-2.5 font-general text-[0.88rem] leading-[1.6] text-white/60">
                  <span className="mt-[0.15em] flex size-[16px] shrink-0 items-center justify-center rounded-full border border-white/15 text-white/45">
                    <X size={9} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Close ───────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-5 pb-28 pt-24 md:px-10 md:py-32">
        <div
          data-reveal
          className="flex flex-col items-start gap-8 border-t border-white/[0.06] pt-16 md:flex-row md:items-end md:justify-between md:pt-20"
        >
          <div>
            <h2 className="max-w-[20ch] text-balance font-display text-[clamp(1.9rem,4vw,2.9rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
              {hasLinks ? "Want more detail?" : "Found your problem?"}
            </h2>
            <p className="mt-3 max-w-[34rem] font-general text-[0.95rem] leading-[1.75] text-white/60">
              {hasLinks
                ? "This brief is the short version. The complete guide goes deeper — evaluation rubric, scope boundaries and example datasets — on the web or as a PDF for offline reading."
                : "You'll pick your domain on the application form — walk in knowing where your idea lives. If this brief matched the problem you can't stop thinking about, this is it."}
            </p>
          </div>
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
