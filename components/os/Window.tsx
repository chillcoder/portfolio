import type { ReactNode } from "react";
import styles from "@/app/os/os.module.css";

interface WindowProps {
  title: string;
  /** Optional 16x16 icon shown left of the title. */
  icon?: ReactNode;
  /** Active windows get the inverted (dark) title bar. */
  active?: boolean;
  children: ReactNode;
  /** Size + position overrides; e.g. Tailwind `absolute left-1/2 top-1/2 ...`. */
  className?: string;
  /** When provided, the × control closes the window. */
  onClose?: () => void;
}

export function Window({
  title,
  icon,
  active = false,
  children,
  className,
  onClose,
}: WindowProps) {
  const titleBarClass = active
    ? `${styles.windowTitleBar} ${styles.windowTitleBarActive}`
    : styles.windowTitleBar;

  return (
    <section
      className={`${styles.window}${className ? ` ${className}` : ""}`}
      aria-label={title}
    >
      <header className={titleBarClass}>
        {icon && (
          <span aria-hidden className={styles.windowTitleIcon}>
            {icon}
          </span>
        )}
        <span className={styles.windowTitle}>{title}</span>
        <span className={styles.windowControls}>
          <button
            type="button"
            className={styles.windowButton}
            aria-label="Minimize"
          >
            −
          </button>
          <button
            type="button"
            className={styles.windowButton}
            aria-label="Maximize"
          >
            □
          </button>
          <button
            type="button"
            className={styles.windowButton}
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </span>
      </header>
      <div className={styles.windowContent}>{children}</div>
    </section>
  );
}
