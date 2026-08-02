import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import DomainsShell from "../components/domains/DomainsShell";
import DomainCompare from "../components/domains/DomainCompare";
import Disclosure from "../components/domains/Disclosure";
import ScopeList from "../components/domains/ScopeList";
import { ANALYTICS, DOMAINS, EXPECTATIONS } from "../lib/domains";
import { usePageMeta } from "../lib/seo";

const DomainsPage = () => {
  usePageMeta({
    title: "Problem Domains",
    description:
      "The four Startathon problem domains — preventive health, intelligent operations, inclusive access, and digital trust. Opportunity areas, example problems, and what a strong solution has to demonstrate.",
    path: "/domains",
  });

  return (
    <DomainsShell>
      {/* ── Lead ──────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-5 pb-4 pt-[clamp(3.5rem,9vw,6rem)] md:px-10">
        <span className="eyebrow mb-6">Problem domains</span>
        <h1 className="special-font bento-title mb-8 max-w-[18ch] text-[clamp(2.4rem,7vw,4.6rem)] leading-[0.98] tracking-[-0.035em] text-white">
          F<b>i</b>nd a problem worth 30 hours<b>.</b>
        </h1>
        <div className="flex max-w-[64ch] flex-col gap-5">
          <p className="font-general text-[clamp(1rem,1.9vw,1.15rem)] leading-[1.8] text-white/80">
            Startathon is a problem-first event. You are expected to identify a meaningful
            problem, understand the people and workflows it affects, and build something
            testable inside the 30 hours.
          </p>
          <p className="font-general text-[0.98rem] leading-[1.8] text-white/65">
            The four domains below are opportunity areas, not fixed problem statements. The
            examples show the kind of problem — and the depth — that fits each one. Pick one of
            the examples, or bring a different problem that clearly belongs to your domain.
          </p>
          <p className="font-general text-[0.98rem] leading-[1.8] text-white/65">
            Solutions do not have to use artificial intelligence. Choose the technology from the
            problem, not the other way round.
          </p>
        </div>
      </section>

      {/* ── The comparison ────────────────────────────────────────────── */}
      <DomainCompare />

      {/* ── The four domains ──────────────────────────────────────────── */}
      <section className="container mx-auto px-5 pb-[clamp(3rem,8vw,5rem)] md:px-10">
        <h2 className="mb-2 font-general text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white/45">
          The domains
        </h2>
        <div className="border-t border-white/[0.06]">
          {DOMAINS.map((d) => (
            <Link
              key={d.slug}
              to={`/domains/${d.slug}`}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-x-[clamp(1.25rem,3vw,2.5rem)] border-b border-white/[0.06] py-[clamp(1.75rem,3.5vw,2.5rem)] no-underline outline-none transition-colors duration-300 focus-visible:bg-lime/[0.03] hover:bg-lime/[0.018] sm:grid-cols-[3.5rem_1fr_1.4fr_auto]"
            >
              <span className="select-none font-display text-[clamp(2rem,3.5vw,2.9rem)] font-normal leading-none tracking-[-0.03em] text-lime/[0.14] transition-colors duration-300 group-hover:text-lime/40">
                {d.num}
              </span>

              <h3 className="font-general text-[clamp(1.1rem,2vw,1.4rem)] font-extrabold leading-[1.2] tracking-[-0.02em] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-2">
                {d.name}
              </h3>

              <p className="col-span-2 col-start-2 pt-3 font-general text-[0.9rem] leading-[1.7] text-white/60 transition-colors duration-[0.4s] group-hover:text-white/85 sm:col-span-1 sm:col-start-3 sm:pt-1">
                {d.glimpse}
              </p>

              <span
                aria-hidden="true"
                className="col-start-3 row-start-1 self-start pt-1 text-white/25 transition-[color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:text-lime sm:col-start-4"
              >
                <ArrowUpRight size={20} strokeWidth={1.75} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Expectations ──────────────────────────────────────────────── */}
      <section className="w-full bg-[#050505] py-[clamp(3rem,8vw,5rem)]">
        <div className="container mx-auto px-5 md:px-10">
          <span className="eyebrow eyebrow--quiet mb-6">Applies to every submission</span>
          <h2 className="special-font bento-title mb-4 max-w-[20ch] text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.03em] text-white">
            Read this before you sta<b>r</b>t building<b>.</b>
          </h2>
          <p className="mb-12 max-w-[60ch] font-general text-[0.98rem] leading-[1.8] text-white/65">
            These six apply in every domain, and judges use them regardless of what you built.
          </p>

          <ol className="grid grid-cols-1 gap-x-[clamp(2rem,5vw,4rem)] gap-y-10 md:grid-cols-2">
            {EXPECTATIONS.map((item) => (
              <li key={item.num} className="flex gap-5">
                <span className="shrink-0 pt-1 font-mono text-[0.7rem] tracking-[0.14em] text-lime/55">
                  {item.num}
                </span>
                <div>
                  <h3 className="mb-2.5 font-general text-[1.02rem] font-bold leading-[1.3] tracking-[-0.01em] text-white">
                    {item.title}
                  </h3>
                  <p className="font-general text-[0.92rem] leading-[1.8] text-white/70">
                    {item.body}
                  </p>
                  {item.note && (
                    <p className="mt-3 border-l border-white/15 pl-4 font-general text-[0.86rem] leading-[1.7] text-white/45">
                      {item.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Appendix A ────────────────────────────────────────────────── */}
      <section id="analytics" className="w-full bg-[#050505] pb-[clamp(4rem,10vw,7rem)] pt-4">
        <div className="container mx-auto max-w-[860px] px-5 md:px-10">
          <Disclosure
            label="Extra requirements for analytics-type submissions"
            meta="Appendix A"
          >
            <div className="flex flex-col gap-5">
              <p className="font-general text-[0.92rem] leading-[1.8] text-white/70">
                {ANALYTICS.intro}
              </p>
              <p className="font-general text-[0.92rem] leading-[1.8] text-white/70">
                {ANALYTICS.context}
              </p>

              <dl className="mt-2 flex flex-col gap-5">
                {ANALYTICS.requirements.map((r) => (
                  <div key={r.term}>
                    <dt className="mb-1 font-general text-[0.92rem] font-bold tracking-[-0.01em] text-white">
                      {r.term}
                    </dt>
                    <dd className="font-general text-[0.9rem] leading-[1.75] text-white/65">
                      {r.body}
                    </dd>
                  </div>
                ))}
              </dl>

              <ScopeList title="Not sufficient on its own" items={ANALYTICS.insufficient} />
              <ScopeList title="Additional measures" items={ANALYTICS.measures} />
            </div>
          </Disclosure>
        </div>
      </section>
    </DomainsShell>
  );
};

export default DomainsPage;
