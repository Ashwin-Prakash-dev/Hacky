import { useEffect } from "react";
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
import Timeline from "../components/sections/Timeline";
import FAQ from "../components/sections/FAQ";
import Contact from "../components/sections/Contact";
import Footer from "../components/sections/Footer";
import VideoCards from "../components/sections/VideoCards";
import StudentHook from "../components/sections/StudentHook";
import { usePageMeta } from "../lib/seo";

const MainPage = () => {
  usePageMeta({ path: "/" });

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
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
