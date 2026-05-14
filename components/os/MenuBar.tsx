"use client";

import Link from "next/link";
import styles from "@/app/os/os.module.css";
import { track } from "@/lib/track";

const ITEMS = ["File", "Edit", "View", "Help"] as const;

export function MenuBar() {
  return (
    <div className={styles.menuBar} role="menubar" aria-label="Lucas-OS menu">
      <Link
        href="/"
        role="menuitem"
        className={`${styles.menuBarBrand} ${styles.menuBarBrandLink}`}
        onClick={() => track("view_switched", { to: "bento" })}
        aria-label="Exit Lucas-OS, return to main portfolio"
      >
        LUCAS-OS
      </Link>
      {ITEMS.map((item) => (
        <span key={item} className={styles.menuBarItem} role="menuitem">
          {item}
        </span>
      ))}
    </div>
  );
}
