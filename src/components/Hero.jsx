import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";

import Button from "./Button";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Single video — mark loaded once it can play
  }, []);

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
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg"
        style={{ backgroundColor: "#000000" }}
      >
        <video
          src="videos/hero-1.mp4"
          autoPlay
          loop
          muted
          className="absolute left-0 top-0 size-full object-cover object-center"
          style={{ opacity: 0.55 }}
          onLoadedData={() => setLoading(false)}
        />

        {/* Bottom vignette */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
          background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))",
          zIndex: 30, pointerEvents: "none",
        }} />

        {/* Overlay content */}
        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-24 px-5 sm:px-10">
            {/* Pill badge */}
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1"
              style={{
                borderColor: "rgba(200,255,0,0.25)",
                background: "rgba(200,255,0,0.06)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#C8FF00",
                boxShadow: "0 0 6px rgba(200,255,0,0.8)",
                animation: "pulse 2s infinite",
                flexShrink: 0,
              }} />
              <span
                className="font-general text-xs uppercase tracking-widest"
                style={{ color: "rgba(200,255,0,0.9)", fontSize: "0.62rem" }}
              >
                Applications opening soon · Kerala
              </span>
            </div>

            <h1
              className="hero-heading text-blue-100"
              style={{ lineHeight: 1.1, overflow: "visible", paddingBottom: "0.05em", fontFamily: "'Open Sauce Sans', sans-serif" }}
            >
              Startathon<span style={{ color: "#888888", fontWeight: "inherit", fontSize: "inherit" }}>.</span>
            </h1>

            <p
              className="mb-5 max-w-sm font-general text-sm text-blue-50"
              style={{ opacity: 0.55, lineHeight: 1.75, letterSpacing: "0.01em" }}
            >
              30 hours. Real problems.
              <br />
              Kerala's most curated hackathon.
            </p>

            <Button
              id="notify-btn"
              title="Register Interest"
              rightIcon={<TiLocationArrow />}
              containerClass="flex-center gap-1"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Hero;
