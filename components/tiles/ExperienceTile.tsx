"use client";

import { useEffect, useState } from "react";
import { Tile } from "@/components/ui/Tile";
import { PROFILE } from "@/config/profile";
import { StatTile } from "@/components/ui/StatTile";

export function ExperienceTile({ span }: { span?: string }) {
  const [years, setYears] = useState("0");

  useEffect(() => {
    const start = PROFILE.careerStart.getTime();
    const now = Date.now();
    const diff = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
    setYears(diff.toFixed(1));
  }, []);

  return (
    <Tile span={span} eyebrow="Experience" title="Years building" accent="secondary">
      <div className="mt-4 flex items-end justify-between gap-3">
        <StatTile value={years} label="years in tech" />
        <span className="font-mono text-xs text-[var(--color-fg-muted)]">
          since {PROFILE.careerStart.getFullYear()}
        </span>
      </div>
    </Tile>
  );
}
