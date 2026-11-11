import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "@mantis/database/client";
import { sentry } from "@sentry/hono/bun";
import sessions from "./routes/session.route"
import chat from "./routes/chat.route";
import * as Sentry from "@sentry/hono/bun";
// The Postgres client connects lazily in the background
await db.connect();

const app = new Hono();

app.use(
  sentry(app, {
    dsn: "https://8c483fc3f13640c6bab57c01bb7e7a5e@o4511586131902464.ingest.us.sentry.io/4512368000630784",
    tracesSampleRate: 1.0,
  }),
);

app.get("/debug-sentry", () => {
  // Send a log before throwing the error
  Sentry.logger.info('User triggered test error', {
    action: 'test_error_endpoint',
  });
  // Send a test metric before throwing the error
  Sentry.metrics.count('test_counter', 1);
  throw new Error("My first Sentry error!");
});

app.onError((error,c)=>{
  if (error  instanceof HTTPException){
    Sentry.logger.warn("Handled HTTP error", {
      status: error.status,
      message: error.message || "Request Failed.",
      path: c.req.path,
      method: c.req.method,
    });
    return c.json({
      error: error.message || "Request Failed."
    },error.status)
  }
  Sentry.logger.error("Unhandled Server error", {
    message: error instanceof Error ? error.message : "Unknown error.",
    path: c.req.path,
    method: c.req.method,
  });
  return c.json({
    error: error.message || "Internal server error."
  }, 500)
})


const routes = app.route("/sessions", sessions).route("/chat", chat);

export type AppType = typeof routes;

//idleTimeout must be high , otherwise LLM tool calls might not be complete
export default {port : 3000, fetch: app.fetch, idleTimeout : 255}