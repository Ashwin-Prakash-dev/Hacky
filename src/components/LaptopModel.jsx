// src/components/LaptopModel.jsx
import * as THREE from "three";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import ScreenContent from "./ScreenContent";

/*
 * LaptopModel
 *
 * Props:
 *   progressRef  — React ref whose .current is scroll progress 0→1 (written by GSAP)
 *
 * Animation phases (mirrors LaptopReveal.jsx scroll phases):
 *   progress 0.00–0.35 → lid opens   (hinge 1.575 → -0.425)
 *   progress 0.35–1.00 → idle float  (gentle rotation + y oscillation)
 */
export default function LaptopModel({ progressRef, ...props }) {
  const group = useRef();
  const hingeGroupRef = useRef();

  const { nodes, materials } = useGLTF("/models/mac-draco.glb");

  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered]);

  useFrame((state) => {
    if (!group.current || !hingeGroupRef.current) return;

    const p = progressRef.current;
    const t = state.clock.getElapsedTime();

    // Phase 1: hinge — lid opens as scroll 0→0.35
    const lidProgress = Math.min(p / 0.35, 1);
    const targetHinge = THREE.MathUtils.lerp(1.575, -0.425, lidProgress);
    hingeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      hingeGroupRef.current.rotation.x,
      targetHinge,
      0.1
    );

    // Idle float — only active once lid is meaningfully open
    if (lidProgress > 0.5) {
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        Math.cos(t / 10) / 10 + 0.25,
        0.05
      );
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        Math.sin(t / 10) / 4,
        0.05
      );
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        Math.sin(t / 10) / 10,
        0.05
      );
      group.current.position.y = THREE.MathUtils.lerp(
        group.current.position.y,
        (-2 + Math.sin(t)) / 3,
        0.05
      );
    } else {
      // Closed: rest on ground
      group.current.position.y = THREE.MathUtils.lerp(
        group.current.position.y,
        -4.3,
        0.1
      );
    }
  });

  return (
    <group
      ref={group}
      {...props}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      dispose={null}
    >
      {/* Hinge group — rotation.x controlled above */}
      <group ref={hingeGroupRef} position={[0, -0.04, 0.41]}>
        <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={materials.aluminium} geometry={nodes["Cube008"].geometry} />
          <mesh material={materials["matte.001"]} geometry={nodes["Cube008_1"].geometry} />
          <mesh material={materials["screen.001"]} geometry={nodes["Cube008_2"].geometry} />
        </group>
      </group>

      {/* Screen HTML overlay */}
      <ScreenContent />

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
