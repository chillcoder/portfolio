import { cn } from "@/lib/cn";

interface StatTileProps {
  value: string | number;
  label: string;
  hint?: string;
  className?: string;
}

export function StatTile({ value, label, hint, className }: StatTileProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="font-mono text-3xl tabular-nums text-[var(--color-fg)] md:text-4xl">
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">{label}</span>
      {hint && <span className="text-xs text-[var(--color-fg-muted)]/80">{hint}</span>}
    </div>
  );
}
