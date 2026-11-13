import { Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { streamSSE ,SSEStreamingApi} from "hono/streaming";
import { streamText as aiStreamText } from "ai"
import { db } from "@mantis/database/client";
import type { Prisma } from "@mantis/database"
import { type ChatStreamEvent, type messagePart, toolCallArgsSchema, messagePartsSchema } from "@mantis/shared";
import type { Mode, MessageStatus } from "@mantis/database/enums";
import * as Sentry from "@sentry/hono/bun";
import { isSupportedChatModel, resolveChatModel } from "../lib/models";
import { el } from "zod/locales";

const submitSchema = z.object({
  content: z.string(),
  mode: z.enum(["build", "plan"]),
  model: z.string().refine(isSupportedChatModel, "Unsupported Model")
});

const submitValidator = zValidator("json", submitSchema, (result, c) => {
  if (!result.success) {
    Sentry.logger.error("Submit message validation failed", {
      path: c.req.path,  
      issues: result.error.issues.length,
      method: c.req.method,
    });
    return c.json({
      error: "Invalid request body"
    }, 400);
  }
});

function buildConversationHistory(
  messages: {
    "role": "user" | "assistant" | "error";
    content: string;
    status: MessageStatus
    }[]
) {
  return messages.flatMap((m) => {
    if (m.role === "error") return [];
    if(m.role === "assistant" && m.content.length ===0) return []
    return [
      {
        role: m.role,
        content: m.content,
        status: m.status,
      }
    ]
  })
};

type StreamParams = {
  sessionId: string;
  model: string;
  history: { role: "user" | "assistant"; content: string }[];
  mode: Mode;
  abortController: AbortController;
};

async function streamAIResponse(stream : SSEStreamingApi, params: StreamParams) {
  const { sessionId, model, history, mode, abortController } = params;
  const startTime = Date.now();
  const parts : messagePart[] = []
  const resolvedModel = resolveChatModel(model);

    
  try {
    const result = aiStreamText({
      model: resolvedModel.model,
      messages: history,
      abortSignal: abortController.signal,
      providerOptions : resolvedModel.providerOptions
    });
    for await (const chunk of result.stream) {
      if (stream.aborted) break;

      if (chunk.type === "reasoning-delta") {
        const last = parts[parts.length - 1];

        if (last && last.type === "reasoning") {
          last.text += chunk.text
        } else {
          parts.push({type: "reasoning", text: chunk.text})
        }
        const event: ChatStreamEvent = { type: "reasoning-delta", text: chunk.text };

        await stream.writeSSE({
          event: "reasoning-delta",
          data: JSON.stringify(event)
        })
      }

      if(chunk.type === "text-delta") {
        const last = parts[parts.length - 1];

        if (last && last.type === "text") {
          last.text += chunk.text
        } else {
          parts.push({type: "text", text: chunk.text})
        }
        
        const event: ChatStreamEvent = {
          type: "text-delta",
          text: chunk.text,
        }
        await stream.writeSSE({
          event: "text-delta",
          data: JSON.stringify(event),
        });
      }
      if (chunk.type === "tool-call") {
        const args = toolCallArgsSchema.parse(chunk.input);

        parts.push({
          type: "tool-call",
          id: chunk.toolCallId,
          name: chunk.toolName,
          args
        });

        const event: ChatStreamEvent = {
          type: "tool-call",
          toolCallId: chunk.toolCallId,
          toolName: chunk.toolName,
          args
        };

        await stream.writeSSE({
          event: "tool-call",
          data: JSON.stringify(event)
        })
      }
      if (chunk.type === "tool-result") {
        const resultStr = typeof chunk.output === "string" ? chunk.output : JSON.stringify(chunk.output);

        const tcPart = parts.find((p): p is Extract<messagePart, { type: "tool-call" }> =>
          p.type === "tool-call" && p.id === chunk.toolCallId);

        if (tcPart) {
          tcPart.result = resultStr;
        };
        const event: ChatStreamEvent = {
          type: "tool-result",
          toolCallId: chunk.toolCallId,
          result: resultStr
        };

        await stream.writeSSE({
          event: "tool-result",
          data: JSON.stringify(event)
        })
      }
      if (chunk.type === "error") {
        throw chunk.error;
      }
    }

    if (stream.aborted || abortController.signal.aborted) return;

    const elapsedTime = Date.now() - startTime;
    const fullResponse = parts.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("")

    const validatedParts = parts.length > 0 ? messagePartsSchema.parse(parts) : undefined;
    
    const assistantMessage = await db.orm.public.Message.create({
      sessionId,
      role: "assistant",
      content: fullResponse,
      status: "complete",
      parts: validatedParts,
      model,
      mode,
      duration: Math.round(elapsedTime/1000)
    });

    const doneEvent: ChatStreamEvent = {
      type: "done",
      messageId: assistantMessage.id,
      durationMs: elapsedTime,
    }
    await stream.writeSSE({
      event: "done",
      data: JSON.stringify(doneEvent),
    });
  } catch (error) {
    if (abortController.signal.aborted) return;
    const message = error instanceof Error ? error.message : String(error);

    await db.orm.public.Message.create({
      sessionId,
      role: "error",
      content: message,
      status: "complete",
      model,
      mode
    });

    const errorEvent: ChatStreamEvent = {
      type: "error",
      message: message,
    }
    await stream.writeSSE({
      event: "error",
      data: JSON.stringify(errorEvent),
    });
  }
}

const app = new Hono()
  .post("/:sessionId/resume", async (c) => {
    const sessionId = c.req.param("sessionId");
    const session = await db.orm.public.Session.whereUnique(
      { id: sessionId }
    ).include("messages",
      (m) => m.orderBy((m) => m.createdAt.asc()))
      .first();

    if (!session) {
      Sentry.logger.warn("Session not found", { sessionId });
      return c.json({ error: "Session not found" }, 404);
    }

    const lastMessage = session.messages[session.messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return c.json({ error: "Session has no pending message to resume" }, 409);
    }

    if(!isSupportedChatModel(lastMessage.model)) {
      return c.json({ error: "Unsupported chat model" }, 409);
    }
    const history = buildConversationHistory(session.messages);
    const abortController = new AbortController();

    return streamSSE(c, async (stream) => {
      stream.onAbort(() => {
        abortController.abort();
      });

      await streamAIResponse(stream, {
        sessionId,
        model: lastMessage.model,
        history,
        mode: lastMessage.mode,
        abortController,
      })
    }, async(err, stream) => {
      const message = err instanceof Error ? err.message : String(err);
      const errorEvent: ChatStreamEvent = {
        type: "error",
        message,
      };
      await stream.writeSSE({
        event: "error",
        data: JSON.stringify(errorEvent),
      });
      Sentry.logger.error("Stream error", { err, sessionId, message });
      stream.close();
    }
    );
  })
  .post("/:sessionId", submitValidator, async (c) => {
    const sessionId = c.req.param("sessionId");
    const session = await db.orm.public.Session.whereUnique(
      { id: sessionId }
    ).include("messages",
      (m) => m.orderBy((m) => m.createdAt.asc()))
      .first();

  if (!session) {
    Sentry.logger.warn("Session not found", { sessionId });
    return c.json({ error: "Session not found" }, 404);
  }
  const data = c.req.valid("json");

  const message = await db.orm.public.Message.create({
    sessionId,
    role: "user",
    content: data.content,
    status: "complete",
    mode: data.mode,
    model: data.model
  });

  const history = buildConversationHistory([
    ...session.messages,
    {
      role: "user",
      content: data.content,
      status: "complete"
    }
  ]);
  const abortController = new AbortController();
  
  return streamSSE(c, async (stream) => {
    stream.onAbort(() => {
      abortController.abort();
    });

    await streamAIResponse(stream, {
      sessionId,
      model: data.model,
      history,
      mode: data.mode,
      abortController,
    });
  },
    async (err, stream) => {
      const message = err instanceof Error ? err.message : String(err);
      const errorEvent: ChatStreamEvent = {
        type: "error",
        message,
      };
      await stream.writeSSE({
        event: "error",
        data: JSON.stringify(errorEvent),
      });
      Sentry.logger.error("Stream error", { err, sessionId, message });
      stream.close();
    }
  );
});

export default app;