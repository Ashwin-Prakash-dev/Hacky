import { useState } from "react";
import Intro from "./components/Intro";
import CustomCursor from "./components/CustomCursor";
import NavBar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Story from "./components/Story";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      <CustomCursor />
      {!introComplete && <Intro onComplete={() => setIntroComplete(true)} />}
      <main className="relative min-h-screen w-screen overflow-x-hidden">
        <NavBar />
        <Hero introComplete={introComplete} />
        <About />
        <Features />
        <Story />
        <FAQ />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

export default App;
