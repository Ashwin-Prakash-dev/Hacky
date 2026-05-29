import * as THREE from "three";
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

// Y coordinate where the desk's top surface should sit.
// Tune if the laptop floats above or clips through the desk:
//   raise (less negative) → desk moves up | lower (more negative) → desk moves down
const DESK_TOP_Y = -13.25;

// Uniform scale multiplier — increase to make the desk bigger, decrease to shrink it.
const DESK_SCALE = 14;

export default function DeskModel() {
  const { scene } = useGLTF("/models/desk3.glb");

  const yOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    return DESK_TOP_Y - box.max.y;
  }, [scene]);

  return <primitive object={scene} position={[0, yOffset, 0]} scale={DESK_SCALE} />;
}

useGLTF.preload("/models/desk.glb");
