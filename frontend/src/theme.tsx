import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./auth";

export type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

// Theme is intentionally scoped to the current authenticated session.
// Every new user login starts in dark mode. Once the signed-in user changes
// the theme, that choice is preserved while the current session is active
// and therefore applies consistently to every protected page.
const SESSION_THEME_KEY = "sentinelsoc_session_theme_v2";

function readSessionTheme(): Theme {
  try {
    return sessionStorage.getItem(SESSION_THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>("dark");

  // Authentication boundary:
  // - logged out/login page => always dark
  // - new authenticated session => dark unless the signed-in user has already
  //   changed the theme during THIS browser session
  useEffect(() => {
    if (!user) {
      try {
        sessionStorage.removeItem(SESSION_THEME_KEY);
      } catch {
        // Best effort only.
      }
      setThemeState("dark");
      applyTheme("dark");
      return;
    }

    const saved = readSessionTheme();
    setThemeState(saved);
    applyTheme(saved);
  }, [user]);

  // Keep the DOM in sync and preserve the user's selection for the current
  // authenticated session only. It is deliberately NOT stored in localStorage,
  // so a later login starts dark again.
  useEffect(() => {
    applyTheme(theme);

    if (!user) return;

    try {
      sessionStorage.setItem(SESSION_THEME_KEY, theme);
    } catch {
      // Best effort only.
    }
  }, [theme, user]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((current) => current === "dark" ? "light" : "dark"),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
