import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Ban, Check } from "lucide-react";
import {
  APPLYING,
  BEFORE_THE_EVENT,
  FLOW,
  JUDGING,
  KICKOFF,
  LEARNING_LOOP,
  LEARNING_NOTE,
  WHAT_IT_IS,
} from "../lib/format";
import { primaryCta } from "../lib/phase";
import ScrollProgress from "../components/ui/ScrollProgress";
import NavBar from "../components/sections/Navbar";
import Footer from "../components/sections/Footer";
import { usePageMeta } from "../lib/seo";

gsap.registerPlugin(ScrollTrigger);

// Derived, never typed: the scorecard footnote has to stay true if a weight
// is ever edited, rather than quietly contradicting the figures above it.
const totalWeight = JUDGING.reduce((sum, j) => sum + j.weight, 0);
const understandingWeight = JUDGING.filter((j) =>
  ["Problem insight", "Validation and learning"].includes(j.dimension)
).reduce((sum, j) => sum + j.weight, 0);

// Sticky section header. The title holds its position while its content
// scrolls past, which is what gives the page its hierarchy: you always know
// which of the seven parts you are inside.
const Rail = ({ eyebrow, title, sub, children }) => (
  <section className="container mx-auto px-5 pt-28 md:px-10 md:pt-40">
    <div className="grid gap-10 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.6fr)] md:gap-16">
      <div className="md:sticky md:top-32 md:self-start">
        <div data-reveal>
          {eyebrow && <span className="eyebrow mb-5">{eyebrow}</span>}
          <h2 className="max-w-[14ch] text-balance font-display text-[clamp(1.9rem,3.6vw,2.8rem)] font-semibold leading-[1.03] tracking-[-0.02em] text-white">
            {title}
          </h2>
          {sub && (
            <p className="mt-4 max-w-[34rem] font-general text-[0.95rem] leading-[1.75] text-white/55">
              {sub}
            </p>
          )}
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  </section>
);

const MarkList = ({ label, items, tone = "neutral" }) => (
  <div data-reveal>
    <p
      className={`font-mono text-[0.64rem] uppercase tracking-[0.22em] ${
        tone === "allowed" ? "text-lime/80" : "text-white/55"
      }`}
    >
      {label}
    </p>
    <ul className="mt-5 grid gap-3">
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-3 font-general text-[0.93rem] leading-[1.6] ${
            tone === "barred" ? "text-white/55" : "text-white/75"
          }`}
        >
          {tone === "allowed" && (
            <Check size={14} strokeWidth={2.25} aria-hidden="true" className="mt-[0.3em] shrink-0 text-lime" />
          )}
          {tone === "barred" && (
            <Ban size={14} strokeWidth={2} aria-hidden="true" className="mt-[0.3em] shrink-0 text-white/45" />
          )}
          {tone === "neutral" && (
            <span className="mt-[0.6em] size-[5px] shrink-0 rounded-full bg-white/25" />
          )}
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const FormatPage = () => {
  const rootRef = useRef(null);
  const flowRailRef = useRef(null);
  const flowlistRef = useRef(null);
  const cta = primaryCta();

  usePageMeta({
    title: "Format and judging",
    description:
      "How Startathon runs: what you can prepare beforehand, what happens across the 30 hours, and the six dimensions judges score.",
    path: "/format",
  });

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    // Always open at the top. Browsers restore the previous offset on reload,
    // and a client-side route change keeps whatever offset you left behind,
    // so both are overridden here. An explicit #hash still wins.
    const prevRestoration = window.history.scrollRestoration;
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    if (!window.location.hash) {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true, force: true });
    }

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = prevRestoration || "auto";
      }
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const els = rootRef.current?.querySelectorAll("[data-reveal]") ?? [];
    const enterEls = rootRef.current?.querySelectorAll("[data-enter]") ?? [];

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Page entrance: the hero arrives in one orchestrated pass rather than
      // snapping in. Everything below the fold is handled by [data-reveal].
      gsap.fromTo(
        enterEls,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.09, delay: 0.05 }
      );

      // Signature 2: the event rail fills as you read the seven steps. The
      // trigger is the step list, not the rail itself, because the rail is
      // display:none below md and would give ScrollTrigger no box to measure.
      gsap.to(flowRailRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: flowlistRef.current,
          start: "top 72%",
          end: "bottom 80%",
          scrub: 0.4,
        },
      });

      els.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },
          }
        );
      });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(enterEls, { opacity: 1, y: 0 });
      gsap.set(flowRailRef.current, { scaleY: 1 });
    });

    ScrollTrigger.refresh();
    return () => mm.revert();
  }, []);

  return (
    <>
      <ScrollProgress />
      <main ref={rootRef} className="relative min-h-dvh w-screen overflow-x-clip bg-[#050505]">
        <NavBar />

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="container mx-auto px-5 pt-36 md:px-10 md:pt-44">
          <span data-enter className="eyebrow mb-7 opacity-0">
            Format and judging
          </span>
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-16">
            <h1
              data-enter
              className="special-font max-w-[11ch] font-display text-[clamp(2.7rem,7.2vw,5.4rem)] leading-[0.93] tracking-[-0.03em] text-white opacity-0"
            >
              What actually g<b>e</b>ts scored<b>.</b>
            </h1>
            <p
              data-enter
              className="max-w-[38rem] font-general text-base leading-[1.8] text-white/80 opacity-0 md:pt-4 md:text-lg"
            >
              {WHAT_IT_IS.lead}
            </p>
          </div>
          <p
            data-enter
            className="mt-16 max-w-[44rem] font-general text-[clamp(1.05rem,2vw,1.35rem)] leading-[1.55] text-white/70 opacity-0 md:mt-20"
          >
            Judges weigh the quality of your reasoning, your evidence and the working product,
            together with the progress and learning you can show for the 30 hours.
          </p>
        </section>

        {/* ── Applying: first, because it is what a reader came to find out ─ */}
        <Rail eyebrow="Applying" title="What you submit" sub={APPLYING.lead}>
          <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
            <MarkList label="Five-slide deck" items={APPLYING.deck} />
            <div className="flex flex-col gap-8">
              <MarkList label="Sixty-second team video" items={APPLYING.video} />
              {/* The one outbound link on the page: examples beat a spec for
                  the deliverable teams most often get wrong. */}
              <a
                data-reveal
                href={APPLYING.videoReference.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border-l border-lime/40 bg-lime/[0.03] py-5 pl-6 pr-5 no-underline outline-none transition-colors duration-300 focus-visible:bg-lime/[0.09] hover:bg-lime/[0.07]"
              >
                <span className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-lime/80">
                  Watch these first
                </span>
                <span className="mt-3 flex items-start gap-2 font-general text-[1rem] font-extrabold leading-tight tracking-[-0.01em] text-white">
                  {APPLYING.videoReference.label}
                  <ArrowUpRight
                    size={15}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="mt-[0.15em] shrink-0 text-lime transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
                <span className="mt-2 block font-general text-[0.92rem] leading-[1.7] text-white/60">
                  {APPLYING.videoReference.note}
                </span>
              </a>
            </div>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-x-14">
            <MarkList label="What we evaluate" items={APPLYING.evaluation} tone="allowed" />
            <MarkList label="Not required" items={APPLYING.notRequired} tone="barred" />
          </div>
          <p
            data-reveal
            className="mt-12 border-l border-lime/30 pl-6 font-general text-[1rem] leading-[1.8] text-white/80 md:pl-8"
          >
            {APPLYING.resetNote}
          </p>
        </Rail>

        {/* ── What it is not ──────────────────────────────────────────────── */}
        <section className="mt-28 w-full bg-[#0b0b0b] py-20 md:mt-40 md:py-28">
          <div className="container mx-auto px-5 md:px-10">
            <p data-reveal className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-white/55">
              Things this is not
            </p>
            <ul className="mt-9 grid gap-x-16 gap-y-4 md:grid-cols-2">
              {WHAT_IT_IS.notThis.map((n) => (
                <li
                  key={n}
                  data-reveal
                  className="font-display text-[clamp(1.15rem,2.2vw,1.55rem)] leading-tight tracking-[-0.01em] text-white/55 line-through decoration-lime/45 decoration-[1.5px]"
                >
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Principles ──────────────────────────────────────────────────── */}
        <Rail title="How we think about it">
          <div className="border-t border-white/[0.06]">
            {WHAT_IT_IS.principles.map((p) => (
              <div key={p.title} data-reveal className="border-b border-white/[0.06] py-7 md:py-8">
                <h3 className="font-general text-[1.05rem] font-extrabold leading-tight tracking-[-0.01em] text-white">
                  {p.title}
                </h3>
                <p className="mt-2.5 font-general text-[0.95rem] leading-[1.75] text-white/65">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </Rail>

        {/* ── Before kickoff ──────────────────────────────────────────────── */}
        <Rail
          eyebrow="Before kickoff"
          title="Most of the research happens before you arrive"
          sub={BEFORE_THE_EVENT.lead}
        >
          <div className="grid gap-10 md:grid-cols-2 md:gap-0">
            <div className="md:pr-10">
              <MarkList
                label="Do this before you arrive"
                items={BEFORE_THE_EVENT.allowed}
                tone="allowed"
              />
            </div>
            <div className="md:border-l md:border-white/[0.08] md:pl-10">
              <MarkList
                label="Leave these for the 30 hours"
                items={BEFORE_THE_EVENT.notAllowed}
                tone="barred"
              />
            </div>
          </div>
          <div data-reveal className="bezel mt-14">
            <div className="bezel-core p-7 md:p-9">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-lime/80">
                Bring these, and declare them
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-x-8">
                {BEFORE_THE_EVENT.declare.map((d) => (
                  <li key={d} className="flex gap-3 font-general text-[0.92rem] leading-[1.6] text-white/80">
                    <span className="mt-[0.6em] size-[5px] shrink-0 rounded-full bg-lime shadow-[0_0_6px_rgba(200,255,0,0.8)]" />
                    {d}
                  </li>
                ))}
              </ul>
              <p className="mt-7 font-general text-[0.9rem] leading-[1.75] text-white/55">
                {BEFORE_THE_EVENT.declareNote}
              </p>
            </div>
          </div>
        </Rail>

        {/* ── What carries over from before the event ─────────────────────── */}
        <Rail eyebrow="At kickoff" title="What carries over from before" sub={KICKOFF.lead}>
          <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
            <MarkList label="Your baseline records" items={KICKOFF.baseline} />
            <MarkList label="Your canvas v0 states" items={KICKOFF.canvas} />
          </div>
          <p
            data-reveal
            className="mt-12 border-l border-lime/30 pl-6 font-general text-[1rem] leading-[1.8] text-white/80 md:pl-8"
          >
            {KICKOFF.deltaNote}
          </p>
          <div className="mt-12">
            <MarkList label="Expect to be asked" items={KICKOFF.probes} />
          </div>
        </Rail>

        {/* ── The 30 hours: a real sequence, so it gets a real timeline ───── */}
        <Rail
          eyebrow="The 30 hours"
          title="How the event runs"
          sub={WHAT_IT_IS.arc.join(", ").toLowerCase() + "."}
        >
          <div ref={flowlistRef} className="relative">
            <span
              className="absolute left-2 top-8 hidden h-[calc(100%-4rem)] w-px bg-white/10 md:block"
              aria-hidden="true"
            />
            <span
              ref={flowRailRef}
              className="absolute left-2 top-8 hidden h-[calc(100%-4rem)] w-px origin-top scale-y-0 bg-lime md:block"
              aria-hidden="true"
            />
            {FLOW.map((step) => (
              <div
                key={step.label}
                data-reveal
                className="relative border-b border-white/[0.06] py-7 md:py-8 md:pl-16"
              >
                <span
                  className="absolute left-[0.3125rem] top-[2.35rem] hidden size-1.5 rounded-full bg-lime md:block"
                  aria-hidden="true"
                />
                <h3 className="font-general text-[1.05rem] font-extrabold leading-tight tracking-[-0.01em] text-white">
                  {step.label}
                </h3>
                <p className="mt-2.5 font-general text-[0.95rem] leading-[1.75] text-white/65">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div data-reveal className="bezel bezel--lime mt-14">
            <div className="bezel-core p-8 md:p-10">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-lime/80">
                Be able to answer, about the assumption you tested
              </p>
              <ul className="mt-7 grid gap-5 sm:grid-cols-2">
                {LEARNING_LOOP.map((q) => (
                  <li
                    key={q}
                    className="font-display text-[clamp(1.05rem,1.9vw,1.3rem)] leading-tight tracking-[-0.01em] text-white"
                  >
                    {q}
                  </li>
                ))}
              </ul>
              <p className="mt-8 font-general text-[0.9rem] leading-[1.75] text-white/55">
                {LEARNING_NOTE}
              </p>
            </div>
          </div>
        </Rail>

        {/* ── Judging: the weight centre of the page ──────────────────────── */}
        <section className="mt-28 w-full bg-[#0b0b0b] py-20 md:mt-40 md:py-32">
          <div className="container mx-auto px-5 md:px-10">
            <div data-reveal className="max-w-[46rem]">
              <span className="eyebrow mb-5">Judging</span>
              <h2 className="text-balance font-display text-[clamp(2rem,4.2vw,3.1rem)] font-semibold leading-[1.03] tracking-[-0.02em] text-white">
                Six dimensions, one scorecard.
              </h2>
              <p className="mt-4 font-general text-[0.98rem] leading-[1.8] text-white/60">
                This is the scorecard: every team is scored on the same six dimensions, weighted
                as shown. It sits alongside the{" "}
                <Link
                  to="/domains#expectations"
                  className="text-lime underline decoration-lime/40 underline-offset-4 transition-colors duration-300 hover:decoration-lime"
                >
                  six expectations
                </Link>{" "}
                every submission has to meet in the first place. Complexity on its own earns
                nothing, and visible effort is not a dimension.
              </p>
            </div>

            <div className="mt-14 border-t border-white/[0.08]">
              {JUDGING.map((j) => (
                <div
                  key={j.dimension}
                  data-reveal
                  className="grid gap-5 border-b border-white/[0.08] py-9 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] md:gap-14 md:py-11"
                >
                  <div>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-lime">
                      {j.weight}%
                    </p>
                    <h3 className="mt-2.5 max-w-[14ch] text-balance font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.05] tracking-[-0.02em] text-white">
                      {j.dimension}
                    </h3>
                  </div>
                  <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-x-8">
                    {j.evaluates.map((e) => (
                      <li
                        key={e}
                        className="flex gap-3 font-general text-[0.92rem] leading-[1.6] text-white/60"
                      >
                        <span className="mt-[0.62em] size-[4px] shrink-0 rounded-full bg-lime/70" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p
              data-reveal
              className="mt-6 font-general text-[0.92rem] leading-[1.7] text-white/55"
            >
              Total {totalWeight}%. Problem insight and validation together carry{" "}
              {understandingWeight}%, so how well you understand the problem counts for as much as
              what you build with it.
            </p>
          </div>
        </section>

        {/* ── Close ───────────────────────────────────────────────────────── */}
        <section className="container mx-auto px-5 py-28 md:px-10 md:pb-32 md:pt-40">
          <div
            data-reveal
            className="flex flex-col items-start gap-8 border-t border-white/[0.06] pt-16 md:flex-row md:items-end md:justify-between md:pt-20"
          >
            <div>
              <h2 className="max-w-[20ch] text-balance font-display text-[clamp(1.9rem,4vw,2.9rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
                Now pick a problem.
              </h2>
              <p className="mt-3 max-w-[34rem] font-general text-[0.95rem] leading-[1.75] text-white/60">
                Four opportunity areas, each with a brief that defines what counts as one problem
                and how judges will measure it.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/domains" className="cta-pill cta-pill--ghost group">
                  Read the domain briefs
                  <span className="cta-pill-icon" aria-hidden="true">
                    <ArrowUpRight size={15} strokeWidth={2} />
                  </span>
                </Link>
                <Link to="/apply" className="cta-pill group">
                  <span className="relative inline-flex overflow-hidden">
                    <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
                      {cta.label}
                    </span>
                    <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
                      {cta.label}
                    </span>
                  </span>
                  <span className="cta-pill-icon" aria-hidden="true">
                    <ArrowUpRight size={15} strokeWidth={2.25} />
                  </span>
                </Link>
              </div>
              {cta.note && (
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/55">
                  {cta.note}
                </p>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default FormatPage;
