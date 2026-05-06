import { getRedis } from "@/lib/redis";

const REDIS_REFRESH_KEY = "spotify_live_refresh_token";

export interface SpotifyTokens {
  accessToken: string;
  refreshToken?: string;
}

async function readRefreshToken(): Promise<string | null> {
  const redis = getRedis();
  if (redis) {
    try {
      const t = (await redis.get<string>(REDIS_REFRESH_KEY)) ?? null;
      if (t) return t;
    } catch {
      /* fallthrough */
    }
  }
  return process.env.SPOTIFY_LIVE_REFRESH_TOKEN ?? null;
}

async function writeRefreshToken(token: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(REDIS_REFRESH_KEY, token);
    } catch {
      /* swallow */
    }
  }
}

export async function getSpotifyAccessToken(): Promise<string | null> {
  const refreshToken = await readRefreshToken();
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!refreshToken || !clientId || !clientSecret) return null;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string; refresh_token?: string };
  if (json.refresh_token && json.refresh_token !== refreshToken) {
    await writeRefreshToken(json.refresh_token);
  }
  return json.access_token ?? null;
}

export async function persistRefreshToken(token: string): Promise<void> {
  await writeRefreshToken(token);
}
