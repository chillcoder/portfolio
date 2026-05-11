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
    cacheKey: "github_stats_v5",
    ttl: 5 * 60 * 1000,
    intervalMs: 5 * 60 * 1000,
  });

  const href = data?.username ? profileUrl(data.username) : PROFILE.socials.github;
  const sparkTitle =
    data?.daily?.length ?
      `Last ${data.daily.length} days on GitHub (click to open profile)`
    : "Contribution trend";

  const year = data?.contributionsThisYear ?? 0;
  const showYearHint = year >= 100;

  return (
    <Tile
      span={span}
      eyebrow="GitHub"
      title="Contributions"
      accent="tertiary"
      className="flex h-full min-h-0 flex-col"
    >
      <div className="mt-4 flex min-h-[120px] flex-1 flex-col justify-between gap-3">
        {isLoading && !data ? (
          <TileSkeleton />
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group flex flex-col gap-4 rounded-lg outline-offset-2 transition-opacity sm:flex-row sm:items-end sm:justify-between",
              "hover:opacity-90 focus-visible:opacity-90",
            )}
            aria-label="Open GitHub profile"
          >
            <StatTile
              value={data?.contributionsLast7d ?? 0}
              label="Contributions this week"
              hint={
                showYearHint
                  ? `${year.toLocaleString()} contributions this year`
                  : undefined
              }
              className="min-w-0 shrink"
            />
            <span
              title={sparkTitle}
              className="flex shrink-0 justify-end transition group-hover:brightness-110 sm:pb-0.5"
            >
              <Sparkline
                values={(data?.daily ?? []).map((d) => d.count)}
                width={160}
                height={44}
                className="max-w-[min(100%,11rem)] sm:max-w-none"
              />
            </span>
          </a>
        )}
      </div>
    </Tile>
  );
}
