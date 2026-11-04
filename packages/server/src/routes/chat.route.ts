import { Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { streamSSE } from "hono/streaming";
import { streamText as aiStreamText } from "ai"
import { db } from "@mantis/database/client";
import { Mode, MessageStatus } from "@mantis/database/enums";
import { type ChatStreamEvent } from "@mantis/shared";
import { isSupportedChatModel, resolveChatModel } from "../lib/models";

const submitSchema = z.object({
  content: z.string(),
  mode: z.enum(Mode.values),
  model: z.string().refine(isSupportedChatModel, "Unsupported Model")
});

const app = new Hono()