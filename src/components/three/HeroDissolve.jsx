/* eslint-disable react/no-unknown-property -- r3f elements take three.js
   props, not DOM attributes */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad, useVideoTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// The hero's centerpiece: one fullscreen video, cover-cropped, that comes
// apart bottom-up in large mosaic pixels as the hero's pin is scrubbed —
// each grid cell gets a random death threshold biased by its row (low
// near the bottom, high near the top) so the wipe reads as an organic
// front, not a hard line. Dead cells go fully transparent, letting the
// DOM StaticHeroBackground gradient (painted beneath this canvas in
// Hero.jsx) stand in as the "atmosphere" — no second color system to
// keep in sync. Static camera; the only motion is the dissolve itself.

// ScreenQuad's geometry is a raw oversized triangle with a "position"
// attribute only — no "uv". Deriving vUv from position (its visible
// range is exactly [-1,1] NDC on the actual screen) avoids referencing
// the nonexistent uv attribute, which is undefined behavior.
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uVideoRes;
  uniform float uProgress;
  uniform float uCols;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
  }

  vec2 coverUv(vec2 uv) {
    float screenA = uRes.x / uRes.y;
    float videoA = uVideoRes.x / uVideoRes.y;
    vec2 c = uv;
    if (screenA > videoA) {
      float s = videoA / screenA;
      c.y = (uv.y - 0.5) * s + 0.5;
    } else {
      float s = screenA / videoA;
      c.x = (uv.x - 0.5) * s + 0.5;
    }
    return c;
  }

  void main() {
    float rows = max(1.0, floor(uCols * (uRes.y / uRes.x)));
    vec2 grid = vec2(uCols, rows);
    vec2 cell = floor(vUv * grid);
    vec2 cellUv = fract(vUv * grid);
    vec2 cellCenter = (cell + 0.5) / grid;

    // bottom (y=0) dies early, top (y=1) dies late; jitter keeps the
    // front from reading as a ruled line
    float rnd = hash(cell);
    float threshold = 0.08 + cellCenter.y * 0.80 + rnd * 0.06;

    // ascending edges only — descending smoothstep edges are undefined
    // on this project's target GPUs
    float band = 0.045;
    float dead = smoothstep(threshold - band, threshold + band, uProgress);
    float alive = 1.0 - dead;
    if (alive < 0.003) discard;

    // sharp video everywhere at rest; a cell only breaks into a big
    // mosaic block as ITS threshold approaches — the pixelation is part
    // of the dying, not a permanent filter over the whole frame
    float mosaic = smoothstep(threshold - band * 4.0, threshold - band, uProgress);
    vec2 fineUv = clamp(coverUv(vUv), 0.001, 0.999);
    vec2 blockUv = clamp(coverUv(cellCenter), 0.001, 0.999);
    vec3 sharp = texture2D(uTex, fineUv).rgb;
    vec3 blocky = texture2D(uTex, blockUv).rgb;
    vec3 vcol = mix(sharp, blocky, mosaic);

    // block shrink + lime spark right before a cell dies
    float nearDeath = smoothstep(threshold - band * 2.0, threshold, uProgress) * alive;
    vec2 local = cellUv - 0.5;
    float inset = nearDeath * 0.5;
    float blockMask = step(abs(local.x), 0.5 - inset) * step(abs(local.y), 0.5 - inset);
    vec3 spark = vec3(0.78, 1.0, 0.0) * nearDeath * 0.55;

    gl_FragColor = vec4(vcol + spark, alive * blockMask);
  }
`;

const DissolvePlane = ({ progressRef, staticMode }) => {
  const matRef = useRef(null);
  const { size } = useThree();
  const texture = useVideoTexture("/videos/hero-1.webm", {
    muted: true,
    loop: true,
    playsInline: true,
    start: !staticMode,
  });

  // uRes is kept current by the effect below (it must survive resize
  // without re-creating the uniforms object, which would drop uProgress)
  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uRes: { value: new THREE.Vector2() },
      uVideoRes: { value: new THREE.Vector2(16, 9) },
      uProgress: { value: 0 },
      uCols: { value: 26 },
    }),
    [texture]
  );

  useEffect(() => {
    const video = texture.image;
    const onMeta = () => {
      uniforms.uVideoRes.value.set(video.videoWidth, video.videoHeight);
    };
    if (video.videoWidth) onMeta();
    else video.addEventListener("loadedmetadata", onMeta);
    return () => video.removeEventListener("loadedmetadata", onMeta);
  }, [texture, uniforms]);

  useEffect(() => {
    uniforms.uRes.value.set(size.width, size.height);
  }, [size, uniforms]);

  useFrame(() => {
    const p = staticMode ? 0 : progressRef.current;
    uniforms.uProgress.value = p;

    // Fully dissolved, every cell is discarded — the decoder would be
    // spending frames on pixels that never reach the screen. Park it there
    // and resume the moment the dissolve backs off, which is what the
    // launch console leans on: it holds the hero at 1 indefinitely.
    const video = texture.image;
    if (!staticMode && video) {
      if (p >= 1) {
        if (!video.paused) video.pause();
      } else if (video.paused) {
        // autoplay can still refuse here; the still frame is the fallback
        video.play().catch(() => {});
      }
    }
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  );
};

const Dust = () => {
  const positions = useMemo(() => {
    const arr = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2;
      arr[i * 3 + 2] = -1 - Math.random() * 2;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={50}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#C8FF00"
        transparent
        opacity={0.28}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

const HeroDissolve = ({ progressRef, staticMode = false }) => {
  const wrapRef = useRef(null);
  const [frameloop, setFrameloop] = useState("always");

  // park the canvas whenever the hero is offscreen. GSAP's pin re-parent
  // can feed the observer one stale "not intersecting" record and then
  // go quiet — never trust a bare false: confirm against the live rect,
  // and recheck once ~400ms after mount, after the pin has settled.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const onScreen = (r) => r.bottom > 0 && r.top < window.innerHeight;
    const io = new IntersectionObserver(([entry]) => {
      setFrameloop(
        entry.isIntersecting || onScreen(el.getBoundingClientRect())
          ? "always"
          : "never"
      );
    });
    io.observe(el);
    const settle = setTimeout(() => {
      if (onScreen(el.getBoundingClientRect())) setFrameloop("always");
    }, 400);
    return () => {
      io.disconnect();
      clearTimeout(settle);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute left-0 top-0 size-full"
      aria-hidden="true"
    >
      {/* default perspective camera: the ScreenQuad's own shader writes
          clip-space directly and ignores the camera entirely, so this
          only frames the Dust points */}
      <Canvas
        flat
        dpr={[1, 1.5]}
        frameloop={staticMode ? "demand" : frameloop}
        gl={{ powerPreference: "high-performance", antialias: false }}
      >
        <Dust />
        <DissolvePlane progressRef={progressRef} staticMode={staticMode} />
      </Canvas>
    </div>
  );
};

export default HeroDissolve;
