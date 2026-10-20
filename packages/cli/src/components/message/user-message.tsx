import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme/context";

type Props = {
  content: string;
};

export function UserMessage({ content }: Props) {
  const { theme } = useTheme();

  return (
    <box width="100%" border={["left"]} borderColor={theme.accent}>
      <box
        width="100%"
        flexDirection="column"
        gap={0}
        paddingX={2}
        paddingY={1}
        backgroundColor={theme.surface}
      >
        <text fg={theme.accent} attributes={TextAttributes.BOLD}>
          you
        </text>
        <text fg={theme.text}>{content}</text>
      </box>
    </box>
  );
}
