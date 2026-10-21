import { useEffect, useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme/context";

const FRAMES = ["\u280b", "\u2819", "\u2839", "\u2838", "\u283c", "\u2834", "\u2826", "\u2827", "\u2807", "\u280f"];

export function Spinner() {
  const { theme } = useTheme();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((current) => (current + 1) % FRAMES.length);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <text fg={theme.accent} attributes={TextAttributes.BOLD}>
      {FRAMES[frame] ?? FRAMES[0]}
    </text>
  );
}
