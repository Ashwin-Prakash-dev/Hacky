import * as THREE from "three";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { CHAPTER_COUNT } from "./journeyContent";

// The signature: a flattened glass droplet that crosses the horizon
// exactly once, driven by scroll, while the wordmark chapter is on
// screen — refracting the type as it passes. It swells in on load,
// collapses as the sweep completes, and stays hidden (zero refraction
// cost) for the rest of the journey.

export const LENS_Z = 6;

// the sweep completes within the first half of the hero chapter, while
// the wordmark is still front and center
const SWEEP_END = 0.45 / (CHAPTER_COUNT - 1);

const Lens = ({ journey, lowTier }) => {
  const mesh = useRef(null);
  const scale = useRef(0.001);
  const camera = useThree((s) => s.camera);
  const viewport = useThree((s) => s.viewport);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const vp = viewport.getCurrentViewport(camera, [0, 0, LENS_Z]);
    const p = journey.current.progress;
    const sweep = THREE.MathUtils.clamp(p / SWEEP_END, 0, 1);

    // left of the wordmark to past the right edge, one pass, with a
    // shallow arc so the path reads as thrown rather than mechanical
    const run = THREE.MathUtils.smoothstep(sweep, 0, 1);
    m.position.x = THREE.MathUtils.lerp(-vp.width * 0.36, vp.width * 0.72, run);
    m.position.y = Math.sin(sweep * Math.PI) * vp.height * 0.08;

    // swell in on load; gone once the sweep completes
    const target =
      vp.height * 0.3 * (1 - THREE.MathUtils.smoothstep(sweep, 0.82, 1));
    scale.current = THREE.MathUtils.damp(scale.current, target, 4, delta);
    m.scale.set(scale.current, scale.current, scale.current * 0.32);
    m.visible = scale.current > 0.02;

    // keep the demand loop alive until the load swell settles
    if (Math.abs(scale.current - target) > 0.002) state.invalidate();
  });

  return (
    <mesh ref={mesh} position={[0, 0, LENS_Z]} scale={0.001} renderOrder={1}>
      <sphereGeometry args={[1, 48, 48]} />
      <MeshTransmissionMaterial
        // low tier (coarse pointers = phones/tablets): smaller refraction
        // buffer and fewer samples — same silhouette, fraction of the cost
        samples={lowTier ? 3 : 5}
        resolution={lowTier ? 384 : 768}
        thickness={0.7}
        ior={1.08}
        roughness={0.04}
        anisotropicBlur={0.15}
        distortion={0.08}
        distortionScale={0.5}
        temporalDistortion={0}
        chromaticAberration={0.05}
        // lifts the glass off pure black where it refracts empty space
        background={new THREE.Color("#10140a")}
      />
    </mesh>
  );
};

export default Lens;
