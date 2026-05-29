import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Intro from "./components/Intro";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import NavBar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Marquee from "./components/Marquee";
import Timeline from "./components/Timeline";
import TerminalBridge from "./components/TerminalBridge";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Sponsors from "./components/Sponsors";
import VideoCards from "./components/VideoCards";

function MainPage() {
  const [introComplete, setIntroComplete] = useState(false);
  return (
    <>
      <ScrollProgress />
      <CustomCursor />
      {!introComplete && <Intro onComplete={() => setIntroComplete(true)} />}
      <main className="relative min-h-screen w-screen overflow-x-clip">
        <NavBar />
        <Hero />
        <VideoCards />
        <Stats />
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
      <Route path="/sponsors" element={<Sponsors />} />
    </Routes>
  );
}

export default App;