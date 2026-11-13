import { useContext, useCallback, useState, createContext } from "react";
import type { ReactNode } from "react";
import { DEFAULT_CHAT_MODEL_ID, type SupportedChatModelId } from "@mantis/shared";
import type{ Mode } from "@mantis/database/enums";

type PromptConfigContextValue = {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
  model: SupportedChatModelId;
  setModel: (model: SupportedChatModelId) => void;
};

const PromptConfigContext = createContext<PromptConfigContextValue | null>(null);

export function usePromptConfig(): PromptConfigContextValue {
  const value = useContext(PromptConfigContext);
  if (!value) {
    throw new Error("usePromptConfig must be usedd withing a promptConfigProvider")
  };

  return value;
};

type promptConfigProviderProps = {
  children: ReactNode;
}


export function PromptConfigProvider({ children }: promptConfigProviderProps) {
  const [mode, setMode] = useState<Mode>("build");
  const [model, setModel] = useState<SupportedChatModelId>(DEFAULT_CHAT_MODEL_ID);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "build" ? "plan" : "build"))
  }, []);

  return (
    <PromptConfigContext.Provider value={{mode, model, toggleMode, setMode, setModel}}>
      {children}
    </PromptConfigContext.Provider>
  )
}