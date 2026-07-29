import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "latticefi-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}

/**
 * Recharts renders raw SVG and needs literal color values rather than
 * class names, so we mirror the Tailwind palette used across the app here
 * and pick the right shade for the active theme.
 */
export function chartPalette(theme: Theme) {
  const dark = theme === "dark";
  return {
    grid: dark ? "#1e293b" : "#e2e8f0",
    axis: dark ? "#94a3b8" : "#64748b",
    tooltipBg: dark ? "#0f172a" : "#ffffff",
    tooltipBorder: dark ? "#334155" : "#e2e8f0",
    tooltipText: dark ? "#e2e8f0" : "#0f172a",
    indigo: dark ? "#818cf8" : "#4f46e5",
    violet: dark ? "#a78bfa" : "#7c3aed",
    emerald: dark ? "#34d399" : "#059669",
    amber: dark ? "#fbbf24" : "#d97706",
    rose: dark ? "#fb7185" : "#e11d48",
  };
}
