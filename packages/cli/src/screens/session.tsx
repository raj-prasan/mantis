import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { SessionView } from "../components/session-view";
import type { ChatMessage } from "../components/message";
import { appendMessage, getSession } from "../lib/sessions";

export function Session() {
  const { id } = useParams();
  const navigate = useNavigate();

  const session = id ? getSession(id) : undefined;
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => session?.messages ?? [],
  );

  useEffect(() => {
    setMessages(session?.messages ?? []);
  }, [id, session]);

  useEffect(() => {
    if (!session) {
      navigate("/", { replace: true });
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  const handleSubmit = (text: string) => {
    const message = appendMessage(session.id, "user", text);
    if (message) {
      setMessages([...session.messages]);
    }
  };

  return (
    <SessionView
      title={session.title}
      messages={messages}
      onSubmit={handleSubmit}
      emptyText="This session has no messages yet."
      inputDisabled
      loading
    />
  );
}
