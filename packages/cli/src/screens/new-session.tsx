import { useEffect, useMemo, useRef } from "react";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router";
import { SessionView } from "../components/session-view";
import type { ChatMessage } from "../components/message";
import { DEFAULT_CHAT_MODEL_ID } from "@mantis/shared";
import { useToast } from "../providers/toast";
import { apiClient } from "../lib/api-client";
import { getErrorMessage } from "../lib/http-errors";

const newSessionStateSchema = z.object({
  message: z.string(),
});

export function NewSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const hasStartedRef = useRef(false);

  const state = useMemo(() => {
    const parsed = newSessionStateSchema.safeParse(location.state);
    return parsed.success ? parsed.data : null;
  }, [location.state]);

  useEffect(() => {
    if (!state) navigate("/", { replace: true });
  }, [state, navigate]);

  //Create the session on mount - this screen to do this

  useEffect(() => {
    if (!state || hasStartedRef.current) return;

    hasStartedRef.current = true;

    let ignore = false;

    const createSession = async () => {
      try {
        const res = await apiClient.sessions.$post({
          json: {
            title: state.message.slice(0, 50),
            cwd: process.cwd(),
            initialMessage: {
              role: "user",
              content: state.message,
              mode: "BUILD",
              model: DEFAULT_CHAT_MODEL_ID,
            },
          },
        });

        if (ignore) return;

        if (!res.ok) {
          throw new Error(await getErrorMessage(res));
        }

        const session = await res.json();
        navigate(`/sessions/${session.id}`, {
          replace: true,
          state: { session },
        });
      } catch (error) {
        if (ignore) return;
        toast.toast({
          message:
            error instanceof Error ? error.message : "Failed to create session",
          variant: "error",
          duration: 5000,
        });
        navigate("/", { replace: true });
      }
    };
    createSession();
    return () => {
      ignore = true;
    };
  }, [state, navigate, toast]);

  if (!state) return null;

  const messages: ChatMessage[] = [];
  messages.push({
    content: state.message,
    id: "new",
    role: "user",
  });

  return (
    <SessionView title="new session" messages={messages} onSubmit={() => {}} />
  );
}
