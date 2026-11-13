import { useEffect, useMemo, useState } from "react";
import type { Mode } from "@mantis/database/enums";
import { useTheme } from "../../providers/theme/context";

const CELLS = 8;
const TRAIL = 5;
const INTERVAL_MS = 60;
// Head travels right then left, pausing one frame at each end.
const PERIOD = (CELLS - 1) * 2;

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1]!, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mix(from: string, to: string, amount: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  if (!a || !b) return amount > 0.5 ? to : from;
  const channel = (i: number) =>
    Math.round(a[i]! + (b[i]! - a[i]!) * amount)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

type Props = {
  mode: Mode;
};

export function Spinner({ mode }: Props) {
  const { theme } = useTheme();
  const color = mode === "plan" ? theme.success : theme.info;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((current) => (current + 1) % PERIOD);
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // Precompute one color per trail step: bright mode color at the head fading to the idle color.
  const palette = useMemo(
    () =>
      Array.from({ length: TRAIL }, (_, step) =>
        mix(color, theme.border, step / TRAIL),
      ),
    [color, theme.border],
  );

  const movingRight = tick < CELLS;
  const head = movingRight ? tick : PERIOD - tick;

  return (
    <box flexDirection="row">
      {Array.from({ length: CELLS }, (_, cell) => {
        const behind = movingRight ? head - cell : cell - head;
        const lit = behind >= 0 && behind < TRAIL;
        return (
          <text key={cell} fg={lit ? palette[behind] : theme.border}>
            {lit ? "■" : "⬝"}
          </text>
        );
      })}
    </box>
  );
}
