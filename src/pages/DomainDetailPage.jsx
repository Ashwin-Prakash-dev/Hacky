import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Download } from "lucide-react";
import DomainsShell from "../components/domains/DomainsShell";
import Disclosure from "../components/domains/Disclosure";
import ScopeList from "../components/domains/ScopeList";
import { BRIEF_PDF, DOMAINS, readingMinutes } from "../lib/domains";
import { usePageMeta } from "../lib/seo";

const REF_IDS = ["opportunities", "scope", "measures"];

const DomainDetailPage = () => {
  const { slug } = useParams();
  const index = DOMAINS.findIndex((d) => d.slug === slug);
  const domain = DOMAINS[index];

  // Collapsed by default, but one control opens everything, so reading the
  // whole brief never means hunting for three separate toggles.
  const [openRefs, setOpenRefs] = useState([]);

  // The route component survives prev/next navigation, so the shell's
  // mount-time reset doesn't fire. Return to the top and re-collapse on
  // every slug change.
  useEffect(() => {
    window.scrollTo(0, 0);
    setOpenRefs([]);
  }, [slug]);

  usePageMeta({
    title: domain ? domain.name : "Problem Domains",
    description: domain ? domain.glimpse : undefined,
    path: domain ? `/domains/${domain.slug}` : "/domains",
  });

  if (!domain) return <Navigate to="/domains" replace />;

  const prev = DOMAINS[(index - 1 + DOMAINS.length) % DOMAINS.length];
  const next = DOMAINS[(index + 1) % DOMAINS.length];
  const allOpen = openRefs.length === REF_IDS.length;

  const toggleRef = (id) =>
    setOpenRefs((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  return (
    <DomainsShell>
      <article className="container mx-auto max-w-[860px] px-5 py-[clamp(3rem,8vw,5rem)] md:px-10">
        <Link
          to="/domains"
          className="mb-10 inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/45 no-underline transition-colors duration-200 hover:text-lime"
        >
          <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
          All domains
        </Link>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="mb-14">
          <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="font-mono text-[0.7rem] tracking-[0.2em] text-lime/60">
              {domain.num} <span className="text-white/25">/ 04</span>
            </p>
            <span className="h-3 w-px bg-white/15" aria-hidden="true" />
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white/40">
              About {readingMinutes(domain)} minutes, read it all
            </p>
          </div>
          <h1 className="mb-6 font-display text-[clamp(2.1rem,5.5vw,3.4rem)] font-normal leading-[1.02] tracking-[-0.03em] text-white">
            {domain.name}
          </h1>
          <p className="max-w-[62ch] font-general text-[clamp(1rem,1.8vw,1.1rem)] leading-[1.8] text-white/75">
            {domain.overview}
          </p>
        </header>

        {/* ── The challenge ───────────────────────────────────────────── */}
        <section className="mb-14 border-l-2 border-lime/45 pl-6 md:pl-8">
          <h2 className="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-lime/70">
            The central challenge
          </h2>
          <p className="font-general text-[clamp(1.05rem,2.2vw,1.3rem)] leading-[1.65] tracking-[-0.01em] text-white">
            {domain.challenge}
          </p>
        </section>

        {/* ── One problem ─────────────────────────────────────────────── */}
        <Block title="What counts as one problem">
          <p className="font-general text-[0.98rem] leading-[1.8] text-white/80">
            {domain.oneProblem.lead}
          </p>
          <p className="font-general text-[0.95rem] leading-[1.8] text-white/60">
            {domain.oneProblem.examples}
          </p>
          <p className="border-l border-white/15 pl-4 font-general text-[0.92rem] leading-[1.75] text-white/55">
            {domain.oneProblem.test}
          </p>
        </Block>

        {/* ── Representative problems ─────────────────────────────────── */}
        <Block title="Example problems">
          <div className="border-t border-white/[0.06]">
            {domain.problems.map((p) => (
              <div key={p.title} className="border-b border-white/[0.06] py-6">
                <h3 className="mb-2.5 font-general text-[1.02rem] font-bold leading-[1.3] tracking-[-0.01em] text-white">
                  {p.title}
                </h3>
                <p className="font-general text-[0.93rem] leading-[1.8] text-white/70">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </Block>

        {/* ── Strong solution ─────────────────────────────────────────── */}
        <Block title="What a strong solution must demonstrate">
          <dl className="grid grid-cols-1 gap-x-[clamp(2rem,5vw,3.5rem)] gap-y-7 sm:grid-cols-2">
            {domain.strongSolution.map((s) => (
              <div key={s.term}>
                <dt className="mb-2 font-general text-[0.95rem] font-bold tracking-[-0.01em] text-white">
                  {s.term}
                </dt>
                <dd className="font-general text-[0.9rem] leading-[1.75] text-white/65">
                  {s.body}
                </dd>
              </div>
            ))}
          </dl>
        </Block>

        {/* ── Hard limits stay visible ────────────────────────────────── */}
        <section className="mb-14 rounded-xl border border-white/[0.09] bg-white/[0.02] p-6 md:p-8">
          <ScopeList
            title="Not permitted in any form"
            items={domain.outOfScope.prohibited}
            tone="loud"
          />
        </section>

        {/* ── Reference ───────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div>
              <h2 className="font-general text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white/45">
                Reference
              </h2>
              <p className="mt-1.5 font-general text-[0.88rem] leading-[1.7] text-white/50">
                Three more sections, part of the brief. Open them before you build.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenRefs(allOpen ? [] : REF_IDS)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/70 outline-none transition-[color,border-color,background] duration-300 focus-visible:ring-1 focus-visible:ring-lime/60 hover:border-lime/40 hover:text-lime"
            >
              {allOpen ? "Hide all three" : "Show all three"}
              <ChevronDown
                size={14}
                strokeWidth={2.25}
                aria-hidden="true"
                className={`transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  allOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <Disclosure
            label="Opportunity areas"
            meta={`${domain.opportunities.length} areas`}
            open={openRefs.includes("opportunities")}
            onToggle={() => toggleRef("opportunities")}
          >
            <ul className="flex flex-col gap-2.5 pl-5">
              {domain.opportunities.map((o) => (
                <li
                  key={o}
                  className="list-disc font-general text-[0.9rem] leading-[1.75] text-white/70 marker:text-lime/40"
                >
                  {o}
                </li>
              ))}
            </ul>
          </Disclosure>

          <Disclosure
            label="Scope"
            meta="In and out"
            open={openRefs.includes("scope")}
            onToggle={() => toggleRef("scope")}
          >
            <div className="flex flex-col gap-7">
              <ScopeList title="In scope" items={domain.inScope} />
              <ScopeList
                title="Not sufficient unless you show a substantial new capability"
                items={domain.outOfScope.insufficient}
              />
            </div>
          </Disclosure>

          <Disclosure
            label="How success is measured"
            meta={`${domain.measures.length} measures`}
            open={openRefs.includes("measures")}
            onToggle={() => toggleRef("measures")}
          >
            <ul className="flex flex-col gap-2.5 pl-5">
              {domain.measures.map((m) => (
                <li
                  key={m}
                  className="list-disc font-general text-[0.9rem] leading-[1.75] text-white/70 marker:text-lime/40"
                >
                  {m}
                </li>
              ))}
            </ul>
          </Disclosure>

          <div className="border-t border-white/[0.07]" />
        </section>

        {/* ── What's still left to read ───────────────────────────────── */}
        <section className="mb-14 rounded-xl border border-lime/20 bg-lime/[0.03] p-7">
          <p className="mb-1.5 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-lime/70">
            You have finished domain {domain.num}
          </p>
          <h2 className="mb-2.5 font-general text-[1.1rem] font-bold tracking-[-0.01em] text-white">
            One more section applies to you.
          </h2>
          <p className="mb-6 max-w-[58ch] font-general text-[0.92rem] leading-[1.8] text-white/70">
            Six expectations apply to every submission in every domain, and judges use them
            whatever you built. Your brief is not complete without them.
          </p>
          <Link to="/domains#expectations" className="cta-pill group">
            Read the six expectations
            <span className="cta-pill-icon" aria-hidden="true">
              <ArrowUpRight size={15} strokeWidth={2.25} />
            </span>
          </Link>

          {domain.analytics && (
            <p className="mt-6 border-t border-lime/15 pt-5 font-general text-[0.88rem] leading-[1.8] text-white/55">
              Generating analyses or charts on demand?{" "}
              <Link
                to="/domains#analytics"
                className="text-lime/90 underline underline-offset-[3px] hover:text-lime"
              >
                Appendix A adds further requirements
              </Link>
              .
            </p>
          )}
        </section>

        {BRIEF_PDF && (
          <a href={BRIEF_PDF} download className="cta-pill cta-pill--ghost mb-16 inline-flex">
            Download the full brief as PDF
            <span className="cta-pill-icon" aria-hidden="true">
              <Download size={14} strokeWidth={2.25} />
            </span>
          </a>
        )}

        {/* ── Prev / next ─────────────────────────────────────────────── */}
        <nav
          aria-label="Other domains"
          className="grid grid-cols-1 gap-2 border-t border-white/[0.07] pt-8 sm:grid-cols-2 sm:gap-8"
        >
          <Link
            to={`/domains/${prev.slug}`}
            className="group flex flex-col gap-1.5 py-4 no-underline"
          >
            <span className="flex items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/45 transition-colors duration-300 group-hover:text-lime">
              <ArrowLeft size={12} strokeWidth={2.25} aria-hidden="true" />
              Previous domain
            </span>
            <span className="font-general text-[1rem] font-bold tracking-[-0.01em] text-white/80 transition-colors duration-300 group-hover:text-white">
              {prev.short}
            </span>
          </Link>
          <Link
            to={`/domains/${next.slug}`}
            className="group flex flex-col gap-1.5 py-4 no-underline sm:items-end sm:text-right"
          >
            <span className="flex items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/45 transition-colors duration-300 group-hover:text-lime">
              Next domain
              <ArrowRight size={12} strokeWidth={2.25} aria-hidden="true" />
            </span>
            <span className="font-general text-[1rem] font-bold tracking-[-0.01em] text-white/80 transition-colors duration-300 group-hover:text-white">
              {next.short}
            </span>
          </Link>
        </nav>
      </article>
    </DomainsShell>
  );
};

const Block = ({ title, children }) => (
  <section className="mb-14">
    <h2 className="mb-5 font-general text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white/45">
      {title}
    </h2>
    <div className="flex flex-col gap-4">{children}</div>
  </section>
);

export default DomainDetailPage;
