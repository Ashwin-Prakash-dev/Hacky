import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

const DURATION = 5.0; // seconds

// Fullscreen quad vertex shader
const vert = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Dissolve fragment shader
// Technique: domain-warped fBm (IQ "Warp" style) as dissolve mask.
// Threshold sweeps 0→1, pixels whose noise < threshold become transparent,
// revealing HTML content beneath the canvas. Lime glow at the wave front.
const frag = /* glsl */`
  uniform float uThreshold; // 0 (fully covered) → 1 (fully revealed)
  varying vec2 vUv;

  // ── noise ────────────────────────────────────────────────────────────────
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
  }

  float gnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(
      mix(dot(hash2(i),          f),
          dot(hash2(i+vec2(1,0)), f-vec2(1,0)), u.x),
      mix(dot(hash2(i+vec2(0,1)), f-vec2(0,1)),
          dot(hash2(i+vec2(1,1)), f-vec2(1,1)), u.x),
      u.y);
  }

  float fbm(vec2 p) {
    float v=0.0, a=0.5;
    mat2 m = mat2(1.6,1.2,-1.2,1.6);
    for(int i=0;i<5;i++){ v+=a*gnoise(p); p=m*p; a*=0.5; }
    return v;
  }

  // domain-warped noise — same technique as BackgroundCanvas but static
  float warpNoise(vec2 uv) {
    vec2 q = vec2(fbm(uv), fbm(uv + vec2(5.2, 1.3)));
    vec2 r = vec2(fbm(uv + 4.0*q + vec2(1.7, 9.2)),
                  fbm(uv + 4.0*q + vec2(8.3, 2.8)));
    return fbm(uv + 3.5*r) * 0.5 + 0.5; // remap to 0..1
  }

  void main() {
    // Slight top-to-bottom bias so dissolve sweeps downward
    vec2 uv = vUv * 2.2;
    float n  = warpNoise(uv);
    float nB = n * 0.75 + vUv.y * 0.25; // mix noise with vertical gradient

    float thr  = uThreshold;
    float edge = 0.06;

    if (nB < thr - edge) {
      // Fully revealed — discard so HTML beneath shows through
      discard;
    } else if (nB < thr) {
      // Dissolving edge — lime glow
      float glow = 1.0 - (thr - nB) / edge;
      float alpha = glow * glow;
      gl_FragColor = vec4(0.784, 1.0, 0.0, alpha * 0.85);
    } else {
      // Still covered — dark (#0a0a0a)
      // Subtle lime tint near the approaching wave front
      float near = smoothstep(thr + 0.35, thr + 0.02, nB);
      vec3 col = vec3(0.039) + vec3(0.784, 1.0, 0.0) * near * 0.04;
      gl_FragColor = vec4(col, 1.0);
    }
  }
`;

// ─── Three.js plane that animates uThreshold ─────────────────────────────────
const DissolvePlane = ({ onDone }) => {
  const matRef    = useRef(null);
  const startRef  = useRef(null);
  const doneRef   = useRef(false);
  const uniforms  = useRef({ uThreshold: { value: 0.0 } });

  useFrame(({ clock }) => {
    if (doneRef.current) return;
    if (!startRef.current) startRef.current = clock.elapsedTime;

    const elapsed = clock.elapsedTime - startRef.current;
    const t = Math.min(elapsed / DURATION, 1.0);

    // Cubic ease-in-out
    const eased = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    uniforms.current.uThreshold.value = eased;

    if (t >= 1.0 && !doneRef.current) {
      doneRef.current = true;
      onDone?.();
    }
  });

  return (
    <mesh renderOrder={1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms.current}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

// ─── component ───────────────────────────────────────────────────────────────
const PhaseTransition = ({ direction = "forward", children }) => {
  const [canvasVisible, setCanvasVisible] = useState(true);

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>

      {/* R3F dissolve canvas — sits on top, transparent to HTML when pixels discard */}
      {canvasVisible && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            pointerEvents: "none",
          }}
        >
          <Canvas
            flat
            gl={{ alpha: true, antialias: false, premultipliedAlpha: false }}
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 1] }}
          >
            <DissolvePlane onDone={() => setCanvasVisible(false)} />
          </Canvas>
        </div>
      )}

      {/* Phase content — visible immediately behind the dissolving shader */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};

export default PhaseTransition;
