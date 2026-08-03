import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useWindowScroll } from "react-use";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { ArrowUpRight } from "lucide-react";
import { DOMAINS } from "../lib/domains";
import DomainCard from "../components/domains/DomainCard";
import DomainDetail from "../components/domains/DomainDetail";
import ScrollProgress from "../components/ScrollProgress";
import Footer from "../components/Footer";
import { usePageMeta } from "../lib/seo";

gsap.registerPlugin(ScrollTrigger, Flip);

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

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
  const navigate = useNavigate();
  const domain = slug ? DOMAINS.find((d) => d.slug === slug) : null;
  const { y: scrollY } = useWindowScroll();

  // Tracked live: the OS setting can change while the page is open, and every
  // morph, drift and reveal on this page keys off it.
  const [reduced, setReduced] = useState(
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // 'picker' | 'expanding' | 'detail' | 'collapsing'
  const [phase, setPhase] = useState(() => (domain ? "detail" : "picker"));
  const [shownDomain, setShownDomain] = useState(domain);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const shownRef = useRef(shownDomain);
  shownRef.current = shownDomain;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const lenisRef = useRef(null);
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
            "The four Startathon challenge domains — who each one serves, problems worth 30 hours, and how submissions are judged.",
          path: "/domains",
        }
  );

  // Smooth scroll for this page, same recipe as MainPage. Reduced motion gets
  // native scrolling: Lenis still drives ScrollTrigger, just without easing.
  useEffect(() => {
    const lenis = new Lenis({ lerp: reduced ? 1 : 0.08, smoothWheel: !reduced });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();
    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(raf);
    };
  }, [reduced]);

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
      if (phaseRef.current === "picker" && flipStateRef.current && !reducedRef.current) {
        setPhase("expanding");
      } else {
        flipStateRef.current = null;
        setPhase("detail");
      }
    } else if (phaseRef.current === "detail" && shownRef.current && !reducedRef.current) {
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
  }, [phase]);

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
      <div className="relative min-h-dvh w-full overflow-x-clip bg-[#050505]">
        <header className="nav-shell">
          <nav
            aria-label="Primary"
            className={`nav-island ${scrollY > 10 ? "nav-island--scrolled" : ""}`}
          >
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
              <span className="cta-pill-icon" aria-hidden="true">
                <ArrowUpRight size={15} strokeWidth={2.25} />
              </span>
            </Link>
          </nav>
        </header>

        <main className="relative">
          {/* ── Picker ──────────────────────────────────────────────────── */}
          {/* `inert` keeps keyboard focus out of the field while it is fading
              or fully replaced by the detail view — aria-hidden alone leaves
              the card links tabbable. */}
          <section
            hidden={isDetailSettled}
            aria-labelledby="domains-title"
            aria-hidden={!isPicker || undefined}
            inert={isPicker ? undefined : ""}
            className={!isPicker ? "pointer-events-none" : undefined}
          >
            <div ref={pickerHeroRef} className="container mx-auto px-5 pb-4 pt-36 md:px-10 md:pt-44">
              <span className="eyebrow mb-6">Domain briefs</span>
              <h1
                id="domains-title"
                className="special-font max-w-[12ch] font-display text-[clamp(2.6rem,7vw,5.25rem)] leading-[0.95] tracking-[-0.03em] text-white"
              >
                Choose your d<b>o</b>main<b>.</b>
              </h1>
              <p className="mt-6 max-w-xl font-general text-base leading-[1.8] text-white/75 md:text-lg">
                Projects may draw on more than one domain. Open each brief, then pick the
                single domain that best represents your central problem — and the primary
                outcome you intend to improve.
              </p>
            </div>
            <ul
              role="list"
              className="container mx-auto grid items-start gap-5 px-5 pb-24 pt-10 md:grid-cols-2 md:gap-7 md:px-10 md:pb-32"
            >
              {DOMAINS.map((d, i) => (
                <DomainCard
                  key={d.slug}
                  domain={d}
                  className={i % 2 === 1 ? "md:mt-14" : undefined}
                  floatActive={isPicker}
                  motionOK={!reduced}
                  onSelect={handleSelect}
                  wrapperRef={(el) => {
                    cardWrapperRefs.current[d.slug] = el;
                  }}
                  panelRef={(el) => {
                    cardPanelRefs.current[d.slug] = el;
                  }}
                />
              ))}
            </ul>
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
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DomainsPage;
