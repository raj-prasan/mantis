import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { TextAttributes } from "@opentui/core";
import {
  DEFAULT_DURATION,
  type ToastOptions,
  type ToastVariant,
} from "./types";
import { useTheme } from "../theme/context";
import type { Theme } from "../theme/types";

export { DEFAULT_DURATION } from "./types";
export type { ToastOptions, ToastVariant } from "./types";

export type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

export type ToastProviderProps = {
  children: ReactNode;
  duration?: number;
};

const ToastContext = createContext<ToastContextValue | null>(null);
type ToastEntry = ToastOptions;

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

type ToastItemProps = {
  toast: ToastEntry;
  onRemove: (toast: ToastEntry) => void;
};

const VARIANT_COLORS: Record<ToastVariant, (theme: Theme) => string> = {
  success: (theme) => theme.success,
  error: (theme) => theme.error,
  info: (theme) => theme.info,
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { theme } = useTheme();
  const color = VARIANT_COLORS[toast.variant](theme);

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <box
      flexDirection="row"
      maxWidth={60}
      paddingLeft={2}
      paddingRight={2}
      paddingY={1}
      border={["left"]}
      borderStyle="single"
      borderColor={color}
      backgroundColor={theme.surface}
      gap={1}
    >
      <text fg={theme.text} attributes={TextAttributes.BOLD}>
        {toast.message}
      </text>
    </box>
  );
}

export function ToastProvider({
  children,
  duration = DEFAULT_DURATION,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const toast = useCallback(
    (options: ToastOptions) => {
      const next = {
        ...options,
        duration: options.duration || duration,
      };
      setToasts((current) => [...current, next]);
    },
    [duration],
  );
  const removeToast = useCallback((toast: ToastEntry) => {
    setToasts((current) => current.filter((item) => item !== toast));
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toast }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <box
        position="absolute"
        top={1}
        right={1}
        zIndex={100}
        flexDirection="column"
        gap={1}
      >
        {toasts.map((item, index) => (
          <ToastItem
            key={`${item.message}-${index}`}
            toast={item}
            onRemove={removeToast}
          />
        ))}
      </box>
    </ToastContext.Provider>
  );
}
