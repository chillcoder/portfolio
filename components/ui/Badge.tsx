import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Variant = "default" | "accent" | "outline" | "muted";

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        variant === "default" && "bg-[var(--color-bg-2)] text-[var(--color-fg)]",
        variant === "muted" && "bg-[var(--color-border)] text-[var(--color-fg-muted)]",
        variant === "outline" &&
          "border border-[var(--color-border)] text-[var(--color-fg-muted)]",
        variant === "accent" && "text-white",
        className,
      )}
      style={
        variant === "accent"
          ? { background: "var(--tile-accent, var(--color-accent-primary))" }
          : undefined
      }
    >
      {children}
    </span>
  );
}
