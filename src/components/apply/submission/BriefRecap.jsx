import { DOMAINS, EXPECTATIONS } from "../../../lib/domains";
import { APPLYING } from "../../../lib/format";
import { SectionLabel, StepIntro, StepTitle, RefLink } from "./ui";

// Step 0. Read-only orientation, assembled from the same modules /domains and
// /format render from, so it cannot drift from the published pages. Nothing
// is retyped here; if a brief changes, this changes with it.
const BriefRecap = () => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-3">
      <StepTitle>Before you write</StepTitle>
      <StepIntro>
        Everything below is what your answers get read against. It&rsquo;s the short
        version of the domain briefs and the format page. Open either one whenever
        you want the whole thing.
      </StepIntro>
    </div>

    {/* Domains, outcome-first: because that is how a team picks one. */}
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <SectionLabel>Four opportunity areas</SectionLabel>
        <RefLink to="/domains">Read the briefs</RefLink>
      </div>
      <p className="font-general text-[0.88rem] leading-relaxed text-white/55">
        Pick the one your main outcome sits in. The form never asks you to name it,
        but it should be clear from how you write your summary.
      </p>
      <ul className="border-t border-white/[0.06]">
        {DOMAINS.map((domain) => (
          <li key={domain.slug} className="border-b border-white/[0.06] py-4">
            <p className="font-general text-[0.95rem] font-bold leading-tight text-white">
              {domain.title}
            </p>
            <p className="mt-1.5 font-general text-[0.87rem] leading-relaxed text-white/60">
              {domain.outcome}
            </p>
          </li>
        ))}
      </ul>
    </section>

    {/* Expectations: the standards above all four domains. */}
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <SectionLabel>Six expectations, every submission</SectionLabel>
        <RefLink to="/domains#expectations">See the detail</RefLink>
      </div>
      <ul className="grid gap-3">
        {EXPECTATIONS.map((expectation) => (
          <li
            key={expectation.title}
            className="flex gap-[0.6rem] font-general text-[0.88rem] leading-relaxed text-white/70"
          >
            <span
              aria-hidden="true"
              className="mt-[0.55em] size-[4px] shrink-0 rounded-full bg-lime/60"
            />
            {expectation.title}
          </li>
        ))}
      </ul>
    </section>

    {/* What this form is scored on. */}
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <SectionLabel>What this application is judged on</SectionLabel>
        <RefLink to="/format">Read the format</RefLink>
      </div>
      <ul className="grid gap-3">
        {APPLYING.evaluation.map((item) => (
          <li
            key={item}
            className="flex gap-[0.6rem] font-general text-[0.88rem] leading-relaxed text-white/70"
          >
            <span
              aria-hidden="true"
              className="mt-[0.55em] size-[4px] shrink-0 rounded-full bg-lime/60"
            />
            {item}
          </li>
        ))}
      </ul>
    </section>

    {/* Named explicitly, because teams over-prepare these by default. */}
    <section className="rounded-md border-[0.5px] border-white/[0.08] bg-white/[0.02] px-[1.1rem] py-[0.9rem]">
      <SectionLabel>Not required, and not scored</SectionLabel>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-x-6">
        {APPLYING.notRequired.map((item) => (
          <li
            key={item}
            className="font-general text-[0.85rem] leading-relaxed text-white/50 line-through decoration-white/25"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>

    <p className="font-general text-[0.88rem] leading-relaxed text-white/60">
      {APPLYING.resetNote}
    </p>
  </div>
);

export default BriefRecap;
