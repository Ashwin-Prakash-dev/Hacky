import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { FONT_DISPLAY, FONT_LABEL, INK } from "./journeyContent";

// Thin wrappers over drei's <Text> so every glyph in the scene comes from
// the same two Open Sauce cuts. `onSync` invalidates the demand frameloop:
// troika lays glyphs out async, so without it text pops in on the next
// unrelated frame instead of the frame it finishes on.

export const DisplayText = ({ children, ...props }) => {
  const invalidate = useThree((s) => s.invalidate);
  return (
    <Text
      font={FONT_DISPLAY}
      color={INK}
      anchorX="center"
      anchorY="middle"
      letterSpacing={-0.02}
      lineHeight={0.95}
      onSync={invalidate}
      {...props}
    >
      {children}
    </Text>
  );
};

// Label: the scene's stand-in for the DOM's mono microcopy — small,
// uppercase, tracked wide.
export const LabelText = ({ children, ...props }) => {
  const invalidate = useThree((s) => s.invalidate);
  return (
    <Text
      font={FONT_LABEL}
      color={INK}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.32}
      onSync={invalidate}
      {...props}
    >
      {children}
    </Text>
  );
};
