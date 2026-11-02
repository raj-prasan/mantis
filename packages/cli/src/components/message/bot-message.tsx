import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme/context";

type Props = {
  content: string,
  model: string,
};

export function BotMessage({ content, model }: Props) {
  const { theme } = useTheme();

  return (
    <box width="100%" border={["left"]} borderColor={theme.success}>
      <box
        width="100%"
        flexDirection="column"
        gap={0}
        paddingX={2}
        paddingY={1}
        backgroundColor={theme.surface}
      >
        <text fg={theme.success} attributes={TextAttributes.BOLD}>
          {model}
        </text>
        <text fg={theme.text}>{content}</text>
      </box>
    </box>
  );
}
