import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme/context";
import { Inputbar } from "./input-bar";
import { Message } from "./message";
import type { ChatMessage } from "./message";
import { Spinner } from "./message/spinner";

type Props = {
  title: string;
  messages: ChatMessage[];
  onSubmit: (text: string) => void;
  emptyText?: string;
  inputDisabled?: boolean;
  loading?: boolean;
};

export function SessionView({
  title,
  messages,
  onSubmit,
  emptyText = "No messages yet.",
  inputDisabled = false,
  loading,
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
      >
        {count === 0 ? (
          <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
            {emptyText}
          </text>
        ) : (
          <box width="100%" flexDirection="column" >
            {messages.map((message, index) => (
              <box
                key={message.id}
                width="100%"
                marginBottom={index === messages.length - 1 ? 0 : 1}
              >
                <Message message={message} />
              </box>
            ))}
          </box>
        )}
      </scrollbox>
      <box
        width="100%"
        flexDirection="column"
        paddingX={2}
        paddingBottom={1}
        flexShrink={0}
      >
        <Inputbar onSubmit={onSubmit} clearOnSubmit disabled={inputDisabled} />
        {loading && (
          <box width="100%" flexDirection="row" paddingTop={1}>
            <Spinner />
          </box>
        )}
      </box>
    </box>
  );
}
