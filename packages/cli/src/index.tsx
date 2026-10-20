import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Header } from "./components/header";
import { Inputbar } from "./components/input-bar";
import { ToastProvider } from "./providers/toast";
import { KeyboardLayerProvider } from "./providers/keyboard-layer";
import { DialogProvider } from "./providers/dialog";
import { ThemeProvider, useTheme } from "./providers/theme";

function Layout() {
  const { theme } = useTheme();

  return (
    <box
      alignItems="center"
      justifyContent="center"
      backgroundColor={theme.background}
      width="100%"
      height="100%"
      gap={2}
    >
      <Header />
      <box width="100%" maxWidth={78} paddingX={2}>
        <Inputbar onSubmit={() => {}} />
      </box>
    </box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <KeyboardLayerProvider>
        <ToastProvider>
          <DialogProvider>
            <Layout />
          </DialogProvider>
        </ToastProvider>
      </KeyboardLayerProvider>
    </ThemeProvider>
  );
}

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  targetFps: 60,
});
createRoot(renderer).render(<App />);
