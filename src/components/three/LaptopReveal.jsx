import { useRef, Suspense, Component } from "react";

// Detect WebGL support before attempting to create a Canvas
function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// Error boundary — catches Canvas crash and shows a plain fallback
class CanvasErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import LaptopModel from "./LaptopModel";

gsap.registerPlugin(ScrollTrigger);

const CAMERA_END_Z = 4.5;
const CAMERA_START_Z = -30;

const CAMERA_PHASE_START = 0.35;
const CAMERA_PHASE_SPAN = 0.65;


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
        {isWebGLAvailable() && (
        <CanvasErrorBoundary fallback={null}>
        <div className="h-full w-full" style={{ position: "absolute", inset: 0, zIndex: 3 }}>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, CAMERA_START_Z], fov: 35 }}
            gl={{ alpha: true, antialias: true }}
            shadows
          >
            <CameraController progressRef={progressRef} />

            {/* Soft warm ambient — base indoor light */}
            <ambientLight intensity={0.4} color="#f5ead8" />

            {/* Sunlight from right window — shadow-casting key light */}
            <directionalLight
              position={[12, 10, 4]}
              intensity={2.6}
              color="#fff6e0"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-near={1}
              shadow-camera-far={80}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
              shadow-bias={-0.0008}
            />

            {/* Cool fill — light bouncing off the white left wall */}
            <directionalLight
              position={[-5, 4, 2]}
              intensity={0.28}
              color="#dce8ff"
            />

            {/* Subtle overhead to lift desk surface */}
            <directionalLight
              position={[0, 10, 1]}
              intensity={0.18}
              color="#ffffff"
            />

            <Suspense fallback={null}>
              <group rotation={[0, Math.PI, 0]}>
                <LaptopModel progressRef={progressRef} />
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
        </CanvasErrorBoundary>
        )}

      </div>
    </div>
  );
}
