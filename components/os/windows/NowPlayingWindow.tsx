"use client";

import { useCachedFetch } from "@/hooks/useCachedFetch";
import type {
  SpotifyNowPayload,
  SpotifyTopPayload,
} from "@/lib/portfolio-data";
import styles from "@/app/os/os.module.css";

/** Static zigzag waveform — pure aesthetic, not derived from audio. */
function Waveform() {
  const points: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const x = (i / 48) * 100;
    const y = 50 + Math.sin(i * 0.7) * 18 + Math.sin(i * 1.9) * 10;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return (
    <svg
      className={styles.mediaWaveform}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function NowPlayingWindow() {
  const { data: now } = useCachedFetch<SpotifyNowPayload>(
    "/api/spotify-stats",
    { cacheKey: "os_spotify_now", ttl: 60_000, intervalMs: 60_000 },
  );
  const { data: top } = useCachedFetch<SpotifyTopPayload>("/api/spotify-top", {
    cacheKey: "os_spotify_top",
    ttl: 60 * 60 * 1000,
  });

  const songLine = now?.song
    ? `${now.song} — ${now.artist ?? "—"}`
    : "Nothing playing";

  const tracks = (top?.topTracks ?? []).slice(0, 5);

  return (
    <div className={styles.mediaPlayer}>
      <Waveform />
      <div className={styles.mediaNowLine}>
        <span
          className={now?.isPlaying ? styles.mediaNowDot : styles.mediaNowDotIdle}
          aria-hidden
        />
        <span className={styles.mediaNowText}>{songLine}</span>
      </div>
      <div className={styles.mediaControls} role="group" aria-label="Playback controls">
        <button type="button" className={styles.mediaControlButton} aria-label="Previous">◁◁</button>
        <button type="button" className={styles.mediaControlButton} aria-label="Play">▷</button>
        <button type="button" className={styles.mediaControlButton} aria-label="Next">▷▷</button>
      </div>
      <div className={styles.mediaListLabel}>Top tracks</div>
      <ol className={styles.mediaList}>
        {tracks.length === 0 ? (
          <li className={styles.mediaListEmpty}>—</li>
        ) : (
          tracks.map((t, i) => (
            <li key={`${t.name}-${i}`}>
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mediaListLink}
              >
                {String(i + 1).padStart(2, "0")} {t.name}
                <span className={styles.mediaListArtist}> — {t.artist}</span>
              </a>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
