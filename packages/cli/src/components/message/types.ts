import type { InferResponseType } from "hono";
import type { apiClient } from "../../lib/api-client";

export type SessionData = InferResponseType<(typeof apiClient.sessions)[":id"]["$get"], 200>

export type ChatMessage = InferResponseType<(typeof apiClient.sessions)[":id"]["$get"], 200>["messages"][number]
