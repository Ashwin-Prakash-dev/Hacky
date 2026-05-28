import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";

import Button from "./Button";
import VideoPreview from "./VideoPreview";

gsap.registerPlugin(ScrollTrigger);

const Hero = ({ introComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);

  const totalVideos = 4;
  const nextVdRef = useRef(null);
  const currentVdRef = useRef(null);
  const heroTitleRef = useRef(null);

  const handleVideoLoad = () => {
    setLoadedVideos((prev) => prev + 1);
  };

  useEffect(() => {
    if (loadedVideos === totalVideos - 1) {
      setLoading(false);
    }
  }, [loadedVideos]);

  useEffect(() => {
    if (introComplete && heroTitleRef.current) {
      // gsap.fromTo(heroTitleRef.current, { opacity: 0 }, { opacity: 1, duration: 0, ease: "power2.out" });
    }
  }, [introComplete]);

  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => nextVdRef.current.play(),
        });
        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    { dependencies: [currentIndex], revertOnUpdate: true }
  );

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

  const getVideoSrc = (index) => `videos/hero-${index}.mp4`;

  const stats = [
    { value: "30", label: "Hours" },
    { value: "500+", label: "Hackers" },
    { value: "Kerala", label: "Location" },
  ];

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
        {/* Video layers */}
        <div>
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <VideoPreview>
              <div
                onClick={handleMiniVdClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
              >
                <video
                  ref={currentVdRef}
                  src={getVideoSrc((currentIndex % totalVideos) + 1)}
                  loop
                  muted
                  id="current-video"
                  className="size-64 origin-center scale-150 object-cover object-center"
                  onLoadedData={handleVideoLoad}
                />
              </div>
            </VideoPreview>
          </div>

          <video
            ref={nextVdRef}
            src={getVideoSrc(currentIndex)}
            loop
            muted
            id="next-video"
            className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
            onLoadedData={handleVideoLoad}
          />
          <video
            src={getVideoSrc(currentIndex === totalVideos - 1 ? 1 : currentIndex)}
            autoPlay
            loop
            muted
            className="absolute left-0 top-0 size-full object-cover object-center"
            style={{ opacity: 0.35 }}
            onLoadedData={handleVideoLoad}
          />
        </div>

        {/* Gradient vignette — depth + readability */}
        <div
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        {/* Decorative bottom-right glyph */}
        <h1
          className="special-font hero-heading absolute bottom-4 right-5 z-40 select-none"
          style={{ color: "rgba(200,255,0,0.13)", fontSize: "clamp(6rem,15vw,13rem)", lineHeight: 1 }}
        >
          S.
        </h1>

        {/* Main overlay */}
        <div className="absolute inset-0 z-40 flex flex-col justify-between px-5 pb-8 pt-28 sm:px-12 sm:pt-32">

          {/* Top-left: badge + headline + tagline + CTA */}
          <div className="max-w-xl">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1"
              style={{ borderColor: "rgba(200,255,0,0.3)" }}
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: "#C8FF00" }}
              />
              <span
                className="font-general text-xs uppercase tracking-widest"
                style={{ color: "#C8FF00" }}
              >
                Applications opening soon · Kerala
              </span>
            </div>

            <h1
              id="hero-title"
              ref={heroTitleRef}
              className="font-open-sauce"
              style={{
                fontSize: "clamp(4rem, 11vw, 10rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 0.9,
                color: "#c8c8c4",
                // opacity: 0,
              }}
            >
              Startathon<span style={{ color: "#3a3a3a" }}>.</span>
            </h1>

            <p
              className="mt-6 max-w-xs font-general text-sm"
              style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}
            >
              30 hours. Real problems.
              <br />
              Kerala's most curated hackathon.
            </p>

            <div className="mt-6">
              <Button
                id="notify-btn"
                title="Register Interest"
                rightIcon={<TiLocationArrow />}
                containerClass="flex-center gap-1"
              />
            </div>
          </div>

          {/* Bottom row: stats left, scroll hint right */}
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-8">
              {stats.map(({ value, label }, i) => (
                <div key={label} className="flex items-end gap-8">
                  {i > 0 && (
                    <div
                      className="mb-1 h-6 w-px shrink-0"
                      style={{ background: "rgba(255,255,255,0.12)" }}
                    />
                  )}
                  <div>
                    <div
                      className="font-general text-2xl font-bold leading-none"
                      style={{ color: "#C8FF00" }}
                    >
                      {value}
                    </div>
                    <div
                      className="mt-1 font-general text-xs uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex flex-col items-center gap-1.5 font-general text-xs uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              <span>Scroll</span>
              <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.15)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
