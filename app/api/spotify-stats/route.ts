import { NextResponse } from "next/server";
import { getSpotifyAccessToken } from "@/lib/spotify";
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
          name: string;
          album: { name: string; images: { url: string }[] };
          artists: { name: string }[];
          external_urls?: { spotify?: string };
        };
      };
      if (json.item) {
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
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
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
            name: string;
            album: { name: string; images: { url: string }[] };
            artists: { name: string }[];
            external_urls?: { spotify?: string };
          };
        }[];
      };
      const item = json.items?.[0];
      if (item) {
        return NextResponse.json({
          isPlaying: false,
          song: item.track.name,
          artist: item.track.artists.map((a) => a.name).join(", "),
          album: item.track.album.name,
          albumImage: item.track.album.images?.[0]?.url ?? null,
          url: item.track.external_urls?.spotify,
          lastPlayedAt: item.played_at,
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
