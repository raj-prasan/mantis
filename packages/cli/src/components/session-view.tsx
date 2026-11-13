import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme/context";
import { Inputbar } from "./input-bar";
import { Message, BotMessage } from "./message";
import type { ChatMessage } from "./message";
import { Spinner } from "./message/spinner";
import { usePromptConfig } from "../providers/prompt-config";
import type { StreamingState } from "../hooks/use-chat";

type Props = {
  title: string;
  messages: ChatMessage[];
  streaming?: StreamingState;
  onSubmit: (text: string) => void;
  emptyText?: string;
  inputDisabled?: boolean;
  loading?: boolean;
};

type MessageListProps = {
  messages: ChatMessage[];
  streaming?: StreamingState;
};

function MessageList({ messages, streaming }: MessageListProps) {
  // Only show the in-progress reply once some text has arrived; until then
  // the spinner under the input bar is the only indicator.
  const inProgress =
    streaming?.status === "streaming" && streaming.parts.length > 0
      ? streaming
      : null;

  return (
    <box width="100%" flexDirection="column">
      {messages.map((message, index) => (
        <box
          key={message.id}
          width="100%"
          marginBottom={index === messages.length - 1 && !inProgress ? 0 : 1}
        >
          <Message message={message} />
        </box>
      ))}
      {inProgress && (
        <box width="100%">
          <BotMessage
            parts={inProgress.parts}
            mode={inProgress.mode}
            model={inProgress.model}
            streaming
          />
        </box>
      )}
    </box>
  );
}

export function SessionView({
  title,
  messages,
  streaming,
  onSubmit,
  emptyText = "No messages yet.",
  inputDisabled = false,
  loading,
}: Props) {
  const { theme } = useTheme();
  const { mode } = usePromptConfig();
  const isStreaming = streaming?.status === "streaming";
  const hasContent = messages.length > 0 || isStreaming;

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
        {!hasContent ? (
          <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
            {emptyText}
          </text>
        ) : (
          <MessageList messages={messages} streaming={streaming} />
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
            <Spinner mode={mode} />
          </box>
        )}
      </box>
    </box>
  );
}
