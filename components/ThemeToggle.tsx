"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "terminal" | "posthog";

const THEMES: ReadonlyArray<{
  id: Theme;
  label: string;
  glyph: string;
  swatch: { bg: string; fg: string; accent: string };
}> = [
  {
    id: "light",
    label: "Light",
    glyph: "☀",
    swatch: { bg: "#f5f3ee", fg: "#1a1a1a", accent: "#ff5a1f" },
  },
  {
    id: "dark",
    label: "Dark",
    glyph: "☾",
    swatch: { bg: "#0e0e10", fg: "#f3f3f0", accent: "#ff5a1f" },
  },
  {
    id: "terminal",
    label: "Terminal",
    glyph: ">_",
    swatch: { bg: "#050805", fg: "#b8ffc6", accent: "#33ff66" },
  },
  {
    id: "posthog",
    label: "PostHog",
    glyph: "◆",
    swatch: { bg: "#eeefe9", fg: "#151515", accent: "#f54e00" },
  },
];

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "terminal" || value === "posthog";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.getAttribute("data-theme");
    if (isTheme(current)) setTheme(current);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function applyTheme(next: Theme) {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
    setTheme(next);
    setOpen(false);
  }

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Theme: ${current.label}. Click to change.`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-tile)] text-[var(--color-fg)] transition hover:bg-[var(--color-tile-hover)]"
      >
        <span className="text-sm font-mono" aria-hidden>
          {mounted ? current.glyph : "·"}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme picker"
          className="absolute right-0 top-[calc(100%+8px)] z-[60] w-44 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1 shadow-lg"
        >
          {THEMES.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => applyTheme(t.id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-[var(--color-fg)] transition hover:bg-[var(--color-tile-hover)]"
              >
                <span
                  aria-hidden
                  className="grid size-6 shrink-0 place-items-center rounded-md border border-[var(--color-border)] font-mono text-[10px]"
                  style={{
                    background: t.swatch.bg,
                    color: t.swatch.fg,
                    boxShadow: `inset 0 0 0 2px ${t.swatch.accent}33`,
                  }}
                >
                  {t.glyph}
                </span>
                <span className="flex-1">{t.label}</span>
                {active && (
                  <span aria-hidden className="text-xs text-[var(--color-fg-muted)]">
                    ●
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
