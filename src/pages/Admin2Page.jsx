import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Timer } from "lucide-react";
import Hero from "../components/sections/Hero";
import LaunchClock from "../components/admin/LaunchClock";
import { usePageMeta } from "../lib/seo";

// The launch console. One viewport, no scroll, no backend: the site's own
// hero with a single extra control. Pressing it runs the hero's mosaic
// dissolve on a timeline instead of a scrub — the video comes apart bottom-up
// and hands the frame to a clock counting down to doors at 10:30.
//
// The armed target is banked in localStorage so a refresh mid-countdown
// resumes where it left off rather than resetting the hall's clock. That is
// the one piece of state on this page that has to survive.

const DOORS_HOUR = 10;
const DOORS_MINUTE = 30;
const STORE_KEY = "startathon.launch.target";

// 30 hours of event plus a margin. A target older than this belongs to a
// hackathon that has already ended, so the console comes back up standing by
// rather than showing a three-day-old T+ that no longer fits the readout.
const STALE_AFTER_MS = 36 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, "0");
const DOORS_LABEL = `${pad(DOORS_HOUR)}:${pad(DOORS_MINUTE)}`;

// The next 10:30 on the wall clock — today's if it has not passed,
// tomorrow's if it has.
const nextDoors = (from = new Date()) => {
  const t = new Date(from);
  t.setHours(DOORS_HOUR, DOORS_MINUTE, 0, 0);
  if (t <= from) t.setDate(t.getDate() + 1);
  return t;
};

const readStored = () => {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const ms = Number(raw);
    if (!Number.isFinite(ms)) return null;
    if (Date.now() - ms > STALE_AFTER_MS) {
      window.localStorage.removeItem(STORE_KEY);
      return null;
    }
    return ms;
  } catch {
    return null;
  }
};

const writeStored = (ms) => {
  try {
    if (ms === null) window.localStorage.removeItem(STORE_KEY);
    else window.localStorage.setItem(STORE_KEY, String(ms));
  } catch {
    // private mode / blocked storage: the countdown still runs, it just
    // will not survive a refresh
  }
};

const Admin2Page = () => {
  usePageMeta({
    title: "Launch control",
    description:
      "The console that opens Startathon. Launch the countdown and it runs to doors at 10:30.",
    path: "/admin2",
    noindex: true,
  });

  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const rootRef = useRef(null);
  const [target, setTarget] = useState(readStored);

  // The dissolve, driven by this page rather than by scroll: GSAP tweens the
  // ref itself, which the hero's shader reads every frame. Launch and abort
  // move the same property of the same object, so `overwrite: auto` kills
  // whichever is mid-flight rather than letting two of them write it on
  // alternating frames. Armed on load means the hero is already gone — start
  // at 1 so nothing flashes through before the first frame.
  const progressRef = useRef(target === null ? 0 : 1);

  // The two pieces of the hero that have to clear the frame. Only opacity and
  // visibility are ever animated on them: the badge disc writes its own
  // transform every frame from inside the hero, and a GSAP transform here
  // would be overwritten mid-tween.
  const heroLayers = () => {
    const overlay = rootRef.current?.querySelector("[data-hero-overlay]");
    // the disc is portaled to <body>, so it lives outside this root
    const disc = document.querySelector(".hero-disc");
    return [overlay, disc].filter(Boolean);
  };

  // Armed on load: put the hero away before the first paint. autoAlpha also
  // sets visibility, which takes the hidden CTA out of the tab order rather
  // than leaving an invisible button under the clock.
  const { contextSafe } = useGSAP(
    () => {
      if (target !== null) gsap.set(heroLayers(), { autoAlpha: 0 });
    },
    { scope: rootRef },
  );

  // contextSafe, so the transition's tweens belong to this component's GSAP
  // context and are reverted with it — navigating away mid-dissolve must not
  // leave one running against a detached hero.
  const launch = contextSafe(() => {
    const t = nextDoors().getTime();
    writeStored(t);

    if (reduced) {
      progressRef.current = 1;
      gsap.set(heroLayers(), { autoAlpha: 0 });
      setTarget(t);
      return;
    }

    gsap
      .timeline({ defaults: { overwrite: "auto" } })
      .to(heroLayers(), { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, 0)
      .to(progressRef, { current: 1, duration: 1, ease: "power2.inOut" }, 0.05)
      // the clock mounts and rises while the last rows are still coming
      // apart — overlapping the two is what makes it one move rather than
      // a screen change
      .call(() => setTarget(t), null, 0.6);
  });

  const abort = contextSafe(() => {
    writeStored(null);

    if (reduced) {
      progressRef.current = 0;
      setTarget(null);
      gsap.set(heroLayers(), { autoAlpha: 1 });
      return;
    }

    gsap
      .timeline({ defaults: { overwrite: "auto" } })
      .to(
        rootRef.current.querySelector("[data-launch-clock]"),
        { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
        0,
      )
      .to(progressRef, { current: 0, duration: 0.85, ease: "power2.inOut" }, 0.05)
      .call(() => setTarget(null), null, 0.28)
      .to(heroLayers(), { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.4);
  });

  const launchButton = (
    <button
      type="button"
      onClick={launch}
      className="cta-pill cta-pill--wide group outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-4 focus-visible:ring-offset-[#050505]"
    >
      <span className="relative inline-flex overflow-hidden">
        <span className="translate-y-0 skew-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-160%] group-hover:skew-y-12">
          Launch Startathon Countdown
        </span>
        <span className="absolute translate-y-[164%] skew-y-12 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:skew-y-0">
          Launch Startathon Countdown
        </span>
      </span>
      <span className="cta-pill-icon" aria-hidden="true">
        <Timer size={15} strokeWidth={2.25} />
      </span>
    </button>
  );

  return (
    <main
      ref={rootRef}
      className="relative h-dvh w-screen overflow-hidden bg-[#050505]"
    >
      <Hero progressRef={progressRef} cta={launchButton} />
      {target !== null && (
        <LaunchClock
          target={target}
          doorsLabel={DOORS_LABEL}
          onAbort={abort}
          reduced={reduced}
        />
      )}
    </main>
  );
};

export default Admin2Page;
