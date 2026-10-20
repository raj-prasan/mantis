import { TextAttributes } from "@opentui/core";
import { getCommandValue } from "./commands";
import type { Command } from "./types";
import { useTheme } from "../../providers/theme/context";
export type CommandMenuProps = {
  commands: Command[];
  activeIndex: number;
  onSelect: (command: Command) => void;
  onExecute: (command: Command) => void;
};

const MAX_VISIBLE = 8;

export function CommandMenu({ commands, activeIndex, onSelect, onExecute }: CommandMenuProps) {
  const { theme } = useTheme();

  if(commands.length === 0){
    return
  }

  const start = Math.max(
    0,
    Math.min(activeIndex - Math.floor(MAX_VISIBLE / 2), commands.length - MAX_VISIBLE),
  );
  const visible = commands.slice(start, start + MAX_VISIBLE);
  const hiddenAbove = start;
  const hiddenBelow = commands.length - start - MAX_VISIBLE;

  return (
    <box
      width="100%"
      flexShrink={0}
      flexDirection="column"
      border
      borderStyle="single"
      borderColor={theme.border}
      backgroundColor={theme.surface}
    >
      {hiddenAbove > 0 && (
        <box width="100%" paddingLeft={2} paddingRight={2}>
          <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
            {`↑ ${hiddenAbove} more`}
          </text>
        </box>
      )}
      {
        visible.map((command, index) => {
          const active = start + index === activeIndex;
          return (
            <box
              key={command.name}
              width="100%"
              flexDirection="row"
              gap={1}
              paddingLeft={2}
              paddingRight={2}
              backgroundColor={active ? theme.surfaceAlt : theme.surface}
              onMouseDown={() => onExecute(command)}
              onMouseMove={()=>onSelect(command)}
            >
              <text fg={active ? theme.accent : theme.textMuted} attributes={active ? TextAttributes.BOLD : undefined}>
                {(active ? "▸ " : "  ") + getCommandValue(command)}
              </text>
              <text fg={theme.textMuted}>{command.description}</text>
            </box>
          );
        })
      }
      {hiddenBelow > 0 && (
        <box width="100%" paddingLeft={2} paddingRight={2}>
          <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
            {`↓ ${hiddenBelow} more`}
          </text>
        </box>
      )}
    </box>
  );
}
