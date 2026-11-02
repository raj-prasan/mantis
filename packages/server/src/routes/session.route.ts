import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { findSupportedChatModel } from "@mantis/shared";
import { db } from "@mantis/database";
import { Role,Mode, MessageStatus} from "@mantis/database/enums";

const createSessionSchema = z.object({
  title: z.string(),
  cwd: z.string().optional(),
  initialMessage: z
    .object({
      role: z.enum(Role.values),
      content: z.string(),
      mode: z.enum(Mode.values),
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
      return c.json({
        error: "Invalid request body"
      }, 400);
    }
  },
);

const app = new Hono()
  .get("/", async (c) => {
    const sessions = await db.orm.public.Session
      .orderBy((s) => s.createdAt.desc())
      .select("id", "createdAt", "title")
      .all();
    
    return c.json({ result: sessions }, 200);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const session = await db.orm.public.Session.where({ id })
      .include("messages",
        (m) => m.orderBy((m) => m.createdAt.asc()))
      .first();

    if (!session) {
      return c.json({ error: "Session Not Founnd" }, 404);
    }

    return c.json(session);
  })
  .post("/", createSessionValidator, async (c) => {

    const { initialMessage, ...data } = c.req.valid("json");

    const session = await db.orm.public.Session.create({
      ...data,
      userId: 'mock-user',
      cwd: data.cwd ?? ""
    });
    
    if (initialMessage) {
      await db.orm.public.Message.create({
        ...initialMessage,
        sessionId: session.id,
        status: MessageStatus.values[0],
      });
    }

    return c.json(session, 201);
  });

  export default app;