import * as THREE from "three";
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

// Must match DESK_TOP_Y in DeskModel.jsx — this is the desk surface level
const DESK_SURFACE_Y = -11.65;

// Uniform scale — tune to match the desk's proportions
const CUP_SCALE = 7;

// Position on the desk relative to the laptop (laptop is centered at x=0, z≈2)
// Positive X = right side of desk, negative X = left side
const CUP_X = 6.4;
const CUP_Z = 1.5;

export default function CoffeeModel() {
  const { scene } = useGLTF("/models/coffeecup.glb");

  const yOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    // Align cup's bottom face to the desk surface
    return DESK_SURFACE_Y - box.min.y;
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[CUP_X, yOffset, CUP_Z]}
      scale={CUP_SCALE}
    />
  );
}

useGLTF.preload("/models/coffeecup.glb");
