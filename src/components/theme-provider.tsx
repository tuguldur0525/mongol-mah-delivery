"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const systemTheme: Theme = mq.matches ? "light" : "dark";
    const initial: Theme = stored ?? systemTheme;
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);

    // Follow system theme if user hasn't manually chosen
    if (!stored) {
      const handler = (e: MediaQueryListEvent) => {
        const sys: Theme = e.matches ? "light" : "dark";
        setTheme(sys);
        document.documentElement.setAttribute("data-theme", sys);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Only persist if user toggled; initial system follow also persists after toggle
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
