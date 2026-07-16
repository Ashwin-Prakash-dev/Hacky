/* eslint-disable react/no-unknown-property -- r3f elements (shaderMaterial)
   take three.js props, not DOM attributes */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// The hero's 3D centerpiece: a field of liquid-mercury metaballs rendered
// by raymarching signed distance fields in a single fullscreen fragment
// shader (no geometry beyond a screen quad). Drops drift on lissajous
// orbits, fuse and split through a polynomial smooth-min, and wear the
// brand: near-black cores, a chromatic lime fresnel rim (the x-ray /
// hologram read), white studio glints from a faked env reflection.
//
// Interaction: one droplet IS the cursor (smoothed pointer projected onto
// the z≈0 plane) — moving the mouse drags a drop through the field so it
// merges with and tears off the others. Scroll velocity feeds a smoothed
// "kick" that warps the sim clock, so the mercury trembles when the page
// moves. The canvas parks (frameloop "never") whenever the hero leaves
// the viewport; under reduced motion it renders a single still frame.

const VERT = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 uMouse;
  uniform float uSpread;
  uniform float uCount;
  uniform float uSurge;
  uniform vec3 uSurgePos;

  #define MAX_STEPS 80
  #define MAX_DIST 14.0

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  vec3 ballPos(float fi, float t) {
    float s1 = fi * 1.7 + 1.3;
    float s2 = fi * 2.3 + 4.1;
    float s3 = fi * 3.1 + 0.7;
    // y band stays clear of the hero's top posts (ribbon / nav) and
    // sags slightly below center
    return vec3(
      sin(t * (0.21 + 0.05 * sin(s1)) + s1 * 2.4) * uSpread,
      sin(t * (0.27 + 0.04 * cos(s2)) + s2 * 1.9) * 1.05 - 0.12,
      sin(t * 0.17 + s3 * 2.2) * 0.85
    );
  }

  float ballR(float fi) {
    return 0.4 + 0.3 * fract(sin(fi * 12.9898) * 43758.5453);
  }

  float map(vec3 p) {
    float d = 1e9;
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      if (fi >= uCount) break;
      // CTA surge: every drop races toward the hovered Apply button,
      // shrinking slightly so they read as droplets in flight
      vec3 c = mix(ballPos(fi, uTime), uSurgePos, uSurge * (0.62 + 0.06 * fi));
      float r = ballR(fi) * (1.0 - 0.22 * uSurge);
      d = smin(d, length(p - c) - r, 0.55);
    }
    // the cursor droplet
    d = smin(d, length(p - uMouse) - 0.32, 0.55);
    return d;
  }

  vec3 calcNormal(vec3 p) {
    const vec2 e = vec2(1.0, -1.0) * 0.5773 * 0.0018;
    return normalize(
      e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
      e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx)
    );
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
    vec3 ro = vec3(0.0, 0.0, 5.2);
    vec3 rd = normalize(vec3(uv * 0.62, -1.0));

    float t = 0.0;
    float glow = 0.0;
    float hit = -1.0;
    for (int i = 0; i < MAX_STEPS; i++) {
      vec3 p = ro + rd * t;
      float d = map(p);
      glow = max(glow, exp(-d * d * 5.0));
      if (d < 0.0014 * t) { hit = 1.0; break; }
      t += d;
      if (t > MAX_DIST) break;
    }

    vec3 lime = vec3(0.784, 1.0, 0.0);
    vec3 col;
    float alpha;

    if (hit > 0.0) {
      vec3 p = ro + rd * t;
      vec3 n = calcNormal(p);
      vec3 v = -rd;
      float ndv = clamp(dot(n, v), 0.0, 1.0);
      // chromatic fresnel: each channel falls off differently so the rim
      // fringes from warm lime through green to a cool edge
      vec3 freC = vec3(
        pow(1.0 - ndv, 2.5),
        pow(1.0 - ndv, 3.1),
        pow(1.0 - ndv, 4.2)
      );
      float fre = freC.g;

      // near-black liquid core with a faint green cast
      col = vec3(0.014, 0.02, 0.008);

      // faked studio environment: a soft top dome plus a cold key streak,
      // sampled along the reflection vector — sells "liquid chrome"
      vec3 r = reflect(rd, n);
      float dome = smoothstep(-0.25, 1.0, r.y);
      float streak = pow(smoothstep(0.55, 0.98, sin(r.x * 2.3 + r.y * 3.5 + 1.2)), 6.0);
      col += (vec3(0.045, 0.055, 0.04) * dome + vec3(0.5, 0.55, 0.5) * streak * dome * 0.5)
        * (0.25 + 0.75 * fre);

      // the chromatic lime rim
      col += lime * fre * 0.85;
      col += vec3(0.35, 0.95, 0.55) * freC.x * 0.10;
      col += vec3(0.92, 1.0, 0.55) * freC.z * 0.22;

      // two speculars: a white key and a lime fill
      vec3 l1 = normalize(vec3(0.6, 0.7, 0.5));
      vec3 l2 = normalize(vec3(-0.6, -0.4, 0.6));
      col += vec3(1.0) * pow(max(dot(reflect(-l1, n), v), 0.0), 90.0) * 0.9;
      col += lime * pow(max(dot(reflect(-l2, n), v), 0.0), 36.0) * 0.45;

      alpha = 1.0;
    } else {
      // soft lime aura hugging the silhouettes (premultiplied)
      float a = glow * glow * 0.12;
      col = lime * a;
      alpha = a;
    }

    gl_FragColor = vec4(col, alpha);
  }
`;

// world-units the pointer travels per unit of NDC: the ray leaves
// ro.z=5.2 with slope 0.62 and hits the z=0 plane after 5.2 units
const PLANE_SCALE = 0.62 * 5.2;

function MercuryScene({ still }) {
  const matRef = useRef(null);
  const { gl, size, viewport, setDpr } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 8.0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector3(0, -0.4, 0.4) },
      uSpread: { value: 2.6 },
      uCount: { value: 7 },
      uSurge: { value: 0 },
      uSurgePos: { value: new THREE.Vector3(0, 0, 0) },
    }),
    []
  );

  const sim = useRef({
    t: 8,
    mx: 0.6,
    my: -0.4,
    tx: 0.6,
    ty: -0.4,
    kick: 0,
    surge: 0,
    surgeOn: false,
    lastY: typeof window === "undefined" ? 0 : window.scrollY,
    // adaptive quality: rolling frame-time average; degrade-only
    ftAcc: 0,
    ftN: 0,
    warm: 0,
    quality: 0,
  });

  // no fine pointer (touch devices): the cursor droplet wanders on its
  // own noise path instead of sitting dead where it initialized
  const coarse = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none), (pointer: coarse)").matches,
    []
  );

  useEffect(() => {
    const aspect = size.width / size.height;
    uniforms.uSpread.value = Math.min(Math.max(aspect * 1.5, 1.15), 3.4);
    uniforms.uCount.value = size.width < 768 ? 5 : 7;
  }, [size, uniforms]);

  useEffect(() => {
    const toWorld = (px, py) => {
      const ndcX = (px / window.innerWidth) * 2 - 1;
      const ndcY = -((py / window.innerHeight) * 2 - 1);
      const aspect = window.innerWidth / window.innerHeight;
      return [ndcX * aspect * PLANE_SCALE, ndcY * PLANE_SCALE];
    };
    const onMove = (e) => {
      const [wx, wy] = toWorld(e.clientX, e.clientY);
      sim.current.tx = wx;
      sim.current.ty = wy;
      // CTA surge: hovering any Apply link magnetizes the whole field
      // onto the button
      const apply = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest?.('a[href="/apply"]');
      if (apply) {
        const r = apply.getBoundingClientRect();
        const [sx, sy] = toWorld(r.left + r.width / 2, r.top + r.height / 2);
        uniforms.uSurgePos.value.set(sx, sy, 0);
      }
      sim.current.surgeOn = !!apply;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [uniforms]);

  useFrame((_, dt) => {
    const s = sim.current;
    const u = uniforms;
    const y = window.scrollY;
    const vel = Math.abs(y - s.lastY);
    s.lastY = y;
    // scroll agitation: a smoothed kick warps the sim clock
    s.kick += (Math.min(vel / 30, 2) - s.kick) * 0.08;
    if (!still) s.t += Math.min(dt, 0.05) * (0.9 + s.kick * 1.6);
    u.uTime.value = s.t;
    // touch devices: the cursor droplet wanders on its own orbit
    if (coarse) {
      s.tx = Math.sin(s.t * 0.16 + 2.1) * u.uSpread.value * 0.7;
      s.ty = Math.sin(s.t * 0.23 + 0.6) * 0.9 - 0.1;
    }
    s.mx += (s.tx - s.mx) * 0.07;
    s.my += (s.ty - s.my) * 0.07;
    u.uMouse.value.set(s.mx, s.my, 0.4);
    // CTA surge ramps in fast, releases slower
    s.surge += ((s.surgeOn ? 1 : 0) - s.surge) * (s.surgeOn ? 0.09 : 0.05);
    u.uSurge.value = s.surge;
    u.uRes.value.set(
      size.width * viewport.dpr,
      size.height * viewport.dpr
    );
    // adaptive quality: after warmup, if the rolling average can't hold
    // ~45fps, step the render resolution down (degrade-only, two steps)
    if (!still && s.warm < 60) {
      s.warm += 1;
    } else if (!still) {
      s.ftAcc += dt;
      s.ftN += 1;
      if (s.ftN === 120) {
        const avg = s.ftAcc / s.ftN;
        s.ftAcc = 0;
        s.ftN = 0;
        if (avg > 1 / 45 && s.quality < 2) {
          s.quality += 1;
          setDpr(s.quality === 1 ? 1.1 : 0.85);
        }
      }
    }
  });

  // gl is stable; touching it here keeps lint honest about the dep
  useEffect(() => void gl, [gl]);

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
}

function canRender() {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const MercuryField = () => {
  const hostRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [webgl] = useState(canRender);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // park the render loop whenever the hero is off-screen
  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  if (!webgl) return null;

  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div ref={hostRef} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={reduced ? "demand" : visible ? "always" : "never"}
        dpr={mobile ? 1 : [1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <MercuryScene still={reduced} />
      </Canvas>
    </div>
  );
};

export default MercuryField;
