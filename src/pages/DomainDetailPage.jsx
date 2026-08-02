import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import DomainsShell from "../components/domains/DomainsShell";
import Disclosure from "../components/domains/Disclosure";
import ScopeList from "../components/domains/ScopeList";
import { BRIEF_PDF, DOMAINS } from "../lib/domains";
import { usePageMeta } from "../lib/seo";

const DomainDetailPage = () => {
  const { slug } = useParams();
  const index = DOMAINS.findIndex((d) => d.slug === slug);
  const domain = DOMAINS[index];

  // The route component survives prev/next navigation, so the shell's
  // mount-time reset doesn't fire — return to the top on every slug change.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  usePageMeta({
    title: domain ? domain.name : "Problem Domains",
    description: domain ? domain.glimpse : undefined,
    path: domain ? `/domains/${domain.slug}` : "/domains",
  });

  if (!domain) return <Navigate to="/domains" replace />;

  const prev = DOMAINS[(index - 1 + DOMAINS.length) % DOMAINS.length];
  const next = DOMAINS[(index + 1) % DOMAINS.length];

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
          <p className="mb-5 font-mono text-[0.7rem] tracking-[0.2em] text-lime/60">
            {domain.num} <span className="text-white/25">/ 04</span>
          </p>
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
          <h2 className="mb-2 font-general text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white/45">
            Reference
          </h2>

          <Disclosure label="Opportunity areas" meta={`${domain.opportunities.length} areas`}>
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

          <Disclosure label="Scope" meta="In and out">
            <div className="flex flex-col gap-7">
              <ScopeList title="In scope" items={domain.inScope} />
              <ScopeList
                title="Not sufficient unless you show a substantial new capability"
                items={domain.outOfScope.insufficient}
              />
            </div>
          </Disclosure>

          <Disclosure label="How success is measured" meta={`${domain.measures.length} measures`}>
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

        {/* ── Analytics pointer + brief ───────────────────────────────── */}
        <div className="mb-16 flex flex-col gap-6">
          {domain.analytics && (
            <p className="font-general text-[0.9rem] leading-[1.8] text-white/55">
              Building something that generates analyses or charts on demand?{" "}
              <Link
                to="/domains#analytics"
                className="text-lime/90 underline underline-offset-[3px] hover:text-lime"
              >
                Appendix A adds further requirements.
              </Link>
            </p>
          )}
          {BRIEF_PDF && (
            <a href={BRIEF_PDF} className="cta-pill cta-pill--ghost self-start" download>
              Download the full brief
              <span className="cta-pill-icon" aria-hidden="true">
                <Download size={14} strokeWidth={2.25} />
              </span>
            </a>
          )}
        </div>

        {/* ── Prev / next ─────────────────────────────────────────────── */}
        <nav
          aria-label="Other domains"
          className="grid grid-cols-1 gap-2 border-t border-white/[0.07] pt-8 sm:grid-cols-2 sm:gap-8"
        >
          <Link
            to={`/domains/${prev.slug}`}
            className="group flex flex-col gap-1.5 py-4 no-underline"
          >
            <span className="flex items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/35 transition-colors duration-300 group-hover:text-lime">
              <ArrowLeft size={12} strokeWidth={2.25} aria-hidden="true" />
              Previous
            </span>
            <span className="font-general text-[1rem] font-bold tracking-[-0.01em] text-white/80 transition-colors duration-300 group-hover:text-white">
              {prev.short}
            </span>
          </Link>
          <Link
            to={`/domains/${next.slug}`}
            className="group flex flex-col gap-1.5 py-4 no-underline sm:items-end sm:text-right"
          >
            <span className="flex items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/35 transition-colors duration-300 group-hover:text-lime">
              Next
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
