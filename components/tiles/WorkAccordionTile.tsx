"use client";

import { useState } from "react";
import { Tile } from "@/components/ui/Tile";
import { WORK, type WorkRole } from "@/config/profile";
import { track } from "@/lib/track";
import { cn } from "@/lib/cn";

const DOT_CLASS = [
  "bg-[var(--color-accent-primary)]",
  "bg-[var(--color-accent-tertiary)]",
  "bg-[var(--color-accent-secondary)]",
] as const;

function spotlightLine(role: WorkRole): string {
  return role.spotlight ?? role.bullets[0] ?? role.summary;
}

function tenure(role: WorkRole): string {
  return `${role.start} – ${role.end}`;
}

export function WorkAccordionTile({ span }: { span?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  function toggle(i: number) {
    const next = open === i ? null : i;
    if (next !== null) {
      track("work_accordion_expand", { company: WORK[i].company });
    }
    setOpen(next);
  }

  return (
    <Tile
      span={span}
      eyebrow="Work"
      title="Recent roles"
      accent="primary"
      className="flex h-full min-h-0 flex-col"
    >
      <ul className="mt-4 flex flex-col divide-y divide-[var(--color-border)]">
        {WORK.map((role, i) => {
          const isOpen = open === i;
          const dot = DOT_CLASS[i % DOT_CLASS.length];
          return (
            <li key={`${role.company}-${role.role}-${role.start}`} className="py-2.5 first:pt-0 last:pb-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`work-panel-${i}`}
                onClick={() => toggle(i)}
                className="flex w-full gap-2.5 text-left"
              >
                <span
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", dot)}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 leading-snug">
                  <span className="font-medium text-[var(--color-fg)]">{role.role}</span>
                  <span className="text-[var(--color-fg-muted)]">
                    {" "}
                    | {role.company} · [{tenure(role)}]
                  </span>
                </span>
              </button>
              <div
                id={`work-panel-${i}`}
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:duration-0",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="border-l-2 border-[var(--color-border)] pl-3 pt-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                    {spotlightLine(role)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Tile>
  );
}
