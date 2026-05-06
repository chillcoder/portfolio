"use client";

import { Tile } from "@/components/ui/Tile";
import { PROJECTS } from "@/config/profile";
import { Badge } from "@/components/ui/Badge";
import { track } from "@/lib/track";

const STATUS_LABEL: Record<(typeof PROJECTS)[number]["status"], string> = {
  live: "Live",
  wip: "Building",
  archived: "Archive",
};

export function ProjectsTile({ span }: { span?: string }) {
  return (
    <Tile span={span} eyebrow="Projects" title="Things I've made" accent="primary">
      <ul className="mt-4 flex flex-col gap-3">
        {PROJECTS.map((p) => (
          <li key={p.name}>
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("tile_click", { project: p.name, url: p.href })}
              className="group flex flex-col gap-1.5 rounded-xl border border-transparent p-3 transition hover:border-[var(--color-border)] hover:bg-[var(--color-tile-hover)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--color-fg)] group-hover:underline">
                  {p.name}
                </span>
                <Badge
                  variant={p.status === "live" ? "accent" : p.status === "wip" ? "muted" : "outline"}
                >
                  {STATUS_LABEL[p.status]}
                </Badge>
              </div>
              <p className="text-xs text-[var(--color-fg-muted)]">{p.description}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]/80"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
