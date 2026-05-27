import { useWindowScroll } from "react-use";
import { useEffect, useState } from "react";

const ScrollProgress = () => {
  const { y } = useWindowScroll();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    setProgress(totalHeight > 0 ? (y / totalHeight) * 100 : 0);
  }, [y]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: "2px",
        background: "linear-gradient(90deg, #C8FF00, rgba(200,255,0,0.7))",
        zIndex: 999999,
        boxShadow: "0 0 10px rgba(200,255,0,0.6), 0 0 20px rgba(200,255,0,0.2)",
        transition: "width 0.08s linear",
        transformOrigin: "left",
      }}
    />
  );
};

export default ScrollProgress;