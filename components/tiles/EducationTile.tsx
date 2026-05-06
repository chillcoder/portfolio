"use client";

import { Tile } from "@/components/ui/Tile";
import { EDUCATION } from "@/config/profile";
import { Badge } from "@/components/ui/Badge";

export function EducationTile({ span }: { span?: string }) {
  return (
    <Tile span={span} eyebrow="Education" title="Schools" accent="secondary">
      <ol className="mt-4 flex flex-col gap-4">
        {EDUCATION.map((e) => (
          <li
            key={e.school}
            className="relative pl-4 before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-[var(--color-accent-secondary)]"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-[var(--color-fg)]">{e.school}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]">
                {e.start} → {e.end}
              </span>
            </div>
            <div className="text-xs text-[var(--color-fg-muted)]">{e.degree}</div>
            {e.details && (
              <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{e.details}</p>
            )}
            {e.coursework?.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {e.coursework.map((c) => (
                  <Badge key={c} variant="muted">
                    {c}
                  </Badge>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </Tile>
  );
}
