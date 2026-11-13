import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme/context";
import type { ClientMessagePart, ClientToolCallPart } from "../../hooks/use-chat";
import type { Mode } from "@mantis/database/enums";

const MAX_ARGS_LENGTH = 80;
const MAX_RESULT_LINES = 5;
const MAX_RESULT_LINE_LENGTH = 120;

type Props = {
  parts: ClientMessagePart[];
  model: string;
  mode: Mode;
  duration?: string;
  streaming?: boolean;
};

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function formatArgs(args: Record<string, unknown>): string {
  const entries = Object.entries(args ?? {});
  if (entries.length === 0) return "";
  const summary = entries
    .map(([key, value]) => {
      const printed = typeof value === "string" ? value : JSON.stringify(value);
      return `${key}=${printed.replace(/\s+/g, " ")}`;
    })
    .join(" ");
  return truncate(summary, MAX_ARGS_LENGTH);
}

function formatResult(result: string): string {
  const lines = result.trim().split("\n");
  const shown = lines
    .slice(0, MAX_RESULT_LINES)
    .map((line) => truncate(line, MAX_RESULT_LINE_LENGTH));
  const hidden = lines.length - shown.length;
  if (hidden > 0) shown.push(`… ${hidden} more line${hidden === 1 ? "" : "s"}`);
  return shown.join("\n");
}

function ReasoningPart({ text }: { text: string }) {
  const { theme } = useTheme();
  const content = text.trim();
  if (!content) return null;

  return (
    <box flexDirection="column">
      <text attributes={TextAttributes.DIM} fg={theme.textMuted}>
        Thinking
      </text>
      <box
        border={["left"]}
        borderColor={theme.border}
        paddingLeft={1}
      >
        <text attributes={TextAttributes.DIM | TextAttributes.ITALIC} fg={theme.textMuted}>
          {content}
        </text>
      </box>
    </box>
  );
}

function ToolCallPart({ part }: { part: ClientToolCallPart }) {
  const { theme } = useTheme();
  const done = part.status === "done";
  const args = formatArgs(part.args);
  const result = done && part.result ? formatResult(part.result) : "";

  return (
    <box flexDirection="column">
      <box flexDirection="row" gap={1}>
        <text fg={done ? theme.success : theme.accent}>{done ? "✓" : "●"}</text>
        <text fg={theme.text}>{part.name}</text>
        {args && (
          <text attributes={TextAttributes.DIM} fg={theme.textMuted}>
            {args}
          </text>
        )}
        {!done && (
          <text attributes={TextAttributes.DIM} fg={theme.textMuted}>
            running…
          </text>
        )}
      </box>
      {result && (
        <box
          border={["left"]}
          borderColor={theme.border}
          paddingLeft={1}
          marginLeft={1}
        >
          <text attributes={TextAttributes.DIM} fg={theme.textMuted}>
            {result}
          </text>
        </box>
      )}
    </box>
  );
}

function renderPart(part: ClientMessagePart, index: number, textColor: string) {
  switch (part.type) {
    case "reasoning":
      return <ReasoningPart key={index} text={part.text} />;
    case "tool-call":
      return <ToolCallPart key={part.id} part={part} />;
    case "text":
      if (!part.text.trim()) return null;
      return (
        <text key={index} fg={textColor}>
          {part.text}
        </text>
      );
    default: {
      const _exhaustive: never = part;
      return _exhaustive;
    }
  }
}

export function BotMessage({
  parts,
  model,
  mode,
  duration,
  streaming = false,
}: Props) {
  const { theme } = useTheme();
  const modeColor = mode === "plan" ? theme.success : theme.info;

  return (
    <box width="100%" border={["left"]} borderColor={theme.success}>
      <box
        width="100%"
        flexDirection="column"
        gap={1}
        paddingX={2}
        paddingY={1}
      >
        {parts.map((part, index) => renderPart(part, index, theme.text))}
        <box flexDirection="row" gap={1}>
          <text fg={modeColor}>{streaming ? "…" : "•"}</text>
          <text fg={modeColor}>{mode === "plan" ? "Plan" : "Build"}</text>
          <text attributes={TextAttributes.DIM} fg={theme.textMuted}>{">"}</text>
          <text attributes={TextAttributes.DIM}>{model}</text>
          {duration && (
            <>
              <text attributes={TextAttributes.DIM} fg={theme.textMuted}>{">"}</text>
              <text attributes={TextAttributes.DIM}>{duration}</text>
            </>
          )}
        </box>
      </box>
    </box>
  );
}
