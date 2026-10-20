export type Theme = {
  id: string;
  name: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  success: string;
  error: string;
  info: string;
};

export type ThemeContextValue = {
  theme: Theme;
  themeId: string;
  savedThemeId: string;
  themes: Theme[];
  isPreviewing: boolean;
  previewTheme: (id: string) => void;
  confirmTheme: (id?: string) => void;
  revertTheme: () => void;
};
