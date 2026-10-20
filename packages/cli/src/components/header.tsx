import { useTheme } from "../providers/theme/context";

export function Header() {
  const { theme } = useTheme();

  return (
    <box justifyContent="center" alignItems="center">
      <box flexDirection="row" justifyContent="center" gap={0.5} alignItems="center">
        <ascii-font font="tiny" color={theme.textMuted} text="man" />
        <ascii-font font="tiny" color={theme.text} text="tis" />
      </box>
    </box>
  );
}
