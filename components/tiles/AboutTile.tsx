"use client";

import { Tile } from "@/components/ui/Tile";
import { ABOUT_FACTS, QUOTE } from "@/config/profile";

export function AboutTile({ span }: { span?: string }) {
  return (
    <Tile
      id="about"
      span={span}
      eyebrow="About"
      title="Field notes"
      accent="tertiary"
      className="scroll-mt-28"
    >
      <ul className="mt-4 space-y-2 text-sm">
        {ABOUT_FACTS.map((f) => (
          <li
            key={f.label}
            className="flex items-baseline gap-3 border-b border-dashed border-[var(--color-border)] pb-2 last:border-0"
          >
            <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]">
              {f.label}
            </span>
            <span className="text-[var(--color-fg)]">{f.value}</span>
          </li>
        ))}
      </ul>
      <blockquote className="mt-5 border-l-2 border-[var(--color-accent-tertiary)] pl-3 text-sm italic text-[var(--color-fg-muted)]">
        &ldquo;{QUOTE.text}&rdquo;
        <footer className="mt-1 font-mono text-[10px] uppercase not-italic">
          {QUOTE.attribution}
        </footer>
      </blockquote>
    </Tile>
  );
}
