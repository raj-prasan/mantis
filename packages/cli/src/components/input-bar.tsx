import { useRef, useState } from "react";
import type { KeyBinding, TextareaRenderable } from "@opentui/core";
import { StatusBar } from "./status-bar";
import { CommandMenu, context1, getCommandValue, useCommandMenu, type Command } from "./command-menu";

type Props = {
  onSubmit: (text: string)=> void;
  disabled? : boolean
}

export const TEXT_AREA_KEY_BINDINGS : KeyBinding[] = [
  {name: "return" , action: "submit"},
  {name: "enter" , action: "submit"},
  {name: "return" , shift: true, action: "newline"},
  {name: "enter" , shift: true, action: "newline",}
]
export function Inputbar ({onSubmit, disabled = false}: Props){
  const textareaRef = useRef<TextareaRenderable | null>(null);
  const [value, setValue] = useState("");

  const handleExecute = (command: Command) => {
    if (command.action){
      command.action(context1);
      return
    }
    const next = `${getCommandValue(command)} `;
    const buffer = textareaRef.current?.editBuffer;
    if (buffer) {
      buffer.replaceText(next);
      buffer.setCursor(0, next.length);
    }
    setValue(next);
  };

  const commandMenu = useCommandMenu({
    value,
    enabled: !disabled,
    onExecute: handleExecute,
  });

  const handleSubmit = () => {
    const text = textareaRef.current?.editBuffer.getText() ?? value;
    if (!text.trim()) return;
    onSubmit(text);
  };

  return(
    <box width="100%" alignItems="center" flexDirection="column">
      {commandMenu.isOpen && (
        <CommandMenu
          commands={commandMenu.matches}
          activeIndex={commandMenu.activeIndex}
          onSelect={commandMenu.select}
          onExecute={handleExecute}
        />
      )}
      <box
      width="100%"
      border={["left"]}
      borderStyle="single"
      borderColor="cyan"
      >
        <box
        position="relative"
        justifyContent="center"
        paddingX={2}
        paddingY={1}
        backgroundColor="#1A1A24"
        width="100%"
        minWidth={78}
        gap={1}
        >
          <textarea ref={textareaRef} focused= {!disabled}
          keyBindings={TEXT_AREA_KEY_BINDINGS}
          placeholder={`Ask anything... Fix a bug in the database`}
          onContentChange={() => setValue(textareaRef.current?.editBuffer.getText() ?? "")}
          onSubmit={handleSubmit}
          />
          <StatusBar />
        </box>
        
      </box>
    </box>
  )
}
