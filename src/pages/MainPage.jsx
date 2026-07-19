import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Intro from "../components/Intro";
import GoogleOneTap from "../components/GoogleOneTap";
import CustomCursor from "../components/CustomCursor";
import ScrollProgress from "../components/ScrollProgress";
import NavBar from "../components/Navbar";
import Hero from "../components/Hero";
import LiquidLens from "../components/LiquidLens";
import SponsorsSection from "../components/SponsorsSection";
import Marquee from "../components/Marquee";
import TerminalBridge from "../components/TerminalBridge";
import Briefing from "../components/Briefing";
import Prizes from "../components/Prizes";
import Timeline from "../components/Timeline";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import VideoCards from "../components/VideoCards";
import StudentHook from "../components/StudentHook";
import { usePageMeta } from "../lib/seo";

const INTRO_SEEN_KEY = "startathon:intro-seen";

const MainPage = () => {
  usePageMeta({ path: "/" });
  const [introComplete, setIntroComplete] = useState(
    () => sessionStorage.getItem(INTRO_SEEN_KEY) === "1"
  );
  const lenisRef = useRef(null);

  useEffect(() => {
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

  // Keep the page from scrolling behind the fixed intro overlay.
  useEffect(() => {
    if (introComplete) {
      lenisRef.current?.start();
      document.body.style.overflow = "";
    } else {
      lenisRef.current?.stop();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [introComplete]);

  return (
    <>
      <ScrollProgress />
      {/* <CustomCursor /> */}
      {!introComplete && (
        <Intro
          onComplete={() => {
            sessionStorage.setItem(INTRO_SEEN_KEY, "1");
            setIntroComplete(true);
          }}
        />
      )}
      {introComplete && <GoogleOneTap />}
      <main className="relative min-h-screen w-screen overflow-x-clip">
        <NavBar />
        {/* the site-wide x-ray lens blob chasing the cursor */}
        <LiquidLens />
        <Hero />
        <SponsorsSection />
        <Prizes />
        {/* <Briefing /> */}
        <Timeline />
        <VideoCards />
        <StudentHook />
        {/* <Marquee /> */}
        {/* <TerminalBridge /> */}
        <FAQ />
        {/* <Contact /> */}
        <Footer />
      </main>
    </>
  );
};

export default MainPage;
