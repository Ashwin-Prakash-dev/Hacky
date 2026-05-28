// src/components/About.jsx
import AnimatedTitle from "./AnimatedTitle";
import LaptopReveal from "./LaptopReveal";

const About = () => {
  return (
    <div id="about" className="w-screen">
      {/* Text header */}
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general text-sm uppercase md:text-[10px]">
          Startathon 2026
        </p>

        <AnimatedTitle
          title="What's in it <br /> for you?"
          containerClass="mt-5 !text-white text-center"
        />

        <div className="about-subtext">
          <p>Prizes. Mentors. 30 hours. Kerala's most curated hackathon.</p>
        </div>
      </div>

      {/* 3D laptop scroll reveal */}
      <LaptopReveal />
    </div>
  );
};

export default About;
