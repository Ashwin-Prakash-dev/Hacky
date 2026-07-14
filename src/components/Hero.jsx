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

  const facts = [
    "SCTCE · Trivandrum",
    "30 hrs non-stop",
    "20 curated teams",
    "₹2L+ prize pool",
  ];

  return (
    <section
      aria-label="Startathon — Kerala's most curated 30-hour hackathon"
      className="relative h-dvh w-screen overflow-x-hidden"
    >
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
          src="videos/hero-1.webm"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          className="absolute left-0 top-0 size-full object-cover object-center"
          style={{ opacity: 0.55 }}
          onLoadedData={() => setLoading(false)}
        />

        <div className="hero-vignette" />

        <div className="absolute left-0 top-0 z-40 flex size-full items-center sm:items-start">
          <div className="w-full px-5 sm:mt-24 sm:px-10">
            <div className="hero-badge mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1">
              <span className="hero-badge-dot" />
              <span className="hero-badge-text font-general uppercase tracking-widest">
                Kerala · Limited teams only
              </span>
            </div>

            <h1 className="hero-heading text-blue-100">
              Startathon<span className="hero-dot">.</span>
              <span className="sr-only">
                {" "}— Kerala&rsquo;s most curated 30-hour hackathon at SCTCE,
                Thiruvananthapuram
              </span>
            </h1>

            <p className="hero-sub mb-5 max-w-sm font-general text-base text-blue-50">
              30 hours. Ship something real.
              <br />
              Not everyone gets in.
            </p>

            <div className="mb-6 flex max-w-md flex-wrap items-center gap-2">
              {facts.map((fact) => (
                <span
                  key={fact}
                  className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-general text-[10px] uppercase tracking-widest text-blue-50/80 backdrop-blur-sm"
                >
                  {fact}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a href="/apply" style={{ textDecoration: "none", display: "inline-block" }}>
                <button className="group relative z-10 flex w-fit cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-[#C8FF00] px-7 py-3 text-black">
                  <span className="relative inline-flex overflow-hidden font-general text-xs uppercase">
                    <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">
                      Apply Now
                    </div>
                    <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                      Apply Now
                    </div>
                  </span>
                  <TiLocationArrow />
                </button>
              </a>

              <a
                href="#what-is-it"
                className="font-general text-xs uppercase tracking-widest text-blue-50/70 underline-offset-4 transition hover:text-[#C8FF00] hover:underline"
              >
                What is Startathon?
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
