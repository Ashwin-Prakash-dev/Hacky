import * as THREE from "three";
import { useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";

// Y coordinate where the desk's top surface should sit.
// Tune if the laptop floats above or clips through the desk:
//   raise (less negative) → desk moves up | lower (more negative) → desk moves down
const DESK_TOP_Y = -11.20;

// Uniform scale multiplier — increase to make the desk bigger, decrease to shrink it.
const DESK_SCALE = 15;

export default function DeskModel() {
  const { scene } = useGLTF("/models/desk3.glb");

  const yOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    return DESK_TOP_Y - box.max.y;
  }, [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} position={[0, yOffset, 0]} scale={DESK_SCALE} />;
}

useGLTF.preload("/models/desk.glb");
