import { useEffect, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { COMMANDS, filterCommands, getCommandQuery } from "./commands";
import type { Command } from "./types";

export type UseCommandMenuOptions = {
  value: string;
  commands?: Command[];
  enabled?: boolean;
  onExecute: (command: Command) => void;
};

export type CommandMenuState = {
  isOpen: boolean;
  matches: Command[];
  activeIndex: number;
  select: (command: Command) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  selectActive: () => void;
  close: () => void;
};

export function useCommandMenu({
  value,
  commands = COMMANDS,
  enabled = true,
  onExecute,
}: UseCommandMenuOptions): CommandMenuState {
  const query = getCommandQuery(value);
  const [dismissedQuery, setDismissedQuery] = useState<string | null>(null);
  const [rawActiveIndex, setRawActiveIndex] = useState(0);

  const matches = useMemo(
    () => (query === null ? [] : filterCommands(commands, query)),
    [commands, query],
  );

  const isOpen = enabled && query !== null && query !== dismissedQuery;

  useEffect(() => {
    setRawActiveIndex(0);
  }, [query]);

  const activeIndex = matches.length === 0 ? 0 : Math.min(rawActiveIndex, matches.length - 1);

  const close = () => {
    if (query !== null) setDismissedQuery(query);
  };

  const select = (command: Command) => {
    const index = matches.indexOf(command);
    if (index >= 0) setRawActiveIndex(index);
  };

  const execute = (command: Command) => {
    onExecute(command);
  };

  const selectNext = () => {
    if (matches.length === 0) return;
    setRawActiveIndex((index) => (index + 1) % matches.length);
  };

  const selectPrevious = () => {
    if (matches.length === 0) return;
    setRawActiveIndex((index) => (index - 1 + matches.length) % matches.length);
  };

  const selectActive = () => {
    const command = matches[activeIndex];
    if (command) execute(command);
  };

  useKeyboard((key) => {
    if (!isOpen) return;
    if (key.eventType === "release") return;

    const isNext = key.name === "down" || (key.ctrl && key.name === "n");
    const isPrevious = key.name === "up" || (key.ctrl && key.name === "p");
    const isAccept = key.name === "return" || key.name === "enter" || key.name === "tab";
    const isClose = key.name === "escape";

    if (isNext) {
      key.preventDefault();
      selectNext();
    } else if (isPrevious) {
      key.preventDefault();
      selectPrevious();
    } else if (isAccept) {
      key.preventDefault();
      selectActive();
    } else if (isClose) {
      key.preventDefault();
      close();
    }
  });

  return {
    isOpen,
    matches,
    activeIndex,
    select,
    selectNext,
    selectPrevious,
    selectActive,
    close,
  };
}
