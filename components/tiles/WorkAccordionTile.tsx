"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { Tile } from "@/components/ui/Tile";
import { WORK } from "@/config/profile";
import { Badge } from "@/components/ui/Badge";
import { track } from "@/lib/track";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function WorkAccordionTile({ span }: { span?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion();
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  function toggle(i: number) {
    const next = open === i ? null : i;
    if (next !== null) {
      track("work_accordion_expand", { company: WORK[i].company });
    }

    if (!reduced) {
      const closing = panelRefs.current[open ?? -1];
      const opening = panelRefs.current[next ?? -1];
      if (closing && open !== null) {
        gsap.to(closing, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: "power2.inOut",
        });
      }
      if (opening && next !== null) {
        gsap.fromTo(
          opening,
          { height: 0, opacity: 0 },
          {
            height: "auto",
            opacity: 1,
            duration: 0.35,
            ease: "power3.out",
          },
        );
      }
    }
    setOpen(next);
  }

  return (
    <Tile span={span} eyebrow="Work" title="Recent roles" accent="primary">
      <ul className="mt-4 flex flex-col divide-y divide-[var(--color-border)]">
        {WORK.map((role, i) => {
          const isOpen = open === i;
          return (
            <li key={role.company} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`work-panel-${i}`}
                onClick={() => toggle(i)}
                className="flex w-full items-baseline justify-between gap-3 text-left"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-[var(--color-fg)]">{role.company}</span>
                  <span className="text-xs text-[var(--color-fg-muted)]">{role.role}</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]">
                  {role.start} → {role.end}
                </span>
              </button>
              <div
                id={`work-panel-${i}`}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                role="region"
                aria-label={`Details for ${role.company}`}
                className="overflow-hidden"
                style={isOpen && reduced ? { height: "auto", opacity: 1 } : undefined}
                hidden={!isOpen && reduced}
              >
                <div className="pt-3 text-sm text-[var(--color-fg-muted)]">
                  <p className="mb-2">{role.summary}</p>
                  <ul className="ml-4 list-disc space-y-1">
                    {role.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{role.role}</Badge>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Tile>
  );
}
