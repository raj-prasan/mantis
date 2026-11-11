import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme/context";
import type { ClientMessagePart } from "../../hooks/use-chat";
import type { Mode } from "@mantis/database/enums";

type Props = {
  parts: ClientMessagePart[];
  model: string;
  mode: Mode;
  duration?: string;
  streaming?: boolean;
};

export function BotMessage({ 
  parts,
  model,
  mode,
  duration,
  streaming = false,
}: Props) {
  const { theme } = useTheme();
  const text = parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
  return (
    <box width="100%" border={["left"]} borderColor={theme.success}>
      <box
        width="100%"
        flexDirection="column"
        gap={1}
        paddingX={2}
        paddingY={1}
      >
        <text fg={theme.text}>{text}</text>
        <box flexDirection="row" gap={1}>
          <text fg={mode === "plan" ? theme.success : theme.info}>•</text>
          <text>{mode === "plan" ? "Plan" : "Build"}</text>
          <text attributes={TextAttributes.DIM} fg={theme.textMuted}>{">"}</text>
          <text attributes={TextAttributes.DIM}>{model}</text>
          {duration && (
            <>
              <text attributes={TextAttributes.DIM} fg={theme.textMuted}>{">"}</text>
              <text attributes={TextAttributes.DIM}>{duration}</text>
            </>
          )}
        </box>
      </box>
    </box>
  );
}
