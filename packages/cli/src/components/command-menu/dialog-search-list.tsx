import { useEffect, useMemo, useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useTheme } from "../../providers/theme/context";

export type DialogSearchItem = {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
};

export type DialogSearchListProps = {
  items: DialogSearchItem[];
  onSelect: (item: DialogSearchItem) => void;
  onHighlight?: (item: DialogSearchItem) => void;
  placeholder?: string;
  emptyText?: string;
  maxVisible?: number;
  initialIndex?: number;
};

export function DialogSearchList({
  items,
  onSelect,
  onHighlight,
  placeholder = "Search...",
  emptyText = "No results",
  maxVisible = 8,
  initialIndex = 0,
}: DialogSearchListProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) => {
      const values = [item.label, item.description ?? "", ...(item.keywords ?? [])];
      return values.some((value) => value.toLowerCase().includes(normalized));
    });
  }, [items, query]);

  const activePosition = filtered.length === 0 ? -1 : Math.min(activeIndex, filtered.length - 1);
  const activeItem = filtered[activePosition];

  useEffect(() => {
    if (activeItem) onHighlight?.(activeItem);
  }, [activeItem, onHighlight]);

  const handleInput = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
  };

  const selectItem = (item: DialogSearchItem) => {
    onSelect(item);
  };

  const selectActive = () => {
    if (activeItem) onSelect(activeItem);
  };

  useKeyboard((key) => {
    if (key.eventType === "release" || filtered.length === 0) return;

    if (key.name === "down" || (key.ctrl && key.name === "n")) {
      key.preventDefault();
      key.stopPropagation();
      setActiveIndex((current) => (Math.min(current, filtered.length - 1) + 1) % filtered.length);
    } else if (key.name === "up" || (key.ctrl && key.name === "p")) {
      key.preventDefault();
      key.stopPropagation();
      setActiveIndex((current) => {
        const index = Math.min(current, filtered.length - 1);
        return (index - 1 + filtered.length) % filtered.length;
      });
    }
  });

  const start = Math.max(
    0,
    Math.min(activePosition - Math.floor(maxVisible / 2), filtered.length - maxVisible),
  );
  const visible = filtered.slice(start, start + maxVisible);
  const hiddenAbove = start;
  const hiddenBelow = filtered.length - start - maxVisible;

  return (
    <box width="100%" flexDirection="column" gap={1}>
      <box width="100%" flexDirection="row" gap={1} paddingX={1}>
        <text fg={theme.accent}>{">"}</text>
        <input
          focused
          flexGrow={1}
          placeholder={placeholder}
          onInput={handleInput}
          onSubmit={selectActive}
        />
      </box>
      {filtered.length === 0 ? (
        <box paddingX={1}>
          <text fg={theme.textMuted}>{emptyText}</text>
        </box>
      ) : (
        <box width="100%" flexDirection="column">
          {hiddenAbove > 0 && (
            <box width="100%" paddingX={1}>
              <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
                {`↑ ${hiddenAbove} more`}
              </text>
            </box>
          )}
          {visible.map((item, index) => {
            const itemIndex = start + index;
            const active = itemIndex === activePosition;
            return (
              <box
                key={item.id}
                width="100%"
                flexDirection="row"
                gap={1}
                paddingX={1}
                backgroundColor={active ? theme.surfaceAlt : theme.surface}
                onMouseMove={() => setActiveIndex(itemIndex)}
                onMouseDown={() => selectItem(item)}
              >
                <text
                  fg={active ? theme.accent : theme.textMuted}
                  attributes={active ? TextAttributes.BOLD : undefined}
                >
                  {(active ? "▸ " : "  ") + item.label}
                </text>
                {item.description && <text fg={theme.textMuted}>{item.description}</text>}
              </box>
            );
          })}
          {hiddenBelow > 0 && (
            <box width="100%" paddingX={1}>
              <text fg={theme.textMuted} attributes={TextAttributes.DIM}>
                {`↓ ${hiddenBelow} more`}
              </text>
            </box>
          )}
        </box>
      )}
    </box>
  );
}
