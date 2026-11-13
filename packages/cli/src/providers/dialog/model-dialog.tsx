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
import { DEFAULT_CHAT_MODEL_ID, type SupportedChatModelId,SUPPORTED_CHAT_MODELS } from "@mantis/shared"
import { usePromptConfig } from "../prompt-config"



export const ModelDialogContent = () => {
  const { theme } = useTheme();
  const { closeDialog } = useDialog();
  const { toast } = useToast();
  const { model, setModel } = usePromptConfig()
  
  const handleSelect = useCallback((item: DialogSearchItem) => {
    setModel(item.id as SupportedChatModelId);
    closeDialog();
  }, [setModel, closeDialog]);

  const items = useMemo<DialogSearchItem[]>(
    () =>
      SUPPORTED_CHAT_MODELS.map((m) => ({
        id: m.id,
        label: m.id,
        description:  m.provider + (m.id === model ? " (current)" : ""),
        keywords: [m.provider],
      })),
    [model],
  );
  const initialIndex = Math.max(
    0,
    items.findIndex((item) => item.id === model),
  );

  return (
    <DialogSearchList
      items={items}
      initialIndex={initialIndex}
      placeholder="Select Models..."
      emptyText="No Models availiable"
      onSelect={handleSelect}
    />
  )
};
