import { useEffect, useRef, useState } from "react";
import type { KeyBinding, TextareaRenderable } from "@opentui/core";
import { StatusBar } from "./status-bar";
import { CommandMenu, getCommandValue, useCommandMenu, type Command, type CommandContext } from "./command-menu";
import { useRenderer } from "@opentui/react";
import { useToast } from "../providers/toast";
import { useKeyboardLayer } from "../providers/keyboard-layer";
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

  const renderer = useRenderer();
  const {toast} = useToast()
  const textareaRef = useRef<TextareaRenderable | null>(null);
  const [value, setValue] = useState("");
  const {isTopLayer, setResponder} = useKeyboardLayer();

  const handleExecute = (command: Command) => {
    if (command.action){
      command.action({
        exit: () => renderer.destroy(),
        toast
      });
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

  //register the base layer responder for ctrl+c dismissal
  useEffect(()=>{
    setResponder("base", ()=> {
      if(disabled) return false

      const textarea = textareaRef.current;
      if(textarea && textarea.plainText.length> 0){
        textarea.setText("")
        return true
      }
      return false;
    });
    return ()=> setResponder("base" , null)
  },[disabled, setResponder])
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
          <textarea ref={textareaRef} 
          focused= {!disabled && (isTopLayer("base") || isTopLayer("command"))}
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
