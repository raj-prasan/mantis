import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Header } from "./components/header";
import { Inputbar } from "./components/input-bar";
import { ToastProvider } from "./providers/toast";
import { KeyboardLayerProvider } from "./providers/keyboard-layer";
function App() {
  return (
    <KeyboardLayerProvider>
      <ToastProvider>
        <box
          alignItems="center"
          justifyContent="center"
          backgroundColor="#0D0D12"
          width="100%"
          height="100%"
          gap={2}
        >
          <Header />
          <box width="100%" maxWidth={78} paddingX={2}>
            <Inputbar onSubmit={() => {}} />
          </box>
        </box>
      </ToastProvider>
    </KeyboardLayerProvider>
  );
}

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  targetFps: 60,
});
createRoot(renderer).render(<App />);
