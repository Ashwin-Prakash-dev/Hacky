import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
      },
    });

    clipAnimation.to(".mask-clip-path", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
    });
  });

  return (
    <section id="about" className="about-section min-h-screen w-screen">
      <div className="about-lead relative flex h-[140vh] flex-col items-center justify-center gap-5">

        {/* Kicker */}
        <p
          style={{
            fontFamily: "var(--font-general, sans-serif)",
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(17,17,17,0.35)",
            marginBottom: "0.25rem",
          }}
        >
          Our philosophy
        </p>

        <AnimatedTitle
          title="A platform for turning <br /> Projects into products"
          containerClass="mt-2 !text-black text-center"
        />

        <div className="about-subtext">

        </div>
      </div>

      <div className="h-dvh w-screen" id="clip">
        <div className="mask-clip-path about-image">
          <img
            src="img/about.webp"
            alt="Background"
            className="absolute left-0 top-0 size-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default About;