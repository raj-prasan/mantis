import { TextAttributes } from "@opentui/core";
import { getCommandValue } from "./commands";
import type { Command } from "./types";
export type CommandMenuProps = {
  commands: Command[];
  activeIndex: number;
  onSelect: (command: Command) => void;
  onExecute: (command: Command) => void;
};

const BACKGROUND = "#12121A";
const BORDER = "#2A2A38";
const ACTIVE_BACKGROUND = "#242433";
const ACCENT = "cyan";
const DESCRIPTION = "#6B7280";
const MAX_VISIBLE = 8;

export function CommandMenu({ commands, activeIndex, onSelect, onExecute }: CommandMenuProps) {
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
      flexDirection="column"
      border
      borderStyle="single"
      borderColor={BORDER}
      backgroundColor={BACKGROUND}
    >
      {hiddenAbove > 0 && (
        <box width="100%" paddingLeft={2} paddingRight={2}>
          <text fg={DESCRIPTION} attributes={TextAttributes.DIM}>
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
              backgroundColor={active ? ACTIVE_BACKGROUND : BACKGROUND}
              onMouseDown={() => onExecute(command)}
              onMouseMove={()=>onSelect(command)}
            >
              <text fg={active ? ACCENT : DESCRIPTION} attributes={active ? TextAttributes.BOLD : undefined}>
                {(active ? "▸ " : "  ") + getCommandValue(command)}
              </text>
              <text fg={DESCRIPTION}>{command.description}</text>
            </box>
          );
        })
      }
      {hiddenBelow > 0 && (
        <box width="100%" paddingLeft={2} paddingRight={2}>
          <text fg={DESCRIPTION} attributes={TextAttributes.DIM}>
            {`↓ ${hiddenBelow} more`}
          </text>
        </box>
      )}
    </box>
  );
}
