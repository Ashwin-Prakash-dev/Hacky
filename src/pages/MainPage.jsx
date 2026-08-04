import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GoogleOneTap from "../components/ui/GoogleOneTap";
import CustomCursor from "../components/ui/CustomCursor";
import ScrollProgress from "../components/ui/ScrollProgress";
import NavBar from "../components/sections/Navbar";
import Hero from "../components/sections/Hero";
import LiquidLens from "../components/ui/LiquidLens";
import SponsorsSection from "../components/sections/SponsorsSection";
import Marquee from "../components/ui/Marquee";
import TerminalBridge from "../components/ui/TerminalBridge";
import Briefing from "../components/sections/Briefing";
import Prizes from "../components/sections/Prizes";
import DomainsPreview from "../components/sections/DomainsPreview";
import Timeline from "../components/sections/Timeline";
import FAQ from "../components/sections/FAQ";
import Contact from "../components/sections/Contact";
import Footer from "../components/sections/Footer";
import VideoCards from "../components/sections/VideoCards";
import StudentHook from "../components/sections/StudentHook";
import { usePageMeta } from "../lib/seo";

const MainPage = () => {
  usePageMeta({ path: "/" });
  const { hash } = useLocation();
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

  // Sections of this page are linked from other routes as /#faq. Lenis owns
  // the scroll, so the jump goes through it rather than native smooth
  // scrolling, which the two would otherwise fight over.
  useEffect(() => {
    if (!hash) return undefined;
    const el = document.getElementById(hash.slice(1));
    if (!el) return undefined;
    const id = requestAnimationFrame(() => {
      if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -80, duration: 0.9 });
      else el.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [hash]);

  return (
    <>
      <ScrollProgress />
      {/* <CustomCursor /> */}
      <GoogleOneTap />
      <main className="relative min-h-screen w-screen overflow-x-clip">
        <NavBar />
        {/* the site-wide x-ray lens blob chasing the cursor */}
        <LiquidLens />
        <Hero />
        <SponsorsSection />
        <Prizes />
        {/* <Briefing /> */}
        <DomainsPreview />
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
