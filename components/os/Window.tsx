"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "@/app/os/os.module.css";

interface WindowProps {
  title: string;
  /** Optional 16x16 icon shown left of the title. */
  icon?: ReactNode;
  /** Active windows get the inverted (dark) title bar. */
  active?: boolean;
  children: ReactNode;
  /** Size + position overrides; positions the window via CSS until the user drags it. */
  className?: string;
  /** When provided, the × control closes the window. */
  onClose?: () => void;
  /** Allow drag from the title bar. Default true. Set false for non-movable windows. */
  draggable?: boolean;
}

interface DragOffset {
  x: number;
  y: number;
}

export function Window({
  title,
  icon,
  active = false,
  children,
  className,
  onClose,
  draggable = true,
}: WindowProps) {
  const titleBarClass = active
    ? `${styles.windowTitleBar} ${styles.windowTitleBarActive}`
    : styles.windowTitleBar;

  const sectionRef = useRef<HTMLElement | null>(null);
  // Once the user starts dragging, we switch from CSS-based positioning
  // (set via `className`) to explicit pixel coords.
  const [pos, setPos] = useState<DragOffset | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!draggable) return;
      // Don't initiate a drag from the chrome buttons.
      if ((e.target as HTMLElement).closest("button")) return;
      const node = sectionRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const parent = node.offsetParent as HTMLElement | null;
      const parentRect = parent?.getBoundingClientRect();

      const originX = pos?.x ?? rect.left - (parentRect?.left ?? 0);
      const originY = pos?.y ?? rect.top - (parentRect?.top ?? 0);

      // Lock to explicit pixel position (also overrides translate() centering).
      setPos({ x: originX, y: originY });
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX,
        originY,
      };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      e.preventDefault();
    },
    [draggable, pos],
  );

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      const node = sectionRef.current;
      const parent = node?.offsetParent as HTMLElement | null;
      const parentRect = parent?.getBoundingClientRect();
      const nodeRect = node?.getBoundingClientRect();
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      let x = drag.originX + dx;
      let y = drag.originY + dy;
      // Clamp so at least 32px of the title bar stays inside the parent.
      if (parentRect && nodeRect) {
        const maxX = parentRect.width - 64;
        const maxY = parentRect.height - 28;
        x = Math.max(-(nodeRect.width - 96), Math.min(maxX, x));
        y = Math.max(0, Math.min(maxY, y));
      }
      setPos({ x, y });
    }
    function onUp() {
      dragRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // When `pos` is set, override CSS positioning with explicit pixel coords.
  const positionStyle: CSSProperties | undefined =
    pos !== null
      ? {
          left: pos.x,
          top: pos.y,
          right: "auto",
          bottom: "auto",
          transform: "none",
        }
      : undefined;

  return (
    <section
      ref={sectionRef}
      className={`${styles.window}${className ? ` ${className}` : ""}`}
      style={positionStyle}
      aria-label={title}
    >
      <header
        className={titleBarClass}
        onPointerDown={onPointerDown}
        style={draggable ? { cursor: "move", touchAction: "none" } : undefined}
      >
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
