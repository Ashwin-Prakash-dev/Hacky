/* eslint-disable react/no-unknown-property -- r3f elements take three.js
   props, not DOM attributes */
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshPortalMaterial, Html } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Three briefing cards on a ring, each a portal (MeshPortalMaterial) into
// its own small tinted world — a slow wireframe primitive + dust, in the
// spirit of pmndrs' enter-portals. A pinned scroll scrubs the ring
// through three plateaued stops (Expect / Mentors / Rules); the front
// card's world is what's populated (others are hidden, not just dim, to
// keep the frame budget to one live world). Hovering the front card
// dollies the camera in a little and tilts the card toward the pointer,
// so the portal reads as "look inside," not just a lit window.

const RING_R = 4.2;
const STEP = (Math.PI * 2) / 3;
const CAM_Z_DESKTOP = 9.4;
const CAM_Z_PORTRAIT = 11.6;

const roundedGeometry = (() => {
  const w = 2.4;
  const h = 3.1;
  const r = 0.22;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return new THREE.ShapeGeometry(shape, 12);
})();

// plateaued-stop easing: p in [0,1] -> 0..2 with holds near each integer
const stopEase = (p) => {
  const t = THREE.MathUtils.clamp(p, 0, 1) * 2;
  const seg = Math.min(2, Math.floor(t));
  const local = THREE.MathUtils.clamp(t - seg, 0, 1);
  return Math.min(2, seg + THREE.MathUtils.smoothstep(local, 0.25, 0.75));
};

const World = ({ tint, geo }) => (
  <>
    <color attach="background" args={[tint]} />
    <fog attach="fog" args={[tint, 2, 7]} />
    <ambientLight intensity={0.6} />
    <pointLight position={[2, 2, 2]} intensity={12} color="#C8FF00" />
    <PortalPrimitive geo={geo} />
  </>
);

const PortalPrimitive = ({ geo }) => {
  const meshRef = useRef(null);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.25;
    meshRef.current.rotation.y += delta * 0.35;
  });
  return (
    <mesh ref={meshRef} rotation={[0.6, 0.4, 0]}>
      {geo === "torus" && <torusGeometry args={[0.9, 0.32, 16, 48]} />}
      {geo === "icosa" && <icosahedronGeometry args={[1.05, 0]} />}
      {geo === "octa" && <octahedronGeometry args={[1.15, 0]} />}
      <meshBasicMaterial color="#C8FF00" wireframe />
    </mesh>
  );
};

const CARDS = [
  {
    id: "expect",
    title: "What to expect",
    tint: "#0b0e05",
    geo: "torus",
    lines: [
      "30 hours — 24 build, 6 eval",
      "20 curated teams — builders, not attendees",
    ],
  },
  {
    id: "mentors",
    title: "Mentors",
    tint: "#060910",
    geo: "icosa",
    lines: ["Technical founders in the room", "Real 1:1s at your table"],
  },
  {
    id: "rules",
    title: "Rules",
    tint: "#0a0708",
    geo: "octa",
    lines: [
      "Teams of 3–4",
      "All code written inside the window",
      "Ship something deployable — slides don't count",
    ],
  },
];

const PortalCard = ({ index, card, activeStopRef, peekRef, onHoverChange }) => {
  const groupRef = useRef(null);
  const angle = index * STEP;

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const dist = Math.abs(activeStopRef.current - index);
    // MeshPortalMaterial always paints its world onto the mesh face —
    // there's no opacity fade to drive — so visibility (and the perf win
    // of not rendering off-stop worlds) comes entirely from toggling the
    // group: only the outgoing/incoming card stays visible through a
    // crossfade, far-side cards are fully skipped.
    g.visible = dist < 1.05;
    const isFront = dist < 0.05;
    const peek = isFront ? peekRef.current : { x: 0, y: 0 };
    g.rotation.y = peek.x * 0.18;
    g.rotation.x = peek.y * 0.1;
  });

  return (
    <group
      position={[Math.sin(angle) * RING_R, 0, Math.cos(angle) * RING_R]}
      rotation={[0, angle, 0]}
    >
      <group ref={groupRef}>
        <mesh
          geometry={roundedGeometry}
          onPointerOver={() => onHoverChange(index, true)}
          onPointerOut={() => onHoverChange(index, false)}
        >
          <MeshPortalMaterial side={THREE.DoubleSide}>
            <World tint={card.tint} geo={card.geo} />
          </MeshPortalMaterial>
        </mesh>
        {/* hairline lime rim, matching the hero portal language */}
        <mesh geometry={roundedGeometry} position={[0, 0, -0.01]} scale={1.02}>
          <meshBasicMaterial color="#C8FF00" transparent opacity={0.5} />
        </mesh>
        <Html
          transform
          position={[0, -0.95, 0.02]}
          center
          distanceFactor={4.2}
          className="pointer-events-none w-[220px] select-none"
        >
          <div className="rounded-xl bg-[#050505]/70 p-3 backdrop-blur-sm">
            <h3 className="mb-1.5 font-display text-sm font-extrabold uppercase tracking-[0.01em] text-white">
              {card.title}
            </h3>
            <ul className="space-y-1 font-general text-[0.7rem] leading-snug text-white/70">
              {card.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </Html>
      </group>
    </group>
  );
};

const OrbitRig = ({ ringRef, progressRef, activeStopRef, camZ }) => {
  useFrame(({ camera }) => {
    const stop = stopEase(progressRef.current);
    activeStopRef.current = stop;
    if (ringRef.current) ringRef.current.rotation.y = -stop * STEP;
    camera.position.set(0, 0, camZ);
    camera.lookAt(0, 0, 0);
  });
  return null;
};

const BriefingPortals = ({ progressRef, onActiveChange }) => {
  const activeStopRef = useRef(0);
  const ringRef = useRef(null);
  const peekRef = useRef({ x: 0, y: 0 });
  const peekTargetRef = useRef({ x: 0, y: 0 });
  const wrapRef = useRef(null);
  const [frameloop, setFrameloop] = useState("always");
  const [portrait, setPortrait] = useState(
    () => window.innerWidth / window.innerHeight < 0.8
  );

  // park the canvas whenever the section is offscreen. GSAP's pin
  // re-parent can feed the observer one stale "not intersecting" record
  // and then go quiet — never trust a bare false: confirm against the
  // live rect, and recheck once after the pin has settled.
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

  useEffect(() => {
    const onResize = () =>
      setPortrait(window.innerWidth / window.innerHeight < 0.8);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleHoverChange = (_, hovering) => {
    peekTargetRef.current = hovering ? { x: 1, y: 1 } : { x: 0, y: 0 };
  };

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = peekRef.current;
      const t = peekTargetRef.current;
      p.x += (t.x - p.x) * 0.08;
      p.y += (t.y - p.y) * 0.08;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // report the current stop's rounded index to the DOM indicator
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const idx = Math.round(activeStopRef.current);
      if (idx !== last) {
        last = idx;
        onActiveChange(idx);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onActiveChange]);

  const camZ = portrait ? CAM_Z_PORTRAIT : CAM_Z_DESKTOP;

  return (
    <div
      ref={wrapRef}
      className="absolute left-0 top-0 size-full"
      aria-hidden="true"
    >
      <Canvas
        flat
        dpr={[1, 1.5]}
        frameloop={frameloop}
        camera={{ fov: 45, near: 0.1, far: 30, position: [0, 0, camZ] }}
        gl={{ powerPreference: "high-performance", antialias: true }}
      >
        <OrbitRig
          ringRef={ringRef}
          progressRef={progressRef}
          activeStopRef={activeStopRef}
          camZ={camZ}
        />
        <group ref={ringRef}>
          {CARDS.map((card, i) => (
            <PortalCard
              key={card.id}
              index={i}
              card={card}
              activeStopRef={activeStopRef}
              peekRef={peekRef}
              onHoverChange={handleHoverChange}
            />
          ))}
        </group>
      </Canvas>
    </div>
  );
};

export default BriefingPortals;
