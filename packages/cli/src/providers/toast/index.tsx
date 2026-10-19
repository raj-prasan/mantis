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

export { DEFAULT_DURATION } from "./types";
export type { ToastOptions, ToastVariant } from "./types";

export type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

export type ToastProviderProps = {
  children: ReactNode;
  duration?: number;
};

const BACKGROUND = "#12121A";
const MESSAGE = "#E5E7EB";

const VARIANT_STYLES: Record<ToastVariant, { color: string}> = {
  success: { color: "green"},
  error: { color: "red"},
  info: { color: "cyan"},
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

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { color} = VARIANT_STYLES[toast.variant];

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
      backgroundColor={BACKGROUND}
      gap={1}
    >
      <text fg={MESSAGE} attributes={TextAttributes.BOLD}>
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
