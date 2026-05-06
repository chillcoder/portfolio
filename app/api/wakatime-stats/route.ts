import { NextResponse } from "next/server";
import { captureServerEvent, getDistinctIdFromHeaders } from "@/lib/posthogServer";

export const revalidate = 600;

interface WakaTimeStats {
  totalHours: number;
  dailyAverageHours: number;
  range: string;
  topLanguages: { name: string; percent: number }[];
}

export async function GET(req: Request) {
  const distinctId = getDistinctIdFromHeaders(req.headers);
  const apiKey = process.env.WAKATIME_API_KEY;

  if (!apiKey) {
    captureServerEvent("wakatime_stats_error", { reason: "missing_key" }, distinctId);
    return NextResponse.json(emptyPayload(), { status: 200 });
  }

  try {
    const auth = Buffer.from(apiKey).toString("base64");
    const res = await fetch("https://wakatime.com/api/v1/users/current/stats/last_30_days", {
      headers: { Authorization: `Basic ${auth}` },
      next: { revalidate: 600 },
    });

    if (!res.ok) throw new Error(`WakaTime HTTP ${res.status}`);

    const json = (await res.json()) as {
      data?: {
        total_seconds?: number;
        daily_average?: number;
        range?: string;
        languages?: { name: string; percent: number }[];
      };
    };

    const data = json.data;
    if (!data) throw new Error("WakaTime: missing data");

    const payload: WakaTimeStats = {
      totalHours: Math.round(((data.total_seconds ?? 0) / 3600) * 10) / 10,
      dailyAverageHours: Math.round(((data.daily_average ?? 0) / 3600) * 10) / 10,
      range: data.range ?? "last_30_days",
      topLanguages: (data.languages ?? [])
        .slice(0, 5)
        .map((l) => ({ name: l.name, percent: Math.round(l.percent * 10) / 10 })),
    };

    captureServerEvent(
      "wakatime_stats_success",
      { total_hours: payload.totalHours },
      distinctId,
    );

    return NextResponse.json(payload);
  } catch (error) {
    captureServerEvent(
      "wakatime_stats_error",
      { reason: error instanceof Error ? error.message : "unknown" },
      distinctId,
    );
    return NextResponse.json(emptyPayload(), { status: 200 });
  }
}

function emptyPayload(): WakaTimeStats {
  return {
    totalHours: 0,
    dailyAverageHours: 0,
    range: "last_30_days",
    topLanguages: [],
  };
}
