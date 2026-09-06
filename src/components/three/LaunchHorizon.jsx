/* eslint-disable react/no-unknown-property -- r3f elements take three.js
   props, not DOM attributes */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// The launch console's ground: a red drafting grid projected onto a floor
// and a far fainter ceiling, racing toward a horizon set just above centre.
// It is the same blueprint surface the site-wide lens paints (.lens-grid, in
// lime there), given perspective, a direction of travel, and its own tint.
//
// Everything reads from one plain object passed in as `driveRef`:
//   charge   0 idle -> 1 armed  (travel speed, horizon bloom, ring pulse)
//   urgency  0      -> 1 at T-0 (the last minute tightening)
//   flash    one-shot ignition, tweened down by the page
// The page mutates that object (directly, or by letting GSAP tween it) and
// the canvas smooths it per-frame. No React state crosses the boundary, so
// the countdown's once-a-tick re-render never touches the render loop.

const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const QUAD_FRAG = /* glsl */ `
  precision highp float;

  uniform vec2  uRes;
  uniform float uScroll;  // world travel, pre-wrapped to the grid period
  uniform float uPulse;   // ring phase, 0..1
  uniform float uCharge;
  uniform float uUrgency;
  uniform float uFlash;
  varying vec2  vUv;

  const vec3 TINT = vec3(1.0, 0.16, 0.08);

  // One infinite plane's worth of grid, distance-faded. Line width grows
  // with distance to stand in for a screen-space derivative: fwidth needs
  // an extension under WebGL1 and this costs nothing.
  // Every smoothstep is written ascending — descending edges are undefined
  // on this project's target GPUs.
  float deck(vec3 rd, float h, float scroll) {
    float t = h / rd.y;
    // the upper bound also catches rd.y == 0 exactly, where t is inf and
    // fract() below would go undefined along the horizon row
    if (t <= 0.0 || t > 200.0) return 0.0;

    vec2 q = vec2(rd.x * t, rd.z * t + scroll);
    float w = 0.010 + t * 0.0022;

    vec2 fine = abs(fract(q) - 0.5);
    float f = (1.0 - smoothstep(w, w * 2.8, fine.x))
            + (1.0 - smoothstep(w, w * 2.8, fine.y));

    // every fifth line held brighter — the coarse block of .lens-grid
    vec2 block = abs(fract(q * 0.2) - 0.5);
    float bw = w * 0.2;
    float b = (1.0 - smoothstep(bw, bw * 3.2, block.x))
            + (1.0 - smoothstep(bw, bw * 3.2, block.y));

    float g = clamp(f * 0.4 + b * 0.85, 0.0, 1.5);

    // fade the far end into the horizon and the near end off the bottom
    // edge, so neither aliases
    return g * (1.0 - smoothstep(9.0, 52.0, t)) * smoothstep(0.5, 3.2, t);
  }

  void main() {
    // s: screen space, -1..1 on both axes before any aspect correction, so
    // every position below is a fraction of the viewport rather than of the
    // width — the composition holds from 375px portrait to a projector.
    vec2 s = vUv * 2.0 - 1.0;
    float aspect = uRes.x / uRes.y;
    float wide = smoothstep(0.85, 1.35, aspect);

    // Dead-centre vanishing point, horizon set high: the console's stack is
    // centred, so the deck reads as a runway running straight out from under
    // it. Everything below the horizon is floor, which is most of the frame.
    vec2 vp = vec2(0.0, mix(0.58, 0.46, wide));
    vec2 c = vec2(s.x * aspect, s.y - vp.y);

    // eye at the origin; the world slides past on z, so floor and ceiling
    // stay locked to each other however fast the clock is running
    vec3 rd = normalize(vec3(c.x, c.y, -1.4));

    // The deck lies down under the stack — a light well around the centre
    // column rather than a scrim behind it, so there is no edge to see. Taller
    // than it is wide, because the wordmark, the clock and the sponsor row all
    // share one axis.
    float quiet = mix(0.22, 1.0,
      smoothstep(0.10, 1.0, length((s - vec2(0.0, 0.04)) / vec2(1.12, 1.32))));

    vec3 col = vec3(0.0);
    col += TINT * deck(rd, -1.0, uScroll) * (0.18 + uCharge * 0.20 + uUrgency * 0.30);
    col += TINT * deck(rd,  2.6, uScroll) * (0.05 + uCharge * 0.07 + uUrgency * 0.12);

    // rings running outward across the floor once the clock is armed — the
    // console's own pulse, roughly one a second. Measured from under the
    // viewer rather than from the world origin, so they keep pace with the
    // travel instead of being left behind by it.
    float tf = -1.0 / rd.y;
    if (tf > 0.0 && tf < 200.0) {
      float r = length(vec2(rd.x, rd.z) * tf);
      float wave = fract(uPulse - r * 0.055);
      float ring = (1.0 - smoothstep(0.0, 0.09, wave))
                 * (1.0 - smoothstep(4.0, 40.0, r))
                 * smoothstep(0.5, 3.0, tf);
      col += TINT * ring * uCharge * 0.42;
    }

    // the horizon itself: a hairline of light, and the bloom behind it
    float band  = 1.0 - smoothstep(0.0, 0.010, abs(c.y));
    float bloom = 1.0 - smoothstep(0.0, 0.32,  abs(c.y));
    float mid   = 1.0 - smoothstep(0.0, 1.5,   abs(c.x));
    col += TINT * band * (0.30 + uCharge * 0.45 + uUrgency * 0.55);
    col += TINT * bloom * mid * (0.030 + uCharge * 0.075 + uUrgency * 0.20);

    // corners fall away, then the light well; ignition sits on top of both
    // because a flash that respected the well would look like a hole
    float vig = 1.0 - 0.58 * pow(clamp(length(s * vec2(0.62, 0.78)), 0.0, 1.0), 1.8);
    col *= vig * quiet;
    col += (TINT * 0.75 + 0.25) * uFlash;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Same guard the hero uses: a context that cannot be created makes R3F
// throw on mount, and this page has to stay usable — the countdown is DOM,
// so without the deck it degrades to type on the site's own near-black.
const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

const Deck = ({ driveRef, staticMode, revision }) => {
  const { size, invalidate } = useThree();
  const smoothed = useRef({ charge: 0, urgency: 0 }).current;
  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uScroll: { value: 0 },
      uPulse: { value: 0 },
      uCharge: { value: 0 },
      uUrgency: { value: 0 },
      uFlash: { value: 0 },
    }),
    [],
  );

  uniforms.uRes.value.set(size.width, size.height);

  // Under reduced motion the loop is on demand, so nothing would repaint
  // when the console is armed. Ask for the one frame that state change is
  // worth — the deck brightens, it just does not start travelling.
  useEffect(() => {
    if (staticMode) invalidate();
  }, [revision, staticMode, invalidate]);

  useFrame((_, delta) => {
    const d = driveRef.current;
    // one smoothing pass for the whole scene: the page can slam a value and
    // the deck still arrives at it without a step. On demand there is no
    // next frame to converge in, so take it whole.
    const k = staticMode ? 1 : Math.min(1, delta * 3.2);
    smoothed.charge += (d.charge - smoothed.charge) * k;
    smoothed.urgency += (d.urgency - smoothed.urgency) * k;

    if (!staticMode) {
      // travel is integrated here and wrapped to the coarse grid's 5-unit
      // period, rather than derived from a running clock in the shader —
      // this console can sit armed for hours, and a float that large
      // quantises the hairlines into a crawl.
      const speed = 1.1 + smoothed.charge * 4.2 + smoothed.urgency * 9.0;
      uniforms.uScroll.value = (uniforms.uScroll.value + delta * speed) % 5;
      uniforms.uPulse.value = (uniforms.uPulse.value + delta * 0.85) % 1;
    }
    uniforms.uCharge.value = smoothed.charge;
    uniforms.uUrgency.value = smoothed.urgency;
    uniforms.uFlash.value = d.flash;
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        vertexShader={QUAD_VERT}
        fragmentShader={QUAD_FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  );
};

const LaunchHorizon = ({ driveRef, staticMode = false, revision = 0 }) => {
  const webgl = useMemo(supportsWebGL, []);
  if (!webgl) return null;

  // fixed, not absolute: on a short viewport the console's own content grows
  // past the fold, and the deck has to stay framed to the window
  return (
    <div className="fixed inset-0" aria-hidden="true">
      <Canvas
        flat
        dpr={[1, 1.5]}
        frameloop={staticMode ? "demand" : "always"}
        gl={{ powerPreference: "high-performance", antialias: false }}
      >
        <Deck driveRef={driveRef} staticMode={staticMode} revision={revision} />
      </Canvas>
    </div>
  );
};

export default LaunchHorizon;
