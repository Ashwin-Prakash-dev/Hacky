import { useState } from "react";
import Intro from "./components/Intro";
import CustomCursor from "./components/CustomCursor";
import NavBar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Timeline from "./components/timeline";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      <CustomCursor />
      {!introComplete && <Intro onComplete={() => setIntroComplete(true)} />}
      <main className="relative min-h-screen w-screen overflow-x-clip">
        <NavBar />
        <Hero />
        <About />
        <Features />
        <Timeline />
        <FAQ />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

export default App;