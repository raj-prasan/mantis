import type { Command } from "./types";


export const COMMANDS: Command[] = [
  {
    name: "help",
    description: "Show available commands and shortcuts",
    aliases: ["?"],
    action : (ctx)=> {
      ctx.toast({message: "Opening helo",variant: "success",duration: 3000});
    }
  },
  {
    name: "new",
    description: "Create a new chat",
    action : (ctx)=> {
      ctx.toast({message: "Switched to a new chat",variant: "success",duration: 3000});
    }
  },
  {
    name: "agents",
    description: "Switch agents",
    action : (ctx)=> {
      ctx.toast({message: "Switching agent",variant: "success",duration: 3000});
    }

  },
  {
    name: "clear",
    description: "Clear the current conversation",
    aliases: ["reset"],
    action : (ctx)=> {
      ctx.toast({message: "Cleared Chat",variant: "success",duration: 3000});
    }
  },
  {
    name: "models",
    description: "Switch the model used for this session",
    action : (ctx)=> {
      ctx.toast({message: "Changing moodel",variant: "success",duration: 3000});
    }
  },
  {
    name: "login",
    description : "Sign in with you browser",
    action : (ctx)=> {
      ctx.toast({message: "Opening browser to sign you in",variant: "success",duration: 3000});
    }
  },
  {
    name: "logout",
    description : "Sign out of your account",
    aliases:  ["signout"],
    action : (ctx)=> {
      ctx.toast({message: "Signed out",variant: "success",duration: 3000});
    }
  },
  {
    name: "upgrade",
    description : "Buy more credits"
  },
  {
    name: "theme",
    description : "Change color theme",
    action : (ctx)=> {
      ctx.toast({message: "Slect your theme",variant: "success",duration: 3000});
    }
  },
  {
    name: "sessions",
    description : "Browse past sessions",
    action : (ctx)=> {
      ctx.toast({message: "Select Past Sessions",variant: "success",duration: 3000});
    }
  },
  {
    name: "init",
    description: "Create an AGENTS.md file for this project",
    action : (ctx)=> {
      ctx.toast({message: "Initializing the project...",variant: "success",duration: 3000});
    }
  },
  {
    name: "compact",
    description: "Summarize and compact the conversation history",
    action : (ctx)=> {
      ctx.toast({message: "Session Compacted",variant: "success",duration: 3000});
    }
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
