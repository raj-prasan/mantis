import { useEffect, useRef } from "react";
import { useDialog } from ".";
import {
  DialogSearchList,
  type DialogSearchItem,
} from "../../components/command-menu/dialog-search-list";
import { useTheme } from "../theme/context";

export function ThemePicker() {
  const { themes, savedThemeId, previewTheme, confirmTheme, revertTheme } = useTheme();
  const { closeDialog } = useDialog();
  const confirmed = useRef(false);

  useEffect(() => {
    return () => {
      if (!confirmed.current) revertTheme();
    };
  }, [revertTheme]);

  const items: DialogSearchItem[] = themes.map((theme) => ({
    id: theme.id,
    label: theme.name,
    description: theme.id === savedThemeId ? "current" : undefined,
    keywords: [theme.id],
  }));

  const initialIndex = Math.max(
    0,
    themes.findIndex((theme) => theme.id === savedThemeId),
  );

  return (
    <DialogSearchList
      items={items}
      initialIndex={initialIndex}
      placeholder="Search themes..."
      onHighlight={(item) => previewTheme(item.id)}
      onSelect={(item) => {
        confirmed.current = true;
        confirmTheme(item.id);
        closeDialog();
      }}
    />
  );
}
