/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props */
import { useEffect, useRef, useState, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Fullscreen quad — vertex shader passes clip-space coords straight through.
const VERTEX = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

// Domain-warped fbm "signal field": near-black base, moss mid-tones, lime
// filament highlights, plus scanlines/grain to match the terminal aesthetic.
const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.0;
      a *= 0.55;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 1.6;
    float t = uTime * 0.06;
    vec2 m = uMouse * 0.35;

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(p + 2.4 * q + vec2(1.7, 9.2) + m + t * 0.7),
      fbm(p + 2.4 * q + vec2(8.3, 2.8) - m - t * 0.4)
    );
    float f = fbm(p + 2.2 * r);

    vec3 col = mix(
      vec3(0.008, 0.012, 0.008),
      vec3(0.035, 0.075, 0.012),
      clamp(f * f * 2.2, 0.0, 1.0)
    );
    col = mix(col, vec3(0.16, 0.28, 0.03), clamp(length(q) * 0.9, 0.0, 1.0));
    col = mix(col, vec3(0.784, 1.0, 0.0), pow(clamp(r.y * f, 0.0, 1.0), 3.0) * 0.9);
    col += vec3(0.784, 1.0, 0.0) * pow(f, 6.0) * 0.55;

    col *= 0.92 + 0.08 * sin(gl_FragCoord.y * 1.35);
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.035;

    float d = distance(uv, vec2(0.5, 0.45));
    col *= smoothstep(0.95, 0.25, d);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function ShaderPlane() {
  const materialRef = useRef();
  const mouse = useRef(new THREE.Vector2(0, 0));
  const target = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const onMove = (e) => {
      target.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mouse.current.lerp(target.current, 0.04);
    mat.uniforms.uMouse.value.copy(mouse.current);
    mat.uniforms.uRes.value.set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr
    );
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={{
          uTime: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uMouse: { value: new THREE.Vector2(0, 0) },
        }}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

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

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

// Static gradient stand-in for no-WebGL / reduced-motion / crashed contexts.
const StaticFallback = () => (
  <div
    aria-hidden="true"
    className="absolute left-0 top-0 size-full"
    style={{
      background:
        "radial-gradient(ellipse 80% 60% at 30% 25%, rgba(200,255,0,0.09), transparent 65%)," +
        "radial-gradient(ellipse 70% 55% at 75% 70%, rgba(200,255,0,0.05), transparent 60%)," +
        "#050505",
    }}
  />
);

const HeroShader = () => {
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [webgl] = useState(isWebGLAvailable);
  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Stop rendering entirely once the hero scrolls out of the viewport.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!webgl || reducedMotion) return <StaticFallback />;

  return (
    <div ref={wrapRef} aria-hidden="true" className="absolute left-0 top-0 size-full">
      <CanvasErrorBoundary fallback={<StaticFallback />}>
        <Canvas
          gl={{ antialias: false, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
          frameloop={inView ? "always" : "never"}
          style={{ position: "absolute", inset: 0 }}
        >
          <ShaderPlane />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default HeroShader;
