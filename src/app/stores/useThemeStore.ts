/**
 * useThemeStore.ts — Store de tema claro/oscuro con Zustand.
 *
 * - Persiste en localStorage
 * - Aplica la clase "dark" en <html> para que Tailwind active el modo oscuro
 * - Inicializa sin parpadeo (flicker-free) leyendo localStorage sincrónicamente
 */

import { create } from "zustand";

type Theme = "light" | "dark";

const THEME_KEY = "taskflow_theme";

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

// Carga y aplica el tema inicial ANTES del primer render — llamado UNA sola vez
function initTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  const theme: Theme =
    saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(theme);
  return theme;
}

const initialTheme = initTheme();

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: initialTheme,
  isDark: initialTheme === "dark",

  toggleTheme: () => {
    set(s => {
      const next: Theme = s.theme === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      return { theme: next, isDark: next === "dark" };
    });
  },

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    set({ theme, isDark: theme === "dark" });
  },
}));
