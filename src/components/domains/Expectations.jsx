import { Ban } from "lucide-react";
import { ANALYTICS_APPENDIX, EXPECTATIONS } from "../../lib/domains";

// The standards that sit above all four domains, anchored at #expectations
// so every brief can link back to it. Deliberately unanimated: the picker's
// floating cards are this page's one motion moment, and these sections live
// inside the picker's `hidden` wrapper, where ScrollTriggers would need
// refreshing on every expand/collapse.
//
// Appendix A is a native <details> — it only concerns teams building
// on-demand analytics, so it stays collapsed for everyone else.
const Expectations = () => (
  <>
    <section id="expectations" className="container mx-auto px-5 pt-8 md:px-10 md:pt-16">
      <span className="eyebrow mb-6">Applies to every submission</span>
      <h2 className="max-w-[16ch] text-balance font-display text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
        Read this before you start building.
      </h2>
      <p className="mt-4 max-w-[46rem] font-general text-[1rem] leading-[1.8] text-white/65">
        These six apply in every domain, and judges use them to evaluate every submission
        regardless of what you built.
      </p>

      <div className="mt-12 border-t border-white/[0.06]">
        {EXPECTATIONS.map((e) => (
          <div
            key={e.title}
            className="grid gap-3 border-b border-white/[0.06] py-8 md:grid-cols-[1fr_1.8fr] md:gap-12 md:py-9"
          >
            <h3 className="font-general text-[clamp(1.05rem,1.9vw,1.28rem)] font-extrabold leading-tight tracking-[-0.01em] text-white">
              {e.title}
            </h3>
            <div>
              <p className="font-general text-[0.95rem] leading-[1.78] text-white/70">{e.body}</p>
              {e.note && (
                <p className="mt-3.5 font-general text-[0.88rem] leading-[1.7] text-white/55">
                  {e.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ── Appendix A: on-demand analytics ───────────────────────────────── */}
    <section className="container mx-auto px-5 pb-28 pt-16 md:px-10 md:pb-36">
      <details className="group border-b border-white/[0.06]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-2xl py-7 outline-none focus-visible:shadow-[0_0_0_1px_rgba(200,255,0,0.6)] [&::-webkit-details-marker]:hidden">
          <div>
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-white/55">
              Appendix A
            </p>
            <p className="mt-2 max-w-[52ch] font-general text-[1.02rem] leading-[1.55] text-white">
              Extra requirements for solutions that generate analyses on demand
            </p>
          </div>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-[0.9rem] leading-none text-white/55 transition-colors duration-300 group-open:border-lime/40 group-open:text-lime"
            aria-hidden="true"
          >
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">&minus;</span>
          </span>
        </summary>

        <div className="pb-10">
          <p className="max-w-[46rem] font-general text-[0.92rem] leading-[1.75] text-white/55">
            {ANALYTICS_APPENDIX.applies}
          </p>
          <p className="mt-5 max-w-[46rem] font-general text-[0.98rem] leading-[1.8] text-white/75">
            {ANALYTICS_APPENDIX.intro}
          </p>

          <div className="mt-10 border-t border-white/[0.06]">
            {ANALYTICS_APPENDIX.criteria.map((c) => (
              <div
                key={c.label}
                className="grid gap-2 border-b border-white/[0.06] py-5 md:grid-cols-[1fr_2.2fr] md:gap-12"
              >
                <h4 className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-lime/80">
                  {c.label}
                </h4>
                <p className="font-general text-[0.92rem] leading-[1.7] text-white/65">{c.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-14">
            <div>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-white/55">
                Not sufficient on its own
              </p>
              <ul className="mt-5 grid gap-3">
                {ANALYTICS_APPENDIX.notSufficient.map((n) => (
                  <li
                    key={n}
                    className="flex gap-3 font-general text-[0.92rem] leading-[1.6] text-white/70"
                  >
                    <Ban
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="mt-[0.3em] shrink-0 text-white/45"
                    />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-lime/80">
                Additional measures
              </p>
              <ul className="mt-5 grid gap-3">
                {ANALYTICS_APPENDIX.measures.map((m) => (
                  <li
                    key={m}
                    className="flex gap-3 font-general text-[0.92rem] leading-[1.6] text-white/70"
                  >
                    <span className="mt-[0.6em] size-[5px] shrink-0 rounded-full bg-lime shadow-[0_0_6px_rgba(200,255,0,0.8)]" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </details>
    </section>
  </>
);

export default Expectations;
