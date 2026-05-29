import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import LaptopModel from "./LaptopModel";
import DeskModel from "./DeskModel";
import CoffeeModel from "./CoffeeModel";

gsap.registerPlugin(ScrollTrigger);

const CAMERA_END_Z = 1.5;
const CAMERA_START_Z = -30;

const CAMERA_PHASE_START = 0.35;
const CAMERA_PHASE_SPAN = 0.65;

const ROOM_BG = "/img/wall.jpg";

function CameraController({ progressRef }) {
  useFrame((state) => {
    const p = progressRef.current;
    const camProgress = Math.max(
      0,
      Math.min((p - CAMERA_PHASE_START) / CAMERA_PHASE_SPAN, 1)
    );
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
  const wrapperRef        = useRef(null);
  const canvasWrapRef     = useRef(null);
  const entranceOverlayRef = useRef(null);
  const progressRef       = useRef(0);

  useGSAP(
    () => {
      if (!wrapperRef.current) return;

      // Entrance: white overlay fades out as section scrolls up from below,
      // matching the About section's white background for a seamless reveal.
      gsap.to(entranceOverlayRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top 90%",   // overlay starts fading when section peeks into view
          end: "top top",     // fully transparent once pinned at viewport top
          scrub: 1,
        },
      });

      // Pin + scroll-driven 3D animation
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
          if (canvasWrapRef.current)
            gsap.set(canvasWrapRef.current, { autoAlpha: 0 });
        },
        onEnterBack: () => {
          if (canvasWrapRef.current)
            gsap.set(canvasWrapRef.current, { autoAlpha: 1 });
        },
      });
    },
    { scope: wrapperRef }
  );

  return (
    <div ref={wrapperRef} className="h-dvh w-screen">
      {/*
       * canvasWrapRef wraps all layers — background, overlay, and canvas.
       * autoAlpha on this div hides everything together on section leave.
       */}
      <div ref={canvasWrapRef} className="h-full w-full" style={{ position: "relative" }}>

        {/* ── Layer 1: room background image — blurred for depth-of-field feel */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url('${ROOM_BG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          filter: "blur(3px)",
          transform: "scale(1.06)", // prevents blur from leaking at edges
        }} />

        {/* ── Layer 2: dark tint — improves contrast of 3D scene and text */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "rgba(18, 12, 6, 0.18)",
        }} />

        {/* ── Layer 3: entrance overlay — starts white (matches About bg), fades to reveal scene */}
        <div
          ref={entranceOverlayRef}
          style={{
            position: "absolute", inset: 0, zIndex: 10,
            background: "#ffffff",
            pointerEvents: "none",
          }}
        />

        {/* ── Layer 4: transparent 3D canvas — models composite over the room */}
        <div className="h-full w-full" style={{ position: "absolute", inset: 0, zIndex: 3 }}>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, CAMERA_START_Z], fov: 35 }}
            gl={{ alpha: true, antialias: true }}
          >
            <CameraController progressRef={progressRef} />

            {/*
             * Lighting designed to match the room image:
             *   — warm ambient for the bright white interior
             *   — strong directional from the right (window bank on right wall)
             *   — cool fill from the left (light bouncing off white left wall)
             */}
            <ambientLight intensity={0.55} color="#f8edd8" />

            {/* Primary — right-side windows */}
            <directionalLight
              position={[7, 5, 3]}
              intensity={1.8}
              color="#fff8e6"
            />

            {/* Fill — reflected from left white wall */}
            <directionalLight
              position={[-4, 3, 2]}
              intensity={0.35}
              color="#ddeeff"
            />

            {/* Subtle top fill to lift the desk surface */}
            <directionalLight
              position={[0, 8, 1]}
              intensity={0.25}
              color="#ffffff"
            />

            <Suspense fallback={null}>
              <group rotation={[0, Math.PI, 0]}>
                <LaptopModel progressRef={progressRef} />
                <DeskModel />
                <CoffeeModel />
              </group>

              {/* Interior HDRI — warm apartment lighting */}
              <Environment preset="apartment" />

              {/* Floor-level AO and contact shadows beneath desk legs */}
              <ContactShadows
                position={[0, -4.5, 0]}
                opacity={0.6}
                scale={22}
                blur={2.8}
                far={5.5}
              />

              {/* Desk-surface shadow from the laptop base */}
              <ContactShadows
                position={[0, -2.8, 0]}
                opacity={0.22}
                scale={5}
                blur={1.8}
                far={1.8}
              />
            </Suspense>
          </Canvas>
        </div>

      </div>
    </div>
  );
}
