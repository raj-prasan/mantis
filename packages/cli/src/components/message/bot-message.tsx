import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme/context";

type Props = {
  content: string;
};

export function BotMessage({ content }: Props) {
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
          opus-4-6
        </text>
        <text fg={theme.text}>{content}</text>
      </box>
    </box>
  );
}
