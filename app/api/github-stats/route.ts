import { NextResponse } from "next/server";
import { captureServerEvent, getDistinctIdFromHeaders } from "@/lib/posthogServer";

/** Avoid CDN / static caching so the tile stays fresh. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface GithubStatsResponse {
  commitsLast7d: number;
  commitsThisYear: number;
  daily: { date: string; count: number }[];
  username: string;
}

const QUERY = /* GraphQL */ `
  query ($login: String!, $yearStart: DateTime!, $now: DateTime!, $weekStart: DateTime!) {
    user(login: $login) {
      contributionsYear: contributionsCollection(from: $yearStart, to: $now) {
        totalCommitContributions
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
      contributionsWeek: contributionsCollection(from: $weekStart, to: $now) {
        totalCommitContributions
      }
    }
  }
`;

function githubLogin(): string {
  return process.env.GITHUB_LOGIN ?? "chillcoder";
}

/** UTC bounds: year-to-date calendar + rolling last 7 calendar days (inclusive of today). */
function contributionWindows(): { yearStart: string; now: string; weekStart: string } {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const yearStart = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
  const weekStart = new Date(Date.UTC(y, m, d - 6, 0, 0, 0, 0));
  const nowEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));
  return {
    yearStart: yearStart.toISOString(),
    now: nowEnd.toISOString(),
    weekStart: weekStart.toISOString(),
  };
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

  const { yearStart, now, weekStart } = contributionWindows();

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { login, yearStart, now, weekStart },
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
            totalCommitContributions?: number;
            contributionCalendar?: {
              weeks?: {
                contributionDays: { date: string; contributionCount: number }[];
              }[];
            };
          };
          contributionsWeek?: {
            totalCommitContributions?: number;
          };
        };
      };
    };

    const yearCol = json.data?.user?.contributionsYear;
    const weekCol = json.data?.user?.contributionsWeek;
    const calendar = yearCol?.contributionCalendar;

    const days = (calendar?.weeks ?? [])
      .flatMap((w) => w.contributionDays)
      .sort((a, b) => a.date.localeCompare(b.date));
    const last30 = days.slice(-30);

    const commitsLast7d = weekCol?.totalCommitContributions ?? 0;
    const commitsThisYear = yearCol?.totalCommitContributions ?? 0;

    const payload: GithubStatsResponse = {
      commitsLast7d,
      commitsThisYear,
      daily: last30.map((d) => ({ date: d.date, count: d.contributionCount })),
      username: login,
    };

    captureServerEvent(
      "github_stats_success",
      { commits_last_7d: payload.commitsLast7d },
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
    commitsLast7d: 0,
    commitsThisYear: 0,
    daily: [],
    username: login,
  };
}
