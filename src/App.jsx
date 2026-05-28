import { useState } from "react";
import Intro from "./components/Intro";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import NavBar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import About from "./components/About";
import Marquee from "./components/Marquee";
import Timeline from "./components/Timeline";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      <ScrollProgress />
      <CustomCursor />
      {!introComplete && <Intro onComplete={() => setIntroComplete(true)} />}
      <main className="relative min-h-screen w-screen overflow-x-clip">
        <NavBar />
        <Hero />
        <Stats />
        <About />
        <Marquee />
        <Timeline />
        <FAQ />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

export default App;