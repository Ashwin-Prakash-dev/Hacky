import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { TiLocationArrow } from "react-icons/ti";
import { useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [loading, setLoading] = useState(true);

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-black">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-black"
      >
        <video
          src="videos/hero-1.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute left-0 top-0 size-full object-cover object-center"
          style={{ opacity: 0.55 }}
          onLoadedData={() => setLoading(false)}
        />

        <div className="hero-vignette" />

        <div className="absolute left-0 top-0 z-40 size-full flex items-center sm:items-start">
          <div className="px-5 sm:px-10 sm:mt-24 w-full">
            <div className="hero-badge mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1">
              <span className="hero-badge-dot" />
              <span className="font-general uppercase tracking-widest hero-badge-text">
                Applications opening soon · Kerala
              </span>
            </div>

            <h1 className="hero-heading text-blue-100">
              Startathon<span className="hero-dot">.</span>
            </h1>

            <p className="mb-5 max-w-sm font-general text-sm text-blue-50 hero-sub">
              30 hours. Real problems.
              <br />
              Kerala's most curated hackathon for builders.
            </p>

            <a href="#contact" style={{ textDecoration: "none" }}>
              <button className="group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full bg-[#C8FF00] px-7 py-3 text-black flex items-center gap-1">
                <span className="relative inline-flex overflow-hidden font-general text-xs uppercase">
                  <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">
                    Register Interest
                  </div>
                  <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                    Register Interest
                  </div>
                </span>
                <TiLocationArrow />
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
