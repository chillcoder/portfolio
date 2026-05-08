"use client";

import { Tile } from "@/components/ui/Tile";
import { TileSkeleton } from "@/components/ui/TileSkeleton";
import { StatTile } from "@/components/ui/StatTile";
import { Sparkline } from "@/components/ui/Sparkline";
import { useCachedFetch } from "@/hooks/useCachedFetch";

interface GithubStats {
  commitsLast7d: number;
  commitsThisYear: number;
  daily: { date: string; count: number }[];
  username: string;
}

export function GithubTile({ span }: { span?: string }) {
  const { data, isLoading } = useCachedFetch<GithubStats>("/api/github-stats", {
    cacheKey: "github_stats_v2",
    ttl: 5 * 60 * 1000,
    intervalMs: 5 * 60 * 1000,
  });

  return (
    <Tile span={span} eyebrow="GitHub" title="Commits this week" accent="tertiary">
      <div className="mt-4">
        {isLoading && !data ? (
          <TileSkeleton />
        ) : (
          <div className="flex items-end justify-between gap-3">
            <StatTile
              value={data?.commitsLast7d ?? 0}
              label="commits / 7d"
              hint={`${data?.commitsThisYear ?? 0} commits this year`}
            />
            <Sparkline
              values={(data?.daily ?? []).map((d) => d.count)}
              width={140}
              height={40}
            />
          </div>
        )}
      </div>
    </Tile>
  );
}
