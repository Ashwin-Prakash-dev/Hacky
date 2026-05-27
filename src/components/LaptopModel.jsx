// src/components/LaptopModel.jsx
import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import ScreenContent from "./ScreenContent";

/*
 * LaptopModel
 *
 * Props:
 *   progressRef  — React ref whose .current is scroll progress 0→1 (written by GSAP)
 *
 * Animation phases:
 *   progress 0.00–0.35 → lid opens (hinge 1.575 → -0.425), model rises from -4.3 → -2
 *   progress 0.35–1.00 → stationary, camera zooms in
 */
export default function LaptopModel({ progressRef, ...props }) {
  const group = useRef();
  const hingeGroupRef = useRef();

  const { nodes, materials } = useGLTF("/models/mac-draco.glb");

  useFrame(() => {
    if (!group.current || !hingeGroupRef.current) return;

    const p = progressRef.current;

    // Hinge — lid opens as scroll 0→0.35
    const lidProgress = Math.min(p / 0.35, 1);
    const targetHinge = THREE.MathUtils.lerp(1.575, -0.425, lidProgress);
    hingeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      hingeGroupRef.current.rotation.x,
      targetHinge,
      0.1
    );

    // Rise from floor as lid opens — stays fixed once open
    const targetY = THREE.MathUtils.lerp(-4.3, -2, lidProgress);
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      targetY,
      0.1
    );
  });

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Hinge group — rotation.x controlled above */}
      <group ref={hingeGroupRef} position={[0, -0.04, 0.41]}>
        <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={materials.aluminium} geometry={nodes["Cube008"].geometry} />
          <mesh material={materials["matte.001"]} geometry={nodes["Cube008_1"].geometry} />
          {/* screen.001 hidden — replaced by Html overlay below */}
          <mesh visible={false} geometry={nodes["Cube008_2"].geometry} />
          {/* Html inherits this group's exact position + rotation = pixel-perfect screen alignment */}
          <ScreenContent />
        </group>
      </group>

      {/* Base */}
      <mesh
        material={materials.keys}
        geometry={nodes.keyboard.geometry}
        position={[1.79, 0, 3.45]}
      />
      <group position={[0, -0.1, 3.39]}>
        <mesh material={materials.aluminium} geometry={nodes["Cube002"].geometry} />
        <mesh material={materials.trackpad} geometry={nodes["Cube002_1"].geometry} />
      </group>
      <mesh
        material={materials.touchbar}
        geometry={nodes.touchbar.geometry}
        position={[0, -0.03, 1.2]}
      />
    </group>
  );
}

useGLTF.preload("/models/mac-draco.glb");
