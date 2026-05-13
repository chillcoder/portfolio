import type { SpotifyTrendsIssue } from "@/lib/portfolio-data";

/** User-visible copy when top tracks or artists lists are empty. */
export function spotifyTrendsEmptyMessage(issue: SpotifyTrendsIssue | undefined): string {
  switch (issue) {
    case "scope":
      return "Reconnect Spotify once: open /api/spotify-callback on this domain while logged into Spotify (grants top tracks & artists).";
    case "no_token":
      return "Spotify isn’t configured on the server for trends.";
    case "empty":
      return "No short-term top tracks yet — keep listening on Spotify and check back.";
    default:
      return "Spotify trends unavailable right now.";
  }
}
