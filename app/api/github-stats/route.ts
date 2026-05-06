import { NextResponse } from "next/server";
import { captureServerEvent, getDistinctIdFromHeaders } from "@/lib/posthogServer";

export const revalidate = 300;

interface GithubStatsResponse {
  commitsLast7d: number;
  totalContributions: number;
  daily: { date: string; count: number }[];
  username: string;
}

const QUERY = /* GraphQL */ `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        totalCommitContributions
        contributionCalendar {
          totalContributions
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

const GITHUB_USERNAME = "lucas-obrien";

export async function GET(req: Request) {
  const distinctId = getDistinctIdFromHeaders(req.headers);
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    captureServerEvent(
      "github_stats_error",
      { reason: "missing_token" },
      distinctId,
    );
    return NextResponse.json(emptyPayload(), { status: 200 });
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { login: GITHUB_USERNAME },
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`GitHub HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            totalCommitContributions?: number;
            contributionCalendar?: {
              totalContributions?: number;
              weeks?: {
                contributionDays: { date: string; contributionCount: number }[];
              }[];
            };
          };
        };
      };
    };

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    const days = (calendar?.weeks ?? [])
      .flatMap((w) => w.contributionDays)
      .sort((a, b) => a.date.localeCompare(b.date));
    const last30 = days.slice(-30);
    const last7 = days.slice(-7);

    const payload: GithubStatsResponse = {
      commitsLast7d: last7.reduce((sum, d) => sum + d.contributionCount, 0),
      totalContributions: calendar?.totalContributions ?? 0,
      daily: last30.map((d) => ({ date: d.date, count: d.contributionCount })),
      username: GITHUB_USERNAME,
    };

    captureServerEvent(
      "github_stats_success",
      { commits_last_7d: payload.commitsLast7d },
      distinctId,
    );

    return NextResponse.json(payload);
  } catch (error) {
    captureServerEvent(
      "github_stats_error",
      { reason: error instanceof Error ? error.message : "unknown" },
      distinctId,
    );
    return NextResponse.json(emptyPayload(), { status: 200 });
  }
}

function emptyPayload(): GithubStatsResponse {
  return {
    commitsLast7d: 0,
    totalContributions: 0,
    daily: [],
    username: GITHUB_USERNAME,
  };
}
