"use client";

import type { ReactNode } from "react";
import styles from "@/app/os/os.module.css";

interface DesktopIconProps {
  label: string;
  /** 32x32 art shown above the label. */
  icon: ReactNode;
  onClick?: () => void;
  /** Renders the dotted selection rectangle. */
  selected?: boolean;
}

export function DesktopIcon({
  label,
  icon,
  onClick,
  selected = false,
}: DesktopIconProps) {
  const className = selected
    ? `${styles.desktopIcon} ${styles.desktopIconActive}`
    : styles.desktopIcon;

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={label}
    >
      <span aria-hidden className={styles.desktopIconArt}>
        {icon}
      </span>
      <span className={styles.desktopIconLabel}>{label}</span>
    </button>
  );
}
