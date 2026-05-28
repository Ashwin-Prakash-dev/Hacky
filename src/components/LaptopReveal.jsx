// src/components/LaptopReveal.jsx
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import LaptopModel from "./LaptopModel";

gsap.registerPlugin(ScrollTrigger);

// Tune this if the screen doesn't fill the viewport at scroll end
const CAMERA_END_Z = 1.5;
const CAMERA_START_Z = -30;

// Camera animation timing
const CAMERA_PHASE_START = 0.35;   // scroll progress at which camera starts moving
const CAMERA_PHASE_SPAN = 0.65;    // remaining scroll span for camera motion (1 - CAMERA_PHASE_START)

/*
 * CameraController — lives inside the Canvas, reads progressRef each frame.
 * Phases:
 *   progress 0.35–1.0  camera moves from CAMERA_START_Z → CAMERA_END_Z
 */
function CameraController({ progressRef }) {
  useFrame((state) => {
    const p = progressRef.current;
    const camProgress = Math.max(0, Math.min((p - CAMERA_PHASE_START) / CAMERA_PHASE_SPAN, 1));
    const targetZ = THREE.MathUtils.lerp(CAMERA_START_Z, CAMERA_END_Z, camProgress);
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      0.08
    );
  });
  return null;
}

export default function LaptopReveal() {
  const wrapperRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const progressRef = useRef(0);

  useGSAP(() => {
    if (!wrapperRef.current) return;
    ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top top",
      end: "+=2000",
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
      onLeave: () => {
        // Canvas hides — Features section takes over seamlessly
        if (canvasWrapRef.current) gsap.set(canvasWrapRef.current, { autoAlpha: 0 });
      },
      onEnterBack: () => {
        // Restore canvas if user scrolls back up
        if (canvasWrapRef.current) gsap.set(canvasWrapRef.current, { autoAlpha: 1 });
      },
    });
  }, { scope: wrapperRef });

  return (
    <div ref={wrapperRef} className="h-dvh w-screen">
      <div ref={canvasWrapRef} className="h-full w-full">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, CAMERA_START_Z], fov: 35 }}
        >
          <CameraController progressRef={progressRef} />

          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#f0f0f0" />

          <Suspense fallback={null}>
            <group rotation={[0, Math.PI, 0]}>
              <LaptopModel progressRef={progressRef} />
            </group>
            <Environment preset="city" />
            <ContactShadows
              position={[0, -4.5, 0]}
              opacity={0.4}
              scale={20}
              blur={1.75}
              far={4.5}
            />
          </Suspense>
          {/* <OrbitControls /> */}
        </Canvas>
      </div>
    </div>
  );
}
