/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props */
import { useEffect, useMemo, useRef, useState, Component } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ~7.5s choreography, all computed on the GPU from uTime:
//   0.0s – 3.2s  particles drift in from depth, swirling in a slow vortex
//   3.2s – 7.5s  staggered convergence: each particle peels off the vortex
//                and locks into its glyph position spelling STARTATHON
//   7.5s –  ∞    idle shimmer + pointer repulsion around the cursor
const VERTEX = /* glsl */ `
  attribute vec3 aStart;
  attribute float aRand;

  uniform float uTime;
  uniform float uScale;
  uniform vec2 uPointer;
  uniform float uSize;

  varying float vAlpha;
  varying float vHot;
  varying float vRand;

  float easeOutCubic(float x) { return 1.0 - pow(1.0 - x, 3.0); }

  void main() {
    float t = uTime;
    float delay = aRand * 1.8;
    float p = clamp((t - 3.2 - delay) / 2.5, 0.0, 1.0);
    p = easeOutCubic(p);

    // vortex: rotate the scatter cloud around Y, pulling slowly inward
    vec3 s = aStart;
    float ang = t * (0.18 + aRand * 0.25) + aRand * 6.28318;
    float ca = cos(ang), sa = sin(ang);
    s = vec3(ca * s.x + sa * s.z, s.y, -sa * s.x + ca * s.z);
    s *= mix(1.0, 0.5, clamp(t / 4.0, 0.0, 1.0));
    s.y += sin(t * 0.6 + aRand * 12.0) * 0.4 * (1.0 - p);

    vec3 target = position * uScale;
    vec3 pos = mix(s, target, p);

    // settled shimmer
    pos += vec3(
      sin(t * 1.4 + aRand * 43.0),
      cos(t * 1.7 + aRand * 29.0),
      sin(t * 1.1 + aRand * 17.0)
    ) * 0.012 * uScale * 0.08 * p;

    // pointer repulsion once converged
    vec2 d = pos.xy - uPointer;
    float dist = length(d);
    float rep = smoothstep(0.14 * uScale, 0.0, dist) * p;
    pos.xy += (d / max(dist, 1e-4)) * rep * 0.05 * uScale;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // bimodal sizes: mostly fine pixels, ~20% chunky blocks
    float chunk = step(0.8, aRand);
    gl_PointSize = uSize * mix(0.45 + aRand * 0.5, 1.6, chunk) * (6.0 / -mv.z);

    vAlpha = clamp(t * 0.8, 0.0, 1.0) * (0.30 + 0.70 * p);
    vHot = p;
    vRand = aRand;
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  varying float vAlpha;
  varying float vHot;
  varying float vRand;

  void main() {
    // crisp square "pixel" with a thin soft edge — terminal aesthetic
    vec2 c = abs(gl_PointCoord - 0.5);
    float edge = max(c.x, c.y);
    float a = (1.0 - smoothstep(0.42, 0.5, edge)) * vAlpha;
    if (a < 0.01) discard;

    vec3 lime = vec3(0.784, 1.0, 0.0);
    vec3 moss = vec3(0.30, 0.44, 0.05);
    // depth variation: some particles sit darker, some run white-hot
    vec3 col = mix(moss, lime, smoothstep(0.15, 0.6, vRand));
    col = mix(col, vec3(1.0), step(0.93, vRand) * 0.7 * vHot);

    // sparse random flicker once the word has formed
    float flicker = step(0.985, fract(vRand * 91.7 + uTime * (1.5 + vRand * 3.0)));
    col += vec3(0.4, 0.5, 0.2) * flicker * vHot;

    gl_FragColor = vec4(col, a);
  }
`;

const WORD = "STARTATHON";

// The Zentry display font ships in /public/fonts but has no CSS @font-face;
// load it directly for the offscreen rasterization, falling back to the
// body font if the load fails.
async function loadDisplayFont() {
  try {
    const font = new FontFace("zentry", 'url(/fonts/zentry-regular.woff2)');
    await font.load();
    document.fonts.add(font);
    return '"zentry", sans-serif';
  } catch {
    try {
      await document.fonts.ready;
    } catch {
      /* sample with whatever is available */
    }
    return '"Open Sauce Sans", sans-serif';
  }
}

// Rasterize the word offscreen and return `count` normalized target
// positions (x in [-0.5, 0.5], y aspect-correct, slight z jitter).
async function sampleWordTargets(count) {
  const family = await loadDisplayFont();
  const weight = family.startsWith('"zentry"') ? 400 : 900;
  const W = 1800;
  const H = 460;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let px = 330;
  ctx.font = `${weight} ${px}px ${family}`;
  const w = ctx.measureText(WORD).width;
  if (w > W * 0.97) {
    px = Math.floor((px * W * 0.97) / w);
    ctx.font = `${weight} ${px}px ${family}`;
  }
  ctx.fillText(WORD, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts = [];
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 128) pts.push(x, y);
    }
  }
  const n = pts.length / 2;
  if (n === 0) return null;

  const targets = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const j = Math.floor(Math.random() * n);
    targets[i * 3] = (pts[j * 2] - W / 2) / W + (Math.random() - 0.5) * 0.002;
    targets[i * 3 + 1] = -(pts[j * 2 + 1] - H / 2) / W + (Math.random() - 0.5) * 0.002;
    targets[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
  }
  return targets;
}

function ParticleWord({ started, count }) {
  const materialRef = useRef();
  const timeRef = useRef(0);
  const pointer = useRef(new THREE.Vector2(999, 999));
  const pointerTarget = useRef(new THREE.Vector2(999, 999));
  const { viewport, gl } = useThree();
  const [targets, setTargets] = useState(null);

  useEffect(() => {
    let alive = true;
    sampleWordTargets(count).then((t) => alive && setTargets(t));
    return () => {
      alive = false;
    };
  }, [count]);

  const { starts, rands } = useMemo(() => {
    const s = new Float32Array(count * 3);
    const r = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // scatter cloud: wide shell around the camera axis, pushed into depth
      const th = Math.random() * Math.PI * 2;
      const rad = 4 + Math.random() * 7;
      s[i * 3] = Math.cos(th) * rad;
      s[i * 3 + 1] = (Math.random() - 0.5) * 8;
      s[i * 3 + 2] = Math.sin(th) * rad - 3;
      r[i] = Math.random();
    }
    return { starts: s, rands: r };
  }, [count]);

  useEffect(() => {
    const onMove = (e) => {
      pointerTarget.current.set(
        ((e.clientX / window.innerWidth) * 2 - 1) * (viewport.width / 2),
        -((e.clientY / window.innerHeight) * 2 - 1) * (viewport.height / 2)
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [viewport.width, viewport.height]);

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    if (started) timeRef.current += Math.min(delta, 0.05);
    mat.uniforms.uTime.value = timeRef.current;
    mat.uniforms.uScale.value = Math.min(viewport.width * 1.02, 18);
    mat.uniforms.uSize.value = 34 * gl.getPixelRatio();
    pointer.current.lerp(pointerTarget.current, 0.08);
    mat.uniforms.uPointer.value.copy(pointer.current);
  });

  if (!targets) return null;

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[targets, 3]} />
        <bufferAttribute attach="attributes-aStart" args={[starts, 3]} />
        <bufferAttribute attach="attributes-aRand" args={[rands, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={{
          uTime: { value: 0 },
          uScale: { value: 10 },
          uPointer: { value: new THREE.Vector2(999, 999) },
          uSize: { value: 30 },
        }}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

export function canUseParticles() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
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

export const StaticHeroBackground = () => (
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

const HeroParticles = ({ started = true }) => {
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(true);
  const isMobile = useMemo(
    () => window.matchMedia("(max-width: 767px)").matches,
    []
  );

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

  return (
    <div ref={wrapRef} aria-hidden="true" className="absolute left-0 top-0 size-full">
      <CanvasErrorBoundary fallback={<StaticHeroBackground />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
          dpr={isMobile ? 1 : [1, 1.75]}
          frameloop={inView ? "always" : "never"}
          style={{ position: "absolute", inset: 0, background: "#050505" }}
        >
          <ParticleWord started={started} count={isMobile ? 6000 : 20000} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default HeroParticles;
