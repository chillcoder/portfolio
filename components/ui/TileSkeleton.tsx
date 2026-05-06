import { cn } from "@/lib/cn";

export function TileSkeleton({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 animate-pulse",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-6 w-1/3 rounded bg-[var(--color-border)]" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-[var(--color-border)]"
          style={{ width: `${60 + ((i * 13) % 35)}%` }}
        />
      ))}
    </div>
  );
}
