import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { DOMAINS } from "../lib/domains";
import DomainCard from "../components/domains/DomainCard";
import DomainDetail from "../components/domains/DomainDetail";
import Expectations from "../components/domains/Expectations";
import ScrollProgress from "../components/ScrollProgress";
import NavBar from "../components/Navbar";
import Footer from "../components/Footer";
import { usePageMeta } from "../lib/seo";

gsap.registerPlugin(ScrollTrigger, Flip);

// /domains — the picker field. /domains/:slug — one domain expanded into a
// long-form brief. One component serves both routes so selection is pure
// URL state: deep links, back/forward and Escape all resolve the same way.
//
// The card→page expansion is a Flip morph between the card panel and the
// detail hero panel (they share a data-flip-id). While it runs, the detail
// lives in a fixed overlay above the picker; once settled it re-renders in
// normal document flow and the picker is hidden. Collapse reverses it.
// Reduced motion skips the morphs entirely.
const DomainsPage = () => {
  const { slug } = useParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const domain = slug ? DOMAINS.find((d) => d.slug === slug) : null;

  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // 'picker' | 'expanding' | 'detail' | 'collapsing'
  const [phase, setPhase] = useState(() => (domain ? "detail" : "picker"));
  const [shownDomain, setShownDomain] = useState(domain);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const shownRef = useRef(shownDomain);
  shownRef.current = shownDomain;

  const lenisRef = useRef(null);
  const pickerRootRef = useRef(null);
  const pickerHeroRef = useRef(null);
  const cardWrapperRefs = useRef({});
  const cardPanelRefs = useRef({});
  const heroPanelRef = useRef(null);
  const backdropRef = useRef(null);
  const flipStateRef = useRef(null);
  const timelineRef = useRef(null);
  const returnFocusSlugRef = useRef(null);

  usePageMeta(
    domain
      ? { title: domain.title, description: domain.hook, path: `/domains/${domain.slug}` }
      : {
          title: "Choose your domain",
          description:
            "The four Startathon challenge domains: who each one serves, problems worth 30 hours, and how submissions are judged.",
          path: "/domains",
        }
  );

  // Smooth scroll for this page, same recipe as MainPage.
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;
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

  // Entrance: the hero copy and the card field arrive in one pass on first
  // load. Cards are animated on their outermost wrapper, because the wrapper
  // inside it owns the ambient drift and the <Link> inside that is the Flip
  // morph target. Touching either would fight an existing animation.
  useEffect(() => {
    const els = pickerRootRef.current?.querySelectorAll("[data-enter]") ?? [];
    if (!els.length) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        els,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.07, delay: 0.05 }
      );
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(els, { opacity: 1, y: 0 });
    });
    return () => mm.revert();
  }, []);

  const scrollTop = (immediate = true) => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate, force: true });
    else window.scrollTo(0, 0);
  };

  const resetPickerVisuals = () => {
    const els = [
      pickerHeroRef.current,
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
      setShownDomain(domain);
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

    gsap.set(cardEl, { autoAlpha: 0 });
    const tl = gsap.timeline({ onComplete: () => setPhase("detail") });
    tl.to(siblings, { autoAlpha: 0, scale: 0.94, filter: "blur(10px)", duration: 0.55, ease: "power2.out", stagger: 0.05 }, 0);
    tl.to(pickerHeroRef.current, { autoAlpha: 0, y: -24, duration: 0.5, ease: "power2.out" }, 0);
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

    gsap.set(backdropRef.current, { autoAlpha: 1 });
    gsap.set(wrappers, { y: 0, rotation: 0 });
    gsap.set(pickerHeroRef.current, { autoAlpha: 0, y: -24 });
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
    tl.to(pickerHeroRef.current, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, 0.3);
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
      // Strip inline residue a finished (or killed) morph left behind.
      if (heroPanelRef.current) {
        gsap.set(heroPanelRef.current, { clearProps: "all" });
        gsap.set(heroPanelRef.current.querySelectorAll("[data-hero-fade]"), { clearProps: "all" });
        heroPanelRef.current.focus({ preventScroll: true });
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
    // The slug is a dependency because the prev/next links move between
    // briefs without leaving the 'detail' phase. Without it this never
    // re-runs, and you land partway down the next brief still scrolled to
    // where you were on the last one.
  }, [phase, shownDomain?.slug]);

  // `/domains#expectations` — the link every brief closes with. The picker
  // is hidden while a brief is open and the collapse animation forces the
  // scroll back to the top, so the jump has to wait for the picker phase
  // rather than relying on the browser's native hash handling.
  useEffect(() => {
    if (phase !== "picker" || hash !== "#expectations") return undefined;
    const id = requestAnimationFrame(() => {
      const el = document.getElementById("expectations");
      if (!el) return;
      if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -80, duration: 0.9 });
      else el.scrollIntoView();
    });
    return () => cancelAnimationFrame(id);
  }, [phase, hash]);

  const handleSelect = (dom, panelEl) => {
    if (phaseRef.current !== "picker") return;
    if (!reduced && panelEl) flipStateRef.current = Flip.getState(panelEl);
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

  return (
    <>
      <ScrollProgress />
      <main className="relative min-h-dvh w-screen overflow-x-clip bg-[#050505]">
        <NavBar />

        {/* ── Picker ──────────────────────────────────────────────────── */}
        <section
          ref={pickerRootRef}
          hidden={isDetailSettled}
          aria-hidden={!isPicker}
          className={!isPicker ? "pointer-events-none" : undefined}
        >
          <div ref={pickerHeroRef} className="container mx-auto px-5 pb-4 pt-36 md:px-10 md:pt-44">
            <span data-enter className="eyebrow mb-6 opacity-0">
              Domain briefs
            </span>
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-16">
              <h1
                data-enter
                className="special-font max-w-[12ch] font-display text-[clamp(2.6rem,7vw,5.25rem)] leading-[0.95] tracking-[-0.03em] text-white opacity-0"
              >
                Choose your d<b>o</b>main<b>.</b>
              </h1>
              <div data-enter className="max-w-2xl space-y-5 opacity-0 md:pt-3">
                <p className="font-general text-base leading-[1.8] text-white/85 md:text-lg">
                  Startathon is a problem-first event. You are expected to identify a meaningful
                  problem, understand the people and workflows it affects, and build something
                  testable inside 30 hours.
                </p>
                <p className="font-general text-[0.98rem] leading-[1.8] text-white/60">
                  The four domains below are opportunity areas, not fixed problem statements. Use
                  the examples in each brief as benchmarks for scope and depth: choose one, adapt
                  one to a specific user and setting, or propose a different problem within one of
                  the four domains that is comparable in complexity and real-world significance.
                </p>
                <p className="font-general text-[0.98rem] leading-[1.8] text-white/60">
                  Solutions do not have to use artificial intelligence. Let the problem determine
                  the technology, not the other way around.
                </p>
              </div>
            </div>
            <p
              data-enter
              className="mt-14 max-w-[54rem] font-general text-[0.95rem] leading-[1.8] text-white/55 opacity-0"
            >
              Every brief answers the same five questions in the same order: the outcome it
              improves, who experiences the problem, which problems fit, how success is measured,
              and which ideas won&rsquo;t survive judging. Use them to compare the domains, then choose
              the one whose problems most strongly resonate with your team. Projects may draw on
              more than one domain; pick the single domain that best represents your central
              problem.
            </p>
          </div>
          <div className="container mx-auto grid items-start gap-5 px-5 pb-24 pt-10 md:grid-cols-2 md:gap-7 md:px-10 md:pb-32">
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
          <Expectations />
        </section>

        {/* ── Detail: fixed overlay while morphing, normal flow once settled ── */}
        {shownDomain && (
          <div className={isDetailSettled ? "relative" : "fixed inset-0 z-40 overflow-hidden"}>
            {!isDetailSettled && (
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
            />
          </div>
        )}

        <Footer />
      </main>
    </>
  );
};

export default DomainsPage;
