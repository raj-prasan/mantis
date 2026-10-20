import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme/context";

export function StatusBar() {
  const { theme } = useTheme();

  return (
    <box flexDirection="row" gap={1}>
      <text fg={theme.accent}>Build</text>
      <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
        &#8250;
      </text>
      <text fg={theme.textMuted}>opus-4-6</text>
    </box>
  );
}
