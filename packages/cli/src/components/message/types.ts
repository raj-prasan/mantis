import type { InferResponseType } from "hono";
import type { apiClient } from "../../lib/api-client";

type SessionResponse = InferResponseType<(typeof apiClient.sessions)[":id"]["$get"], 200>

// `parts` is a recursive JSON column. Hono's JSON serialization type recurses
// through it without terminating ("Type instantiation is excessively deep"),
// so it is omitted here and typed as `unknown` until the UI actually needs it.
type SessionMessage = Omit<SessionResponse["messages"][number], "parts"> & {
  parts: unknown
}

export type SessionData = Omit<SessionResponse, "messages"> & {
  messages: SessionMessage[]
}

// What the UI renders (and what `useChat` manages). Database rows
// (`SessionData["messages"]`) must be converted into this shape first.
export type { Message as ChatMessage } from "../../hooks/use-chat";