import { NextResponse } from "next/server";
import { getSpotifyAccessToken } from "@/lib/spotify";
import { isSpotifyMusicTrack } from "@/lib/spotifyMusic";
import { captureServerEvent, getDistinctIdFromHeaders } from "@/lib/posthogServer";

export const revalidate = 30;
export const dynamic = "force-dynamic";

interface SpotifyStats {
  isPlaying: boolean;
  song?: string;
  artist?: string;
  album?: string;
  albumImage?: string | null;
  url?: string;
  lastPlayedAt?: string;
}

export async function GET(req: Request) {
  const distinctId = getDistinctIdFromHeaders(req.headers);
  try {
    const token = await getSpotifyAccessToken();
    if (!token) {
      captureServerEvent("spotify_stats_error", { reason: "no_token" }, distinctId);
      return NextResponse.json({ isPlaying: false } satisfies SpotifyStats);
    }

    const playing = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (playing.status === 200) {
      const json = (await playing.json()) as {
        is_playing?: boolean;
        item?: {
          type?: string;
          uri?: string;
          show?: unknown;
          name: string;
          album: { name: string; images: { url: string }[] };
          artists: { name: string }[];
          external_urls?: { spotify?: string };
        };
      };
      if (json.item && isSpotifyMusicTrack(json.item)) {
        return NextResponse.json({
          isPlaying: !!json.is_playing,
          song: json.item.name,
          artist: json.item.artists.map((a) => a.name).join(", "),
          album: json.item.album.name,
          albumImage: json.item.album.images?.[0]?.url ?? null,
          url: json.item.external_urls?.spotify,
        } satisfies SpotifyStats);
      }
    }

    const recent = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    if (recent.ok) {
      const json = (await recent.json()) as {
        items?: {
          played_at: string;
          track: {
            type?: string;
            uri?: string;
            show?: unknown;
            name: string;
            album: { name: string; images: { url: string }[] };
            artists: { name: string }[];
            external_urls?: { spotify?: string };
          };
        }[];
      };

      for (const row of json.items ?? []) {
        const tr = row.track;
        if (!isSpotifyMusicTrack(tr)) continue;
        return NextResponse.json({
          isPlaying: false,
          song: tr.name,
          artist: tr.artists.map((a) => a.name).join(", "),
          album: tr.album.name,
          albumImage: tr.album.images?.[0]?.url ?? null,
          url: tr.external_urls?.spotify,
          lastPlayedAt: row.played_at,
        } satisfies SpotifyStats);
      }
    }

    return NextResponse.json({ isPlaying: false } satisfies SpotifyStats);
  } catch (error) {
    captureServerEvent(
      "spotify_stats_error",
      { reason: error instanceof Error ? error.message : "unknown" },
      distinctId,
    );
    return NextResponse.json({ isPlaying: false } satisfies SpotifyStats);
  }
}
