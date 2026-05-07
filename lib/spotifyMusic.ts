/**
 * Spotify player endpoints return tracks or episodes (podcasts, audiobooks).
 * Only surface music tracks in "now playing" / trends.
 */
export function isSpotifyMusicTrack(
  item:
    | {
        type?: string;
        uri?: string;
        /** Present on tracks; episodes use `show` instead. */
        album?: unknown;
        artists?: { name: string }[];
        show?: unknown;
      }
    | null
    | undefined,
): boolean {
  if (!item) return false;
  if (item.type === "episode") return false;
  if (item.show != null) return false;
  const uri = item.uri ?? "";
  if (uri.startsWith("spotify:episode:")) return false;
  if (uri.startsWith("spotify:track:")) return true;
  if (item.type === "track") return true;
  return !!(item.album != null && item.artists && item.artists.length > 0);
}
