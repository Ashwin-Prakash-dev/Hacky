import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

// Fullscreen quad — positions from PlaneGeometry(2,2) go -1..1
// so we pass them straight to clip space, bypassing camera projection.
const vert = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Domain-warped fBm — technique from Inigo Quilez's "Warp" (shadertoy.com/view/4s23zz)
// Dark palette (#0a0a0a) with subtle lime (#C8FF00) at noise peaks.
const frag = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
          dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
      mix(dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
          dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float f = 0.0;
    float w = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      f += w * noise(p);
      p = m * p;
      w *= 0.5;
    }
    return f;
  }

  void main() {
    vec2 uv = vUv * 2.5;
    float t  = uTime * 0.07;

    // First warp level
    vec2 q = vec2(
      fbm(uv + t),
      fbm(uv + vec2(5.2, 1.3) + t * 0.65)
    );

    // Second warp level — q warps uv further
    vec2 r = vec2(
      fbm(uv + 4.0 * q + vec2(1.7, 9.2) + t * 0.32),
      fbm(uv + 4.0 * q + vec2(8.3, 2.8) + t * 0.26)
    );

    float f   = fbm(uv + 3.5 * r);
    float t01 = clamp(f * 0.5 + 0.5, 0.0, 1.0);

    // Base is #0a0a0a
    vec3 col = vec3(0.039, 0.039, 0.039);

    // Mid-tone: a slightly brighter dark-green region in the flow
    col = mix(col, vec3(0.052, 0.062, 0.036), smoothstep(0.3, 0.58, t01));

    // Lime accent (#C8FF00 = 0.784,1.0,0.0) at warp peaks
    float limeMask = smoothstep(0.58, 0.80, t01);
    col += vec3(0.784, 1.0, 0.0) * limeMask * 0.13;

    // Vignette — pull edges back to deep black
    vec2 c = vUv - 0.5;
    float vig = 1.0 - dot(c, c) * 2.0;
    col *= clamp(vig, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const WarpField = () => {
  const uniforms = useMemo(() => ({ uTime: { value: 0.0 } }), []);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

const BackgroundCanvas = () => (
  <div
    aria-hidden="true"
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
    }}
  >
    <Canvas
      flat
      gl={{ antialias: false, alpha: false }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 1] }}
    >
      <WarpField />
    </Canvas>
  </div>
);

export default BackgroundCanvas;
