import { TextAttributes } from "@opentui/core";

export function StatusBar() {
  return (
    <box
      flexDirection="row"
      gap={1}
    >
      <text fg="cyan">Build</text>
      <text fg="gray" attributes={TextAttributes.DIM}>
        &#8250;
      </text>
      <text fg="grey">opus-4-6</text>
    </box>
  );
}
