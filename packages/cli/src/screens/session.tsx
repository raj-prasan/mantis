import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import z from "zod";
import type { InferResponseType } from "hono/client";
import { SessionView } from "../components/session-view";

import { useToast } from "../providers/toast";
import { apiClient } from "../lib/api-client";
import { getErrorMessage } from "../lib/http-errors";

type SessionData = InferResponseType<(typeof apiClient.sessions)[":id"]["$get"], 200>

const sessionLocationSchema = z.object({
  session: z.custom<SessionData>((val) => val != null && typeof val === "object" && "id" in val)
});

export function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const session = id;
  const toast = useToast();

  const prefetched = useMemo(() => {
    const parsed = sessionLocationSchema.safeParse(location.state);
    return parsed.success ? parsed.data.session : null;
  }, [id, session]);

  const [sessionData, setSessionData] = useState<SessionData | null>(prefetched);

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
  }, [id, session, prefetched, toast, navigate]);

  if (!session) {
    return null;
  }

  return (
    <SessionView
      title = {sessionData?.title ?? "Session"}
      messages={sessionData?.messages ?? []}
      onSubmit={()=>{}}
      emptyText="This session has no messages yet."
      loading = {false}
    />
  );
}
