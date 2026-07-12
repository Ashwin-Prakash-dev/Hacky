import { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import Intro from "./components/Intro";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import NavBar from "./components/Navbar";
import Hero from "./components/Hero";
import SponsorStrip from "./components/SponsorStrip";
import Stats from "./components/Stats";
import Marquee from "./components/Marquee";
import TerminalBridge from "./components/TerminalBridge";
import Timeline from "./components/Timeline";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Sponsors from "./components/Sponsors";
import VideoCards from "./components/VideoCards";
import StudentHook from "./components/StudentHook";
import ApplyPage from "./components/apply/ApplyPage";
import LoginPage from "./components/apply/pages/LoginPage";
import SignupPage from "./components/apply/pages/SignupPage";

function MainPage() {
  const [introComplete, setIntroComplete] = useState(false);
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
      <CustomCursor />
      {!introComplete && <Intro onComplete={() => setIntroComplete(true)} />}
      <main className="relative min-h-screen w-screen overflow-x-clip">
        <NavBar />
        <Hero />
        <SponsorStrip />
        <VideoCards />
        <Stats />
        <StudentHook />
        <Marquee />
        <TerminalBridge />
        <Timeline />
        <FAQ />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/sponsors" element={<><CustomCursor /><Sponsors /></>} />
      <Route path="/apply" element={<ApplyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}

export default App;