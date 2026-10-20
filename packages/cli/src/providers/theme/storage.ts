import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type Prefs = {
  theme?: string;
};

const PREFS_DIR = join(homedir(), ".mantis");
const PREFS_FILE = join(PREFS_DIR, "prefs");

export function readPrefs(): Prefs {
  try {
    return JSON.parse(readFileSync(PREFS_FILE, "utf8")) as Prefs;
  } catch {
    return {};
  }
}

export function writePrefs(prefs: Prefs): void {
  try {
    mkdirSync(PREFS_DIR, { recursive: true });
    writeFileSync(PREFS_FILE, `${JSON.stringify(prefs, null, 2)}\n`, "utf8");
  } catch {
    return;
  }
}

export function loadSavedThemeId(): string | undefined {
  return readPrefs().theme;
}

export function saveThemeId(themeId: string): void {
  writePrefs({ ...readPrefs(), theme: themeId });
}
