import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { SessionView } from "../components/session-view";
import type { ChatMessage } from "../components/message";
import { appendMessage, createSession } from "../lib/sessions";
import type { Session } from "../lib/sessions";

export function NewSession() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { message?: string } | null;
  const [session] = useState<Session | null>(() =>
    state?.message ? createSession(state.message) : null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => session?.messages ?? [],
  );

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
      title="new session"
      messages={messages}
      onSubmit={handleSubmit}
    />
  );
}
