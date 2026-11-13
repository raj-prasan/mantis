import { useState, useEffect, useCallback, useRef } from "react"
import { EventSourceParserStream } from "eventsource-parser/stream"
import type{ ClientResponse } from "hono/client"
import prettyMs from "pretty-ms"
import { apiClient } from "../lib/api-client"
import { getErrorMessage } from "../lib/http-errors"
import type { Mode } from "@mantis/database/enums"
import { chatStreamEventSchema, type SupportedChatModelId } from "@mantis/shared"

export type ClientMessagePart = 
  | { type: "reasoning"; text: string }
  | ClientToolCallPart
  | {type : "text", text: string}

export type ClientToolCallPart = {
  type: "tool-call",
  id: string,
  name: string,
  args: Record<string, unknown>,
  result?: string;
  status : "calling" | "done"
}

export type Message = {
  id: string;
  role: "user";
  content: string;
  mode: Mode;
  model: SupportedChatModelId;
} | {
  id: string;
  role: "assistant";
  content: string;
  mode: Mode;
  model: SupportedChatModelId;
  parts: ClientMessagePart[];
  duration?: string;
} | {
  id: string;
  role: "error";
  content: string
};

export type StreamingState = {
  status: "idle"
} | {
  status: "streaming";
  parts: ClientMessagePart[];
  mode: Mode;
  model: SupportedChatModelId;
};

type ActiveStream = {
  requestId: string;
  controller: AbortController;
  mode: Mode;
  model: SupportedChatModelId;
  parts: ClientMessagePart[];
};

type SubmitParams = {
  userText: string;
  mode: Mode;
  model: SupportedChatModelId;
};

type RunStreamParams = {
  mode: Mode;
  model: SupportedChatModelId;
  request: (controller: AbortController) => Promise<ClientResponse<unknown>>;
};

export function useChat(
  sessionId: string,
  initialMessages: Message[]
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [streaming, setStreaming] = useState<StreamingState>({ status: "idle" });
  const activeStreamRef = useRef<ActiveStream | null>(null);

  const updateMessage = useCallback((updater: (prev: Message[]) => Message[]) => {
    setMessages((prev) => updater(prev))
  }, []);

  const isActiveRequest = useCallback((requestId: string) => {
    return activeStreamRef.current?.requestId === requestId;
  }, []);

  const emitParts = useCallback((requestId: string, parts: ClientMessagePart[]) => {
    if (!isActiveRequest(requestId)) return;
    
    const snapshot = [...parts];
    const activeStream = activeStreamRef.current;
    if (!activeStream) return;

    activeStream.parts = snapshot;
    setStreaming({
      status: "streaming",
      parts: snapshot,
      mode: activeStream.mode,
      model: activeStream.model,
    })
  }, [isActiveRequest]);

  const clearStream = useCallback((requestId: string) => {
    if (!isActiveRequest(requestId)) return;
    activeStreamRef.current = null;
    setStreaming({ status: "idle" });
  }, [isActiveRequest]);

  const handleStream = useCallback(
    async (
      response: ClientResponse<unknown>,
      activeStream: ActiveStream
    ) => {
      if (!isActiveRequest(activeStream.requestId)) return;
  
      if (!response.ok) {
        const message = await getErrorMessage(response);
  
        updateMessage((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "error",
            content: message,
          },
        ]);
  
        return;
      }
  
      if (!response.body) {
        throw new Error("Response body is empty");
      }
  
      const parts: ClientMessagePart[] = [];
  
      const stream = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventSourceParserStream());
  
      const reader = stream.getReader();
  
      try {
        while (true) {
          const { done, value } = await reader.read();
  
          if (done) break;
  
          if (!isActiveRequest(activeStream.requestId)) {
            await reader.cancel();
            return;
          }
  
          let event;
  
          try {
            event = chatStreamEventSchema.parse(
              JSON.parse(value.data)
            );
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : "Invalid stream event";
  
            updateMessage((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "error",
                content: message,
              },
            ]);
  
            break;
          }
  
          switch (event.type) {
            case "reasoning-delta": {
              const last = parts[parts.length - 1];
              if (last && last.type === "reasoning") {
                last.text += event.text
              
              } else {
                parts.push({ type: "text", text: event.text });
              }
              emitParts(activeStream.requestId, parts);
              break;
            }
            case "text-delta": {
              const last = parts[parts.length - 1];
              if (last && last.type === "text") {
                // Replace instead of mutating: earlier snapshots handed to
                // React state must stay untouched.
                parts[parts.length - 1] = { ...last, text: last.text + event.text };
              } else {
                parts.push({ type: "text", text: event.text });
              }
              emitParts(activeStream.requestId, parts);
              break;
            }
            case "reasoning-delta":
              break;
            case "tool-call":
              parts.push({
                type: "tool-call",
                id: event.toolCallId,
                name: event.toolName,
                args: event.args,
                status: "calling"
              })
              break;
            case "tool-result":
              const tc = parts.find(
                (p): p is ClientToolCallPart => p.type === "tool-call" && p.id === event.toolCallId
              );
              if (tc) {
                tc.result = event.result;
                tc.status = "done"
              }
              break;
            case "done": {
              if (!isActiveRequest(activeStream.requestId)) return;
              const fullText = parts
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("");
              updateMessage((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: fullText,
                  mode: activeStream.mode,
                  model: activeStream.model,
                  duration: prettyMs(event.durationMs),
                  parts: [...parts],
                },
              ]);
              break;
            }
            case "error":
              updateMessage((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  role: "error",
                  content: event.message,
                },
              ]);
              break;
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
    [isActiveRequest, updateMessage, emitParts]
  );

  const runStream = useCallback(async ({ mode, model, request }: RunStreamParams) => {
    const controller = new AbortController();
    const activeStream: ActiveStream = {
      requestId: crypto.randomUUID(),
      mode,
      model,
      controller,
      parts: [],
    };
    activeStreamRef.current = activeStream;
    setStreaming({ status: "streaming", parts: [], mode, model });

    try {
      const response = await request(controller);
      await handleStream(response, activeStream)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      if (!isActiveRequest(activeStream.requestId)) return;

      const msg = err instanceof Error ? err.message : String(err);
      updateMessage((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "error",
          content: msg,
        },
      ]);
    }
    finally {
      clearStream(activeStream.requestId);
    }
  }, [clearStream, handleStream, isActiveRequest, updateMessage]);
  const resume = useCallback(async ({ mode, model }: Omit<SubmitParams, "userText">) => {
    await runStream({
      mode, model, request: async (controller: AbortController) => {
        return apiClient.chat[":sessionId"].resume.$post(
          { param: { sessionId } },
          { init: { signal: controller.signal } }
        )
      }
    });
  }, [runStream, sessionId]);

  const hasAutoResumeRef = useRef(false);
  useEffect(() => {
    if (hasAutoResumeRef.current) return;
    const last = initialMessages[initialMessages.length - 1];
    if (last?.role !== "user") return;
    hasAutoResumeRef.current = true;
    void resume({ mode: last.mode, model: last.model });
  }, [resume, initialMessages]);

  const submit = useCallback(async ({ userText, mode, model }: SubmitParams) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userText,
      mode,
      model,
    };
    updateMessage((prev) => [...prev, userMessage]);
    await runStream({
      mode,
      model,
      request: async (controller: AbortController) => {
        return apiClient.chat[":sessionId"].$post(
          {
            param: { sessionId },
            json: { content: userText, mode, model },
          },
          { init: { signal: controller.signal } }
        );
      }
    });
  }, [updateMessage, runStream, sessionId]);

  const abort = useCallback(() => {
    const activeStream = activeStreamRef.current;
    if (!activeStream) {
      return;
    }
    activeStreamRef.current = null;
    activeStream.controller.abort();
    // clearStream() ignores the request once it is no longer active, so reset
    // the streaming state here or the UI would stay stuck on "streaming".
    setStreaming({ status: "idle" });
  }, []);

  return { messages, streaming, submit, resume, abort };
}