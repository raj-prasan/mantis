import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme/context";
import { usePromptConfig } from "../providers/prompt-config";

export function StatusBar() {
  const { mode, model } = usePromptConfig();
  const { theme } = useTheme();

  return (
    <box flexDirection="row" gap={1}>
      <text fg={mode === "plan" ? theme.success : theme.info}>{mode}</text>
      <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
        &#8250;
      </text>
      <text fg={theme.textMuted}>{model}</text>
    </box>
  );
}
