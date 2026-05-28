// src/components/ScreenContent.jsx
import { Html } from "@react-three/drei";

/*
 * ScreenContent — solid black screen.
 * As the camera zooms in, the black fills the viewport and merges
 * seamlessly with the black Features section background behind the canvas.
 *
 * TO RESTORE CONTENT: replace the black div with <FeaturesPreview />.
 * TO SWAP TO TEXTURE: replace Html with a <mesh> + <meshStandardMaterial map={texture} />.
 */
export default function ScreenContent() {
  return (
    <Html
      transform
      occlude
      position={[0, 0, 0.01]}
      scale={256}
      zIndexRange={[1, 0]}
    >
      <div
        style={{
          width: "900px",
          height: "580px",
          background: "#000000",
          borderRadius: "8px",
        }}
      />
    </Html>
  );
}