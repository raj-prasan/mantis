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

export function CommandMenu({ commands, activeIndex, onSelect, onExecute }: CommandMenuProps) {
  return (
    <box
      width="100%"
      flexDirection="column"
      border
      borderStyle="single"
      borderColor={BORDER}
      backgroundColor={BACKGROUND}
    >
      {commands.length === 0 ? (
        <box paddingLeft={2} paddingRight={2} paddingY={1}>
          <text fg={DESCRIPTION}>No matching commands</text>
        </box>
      ) : (
        commands.map((command, index) => {
          const active = index === activeIndex;
          return (
            <box
              key={command.name}
              width="100%"
              flexDirection="row"
              gap={1}
              paddingLeft={2}
              paddingRight={2}
              backgroundColor={active ? ACTIVE_BACKGROUND : BACKGROUND}
              onMouseOver={() => onSelect(command)}
              onMouseDown={() => onExecute(command)}
            >
              <text fg={active ? ACCENT : DESCRIPTION} attributes={active ? TextAttributes.BOLD : undefined}>
                {(active ? "▸ " : "  ") + getCommandValue(command)}
              </text>
              <text fg={DESCRIPTION}>{command.description}</text>
            </box>
          );
        })
      )}
    </box>
  );
}
