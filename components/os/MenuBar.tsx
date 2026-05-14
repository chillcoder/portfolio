"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "@/app/os/os.module.css";
import { track } from "@/lib/track";
import { PROFILE } from "@/lib/portfolio-data";
import type { MainWindowId } from "@/components/os/mainWindowTypes";

type TopMenu = "File" | "Edit" | "View" | "Help";

export interface MenuBarProps {
  activeMain: MainWindowId | null;
  onOpenMain: (id: MainWindowId) => void;
  onCloseMain: () => void;
  pinnedClosed: boolean;
  onTogglePinned: () => void;
}

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    track("os_menu_clipboard", { label, ok: true });
  } catch {
    track("os_menu_clipboard", { label, ok: false });
  }
}

export function MenuBar({
  activeMain,
  onOpenMain,
  onCloseMain,
  pinnedClosed,
  onTogglePinned,
}: MenuBarProps) {
  const [open, setOpen] = useState<TopMenu | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (!open) return;
    function onDocMouse(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDocMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  function toggle(which: TopMenu) {
    setOpen((v) => (v === which ? null : which));
  }

  function item(
    key: string,
    label: string,
    onSelect: () => void,
    opts?: { disabled?: boolean },
  ) {
    const disabled = opts?.disabled ?? false;
    return (
      <button
        key={key}
        type="button"
        role="menuitem"
        disabled={disabled}
        className={styles.menuPullDownItem}
        onClick={() => {
          if (disabled) return;
          onSelect();
          close();
        }}
      >
        {label}
      </button>
    );
  }

  const menus: Record<TopMenu, ReactNode> = {
    File: (
      <>
        {item("about", "about.md", () => onOpenMain("about"))}
        {item("projects", "Projects", () => onOpenMain("projects"))}
        {item("contact", "contact.app", () => onOpenMain("contact"))}
        <div className={styles.menuPullDownSep} role="separator" />
        {item("close", "Close window", () => onCloseMain(), {
          disabled: !activeMain,
        })}
        <Link
          href="/"
          role="menuitem"
          className={styles.menuPullDownItem}
          onClick={() => {
            track("view_switched", { to: "bento" });
            close();
          }}
        >
          Return to portfolio…
        </Link>
      </>
    ),
    Edit: (
      <>
        {item("copy-email", `Copy email (${PROFILE.email})`, () =>
          copyText("email", PROFILE.email),
        )}
        {item("copy-url", "Copy this page URL", () =>
          copyText("url", typeof window !== "undefined" ? window.location.href : ""),
        )}
      </>
    ),
    View: (
      <>
        {item(
          "toggle-player",
          pinnedClosed ? "Show Now Playing" : "Hide Now Playing",
          onTogglePinned,
        )}
      </>
    ),
    Help: (
      <>
        {item("about-os", "About this desktop", () => onOpenMain("about"))}
        <Link
          href="/privacy"
          role="menuitem"
          className={styles.menuPullDownItem}
          onClick={close}
        >
          Privacy policy
        </Link>
        <div className={styles.menuPullDownHint} role="note">
          Tip: press Esc to close menus. Konami code does something fun.
        </div>
      </>
    ),
  };

  const labels: TopMenu[] = ["File", "Edit", "View", "Help"];

  return (
    <div ref={rootRef} className={styles.menuBar} role="menubar" aria-label="Lucas-OS menu">
      <Link
        href="/"
        role="menuitem"
        className={`${styles.menuBarBrand} ${styles.menuBarBrandLink}`}
        onClick={() => track("view_switched", { to: "bento" })}
        aria-label="Exit Lucas-OS, return to main portfolio"
      >
        LUCAS-OS
      </Link>
      {labels.map((label) => {
        const isOpen = open === label;
        return (
          <div key={label} className={styles.menuBarMenuWrap}>
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              className={styles.menuBarTrigger}
              onClick={() => toggle(label)}
            >
              {label}
            </button>
            {isOpen && (
              <div className={styles.menuPullDown} role="menu">
                {menus[label]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
