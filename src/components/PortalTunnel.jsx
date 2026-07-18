/* eslint-disable react/no-unknown-property -- r3f elements take three.js
   props, not DOM attributes */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import useParkedFrameloop from "../lib/useParkedFrameloop";

// The hero's video stage. It opens on video 1 filling the viewport behind
// the wordmark; scrolling zooms the footage out into a floating rounded
// card, revealing the fogged atmosphere around it. Each handoff is a swirl
// transition — the current card distorts and slides off one side while the
// next swirls in from the other (directions alternate) — with the big fact
// lines sitting in the holds between. Card 3 sinks away as the atmosphere
// settles to the page ground. Camera stays fixed (pointer parallax only,
// suppressed while the footage is fullscreen); the swirl, rounded corners,
// and hairline lime border all live in one shader per card.

const CAM_Z = 6;

// per-stage atmosphere tints (scene background + fog); the exit tint is
// the page ground so the unpin seam into Sponsors is invisible
const STAGES = [
  { src: "/videos/hero-1.webm", tint: "#0b0e05" },
  { src: "/videos/hero-2.webm", tint: "#060910" },
  { src: "/videos/hero-3.webm", tint: "#0a0a08" },
];
const EXIT_TINT = "#050505";
const TINT_STOPS = [0, 0.36, 0.58, 0.92];

// choreography windows over scroll progress p — transitions alternate
// sides, facts sit in the holds between them (Hero.jsx FACT_WINDOWS align)
const T = {
  zoomOut: [0.06, 0.2],
  swap1: [0.3, 0.42], // card 0 exits left, card 1 enters from the right
  swap2: [0.52, 0.64], // card 1 exits right, card 2 enters from the left
  sink: [0.82, 0.96], // card 3 settles away into the dimming atmosphere
};

// reduced-motion composition: all three cards at rest, no choreography
const STATIC_POSES = [
  [0, 0.15, 0],
  [-2.1, -1.25, -3],
  [2.2, -1.4, -4],
];

const norm = (p, [a, b]) => THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
const easeInOut = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - (1 - t) * (1 - t);
const easeIn = (t) => t * t;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// rounded-rect SDF mask + hairline lime border + a center-falloff UV
// rotation ("swirl") that bends the footage during transitions
const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uOpacity;
  uniform float uSwirl;
  uniform float uEdge; // 0 = fullscreen footage (no chrome), 1 = card
  uniform vec2 uRepeat;
  uniform vec2 uOffset;
  uniform float uAspect;
  varying vec2 vUv;

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 q = vUv - 0.5;
    float rr = length(q * vec2(uAspect, 1.0));
    float ang = uSwirl * (1.0 - smoothstep(0.0, 0.8, rr));
    float c = cos(ang);
    float s = sin(ang);
    vec2 uv = (mat2(c, -s, s, c) * q) + 0.5;
    vec2 tuv = clamp(uv, 0.0, 1.0) * uRepeat + uOffset;
    vec3 col = texture2D(uTex, tuv).rgb;

    vec2 p = q * vec2(uAspect, 1.0);
    float radius = mix(0.001, 0.09, uEdge);
    float d = sdRoundRect(p, vec2(0.5 * uAspect, 0.5), radius);
    float aa = max(fwidth(d) * 1.2, 0.002);
    float mask = 1.0 - smoothstep(-aa, aa, d);
    // hairline border, absent while the footage is fullscreen
    float border = 1.0 - smoothstep(0.004, 0.004 + aa * 2.0, abs(d + 0.006));
    col = mix(col, vec3(0.784, 1.0, 0.0), border * 0.85 * uEdge);

    gl_FragColor = vec4(col, mask * uOpacity);
    #include <colorspace_fragment>
  }
`;

// crop like CSS object-fit: cover, expressed as repeat/offset uniforms
const coverCrop = (video, planeAspect, uRepeat, uOffset) => {
  const va =
    video && video.videoWidth ? video.videoWidth / video.videoHeight : 16 / 9;
  if (va > planeAspect) {
    uRepeat.value.set(planeAspect / va, 1);
    uOffset.value.set((1 - planeAspect / va) / 2, 0);
  } else {
    uRepeat.value.set(1, va / planeAspect);
    uOffset.value.set(0, (1 - va / planeAspect) / 2);
  }
};

// pose of card `index` at progress p: fullscreen open, zoom-out, holds,
// alternating swirl swaps, final sink
const cardPose = (index, p, cover, xOff) => {
  const pose = { x: 0, y: 0, sc: 1, rz: 0, swirl: 0, opacity: 1, visible: true };
  if (index === 0) {
    if (p < T.zoomOut[0]) {
      pose.sc = cover;
    } else if (p < T.zoomOut[1]) {
      pose.sc = THREE.MathUtils.lerp(cover, 1, easeInOut(norm(p, T.zoomOut)));
    } else if (p >= T.swap1[0]) {
      const t = norm(p, T.swap1);
      pose.x = -easeIn(t) * xOff;
      pose.swirl = -Math.sin(t * Math.PI) * 1.1;
      pose.rz = -0.1 * t;
      pose.sc = 1 - 0.06 * t;
      pose.opacity = t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35;
      pose.visible = t < 1;
    }
  } else if (index === 1) {
    if (p < T.swap1[0]) {
      pose.visible = false;
    } else if (p < T.swap1[1]) {
      const t = norm(p, T.swap1);
      pose.x = (1 - easeOut(t)) * xOff;
      pose.swirl = Math.sin(t * Math.PI) * 1.1;
      pose.rz = 0.08 * (1 - t);
      pose.sc = 0.94 + 0.06 * easeOut(t);
      pose.opacity = Math.min(1, t / 0.3);
    } else if (p >= T.swap2[0]) {
      const t = norm(p, T.swap2);
      pose.x = easeIn(t) * xOff;
      pose.swirl = Math.sin(t * Math.PI) * 1.1;
      pose.rz = 0.1 * t;
      pose.sc = 1 - 0.06 * t;
      pose.opacity = t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35;
      pose.visible = t < 1;
    }
  } else {
    if (p < T.swap2[0]) {
      pose.visible = false;
    } else if (p < T.swap2[1]) {
      const t = norm(p, T.swap2);
      pose.x = -(1 - easeOut(t)) * xOff;
      pose.swirl = -Math.sin(t * Math.PI) * 1.1;
      pose.rz = -0.08 * (1 - t);
      pose.sc = 0.94 + 0.06 * easeOut(t);
      pose.opacity = Math.min(1, t / 0.3);
    } else if (p >= T.sink[0]) {
      const t = norm(p, T.sink);
      pose.y = -0.3 * easeIn(t);
      pose.sc = 1 - 0.15 * t;
      pose.opacity = 1 - t;
      pose.visible = t < 1;
    }
  }
  return pose;
};

const VideoCard = ({
  index,
  src,
  planeW,
  planeH,
  staticMode,
  progressRef,
  videosRef,
}) => {
  const meshRef = useRef(null);
  const invalidate = useThree((s) => s.invalidate);
  const texture = useVideoTexture(src, {
    start: false,
    muted: true,
    loop: true,
    playsInline: true,
  });

  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uOpacity: { value: 1 },
      uSwirl: { value: 0 },
      uEdge: { value: 1 },
      uRepeat: { value: new THREE.Vector2(1, 1) },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: planeW / planeH },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recreated per texture
    [texture]
  );

  useEffect(() => {
    uniforms.uAspect.value = planeW / planeH;
    const video = texture.image;
    const videos = videosRef.current;
    videos[index] = video;
    const applyCrop = () =>
      coverCrop(video, planeW / planeH, uniforms.uRepeat, uniforms.uOffset);
    applyCrop();
    // nudge off t=0 so a paused element still yields a decoded frame
    const onSeeked = () => {
      texture.needsUpdate = true;
      invalidate();
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadedmetadata", applyCrop);
    try {
      video.currentTime = 0.01;
    } catch {
      /* not seekable yet — the play() retry path will paint instead */
    }
    return () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", applyCrop);
      videos[index] = null;
    };
  }, [texture, index, planeW, planeH, videosRef, invalidate, uniforms]);

  useFrame(({ camera, viewport }) => {
    const mesh = meshRef.current;
    if (!mesh || staticMode) return;
    const view = viewport.getCurrentViewport(camera, [0, 0, 0]);
    const cover = Math.max(view.width / planeW, view.height / planeH) * 1.02;
    const xOff = view.width / 2 + planeW / 2 + 0.6;
    const pose = cardPose(index, progressRef.current, cover, xOff);
    mesh.visible = pose.visible;
    mesh.position.set(pose.x, pose.y, 0);
    mesh.rotation.z = pose.rz;
    mesh.scale.setScalar(pose.sc);
    uniforms.uSwirl.value = pose.swirl;
    uniforms.uOpacity.value = pose.opacity;
    // card 0 grows its chrome (border + corner rounding) as it zooms out
    // of the fullscreen open; the other cards are always cards
    uniforms.uEdge.value =
      index === 0 ? easeInOut(norm(progressRef.current, T.zoomOut)) : 1;
  });

  return (
    <mesh
      ref={meshRef}
      position={staticMode ? STATIC_POSES[index] : [0, 0, 0]}
      scale={staticMode && index > 0 ? 0.55 : 1}
    >
      <planeGeometry args={[planeW, planeH]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
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
      arr[i * 3] = (Math.random() - 0.5) * 11;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = 3 - Math.random() * 9;
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
    // no parallax while the footage is fullscreen — it would expose edges
    const amp = staticMode ? 0 : norm(p, T.zoomOut);
    const k = 1 - Math.exp(-4 * delta);
    eased.current.x += (pointer.current.x - eased.current.x) * k;
    eased.current.y += (pointer.current.y - eased.current.y) * k;
    camera.position.set(
      eased.current.x * 0.35 * amp,
      -eased.current.y * 0.22 * amp,
      CAM_Z
    );
    camera.lookAt(
      eased.current.x * 0.1 * amp,
      -eased.current.y * 0.06 * amp,
      -6
    );
  });

  return null;
};

// plays exactly one video — the stage currently on (or entering) the
// screen. play() is re-attempted (throttled) while the active video sits
// paused: the first attempt at mount can land before the element is
// ready, and its rejected promise would otherwise freeze the opening
// footage on the first paint.
const VideoDirector = ({ progressRef, videosRef, staticMode }) => {
  const activeRef = useRef(-1);
  const lastTryRef = useRef(0);
  useFrame(({ clock }) => {
    if (staticMode) return;
    const p = progressRef.current;
    const active = p < 0.36 ? 0 : p < 0.58 ? 1 : 2;
    if (active !== activeRef.current) {
      activeRef.current = active;
      videosRef.current.forEach((v, i) => {
        if (v && i !== active && !v.paused) v.pause();
      });
      lastTryRef.current = 0; // let the new stage start immediately
    }
    const v = videosRef.current[active];
    const t = clock.elapsedTime;
    if (v && v.paused && t - lastTryRef.current > 0.5) {
      lastTryRef.current = t;
      v.play().catch(() => {});
    }
  });
  return null;
};

const PortalTunnel = ({ progressRef, staticMode = false }) => {
  const wrapRef = useRef(null);
  const videosRef = useRef([]);
  const frameloop = useParkedFrameloop(wrapRef);
  const [portrait, setPortrait] = useState(
    () => window.innerWidth / window.innerHeight < 0.8
  );

  useEffect(() => {
    const onResize = () =>
      setPortrait(window.innerWidth / window.innerHeight < 0.8);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const planeW = portrait ? 2.3 : 4.4;
  const planeH = portrait ? 3.1 : 2.6;

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
        camera={{ fov: 50, near: 0.1, far: 40, position: [0, 0, CAM_Z] }}
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
            <VideoCard
              key={s.src}
              index={i}
              src={s.src}
              planeW={planeW}
              planeH={planeH}
              staticMode={staticMode}
              progressRef={progressRef}
              videosRef={videosRef}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default PortalTunnel;
