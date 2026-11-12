import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { findSupportedChatModel } from "@mantis/shared";
import * as Sentry from "@sentry/hono/bun";
import { db } from "@mantis/database/client";
import type { Role,Mode, MessageStatus} from "@mantis/database/enums";
import { generateText } from "ai";
import { resolveChatModel } from "../lib/models";
const createSessionSchema = z.object({
  title: z.string(),
  cwd: z.string().optional(),
  initialMessage: z
    .object({
      role: z.enum(["user", "assistant", "error"]),
      content: z.string(),
      mode: z.enum(["build", "plan"]),
      model: z
        .string()
        .refine((id) => !!findSupportedChatModel(id), "Unsupported chat model"),
    })
    .optional(),
});

const createSessionValidator = zValidator(
  "json",
  createSessionSchema,
  (result, c) => {
    if (!result.success) {
      Sentry.logger.error("Session creation validation failed", {
        path: c.req.path,
        issues: result.error.issues.length,
        method: c.req.method,
      });
      return c.json({
        error: "Invalid request body"
      }, 400);
    }
  },
);
const generateSessionTitle = async (initialMessage: string): string => {
  const modelInfo = resolveChatModel("gemini-3.5-flash-lite");
  const { text } = await generateText({
    model: modelInfo.model,
    prompt: `Generate a Code AI Assistant Session for the user prompt : ${initialMessage} , keep it shorter , and just give the title and nothing extra , just the session title.`
  })
  return text;
}

const app = new Hono()
  .get("/", async (c) => {
    const sessions = await db.orm.public.Session
      .orderBy((s) => s.createdAt.desc())
      .select("id", "createdAt", "title")
      .all();

    Sentry.logger.info("Fetched sessions", {
      count: sessions.length,
    });
    
    return c.json({ result: sessions }, 200);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const session = await db.orm.public.Session.where({ id })
      .include("messages",
        (m) => m.orderBy((m) => m.createdAt.asc()))
      .first();

    if (!session) {
      Sentry.logger.error("Session not found", {
        sessionId: id,
        userId: "mock-user"
      });
      
      return c.json({ error: "Session Not Founnd" }, 404);
    }

    return c.json(session);
  })
  .post("/", createSessionValidator, async (c) => {

    const { initialMessage, ...data } = c.req.valid("json");

    //TODO : implement try catch in the logic
    if (!initialMessage) {
      throw new Error("Initial Message cant be empty")
    }
    const session = await db.orm.public.Session.create({
      ...data,
      title : generateSessionTitle(initialMessage.content),
      userId: 'mock-user',
      cwd: data.cwd ?? ""
    });
    
    if (initialMessage) {
      await db.orm.public.Message.create({
        ...initialMessage,
        sessionId: session.id,
        status: "complete",
      });
    }
    Sentry.logger.info("Session created", {
      sessionId: session.id,
      userId: "mock-user",
      title: session.title,
      initialMessage: !!initialMessage,
      cwd: session.cwd,
    });

    return c.json({...session, initialMessage}, 201);
  });

  export default app;