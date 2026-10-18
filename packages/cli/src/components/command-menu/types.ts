export type Command = {
  name: string;
  description: string;
  aliases?: string[];
  value?: string;
  action?: (ctx: CommandContext) => void | Promise<void> 
};

export type CommandContext = {
  exit :() => void
}
