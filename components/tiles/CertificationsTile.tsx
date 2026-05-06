"use client";

import { Tile } from "@/components/ui/Tile";
import { CERTIFICATIONS } from "@/config/profile";
import { Tooltip } from "@/components/ui/Tooltip";
import { track } from "@/lib/track";

export function CertificationsTile({ span }: { span?: string }) {
  return (
    <Tile span={span} eyebrow="Credentials" title="Certifications" accent="tertiary">
      <ul className="mt-4 flex flex-wrap gap-2">
        {CERTIFICATIONS.map((c) => (
          <li key={c.name}>
            <Tooltip label={c.name}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("cert_badge_click", { cert: c.name, issuer: c.issuer })
                }
                className="grid size-12 place-items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-tile)] font-mono text-[10px] font-semibold uppercase tracking-wider transition hover:border-[var(--color-accent-tertiary)] hover:bg-[var(--color-tile-hover)]"
              >
                {c.initials}
              </a>
            </Tooltip>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
