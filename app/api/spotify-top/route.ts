import { NextResponse } from "next/server";
import { getSpotifyAccessToken } from "@/lib/spotify";
import { getRedis } from "@/lib/redis";
import { isSpotifyMusicTrack } from "@/lib/spotifyMusic";
import { captureServerEvent, getDistinctIdFromHeaders } from "@/lib/posthogServer";

export const dynamic = "force-dynamic";

/** KV cache for last good top response — cuts Spotify Web API traffic (avoids 429 on reloads). */
const TOP_CACHE_KEY = "spotify_top_bento_cache";
const TOP_CACHE_TTL_SEC = 30 * 60;

interface TopArtist {
  name: string;
  image: string | null;
  url: string;
}
interface TopTrack {
  name: string;
  artist: string;
  image: string | null;
  url: string;
}

export type SpotifyTrendsIssue = "no_token" | "scope" | "empty" | "api";

export interface SpotifyTopResponse {
  topArtists: TopArtist[];
  topTracks: TopTrack[];
  /** Present when both lists are empty; helps distinguish missing scope vs no listening data. */
  trendsIssue?: SpotifyTrendsIssue;
  /** Spotify Web API HTTP status for each top request (debugging). */
  spotifyHttp?: { artists: number; tracks: number };
}

export async function GET(req: Request) {
  const distinctId = getDistinctIdFromHeaders(req.headers);
  const redis = getRedis();

  try {
    if (redis) {
      try {
        const cached = await redis.get<string>(TOP_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as SpotifyTopResponse;
          return NextResponse.json(parsed, {
            headers: {
              "X-Spotify-Top": "kv-cache-hit",
              "Cache-Control": "private, s-maxage=120, stale-while-revalidate=600",
            },
          });
        }
      } catch {
        /* bad cache — refetch */
      }
    }

    const token = await getSpotifyAccessToken();
    if (!token) {
      captureServerEvent("spotify_top_error", { reason: "no_token" }, distinctId);
      return NextResponse.json(
        {
          topArtists: [],
          topTracks: [],
          trendsIssue: "no_token",
        } satisfies SpotifyTopResponse,
        { headers: { "X-Spotify-Top": "no-token" } },
      );
    }

    const [artistsRes, tracksRes] = await Promise.all([
      fetch("https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch("https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    if (!artistsRes.ok || !tracksRes.ok) {
      captureServerEvent(
        "spotify_top_error",
        {
          reason: "api_error",
          artists_status: artistsRes.status,
          tracks_status: tracksRes.status,
        },
        distinctId,
      );
    }

    const scopeLikelyMissing =
      artistsRes.status === 403 ||
      tracksRes.status === 403 ||
      artistsRes.status === 401 ||
      tracksRes.status === 401;

    const topArtists: TopArtist[] = artistsRes.ok
      ? ((await artistsRes.json()) as {
          items?: { name: string; images: { url: string }[]; external_urls?: { spotify?: string } }[];
        }).items?.map((a) => ({
          name: a.name,
          image: a.images?.[0]?.url ?? null,
          url: a.external_urls?.spotify ?? "https://open.spotify.com",
        })) ?? []
      : [];

    const topTracks: TopTrack[] = tracksRes.ok
      ? ((await tracksRes.json()) as {
          items?: {
            type?: string;
            uri?: string;
            name: string;
            artists: { name: string }[];
            album: { images: { url: string }[] };
            external_urls?: { spotify?: string };
          }[];
        }).items
          ?.filter((t) => isSpotifyMusicTrack(t))
          .map((t) => ({
            name: t.name,
            artist: t.artists.map((a) => a.name).join(", "),
            image: t.album.images?.[0]?.url ?? null,
            url: t.external_urls?.spotify ?? "https://open.spotify.com",
          })) ?? []
      : [];

    const bothEmpty = topArtists.length === 0 && topTracks.length === 0;
    let trendsIssue: SpotifyTrendsIssue | undefined;
    if (bothEmpty) {
      if (scopeLikelyMissing) trendsIssue = "scope";
      else if (!artistsRes.ok || !tracksRes.ok) trendsIssue = "api";
      else trendsIssue = "empty";
    }

    const rateLimited = artistsRes.status === 429 || tracksRes.status === 429;
    if (rateLimited && redis) {
      try {
        const staleRaw = await redis.get<string>(TOP_CACHE_KEY);
        if (staleRaw) {
          const stale = JSON.parse(staleRaw) as SpotifyTopResponse;
          return NextResponse.json(stale, {
            headers: {
              "X-Spotify-Top": "stale-after-429",
              "Cache-Control": "private, max-age=60",
            },
          });
        }
      } catch {
        /* fall through */
      }
    }

    const payload: SpotifyTopResponse = {
      topArtists,
      topTracks,
      trendsIssue,
      spotifyHttp: { artists: artistsRes.status, tracks: tracksRes.status },
    };

    if (redis && artistsRes.ok && tracksRes.ok) {
      try {
        await redis.set(TOP_CACHE_KEY, JSON.stringify(payload), { ex: TOP_CACHE_TTL_SEC });
      } catch {
        /* non-fatal */
      }
    }

    return NextResponse.json(payload, {
      headers: {
        "X-Spotify-Top": `ok artists=${artistsRes.status}/${topArtists.length} tracks=${tracksRes.status}/${topTracks.length}${trendsIssue ? ` issue=${trendsIssue}` : ""}`,
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    captureServerEvent("spotify_top_error", { reason }, distinctId);
    return NextResponse.json(
      {
        topArtists: [],
        topTracks: [],
        trendsIssue: "api",
      } satisfies SpotifyTopResponse,
      { headers: { "X-Spotify-Top": `error: ${reason.slice(0, 80)}` } },
    );
  }
}
