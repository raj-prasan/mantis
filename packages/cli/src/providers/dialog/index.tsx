import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { DialogConfig } from "./types";
import { useKeyboardLayer } from "../keyboard-layer";
import { useTheme } from "../theme/context";

export type { DialogConfig } from "./types";

export type DialogContextValue = {
  openDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
  isOpen: boolean;
};

export type DialogProviderProps = {
  children: ReactNode;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

export function DialogProvider({ children }: DialogProviderProps) {
  const { theme } = useTheme();
  const { isTopLayer, push, pop } = useKeyboardLayer();
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

  const closeDialog = useCallback(() => {
    pop("dialog");
    setDialog(null);
  }, [pop]);

  const openDialog = useCallback(
    (config: DialogConfig) => {
      push("dialog", () => {
        closeDialog();
        return true;
      });
      setDialog(config);
    },
    [push, closeDialog],
  );

  useKeyboard((key) => {
    if (!dialog || key.eventType === "release" || !isTopLayer("dialog")) return;

    if (key.name === "escape") {
      key.preventDefault();
      key.stopPropagation();
      closeDialog();
    }
  });

  const value = useMemo<DialogContextValue>(
    () => ({ openDialog, closeDialog, isOpen: dialog !== null }),
    [openDialog, closeDialog, dialog],
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialog && (
        <box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
          backgroundColor="transparent"
          zIndex={90}
          onMouseDown={closeDialog}
        >
          <box
            flexDirection="column"
            border
            borderStyle="single"
            borderColor={theme.border}
            backgroundColor={theme.surface}
            width="100%"
            maxWidth={78}
            paddingX={2}
            paddingY={1}
            gap={1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <box
              width="100%"
              flexDirection="row"
              justifyContent="space-between"
              gap={2}
            >
              <text fg={theme.text} attributes={TextAttributes.BOLD}>
                {dialog.title}
              </text>
              <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
                esc
              </text>
            </box>
            <box flexDirection="column">{dialog.children}</box>
          </box>
        </box>
      )}
    </DialogContext.Provider>
  );
}
