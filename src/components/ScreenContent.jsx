// src/components/ScreenContent.jsx
import { Html } from "@react-three/drei";

/* ─── Mini preview of Features content shown on laptop screen ─── */
function FeaturesPreview() {
  return (
    <div
      style={{
        width: "900px",
        height: "580px",
        background: "#0a0a0a",
        borderRadius: "8px",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px",
        padding: "12px",
        fontFamily: "'Open Sauce One', sans-serif",
      }}
    >
      {/* Prizes card */}
      <div style={{ background: "#111", borderRadius: "4px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span style={{ fontSize: "8px", letterSpacing: "3px", color: "#C8FF00", textTransform: "uppercase" }}>Prize Pool</span>
        <div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#C8FF00", lineHeight: 1 }}>₹X.XL</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>cash + incubation</div>
        </div>
      </div>

      {/* What to expect card */}
      <div style={{ background: "#111", borderRadius: "4px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "8px", letterSpacing: "3px", color: "#C8FF00", textTransform: "uppercase" }}>Experience</span>
        {["30-Hour Build Sprint", "Expert Mentors", "Curated Teams Only", "Demo Day Pitching"].map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#00aa55", fontSize: "8px" }}>◈</span>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Timeline card */}
      <div style={{ background: "#111", borderRadius: "4px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span style={{ fontSize: "8px", letterSpacing: "3px", color: "#C8FF00", textTransform: "uppercase" }}>Schedule</span>
        <div style={{ fontSize: "32px", fontWeight: 900, color: "transparent", WebkitTextStroke: "1px rgba(200,255,0,0.3)", lineHeight: 1 }}>JUL 26</div>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>SCTCE · Thiruvananthapuram</div>
      </div>
    </div>
  );
}

/*
 * ScreenContent — mounts Html overlay on laptop screen.
 *
 * TO SWAP TO TEXTURE (future):
 *   1. Delete the <Html> block.
 *   2. Add: const texture = useLoader(THREE.TextureLoader, '/img/screen-preview.png')
 *   3. Return: <mesh position={...} rotation={...}><planeGeometry args={[2.1, 1.35]} /><meshStandardMaterial map={texture} /></mesh>
 */
export default function ScreenContent() {
  return (
    <Html
      transform
      occlude
      position={[0, 1.60, -1.81]}
      rotation={[-0.256, Math.PI, 0]}
      scale={0.135}
      zIndexRange={[1, 0]}
    >
      <FeaturesPreview />
    </Html>
  );
}
