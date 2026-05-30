import AnimatedTitle from "./AnimatedTitle";
import LaptopReveal from "./LaptopReveal";

const About = () => {
  return (
    <div id="about" className="w-screen" style={{ background: "#ffffff" }}>
      {/* Text header */}
      <div className="relative mt-48 flex flex-col items-center gap-5" style={{ paddingBottom: "clamp(32rem, 96vh, 64rem)" }}>
        <p
          className="font-general text-sm uppercase md:text-[10px]"
          style={{ color: "rgba(0,0,0,0.4)" }}
        >
          Startathon 2026
        </p>

        <AnimatedTitle
          title="What's in it <br /> for you?"
          containerClass="mt-5 !text-black text-center"
        />

        <div className="about-subtext">
          <p style={{ color: "rgba(0,0,0,0.5)" }}>
            Prizes. Mentors. 30 hours. Kerala's most curated hackathon for builders.
          </p>
        </div>
      </div>

      {/* 3D laptop scroll reveal */}
      <LaptopReveal />
    </div>
  );
};

export default About;