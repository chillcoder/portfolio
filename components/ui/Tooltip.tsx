"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ label, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-opacity duration-150",
          open ? "opacity-100" : "opacity-0",
        )}
        style={{
          background: "var(--color-fg)",
          color: "var(--color-bg)",
        }}
      >
        {label}
      </span>
    </span>
  );
}
