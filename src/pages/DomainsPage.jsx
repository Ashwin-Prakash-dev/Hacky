import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { ArrowUpRight } from "lucide-react";
import { ANALYTICS_APPENDIX, DOMAINS, EXPECTATIONS } from "../lib/domains";
import DomainCard from "../components/domains/DomainCard";
import DomainDetail from "../components/domains/DomainDetail";
import DomainComparison from "../components/domains/DomainComparison";
import ExpectationsSection from "../components/domains/ExpectationsSection";
import AppendixSection from "../components/domains/AppendixSection";
import ScrollProgress from "../components/ScrollProgress";
import Footer from "../components/Footer";
import { usePageMeta } from "../lib/seo";

gsap.registerPlugin(ScrollTrigger, Flip);

// /domains — the picker: intro, comparison matrix, domain cards, shared
// expectations, appendix. /domains/:slug — one domain expanded into a
// long-form brief. One component serves both routes so selection is pure
// URL state: deep links, back/forward and Escape all resolve the same way.
//
// The card→page expansion is a Flip morph between the card panel and the
// detail hero panel (they share a data-flip-id). While it runs, the detail
// lives in a fixed overlay above the picker; once settled it re-renders in
// normal document flow and the picker is hidden. Collapse reverses it.
// Reduced motion skips the morphs entirely. Selecting a domain from the
// comparison matrix reuses the same morph — it just scrolls the matching
// card into place first, then hands off to the same expand path a direct
// card click takes.
const DomainsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const domain = slug ? DOMAINS.find((d) => d.slug === slug) : null;

  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // 'picker' | 'expanding' | 'detail' | 'switching' | 'collapsing'
  const [phase, setPhase] = useState(() => (domain ? "detail" : "picker"));
  const [shownDomain, setShownDomain] = useState(domain);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const shownRef = useRef(shownDomain);
  shownRef.current = shownDomain;

  const lenisRef = useRef(null);
  const pickerHeroRef = useRef(null);
  const comparisonRef = useRef(null);
  const expectationsRef = useRef(null);
  const appendixRef = useRef(null);
  const cardWrapperRefs = useRef({});
  const cardPanelRefs = useRef({});
  const heroPanelRef = useRef(null);
  const detailRootRef = useRef(null);
  const backdropRef = useRef(null);
  const flipStateRef = useRef(null);
  const timelineRef = useRef(null);
  const returnFocusSlugRef = useRef(null);
  const pendingDomainRef = useRef(null);
  const enteredViaSwitchRef = useRef(false);

  usePageMeta(
    domain
      ? { title: domain.title, description: domain.hook, path: `/domains/${domain.slug}` }
      : {
          title: "Choose your domain",
          description:
            "The four Startathon challenge domains — who each one serves, problems worth 30 hours, and how submissions are judged.",
          path: "/domains",
        }
  );

  // Smooth scroll for this page, same recipe as MainPage.
  useEffect(() => {
    // Router navigation keeps the previous page's scroll offset, so arriving
    // from mid-homepage would drop you mid-brief. Reset before Lenis reads it.
    window.scrollTo(0, 0);
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();
    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  const scrollTop = (immediate = true) => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate, force: true });
    else window.scrollTo(0, 0);
  };

  // Every element that fades as a group when a domain expands or collapses:
  // the hero intro plus the comparison, expectations and appendix sections
  // flanking the card grid. The grid's own cards animate separately (blur +
  // scale) so the picker keeps its one signature move on the cards alone.
  const auxEls = () =>
    [pickerHeroRef.current, comparisonRef.current, expectationsRef.current, appendixRef.current].filter(
      Boolean
    );

  const resetPickerVisuals = () => {
    const els = [
      ...auxEls(),
      ...Object.values(cardWrapperRefs.current),
      ...Object.values(cardPanelRefs.current),
    ].filter(Boolean);
    if (els.length) gsap.set(els, { clearProps: "all" });
  };

  // URL is the source of truth: react to slug changes by entering the
  // matching phase. A running transition is killed and reconciled.
  useEffect(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;

    if (domain) {
      // Domain → domain while already reading a brief: a crossfade, not a
      // Flip morph (there's no card box to morph from).
      const isSwitch =
        phaseRef.current === "detail" &&
        shownRef.current &&
        shownRef.current.slug !== domain.slug;

      if (isSwitch && !reduced) {
        pendingDomainRef.current = domain;
        setPhase("switching");
        return;
      }

      setShownDomain(domain);
      if (isSwitch) {
        // Reduced motion: phase is already "detail", so the settle effect
        // won't re-run — reset scroll here or the new brief opens mid-page.
        scrollTop();
        return;
      }
      if (phaseRef.current === "picker" && flipStateRef.current && !reduced) {
        setPhase("expanding");
      } else {
        flipStateRef.current = null;
        setPhase("detail");
      }
    } else if (phaseRef.current === "detail" && shownRef.current && !reduced) {
      returnFocusSlugRef.current = shownRef.current.slug;
      setPhase("collapsing");
    } else {
      returnFocusSlugRef.current = shownRef.current?.slug ?? null;
      resetPickerVisuals();
      setShownDomain(null);
      setPhase("picker");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Expand: morph the captured card box into the detail hero panel while
  // the rest of the picker recedes.
  useLayoutEffect(() => {
    if (phase !== "expanding" || !shownDomain) return undefined;
    const cardEl = cardPanelRefs.current[shownDomain.slug];
    const state = flipStateRef.current;
    flipStateRef.current = null;
    if (!cardEl || !state || !heroPanelRef.current) {
      setPhase("detail");
      return undefined;
    }

    lenisRef.current?.stop();
    const siblings = Object.entries(cardWrapperRefs.current)
      .filter(([s, el]) => s !== shownDomain.slug && el)
      .map(([, el]) => el);
    const heroFadeEls = heroPanelRef.current.querySelectorAll("[data-hero-fade]");
    // Below sm the hero panel no longer covers the viewport, so the brief
    // underneath it would be visible through the morph — fade it in behind.
    const briefBody = detailRootRef.current?.querySelectorAll("[data-brief-body]");

    gsap.set(cardEl, { autoAlpha: 0 });
    if (briefBody?.length) gsap.set(briefBody, { autoAlpha: 0 });
    const tl = gsap.timeline({ onComplete: () => setPhase("detail") });
    if (briefBody?.length) {
      tl.to(briefBody, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.6);
    }
    tl.to(siblings, { autoAlpha: 0, scale: 0.94, filter: "blur(10px)", duration: 0.55, ease: "power2.out", stagger: 0.05 }, 0);
    tl.to(auxEls(), { autoAlpha: 0, y: -24, duration: 0.5, ease: "power2.out" }, 0);
    tl.to(backdropRef.current, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, 0.1);
    tl.add(
      Flip.from(state, {
        targets: heroPanelRef.current,
        scale: true,
        duration: 0.95,
        ease: "power4.inOut",
      }),
      0.05
    );
    tl.fromTo(
      heroFadeEls,
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06 },
      0.5
    );
    timelineRef.current = tl;
    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Switch: fade the current brief out, swap in the next one, and let the
  // settle effect scroll to top and stagger it back in.
  useLayoutEffect(() => {
    if (phase !== "switching") return undefined;
    const next = pendingDomainRef.current;
    const root = detailRootRef.current;
    if (!next || !root) {
      if (next) setShownDomain(next);
      pendingDomainRef.current = null;
      setPhase("detail");
      return undefined;
    }

    lenisRef.current?.stop();
    const tl = gsap.timeline({
      onComplete: () => {
        enteredViaSwitchRef.current = true;
        setShownDomain(next);
        pendingDomainRef.current = null;
        setPhase("detail");
      },
    });
    tl.to(root, { autoAlpha: 0, y: -18, duration: 0.32, ease: "power2.in" });
    timelineRef.current = tl;
    return () => tl.kill();
  }, [phase]);

  // Collapse: morph the hero panel back down into its card slot while the
  // picker returns underneath.
  useLayoutEffect(() => {
    if (phase !== "collapsing" || !shownDomain) return undefined;
    const cardEl = cardPanelRefs.current[shownDomain.slug];
    if (!cardEl || !heroPanelRef.current || !backdropRef.current) {
      resetPickerVisuals();
      setShownDomain(null);
      setPhase("picker");
      return undefined;
    }

    lenisRef.current?.stop();
    scrollTop();
    const wrappers = Object.values(cardWrapperRefs.current).filter(Boolean);
    const siblings = Object.entries(cardWrapperRefs.current)
      .filter(([s, el]) => s !== shownDomain.slug && el)
      .map(([, el]) => el);
    const heroFadeEls = heroPanelRef.current.querySelectorAll("[data-hero-fade]");
    const briefBody = detailRootRef.current?.querySelectorAll("[data-brief-body]");
    const aux = auxEls();

    if (briefBody?.length) gsap.set(briefBody, { autoAlpha: 0 });
    gsap.set(backdropRef.current, { autoAlpha: 1 });
    gsap.set(wrappers, { y: 0, rotation: 0 });
    gsap.set(aux, { autoAlpha: 0, y: -24 });
    gsap.set(siblings, { autoAlpha: 0, scale: 0.94, filter: "blur(10px)" });
    gsap.set(cardEl, { autoAlpha: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        setShownDomain(null);
        setPhase("picker");
      },
    });
    tl.to(heroFadeEls, { autoAlpha: 0, y: 12, duration: 0.3, ease: "power2.in" }, 0);
    tl.add(
      Flip.fit(heroPanelRef.current, cardEl, {
        scale: true,
        duration: 0.85,
        ease: "power4.inOut",
      }),
      0.08
    );
    tl.to(backdropRef.current, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0.15);
    tl.to(aux, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, 0.3);
    tl.to(siblings, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out", stagger: 0.05 }, 0.3);
    tl.to(heroPanelRef.current, { autoAlpha: 0, duration: 0.16, ease: "power1.out" }, 0.78);
    tl.to(cardEl, { autoAlpha: 1, duration: 0.22, ease: "power1.out" }, 0.8);
    timelineRef.current = tl;
    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Settle bookkeeping for both stable phases.
  useLayoutEffect(() => {
    if (phase === "detail") {
      scrollTop();
      // Strip inline residue a finished (or killed) morph left behind —
      // including a switch fade-out that was interrupted mid-flight.
      if (detailRootRef.current) {
        gsap.set(detailRootRef.current, { clearProps: "opacity,visibility,transform" });
        const briefBody = detailRootRef.current.querySelectorAll("[data-brief-body]");
        if (briefBody.length) gsap.set(briefBody, { clearProps: "opacity,visibility" });
      }
      if (heroPanelRef.current) {
        gsap.set(heroPanelRef.current, { clearProps: "all" });
        gsap.set(heroPanelRef.current.querySelectorAll("[data-hero-fade]"), { clearProps: "all" });
        heroPanelRef.current.focus({ preventScroll: true });
      }
      if (enteredViaSwitchRef.current) {
        enteredViaSwitchRef.current = false;
        const fadeEls = heroPanelRef.current?.querySelectorAll("[data-hero-fade]");
        if (fadeEls?.length) {
          gsap.fromTo(
            fadeEls,
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.06 }
          );
        }
      }
      lenisRef.current?.start();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    } else if (phase === "picker") {
      resetPickerVisuals();
      if (returnFocusSlugRef.current) {
        cardPanelRefs.current[returnFocusSlugRef.current]?.focus({ preventScroll: true });
        returnFocusSlugRef.current = null;
      }
      lenisRef.current?.start();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }, [phase]);

  const handleSelect = (dom, panelEl) => {
    if (phaseRef.current !== "picker") return;
    if (!reduced && panelEl) flipStateRef.current = Flip.getState(panelEl);
    navigate(`/domains/${dom.slug}`);
  };

  // Entry point for the comparison matrix: scroll the matching card into
  // place first (it may be off-screen), then hand off to the exact same
  // Flip-based expand path a direct card click takes.
  const handleExplore = (dom) => {
    if (phaseRef.current !== "picker") return;
    const cardEl = cardPanelRefs.current[dom.slug];
    if (!cardEl) {
      navigate(`/domains/${dom.slug}`);
      return;
    }
    if (reduced || !lenisRef.current) {
      navigate(`/domains/${dom.slug}`);
      return;
    }
    lenisRef.current.scrollTo(cardEl, {
      offset: -140,
      duration: 0.9,
      onComplete: () => {
        flipStateRef.current = Flip.getState(cardEl);
        navigate(`/domains/${dom.slug}`);
      },
    });
  };

  // Jump straight from one brief to the next without returning to the picker.
  const handleSwitch = (dom) => {
    if (phaseRef.current !== "detail" || dom.slug === shownRef.current?.slug) return;
    navigate(`/domains/${dom.slug}`);
  };

  const handleBack = () => {
    if (phaseRef.current !== "detail") return;
    const lenis = lenisRef.current;
    if (!reduced && lenis && window.scrollY > window.innerHeight * 0.5) {
      lenis.scrollTo(0, { duration: 0.5, onComplete: () => navigate("/domains") });
    } else {
      navigate("/domains");
    }
  };

  useEffect(() => {
    if (phase !== "detail") return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") handleBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (slug && !domain) return <Navigate to="/domains" replace />;

  const isPicker = phase === "picker";
  const isDetailSettled = phase === "detail";
  // "switching" stays in normal document flow so the crossfade doesn't
  // yank the article into a fixed overlay mid-tween.
  const inDetailFlow = phase === "detail" || phase === "switching";

  const shownIndex = shownDomain ? DOMAINS.findIndex((d) => d.slug === shownDomain.slug) : -1;
  const prevDomain = shownIndex >= 0 ? DOMAINS[(shownIndex - 1 + DOMAINS.length) % DOMAINS.length] : null;
  const nextDomain = shownIndex >= 0 ? DOMAINS[(shownIndex + 1) % DOMAINS.length] : null;

  return (
    <>
      <ScrollProgress />
      <main className="relative min-h-dvh w-screen overflow-x-clip bg-[#050505]">
        <header className="nav-shell">
          <div className="nav-island">
            <Link to="/" className="nav-logo">
              Startathon<span className="nav-logo-dot">.</span>
            </Link>
            <div className="hidden items-center md:flex">
              <Link to="/" className="nav-link">
                Back to site
              </Link>
            </div>
            <Link to="/apply" className="nav-cta group">
              <span className="relative inline-flex overflow-hidden">
                <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
                  Apply
                </span>
                <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
                  Apply
                </span>
              </span>
              <span className="nav-cta-icon" aria-hidden="true">
                <ArrowUpRight size={13} strokeWidth={2.25} />
              </span>
            </Link>
          </div>
        </header>

        {/* ── Picker: intro → comparison → domain cards → expectations → appendix ── */}
        <section
          hidden={inDetailFlow}
          aria-hidden={!isPicker}
          className={!isPicker ? "pointer-events-none" : undefined}
        >
          <div ref={pickerHeroRef} className="container mx-auto px-5 pb-4 pt-36 md:px-10 md:pt-44">
            <span className="eyebrow mb-6">Domain briefs</span>
            <h1 className="special-font max-w-[12ch] font-display text-[clamp(2.6rem,7vw,5.25rem)] leading-[0.95] tracking-[-0.03em] text-white">
              Choose your d<b>o</b>main<b>.</b>
            </h1>
            <p className="mt-6 max-w-xl font-general text-base leading-[1.8] text-white/75 md:text-lg">
              Startathon is a problem-first event. The four domains below are opportunity
              areas, not fixed problem statements — understand how they differ before you
              pick where your idea belongs.
            </p>
          </div>

          <DomainComparison ref={comparisonRef} domains={DOMAINS} active={isPicker} onExplore={handleExplore} />

          <div className="container mx-auto grid items-start gap-5 px-5 pb-24 pt-16 md:grid-cols-2 md:gap-7 md:px-10 md:pb-32 md:pt-20">
            {DOMAINS.map((d, i) => (
              <DomainCard
                key={d.slug}
                domain={d}
                className={i % 2 === 1 ? "md:mt-14" : undefined}
                floatActive={isPicker}
                motionOK={!reduced}
                onSelect={handleSelect}
                wrapperRef={(el) => (cardWrapperRefs.current[d.slug] = el)}
                panelRef={(el) => (cardPanelRefs.current[d.slug] = el)}
              />
            ))}
          </div>

          <ExpectationsSection ref={expectationsRef} items={EXPECTATIONS} active={isPicker} />
          <AppendixSection ref={appendixRef} appendix={ANALYTICS_APPENDIX} active={isPicker} />
        </section>

        {/* ── Detail: fixed overlay while morphing, normal flow once settled ── */}
        {shownDomain && (
          <div
            ref={detailRootRef}
            className={inDetailFlow ? "relative" : "fixed inset-0 z-40 overflow-hidden"}
          >
            {!inDetailFlow && (
              <div
                ref={backdropRef}
                className="pointer-events-none absolute inset-0 bg-[#050505] opacity-0"
              />
            )}
            <DomainDetail
              domain={shownDomain}
              settled={isDetailSettled}
              heroPanelRef={heroPanelRef}
              onBack={handleBack}
              prev={prevDomain}
              next={nextDomain}
              onNavigate={handleSwitch}
            />
          </div>
        )}

        <Footer />
      </main>
    </>
  );
};

export default DomainsPage;
