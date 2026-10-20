import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { DEFAULT_THEME_ID, getTheme, THEMES } from "./presets";
import { loadSavedThemeId, saveThemeId } from "./storage";
import type { ThemeContextValue } from "./types";

type ThemeState = {
  activeId: string;
  savedId: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialState(): ThemeState {
  const savedId = loadSavedThemeId();
  const id = THEMES.some((theme) => theme.id === savedId) ? savedId! : DEFAULT_THEME_ID;
  return { activeId: id, savedId: id };
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(getInitialState);
  const activeIdRef = useRef(state.activeId);
  activeIdRef.current = state.activeId;

  const previewTheme = useCallback((id: string) => {
    const next = getTheme(id).id;
    setState((current) =>
      current.activeId === next ? current : { ...current, activeId: next },
    );
  }, []);

  const confirmTheme = useCallback((id?: string) => {
    const next = getTheme(id ?? activeIdRef.current).id;
    saveThemeId(next);
    setState({ activeId: next, savedId: next });
  }, []);

  const revertTheme = useCallback(() => {
    setState((current) =>
      current.activeId === current.savedId
        ? current
        : { ...current, activeId: current.savedId },
    );
  }, []);

  const theme = getTheme(state.activeId);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeId: state.activeId,
      savedThemeId: state.savedId,
      themes: THEMES,
      isPreviewing: state.activeId !== state.savedId,
      previewTheme,
      confirmTheme,
      revertTheme,
    }),
    [theme, state, previewTheme, confirmTheme, revertTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
