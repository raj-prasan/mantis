import { useCallback, useEffect, useMemo, useState } from "react"
import { TextAttributes } from "@opentui/core"
import { format } from "date-fns"
import { useNavigate } from "react-router"
import { useDialog } from "../dialog/index"
import { useToast } from "../toast"
import { useTheme } from "../theme/context"
import { apiClient } from "../../lib/api-client"
import { getErrorMessage } from "../../lib/http-errors"
import {
  DialogSearchList,
  type DialogSearchItem,
} from "../../components/command-menu/dialog-search-list"

type Session = {
  id: string
  title: string
  createdAt: string
};

export const SessionDialogContent = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { closeDialog } = useDialog();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchSessions = async () => {
      try {
        const res = await apiClient.sessions.$get();
        if (!res.ok) {
          throw new Error(await getErrorMessage(res));
        }
        const { result } = await res.json();

        if (!ignore) {
          setSessions(result);
          setLoading(false);
        }
      }
      catch (err) {
        if (!ignore) {
          toast({
            variant: "error",
            message: err instanceof Error ? err.message : "Failed to fetch sessions",
            duration: 3000
          })
          closeDialog();
        }
      }
    };
    
    void fetchSessions();
    return () => {
      ignore = true;
    };
  }, [closeDialog, toast]);
  
  const handleSelect = useCallback((item: DialogSearchItem) => {
    closeDialog();
    navigate(`/sessions/${item.id}`)
  }, [closeDialog, navigate]);

  const items = useMemo<DialogSearchItem[]>(
    () =>
      sessions.map((session) => ({
        id: session.id,
        label: session.title || "Untitled session",
        description: format(new Date(session.createdAt), "MMM d, yyyy HH:mm"),
        keywords: [session.id],
      })),
    [sessions],
  );

  if (loading) {
    return (
      <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
        Loading sessions...
      </text>
    )
  }

  return (
    <DialogSearchList
      items={items}
      placeholder="Search sessions..."
      emptyText="No sessions yet"
      onSelect={handleSelect}
    />
  )
};
