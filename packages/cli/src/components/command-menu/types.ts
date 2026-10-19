import type { DialogConfig } from "../../providers/dialog";
import type { ToastContextValue } from "../../providers/toast";

export type Command = {
  name: string;
  description: string;
  aliases?: string[];
  value?: string;
  action?: (ctx: CommandContext) => void | Promise<void> 
};

export type CommandContext = {
  exit :() => void;
  toast: ToastContextValue["toast"];
  openDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
}
