"use client";

import type { ReactNode } from "react";
import styles from "@/app/os/os.module.css";

interface DesktopIconBaseProps {
  label: string;
  /** 32x32 art shown above the label. */
  icon: ReactNode;
  /** Renders the dotted selection rectangle. */
  selected?: boolean;
}

interface DesktopIconButton extends DesktopIconBaseProps {
  onClick: () => void;
  href?: never;
}

interface DesktopIconLink extends DesktopIconBaseProps {
  href: string;
  /** Defaults to "_blank" when href is set. */
  target?: string;
  onClick?: never;
}

type DesktopIconProps = DesktopIconButton | DesktopIconLink;

export function DesktopIcon(props: DesktopIconProps) {
  const className = props.selected
    ? `${styles.desktopIcon} ${styles.desktopIconActive}`
    : styles.desktopIcon;

  const inner = (
    <>
      <span aria-hidden className={styles.desktopIconArt}>
        {props.icon}
      </span>
      <span className={styles.desktopIconLabel}>{props.label}</span>
    </>
  );

  if ("href" in props && props.href) {
    return (
      <a
        href={props.href}
        target={props.target ?? "_blank"}
        rel={props.target === "_self" ? undefined : "noopener noreferrer"}
        className={className}
        aria-label={props.label}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={props.onClick}
      aria-label={props.label}
    >
      {inner}
    </button>
  );
}
