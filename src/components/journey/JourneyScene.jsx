import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import Lens from "./Lens";
import {
  Arrival,
  Positioning,
  Builders,
  Briefing,
  Prizes,
  Sponsors,
  Threshold,
} from "./chapters";
import { CHAPTERS, CHAPTER_COUNT } from "./journeyContent";

const CHAPTER_VIEWS = {
  arrival: Arrival,
  positioning: Positioning,
  builders: Builders,
  briefing: Briefing,
  prizes: Prizes,
  sponsors: Sponsors,
  threshold: Threshold,
};

// Generic chapter transition: each chapter recedes into depth and tilts
// away as it enters and leaves the frame, so the journey moves through
// 3D space instead of panning a flat wall. Chapters with their own
// signature move (video fly-in, prize zoom) layer it on top of this.
const ChapterRig = ({ index, journey, reducedMotion, children }) => {
  const ref = useRef(null);
  useFrame(() => {
    if (!ref.current || reducedMotion) return;
    const at = journey.current.progress * (CHAPTER_COUNT - 1);
    const t = THREE.MathUtils.clamp(at - index, -1, 1);
    ref.current.position.z = -Math.abs(t) * 4;
    ref.current.rotation.x = t * -0.22;
  });
  return <group ref={ref}>{children}</group>;
};

// The canvas-side root: reads the DOM track each frame, drives the chapter
// stack past the camera, and keeps the demand frameloop honest — frames
// render only on scroll or while damped values settle.
const JourneyScene = ({ trackRef, journey, reducedMotion, lowTier }) => {
  const group = useRef(null);
  const invalidate = useThree((s) => s.invalidate);
  const viewport = useThree((s) => s.viewport);
  const vw = viewport.width;
  const vh = viewport.height;

  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    invalidate();
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate]);

  useFrame(() => {
    const el = trackRef.current;
    if (!el || !group.current) return;
    const rect = el.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    journey.current.progress = THREE.MathUtils.clamp(
      total > 0 ? -rect.top / total : 0,
      0,
      1
    );
    group.current.position.y =
      journey.current.progress * (CHAPTER_COUNT - 1) * vh;
  });

  return (
    <>
      {/* studio-in-a-box: two soft panels give the glass its highlights —
          no HDR fetch, baked once (frames={1}) into a tiny env map */}
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={1.6} position={[0, 4, 8]} scale={[10, 4, 1]} />
        <Lightformer
          intensity={0.8}
          color="#C8FF00"
          position={[-6, -3, 4]}
          scale={[6, 3, 1]}
        />
      </Environment>
      <group ref={group}>
        {CHAPTERS.map((c, i) => {
          const View = CHAPTER_VIEWS[c.id];
          return (
            <group key={c.id} position={[0, -i * vh, 0]}>
              <ChapterRig
                index={i}
                journey={journey}
                reducedMotion={reducedMotion}
              >
                <View
                  vw={vw}
                  vh={vh}
                  journey={journey}
                  chapterIndex={i}
                  reducedMotion={reducedMotion}
                />
              </ChapterRig>
            </group>
          );
        })}
      </group>
      <Lens journey={journey} lowTier={lowTier} />
    </>
  );
};

export default JourneyScene;
