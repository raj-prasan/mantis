import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useKeyboard } from "@opentui/react";
import { useKeyboardLayer } from "../providers/keyboard-layer";

import { SessionView } from "../components/session-view";
import type { SessionData } from "../components/message";

import { useToast } from "../providers/toast";
import { apiClient } from "../lib/api-client";
import { getErrorMessage } from "../lib/http-errors";
import { type Message, useChat } from "../hooks/use-chat";
import { DEFAULT_CHAT_MODEL_ID, type SupportedChatModelId } from "@mantis/shared";
import prettyMs from "pretty-ms";



function mapDbMessages(dbMessages: SessionData["messages"]): Message[] {
  return dbMessages.map((m): Message => {
    if (m.role === "error") {
      return { id: m.id, role: "error", content: m.content };
    }
    if (m.role === "user") {
      return {
        id: m.id,
        role: "user",
        content: m.content,
        mode: m.mode,
        model: m.model as SupportedChatModelId,
      }
    }
    return {
      id: m.id,
      role: "assistant",
      content: m.content,
      mode: m.mode,
      model: m.model as SupportedChatModelId,
      parts: [{ type: "text", text: m.content }],
      ...(m.duration != null ? {duration: prettyMs(m.duration * 1000)} : {})
    }
  })
}

function SessionChat({ session }: { session: SessionData }) {
  const [initialMessages] = useState(() => 
    mapDbMessages(session.messages)
  )
  const {messages, streaming, submit, abort} = useChat(session.id, initialMessages)
  const { isTopLayer } = useKeyboardLayer();

  useEffect(() => {
    return () => {
      abort();
    }
  }, [abort]);

  const isStreaming = streaming.status === "streaming";

  // Esc stops the reply that is currently streaming.
  useKeyboard((key) => {
    if (key.eventType === "release" || key.name !== "escape") return;
    if (!isStreaming || !isTopLayer("base")) return;
    key.preventDefault();
    abort();
  });

  return (
    <SessionView
      title={session.title}
      messages={messages}
      streaming={streaming}
      onSubmit={(text) => {
        void submit({ userText: text, mode: "build", model: DEFAULT_CHAT_MODEL_ID });
      }}
      emptyText="This session has no messages yet."
      inputDisabled={isStreaming}
      loading={isStreaming}
    />
  )
}

export function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = id;
  const toast = useToast();

  // The session is always fetched: the POST /sessions response that NewSession
  // passes along in navigation state has no `messages`, so it can't be used
  // to render the chat.
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    setSessionData(null);
    if (!session) return;
    let ignore = false;
    
    const fetchSession = async () => {
      try {
        const res = await apiClient.sessions[":id"].$get({ param: { id: session } });
        
        if (ignore) return;
        
        if (!res.ok) throw new Error(await getErrorMessage(res));
        
        setSessionData(await res.json());
        
      } catch (error) {
        if (ignore) return;
        toast.toast({
          message:
            error instanceof Error ? error.message : "Failed to load session",
          variant: "error",
          duration: 5000,
        });
        navigate("/", { replace: true });
      }
    };
    fetchSession();
    return () => {
      ignore = true;
    };
  }, [session, toast, navigate]);

  if (!session) {
    return null;
  }

  if (!sessionData) {
    return (
      <SessionView
        title="Session"
        messages={[]}
        onSubmit={() => {}}
        emptyText="Loading session..."
        inputDisabled
        loading
      />
    );
  }

  // `key` remounts SessionChat when navigating between sessions, so
  // useChat starts again from the new session's messages.
  return <SessionChat key={sessionData.id} session={sessionData} />;
}
