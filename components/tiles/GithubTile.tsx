"use client";

import { Tile } from "@/components/ui/Tile";
import { TileSkeleton } from "@/components/ui/TileSkeleton";
import { StatTile } from "@/components/ui/StatTile";
import { Sparkline } from "@/components/ui/Sparkline";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { PROFILE } from "@/config/profile";
import { cn } from "@/lib/cn";

interface GithubStats {
  contributionsLast7d: number;
  contributionsThisYear: number;
  commitsThisYear: number;
  pullRequestsThisYear: number;
  issuesThisYear: number;
  reviewsThisYear: number;
  currentStreak: number;
  activeDaysLast30: number;
  daily: { date: string; count: number }[];
  username: string;
}

function profileUrl(username: string) {
  return `https://github.com/${username}`;
}

export function GithubTile({ span }: { span?: string }) {
  const { data, isLoading } = useCachedFetch<GithubStats>("/api/github-stats", {
    cacheKey: "github_stats_v4",
    ttl: 5 * 60 * 1000,
    intervalMs: 5 * 60 * 1000,
  });

  const href = data?.username ? profileUrl(data.username) : PROFILE.socials.github;
  const sparkTitle =
    data?.daily?.length ?
      `Last ${data.daily.length} days on GitHub (click to open profile)`
    : "Contribution trend";

  return (
    <Tile span={span} eyebrow="GitHub" title="Contributions" accent="tertiary">
      <div className="mt-4 flex flex-col gap-4">
        {isLoading && !data ? (
          <TileSkeleton />
        ) : (
          <>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-end justify-between gap-3 rounded-lg outline-offset-2 transition-opacity hover:opacity-90 focus-visible:opacity-90"
              aria-label="Open GitHub profile"
            >
              <StatTile
                value={data?.contributionsLast7d ?? 0}
                label="Contributions this week"
                hint={`${data?.contributionsThisYear ?? 0} contributions this year`}
              />
              <span title={sparkTitle} className="shrink-0 transition group-hover:brightness-110">
                <Sparkline
                  values={(data?.daily ?? []).map((d) => d.count)}
                  width={140}
                  height={40}
                />
              </span>
            </a>

            {data && (
              <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
                <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]">
                  <MetricPill
                    label="Streak"
                    value={`${data.currentStreak}d`}
                    title="Consecutive days with at least one contribution (GitHub calendar)"
                  />
                  <MetricPill
                    label="Active"
                    value={`${data.activeDaysLast30}/30`}
                    title="Days with contributions in the last 30 days shown in the sparkline"
                  />
                  <MetricPill label="PRs" value={String(data.pullRequestsThisYear)} title="Pull requests (year to date)" />
                  <MetricPill label="Issues" value={String(data.issuesThisYear)} title="Issues (year to date)" />
                  <MetricPill label="Reviews" value={String(data.reviewsThisYear)} title="PR reviews (year to date)" />
                </div>
                <p className="text-[10px] leading-snug text-[var(--color-fg-muted)] opacity-90">
                  <span className="font-mono">{data.commitsThisYear}</span> commits YTD · same graph as your GitHub
                  profile
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Tile>
  );
}

function MetricPill({
  label,
  value,
  title,
}: {
  label: string;
  value: string;
  title?: string;
}) {
  return (
    <span title={title} className="inline-flex items-baseline gap-1">
      <span className="text-[var(--color-fg-muted)]">{label}</span>
      <span className={cn("tabular-nums text-[var(--color-fg)]")}>{value}</span>
    </span>
  );
}
