import type { Command } from "./types";


export const COMMANDS: Command[] = [
  {
    name: "help",
    description: "Show available commands and shortcuts",
    aliases: ["?"],
  },
  {
    name: "clear",
    description: "Clear the current conversation",
    aliases: ["reset"],
  },
  {
    name: "model",
    description: "Switch the model used for this session",
  },
  {
    name: "init",
    description: "Create an AGENTS.md file for this project",
  },
  {
    name: "compact",
    description: "Summarize and compact the conversation history",
  },
  {
    name: "review",
    description: "Review pending changes on the current branch",
  },
  {
    name: "exit",
    description: "Quit Mantis",
    aliases: ["quit", "q"],
    action : (ctx)=>{ctx.exit()}
  },
];

const COMMAND_TOKEN = /^\/\S*$/;

export function getCommandQuery(value: string): string | null {
  return COMMAND_TOKEN.test(value) ? value.slice(1) : null;
}

export function filterCommands(commands: Command[], query: string): Command[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return commands;

  return commands.filter((command) => {
    const values = [command.name, command.description, ...(command.aliases ?? [])];
    return values.some((value) => value.toLowerCase().includes(normalized));
  });
}

export function getCommandValue(command: Command): string {
  return command.value ?? `/${command.name}`;
}
