import type { ChatMessage } from "./types";
import { UserMessage } from "./user-message";
import { BotMessage } from "./bot-message";
import { ErrorMessage } from "./error-message";

type Props = {
  message: ChatMessage;
};

export function Message({ message }: Props) {
  switch (message.role) {
    case "user":
      return <UserMessage content={message.content} />;
    case "error":
      return <ErrorMessage message={message.content} />;
    default:
      return <BotMessage content={message.content} />;
  }
}
