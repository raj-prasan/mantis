import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme/context";

type Props = {
  message: string;
};

export function ErrorMessage({ message }: Props) {
  const { theme } = useTheme();

  return (
    <box width="100%" border={["left"]} borderColor={theme.error}>
      <box
        width="100%"
        flexDirection="column"
        gap={0}
        paddingX={2}
        paddingY={1}
        backgroundColor={theme.surface}
      >
        <text fg={theme.error} attributes={TextAttributes.BOLD}>
          Error
        </text>
        <text fg={theme.error}>{message}</text>
      </box>
    </box>
  );
}
