import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme/context";
import { Inputbar } from "./input-bar";
import { Message } from "./message";
import type { ChatMessage } from "./message";

type Props = {
  title: string;
  messages: ChatMessage[];
  onSubmit: (text: string) => void;
  emptyText?: string;
};

export function SessionView({
  title,
  messages,
  onSubmit,
  emptyText = "No messages yet.",
}: Props) {
  const { theme } = useTheme();
  const count = messages.length;

  return (
    <box width="100%" height="100%" flexDirection="column">
      <box
        width="100%"
        flexDirection="row"
        gap={1}
        paddingX={2}
        paddingY={1}
        flexShrink={0}
      >
        <text fg={theme.accent} attributes={TextAttributes.BOLD}>
          {title}
        </text>
        <text fg={theme.textMuted}>
          {`\u00b7 ${count} message${count === 1 ? "" : "s"}`}
        </text>
      </box>
      <scrollbox
        width="100%"
        flexGrow={1}
        flexShrink={1}
        flexBasis={0}
        minHeight={0}
        stickyScroll
        stickyStart="bottom"
        paddingX={2}
        paddingY={1}
        gap={0.5}
      >
        {count === 0 ? (
          <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
            {emptyText}
          </text>
        ) : (
          messages.map((message) => (

            <Message key={message.id} message={message} />
          ))
        )}
      </scrollbox>
      <box width="100%" paddingX={2} paddingBottom={1} flexShrink={0}>
        <Inputbar onSubmit={onSubmit} clearOnSubmit />
      </box>
    </box>
  );
}
