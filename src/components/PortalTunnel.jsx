/* eslint-disable react/no-unknown-property -- r3f elements take three.js
   props, not DOM attributes */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// The hero's portal tunnel: three rounded video cards hang at increasing
// depth in a fogged near-black atmosphere. The pinned hero scrubs the
// camera straight down -z: each card grows until it fills the frame (its
// fullscreen moment), dissolves as the camera crosses its plane, and the
// next portal emerges from the fog. Real depth, one draw per card, no
// render targets — cheap enough for mid-range phones. Lime dust specks
// exist only to make the dolly's speed legible between cards.

const STAGE_GAP = 10;
const CAM_START = 6;
const CAM_END = -(STAGE_GAP * 2) - 4; // 4 units past the last card
const CAM_TRAVEL = CAM_START - CAM_END; // 30

// per-stage atmosphere tints (scene background + fog); the exit tint is
// the page ground so the unpin seam into Sponsors is invisible
const STAGES = [
  { src: "/videos/hero-1.webm", tint: "#0b0e05" },
  { src: "/videos/hero-2.webm", tint: "#060910" },
  { src: "/videos/hero-3.webm", tint: "#0a0a08" },
];
const EXIT_TINT = "#050505";
const TINT_STOPS = [0, 0.44, 0.77, 1];

// lateral drift per card so the dive isn't a dead-straight corridor
const CARD_OFFSETS = [
  [0, -0.05],
  [0.55, -0.25],
  [-0.45, 0.2],
];
// reduced-motion composition: all three cards at rest, no dolly
const STATIC_POSES = [
  [0, 0.15, 0],
  [-2.1, -1.25, -3],
  [2.2, -1.4, -4],
];

const makeRoundedAlpha = (aspect) => {
  const W = 512;
  const H = Math.round(512 / aspect);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(2, 2, W - 4, H - 4, 46);
  ctx.fill();
  return new THREE.CanvasTexture(c);
};

// crop the video like CSS object-fit: cover
const coverCrop = (tex, planeAspect) => {
  const v = tex.image;
  const va = v && v.videoWidth ? v.videoWidth / v.videoHeight : 16 / 9;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  if (va > planeAspect) {
    tex.repeat.set(planeAspect / va, 1);
    tex.offset.set((1 - planeAspect / va) / 2, 0);
  } else {
    tex.repeat.set(1, va / planeAspect);
    tex.offset.set(0, (1 - va / planeAspect) / 2);
  }
};

const PortalCard = ({
  index,
  src,
  planeW,
  planeH,
  alphaMap,
  staticMode,
  videosRef,
}) => {
  const groupRef = useRef(null);
  const videoMatRef = useRef(null);
  const rimMatRef = useRef(null);
  const invalidate = useThree((s) => s.invalidate);
  const texture = useVideoTexture(src, {
    start: false,
    muted: true,
    loop: true,
    playsInline: true,
  });

  useEffect(() => {
    coverCrop(texture, planeW / planeH);
    const video = texture.image;
    const videos = videosRef.current;
    videos[index] = video;
    // nudge off t=0 so a paused element still yields a decoded frame
    const onSeeked = () => {
      texture.needsUpdate = true;
      invalidate();
    };
    video.addEventListener("seeked", onSeeked);
    try {
      video.currentTime = 0.01;
    } catch {
      /* not seekable yet — the play() path will paint instead */
    }
    return () => {
      video.removeEventListener("seeked", onSeeked);
      videos[index] = null;
    };
  }, [texture, index, planeW, planeH, videosRef, invalidate]);

  const frameZ = -index * STAGE_GAP;
  const pos = staticMode
    ? STATIC_POSES[index]
    : [CARD_OFFSETS[index][0], CARD_OFFSETS[index][1], frameZ];

  useFrame(({ camera }) => {
    if (staticMode) return;
    const d = camera.position.z - frameZ;
    // opaque on approach; dissolves in the last unit before the camera
    // crosses the card's plane (the card already over-fills the frame)
    const fade = THREE.MathUtils.clamp((d - 0.3) / 0.9, 0, 1);
    if (videoMatRef.current) videoMatRef.current.opacity = fade;
    if (rimMatRef.current) rimMatRef.current.opacity = fade * 0.9;
    if (groupRef.current) groupRef.current.visible = fade > 0.001;
  });

  return (
    <group
      ref={groupRef}
      position={pos}
      scale={staticMode && index > 0 ? 0.55 : 1}
    >
      {/* rim: a slightly larger lime rounded-rect behind the video reads
          as the portal's frame */}
      <mesh position-z={-0.03} scale={[1.045, 1.045, 1]}>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial
          ref={rimMatRef}
          color="#C8FF00"
          alphaMap={alphaMap}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial
          ref={videoMatRef}
          map={texture}
          alphaMap={alphaMap}
          transparent
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

const Atmosphere = ({ progressRef, staticMode }) => {
  const scene = useThree((s) => s.scene);
  const colors = useMemo(
    () => [
      ...STAGES.map((s) => new THREE.Color(s.tint)),
      new THREE.Color(EXIT_TINT),
    ],
    []
  );
  const bg = useMemo(() => colors[0].clone(), [colors]);

  useEffect(() => {
    scene.background = bg;
    scene.fog = new THREE.Fog(bg, 7, 24);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, bg]);

  useFrame(() => {
    const p = staticMode ? 0 : progressRef.current;
    let i = TINT_STOPS.length - 2;
    for (let k = 0; k < TINT_STOPS.length - 1; k += 1) {
      if (p <= TINT_STOPS[k + 1]) {
        i = k;
        break;
      }
    }
    const span = TINT_STOPS[i + 1] - TINT_STOPS[i];
    const t = THREE.MathUtils.clamp((p - TINT_STOPS[i]) / span, 0, 1);
    bg.copy(colors[i]).lerp(colors[i + 1], t);
  });

  return null;
};

const Dust = () => {
  const positions = useMemo(() => {
    const arr = new Float32Array(70 * 3);
    for (let i = 0; i < 70; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = 5 - Math.random() * 31;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={70}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#C8FF00"
        transparent
        opacity={0.3}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

const CameraRig = ({ progressRef, staticMode }) => {
  const pointer = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (staticMode) return undefined;
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [staticMode]);

  useFrame(({ camera }, delta) => {
    const p = staticMode ? 0 : progressRef.current;
    const z = CAM_START - CAM_TRAVEL * p;
    const k = 1 - Math.exp(-4 * delta);
    eased.current.x += (pointer.current.x - eased.current.x) * k;
    eased.current.y += (pointer.current.y - eased.current.y) * k;
    camera.position.set(eased.current.x * 0.35, -eased.current.y * 0.22, z);
    camera.lookAt(eased.current.x * 0.1, -eased.current.y * 0.06, z - 6);
  });

  return null;
};

// plays exactly one video — the stage the camera is inside
const VideoDirector = ({ progressRef, videosRef, staticMode }) => {
  const activeRef = useRef(-1);
  useFrame(() => {
    if (staticMode) return;
    const p = progressRef.current;
    const active = p < 0.2 ? 0 : p < 0.53 ? 1 : 2;
    if (active === activeRef.current) return;
    activeRef.current = active;
    videosRef.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else if (!v.paused) v.pause();
    });
  });
  return null;
};

const PortalTunnel = ({ progressRef, staticMode = false }) => {
  const wrapRef = useRef(null);
  const videosRef = useRef([]);
  const [frameloop, setFrameloop] = useState("always");
  const [portrait, setPortrait] = useState(
    () => window.innerWidth / window.innerHeight < 0.8
  );

  // park the canvas whenever the hero is offscreen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setFrameloop(entry.isIntersecting ? "always" : "never");
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () =>
      setPortrait(window.innerWidth / window.innerHeight < 0.8);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const planeW = portrait ? 2.3 : 4.4;
  const planeH = portrait ? 3.1 : 2.6;
  const alphaMap = useMemo(
    () => makeRoundedAlpha(planeW / planeH),
    [planeW, planeH]
  );

  return (
    <div
      ref={wrapRef}
      className="absolute left-0 top-0 size-full"
      aria-hidden="true"
    >
      <Canvas
        flat
        dpr={[1, 1.5]}
        frameloop={staticMode ? "demand" : frameloop}
        camera={{ fov: 50, near: 0.1, far: 40, position: [0, 0, CAM_START] }}
        gl={{ powerPreference: "high-performance", antialias: true }}
      >
        <Atmosphere progressRef={progressRef} staticMode={staticMode} />
        <Dust />
        <CameraRig progressRef={progressRef} staticMode={staticMode} />
        <VideoDirector
          progressRef={progressRef}
          videosRef={videosRef}
          staticMode={staticMode}
        />
        <Suspense fallback={null}>
          {STAGES.map((s, i) => (
            <PortalCard
              key={s.src}
              index={i}
              src={s.src}
              planeW={planeW}
              planeH={planeH}
              alphaMap={alphaMap}
              staticMode={staticMode}
              videosRef={videosRef}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default PortalTunnel;
