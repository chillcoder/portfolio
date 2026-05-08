import { NextResponse } from "next/server";
import { captureServerEvent, getDistinctIdFromHeaders } from "@/lib/posthogServer";

/** Avoid CDN / static caching so the tile stays fresh. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface GithubStatsResponse {
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

const QUERY = /* GraphQL */ `
  query ($login: String!, $yearStart: DateTime!, $now: DateTime!) {
    user(login: $login) {
      contributionsYear: contributionsCollection(from: $yearStart, to: $now) {
        totalContributions
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

function githubLogin(): string {
  return process.env.GITHUB_LOGIN ?? "chillcoder";
}

function yearToDateBounds(): { yearStart: string; now: string } {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const yearStart = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
  const nowEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));
  return {
    yearStart: yearStart.toISOString(),
    now: nowEnd.toISOString(),
  };
}

/** Consecutive days with ≥1 contribution ending on the last calendar day in the list. */
function currentStreak(sortedDays: { contributionCount: number }[]): number {
  let streak = 0;
  for (let i = sortedDays.length - 1; i >= 0; i--) {
    if (sortedDays[i].contributionCount > 0) streak += 1;
    else break;
  }
  return streak;
}

export async function GET(req: Request) {
  const distinctId = getDistinctIdFromHeaders(req.headers);
  const login = githubLogin();
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    captureServerEvent(
      "github_stats_error",
      { reason: "missing_token" },
      distinctId,
    );
    return NextResponse.json(emptyPayload(login), { status: 200 });
  }

  const { yearStart, now } = yearToDateBounds();

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { login, yearStart, now },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`GitHub HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      data?: {
        user?: {
          contributionsYear?: {
            totalContributions?: number;
            totalCommitContributions?: number;
            totalPullRequestContributions?: number;
            totalIssueContributions?: number;
            totalPullRequestReviewContributions?: number;
            contributionCalendar?: {
              weeks?: {
                contributionDays: { date: string; contributionCount: number }[];
              }[];
            };
          };
        };
      };
    };

    const yearCol = json.data?.user?.contributionsYear;
    const calendar = yearCol?.contributionCalendar;

    const days = (calendar?.weeks ?? [])
      .flatMap((w) => w.contributionDays)
      .sort((a, b) => a.date.localeCompare(b.date));
    const last30 = days.slice(-30);
    const last7 = days.slice(-7);

    const contributionsLast7d = last7.reduce((s, d) => s + d.contributionCount, 0);
    const activeDaysLast30 = last30.filter((d) => d.contributionCount > 0).length;

    const payload: GithubStatsResponse = {
      contributionsLast7d,
      contributionsThisYear: yearCol?.totalContributions ?? 0,
      commitsThisYear: yearCol?.totalCommitContributions ?? 0,
      pullRequestsThisYear: yearCol?.totalPullRequestContributions ?? 0,
      issuesThisYear: yearCol?.totalIssueContributions ?? 0,
      reviewsThisYear: yearCol?.totalPullRequestReviewContributions ?? 0,
      currentStreak: currentStreak(days),
      activeDaysLast30,
      daily: last30.map((d) => ({ date: d.date, count: d.contributionCount })),
      username: login,
    };

    captureServerEvent(
      "github_stats_success",
      { contributions_last_7d: payload.contributionsLast7d },
      distinctId,
    );

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    captureServerEvent(
      "github_stats_error",
      { reason: error instanceof Error ? error.message : "unknown" },
      distinctId,
    );
    return NextResponse.json(emptyPayload(login), {
      status: 200,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  }
}

function emptyPayload(login: string): GithubStatsResponse {
  return {
    contributionsLast7d: 0,
    contributionsThisYear: 0,
    commitsThisYear: 0,
    pullRequestsThisYear: 0,
    issuesThisYear: 0,
    reviewsThisYear: 0,
    currentStreak: 0,
    activeDaysLast30: 0,
    daily: [],
    username: login,
  };
}
