"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Accent = "primary" | "secondary" | "tertiary" | "neutral";

const ACCENT_VAR: Record<Accent, string> = {
  primary: "var(--color-accent-primary)",
  secondary: "var(--color-accent-secondary)",
  tertiary: "var(--color-accent-tertiary)",
  neutral: "var(--color-fg-muted)",
};

export interface TileProps extends HTMLAttributes<HTMLDivElement> {
  accent?: Accent;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  padded?: boolean;
  span?: string;
  noise?: boolean;
}

export const Tile = forwardRef<HTMLDivElement, TileProps>(
  (
    {
      accent = "neutral",
      title,
      eyebrow,
      action,
      padded = true,
      span,
      noise = true,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass glass-hover relative overflow-hidden rounded-[var(--radius-tile)]",
          noise && "noise",
          span,
          className,
        )}
        style={
          {
            "--tile-accent": ACCENT_VAR[accent],
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--tile-accent) 50%, transparent 100%)",
            opacity: 0.5,
          }}
        />
        {(title || eyebrow || action) && (
          <div
            className={cn(
              "flex items-center justify-between gap-3",
              padded ? "px-5 pt-5" : "",
            )}
          >
            <div className="flex flex-col gap-0.5">
              {eyebrow && (
                <span
                  className="text-[10px] font-mono uppercase tracking-[0.18em]"
                  style={{ color: "var(--tile-accent)" }}
                >
                  {eyebrow}
                </span>
              )}
              {title && (
                <h3 className="text-base font-medium text-[var(--color-fg)]">{title}</h3>
              )}
            </div>
            {action}
          </div>
        )}
        <div className={cn("relative z-[1]", padded && "p-5")}>{children}</div>
      </div>
    );
  },
);
Tile.displayName = "Tile";
