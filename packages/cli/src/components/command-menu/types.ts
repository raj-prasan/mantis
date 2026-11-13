import type { Mode } from "@mantis/database/enums";
import type { DialogConfig } from "../../providers/dialog";
import type { ToastContextValue } from "../../providers/toast";
import type { SupportedChatModelId } from "@mantis/shared";

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
  navigate: (screen: string) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  setModel : (model : SupportedChatModelId)=> void
}
