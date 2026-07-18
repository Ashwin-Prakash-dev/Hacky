import * as THREE from "three";
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, useVideoTexture } from "@react-three/drei";
import { DisplayText, LabelText } from "./SceneText";
import {
  BUILDERS,
  BRIEFING_LINES,
  SPONSORS,
  CHAPTER_COUNT,
  LIME,
  INK,
} from "./journeyContent";

// Each chapter composes one viewport-height of the journey. All sizes
// derive from the live viewport (vw/vh in world units at z=0) so the
// composition holds from 375px phones to ultrawides. Small z offsets give
// elements different screen speeds under the narrow-fov camera — the
// parallax that makes the wall feel dimensional through the lens.

export const Arrival = ({ vw }) => (
  <group>
    <DisplayText fontSize={vw * 0.105} color={LIME}>
      Startathon.
    </DisplayText>
    <LabelText
      fontSize={Math.max(vw * 0.014, 0.09)}
      position={[0, -vw * 0.095, 0.5]}
      fillOpacity={0.75}
    >
      30 HOURS · 20 TEAMS · SHIP SOMETHING REAL
    </LabelText>
  </group>
);

export const Positioning = ({ vw, vh }) => (
  <group>
    <DisplayText
      fontSize={vw * 0.062}
      maxWidth={vw * 0.62}
      anchorX="left"
      textAlign="left"
      position={[-vw * 0.38, vh * 0.18, -1.5]}
    >
      {"Kerala's most curated hackathon."}
    </DisplayText>
    <DisplayText
      fontSize={vw * 0.042}
      color={LIME}
      anchorX="right"
      position={[vw * 0.36, -vh * 0.22, 1.2]}
    >
      Not everyone gets in.
    </DisplayText>
  </group>
);

// One tile of the builder wall. Each tile flies in from deep space with a
// staggered unfold as its chapter arrives, and swings away as it leaves.
// Videos start paused and only play while their chapter is within range;
// a playing video keeps requesting frames so the texture stays live on
// the demand loop.
const easeOutCubic = (x) => 1 - (1 - x) ** 3;

const BuilderPanel = ({
  builder,
  index,
  chapterIndex,
  journey,
  reducedMotion,
  width,
  position,
}) => {
  const group = useRef(null);
  const texture = useVideoTexture(builder.src, {
    start: false,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata",
  });
  const playing = useRef(false);

  useFrame((state) => {
    const video = texture.image;
    const at = journey.current.progress * (CHAPTER_COUNT - 1);
    const t = THREE.MathUtils.clamp(at - chapterIndex, -1, 1);
    const near = Math.abs(t) < 1.2;
    if (near && !playing.current) {
      playing.current = true;
      video.play().catch(() => {});
    } else if (!near && playing.current) {
      playing.current = false;
      video.pause();
    }
    if (playing.current) state.invalidate();

    if (!group.current) return;
    const reveal = reducedMotion
      ? 1
      : easeOutCubic(
          THREE.MathUtils.clamp((1 - Math.abs(t)) * 1.6 - index * 0.12, 0, 1)
        );
    group.current.position.z = position[2] - (1 - reveal) * 9;
    group.current.rotation.y = (1 - reveal) * (index % 2 ? -0.55 : 0.55);
  });

  return (
    <group ref={group} position={position}>
      <mesh>
        <planeGeometry args={[width, width * 0.5625]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <LabelText
        fontSize={width * 0.052}
        anchorX="left"
        position={[-width / 2, -width * 0.34, 0]}
        fillOpacity={0.65}
      >
        {builder.name}
      </LabelText>
    </group>
  );
};

export const Builders = ({ vw, vh, journey, chapterIndex, reducedMotion }) => {
  const w = vw * 0.23;
  // staggered wall: two loose rows, varied depth
  const slots = [
    [-vw * 0.3, -vh * 0.02, -2],
    [-vw * 0.02, -vh * 0.14, -0.6],
    [vw * 0.27, -vh * 0.04, -1.4],
    [-vw * 0.17, -vh * 0.3, 0.4],
    [vw * 0.14, -vh * 0.32, -1],
  ];
  return (
    <group>
      <DisplayText
        fontSize={vw * 0.045}
        maxWidth={vw * 0.6}
        anchorX="left"
        anchorY="top"
        textAlign="left"
        position={[-vw * 0.4, vh * 0.4, -0.5]}
      >
        We took notes from the builders who changed everything
      </DisplayText>
      <Suspense fallback={null}>
        {BUILDERS.map((b, i) => (
          <BuilderPanel
            key={b.name}
            builder={b}
            index={i}
            chapterIndex={chapterIndex}
            journey={journey}
            reducedMotion={reducedMotion}
            width={w}
            position={slots[i]}
          />
        ))}
      </Suspense>
    </group>
  );
};

export const Briefing = ({ vw, vh }) => (
  <group>
    <DisplayText
      fontSize={vw * 0.058}
      anchorX="left"
      position={[-vw * 0.36, vh * 0.26, -1]}
    >
      What is Startathon?
    </DisplayText>
    {BRIEFING_LINES.map((line, i) => (
      <DisplayText
        key={line}
        fontSize={vw * 0.026}
        anchorX="left"
        fillOpacity={0.85}
        position={[-vw * 0.36, vh * 0.06 - i * vw * 0.045, (i % 2) * 0.8 - 0.4]}
      >
        {line}
      </DisplayText>
    ))}
  </group>
);

// The prize figure is the journey's zoom moment: it rushes up from deep
// space as the chapter arrives, then flies past the camera on exit.
export const Prizes = ({ vw, vh, journey, chapterIndex, reducedMotion }) => {
  const big = useRef(null);
  useFrame(() => {
    if (!big.current || reducedMotion) return;
    const at = journey.current.progress * (CHAPTER_COUNT - 1);
    const t = THREE.MathUtils.clamp(at - chapterIndex, -1, 1);
    const enter = THREE.MathUtils.smoothstep(t, -1, 0);
    big.current.position.z =
      THREE.MathUtils.lerp(-16, -1.5, enter) + Math.max(t, 0) * 9;
  });
  return (
    <group>
      <group ref={big} position={[0, vh * 0.06, -1.5]}>
        <DisplayText fontSize={vw * 0.21} color={LIME}>
          2L+
        </DisplayText>
      </group>
      <LabelText
        fontSize={Math.max(vw * 0.013, 0.09)}
        position={[0, -vh * 0.2, 0.5]}
        fillOpacity={0.6}
      >
        TOTAL PRIZE POOL · INR
      </LabelText>
      <LabelText
        fontSize={Math.max(vw * 0.015, 0.1)}
        position={[0, -vh * 0.3, 0.5]}
        fillOpacity={0.85}
      >
        FIRST 1,00,000 · SECOND 60,000 · THIRD 40,000
      </LabelText>
    </group>
  );
};

const SponsorMark = ({ sponsor, x, vw }) => {
  const texture = useTexture(sponsor.src);
  const aspect = texture.image.width / texture.image.height;
  const h = vw * 0.032 * sponsor.h;
  return (
    <mesh position={[x, 0, 0]}>
      <planeGeometry args={[h * aspect, h]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
};

export const Sponsors = ({ vw, vh }) => (
  <group>
    <DisplayText fontSize={vw * 0.042} position={[0, vh * 0.16, -0.8]}>
      Companies backing Startathon
    </DisplayText>
    <Suspense fallback={null}>
      <group position={[0, -vh * 0.08, 0]}>
        {SPONSORS.map((s, i) => (
          <SponsorMark
            key={s.name}
            sponsor={s}
            x={(i - 1) * vw * 0.26}
            vw={vw}
          />
        ))}
      </group>
    </Suspense>
  </group>
);

export const Threshold = ({ vw, vh }) => (
  <group>
    <LabelText
      fontSize={Math.max(vw * 0.013, 0.09)}
      color={LIME}
      position={[0, vh * 0.3, 0.5]}
    >
      {"YOU'RE NEXT"}
    </LabelText>
    <DisplayText fontSize={vw * 0.062} position={[0, vh * 0.16, -0.6]}>
      Still in college.
    </DisplayText>
    <DisplayText fontSize={vw * 0.062} color={INK} position={[0, vh * 0.05, 0.6]}>
      Already building.
    </DisplayText>
  </group>
);
