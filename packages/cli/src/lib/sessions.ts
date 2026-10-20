import type { ChatMessage, MessageRole } from "../components/message/types";

export type Session = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
};

const sessions = new Map<string, Session>();
let counter = 0;

function nextId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}

function titleFrom(message: string): string {
  const clean = message.trim().replace(/\s+/g, " ");
  return clean.length > 48 ? `${clean.slice(0, 47)}\u2026` : clean;
}

export function createSession(initialMessage?: string): Session {
  const id = nextId();
  const message = initialMessage?.trim();
  const session: Session = {
    id,
    title: message ? titleFrom(message) : "new session",
    createdAt: Date.now(),
    messages: message
      ? [{ id: `${id}-0`, role: "user", content: message }]
      : [],
  };

  sessions.set(id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function appendMessage(
  sessionId: string,
  role: MessageRole,
  content: string,
): ChatMessage | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  const message: ChatMessage = {
    id: `${sessionId}-${session.messages.length}`,
    role,
    content,
  };
  session.messages.push(message);
  return message;
}
