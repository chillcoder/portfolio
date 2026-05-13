import type { SpotifyTrendsIssue } from "@/lib/portfolio-data";

/** User-visible copy when top tracks or artists lists are empty. */
export function spotifyTrendsEmptyMessage(
  issue: SpotifyTrendsIssue | undefined,
  spotifyHttp?: { artists: number; tracks: number } | null,
): string {
  if (
    issue === "api" &&
    spotifyHttp &&
    (spotifyHttp.artists === 429 || spotifyHttp.tracks === 429)
  ) {
    return "Spotify rate-limited this request. Try again in a few minutes.";
  }
  switch (issue) {
    case "scope":
      return "Reconnect Spotify once: open /api/spotify-callback on this domain while logged into Spotify (grants top tracks & artists).";
    case "no_token":
      return "Spotify isn’t configured on the server for trends.";
    case "empty":
      return "No short-term top tracks yet — keep listening on Spotify and check back.";
    default:
      if (issue === "api" && spotifyHttp) {
        return `Spotify trends unavailable (artists HTTP ${spotifyHttp.artists}, tracks HTTP ${spotifyHttp.tracks}).`;
      }
      return "Spotify trends unavailable right now.";
  }
}
