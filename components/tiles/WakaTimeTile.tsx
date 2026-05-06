"use client";

import { Tile } from "@/components/ui/Tile";
import { TileSkeleton } from "@/components/ui/TileSkeleton";
import { StatTile } from "@/components/ui/StatTile";
import { useCachedFetch } from "@/hooks/useCachedFetch";

interface WakaTimeStats {
  totalHours: number;
  dailyAverageHours: number;
  range: string;
  topLanguages: { name: string; percent: number }[];
}

export function WakaTimeTile({ span }: { span?: string }) {
  const { data, isLoading } = useCachedFetch<WakaTimeStats>("/api/wakatime-stats", {
    cacheKey: "wakatime_stats",
    ttl: 10 * 60 * 1000,
  });

  return (
    <Tile span={span} eyebrow="WakaTime" title="Coding · last 30 days" accent="primary">
      {isLoading && !data ? (
        <div className="mt-4">
          <TileSkeleton />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <StatTile
              value={`${data?.totalHours ?? 0}h`}
              label="total"
              hint={`${data?.dailyAverageHours ?? 0}h / day`}
            />
          </div>
          <ul className="flex flex-col gap-1.5">
            {(data?.topLanguages ?? []).map((lang) => (
              <li key={lang.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-fg)]">{lang.name}</span>
                  <span className="font-mono text-[var(--color-fg-muted)] tabular-nums">
                    {lang.percent}%
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--color-border)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${lang.percent}%`,
                      background: "var(--tile-accent)",
                    }}
                  />
                </div>
              </li>
            ))}
            {!data?.topLanguages?.length && (
              <li className="text-xs text-[var(--color-fg-muted)]">
                Connect WakaTime to populate this tile.
              </li>
            )}
          </ul>
        </div>
      )}
    </Tile>
  );
}
