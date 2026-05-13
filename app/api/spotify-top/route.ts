import { NextResponse } from "next/server";
import { getSpotifyAccessToken } from "@/lib/spotify";
import { isSpotifyMusicTrack } from "@/lib/spotifyMusic";
import { captureServerEvent, getDistinctIdFromHeaders } from "@/lib/posthogServer";

export const revalidate = 3600;

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

export interface SpotifyTopResponse {
  topArtists: TopArtist[];
  topTracks: TopTrack[];
}

export async function GET(req: Request) {
  const distinctId = getDistinctIdFromHeaders(req.headers);
  try {
    const token = await getSpotifyAccessToken();
    if (!token) {
      captureServerEvent("spotify_top_error", { reason: "no_token" }, distinctId);
      return NextResponse.json(
        { topArtists: [], topTracks: [] } satisfies SpotifyTopResponse,
        { headers: { "X-Spotify-Top": "no-token" } },
      );
    }

    const [artistsRes, tracksRes] = await Promise.all([
      fetch(
        "https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term",
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } },
      ),
      fetch(
        "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term",
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } },
      ),
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

    return NextResponse.json(
      { topArtists, topTracks } satisfies SpotifyTopResponse,
      {
        headers: {
          "X-Spotify-Top": `ok artists=${artistsRes.status}/${topArtists.length} tracks=${tracksRes.status}/${topTracks.length}`,
        },
      },
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    captureServerEvent("spotify_top_error", { reason }, distinctId);
    return NextResponse.json(
      { topArtists: [], topTracks: [] } satisfies SpotifyTopResponse,
      { headers: { "X-Spotify-Top": `error: ${reason.slice(0, 80)}` } },
    );
  }
}
