"use client";

import { useEffect, useState } from "react";

export type DataTheme = "light" | "dark" | "terminal" | "epaper";

const THEMES: ReadonlySet<string> = new Set(["light", "dark", "terminal", "epaper"]);

export function isDataTheme(value: string | null): value is DataTheme {
  return value !== null && THEMES.has(value);
}

/** Subscribes to `data-theme` on `<html>` (matches ThemeToggle / layout init). */
export function useDataTheme(): DataTheme {
  const [theme, setTheme] = useState<DataTheme>("light");

  useEffect(() => {
    const read = () => {
      const current = document.documentElement.getAttribute("data-theme");
      setTheme(isDataTheme(current) ? current : "light");
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}
