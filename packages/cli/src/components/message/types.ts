export type MessageRole = "user" | "assistant" | "error";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
};
