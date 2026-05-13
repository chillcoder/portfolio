"use client";

import Image from "next/image";
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

  const tracks = (top?.topTracks ?? []).slice(0, 4);
  const artists = (top?.topArtists ?? []).slice(0, 4);

  return (
    <div className={styles.mediaPlayer}>
      <Waveform />

      <div className={styles.mediaNowBlock}>
        <span className={styles.mediaSectionLabel}>Now playing</span>
        {now?.song ? (
          <a
            href={now.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mediaNowLink}
          >
            <span
              className={now.isPlaying ? styles.mediaNowDot : styles.mediaNowDotIdle}
              aria-hidden
            />
            {now.albumImage ? (
              <Image
                src={now.albumImage}
                alt=""
                width={32}
                height={32}
                className={styles.mediaNowArt}
                unoptimized
              />
            ) : (
              <span className={styles.mediaNowArtFallback} aria-hidden />
            )}
            <span className={styles.mediaNowMeta}>
              <span className={styles.mediaNowTitle}>{now.song}</span>
              <span className={styles.mediaNowArtist}>{now.artist}</span>
            </span>
          </a>
        ) : (
          <span className={styles.mediaNowText}>nothing playing</span>
        )}
      </div>

      <div className={styles.mediaControls} role="group" aria-label="Playback controls">
        <button type="button" className={styles.mediaControlButton} aria-label="Previous">◁◁</button>
        <button type="button" className={styles.mediaControlButton} aria-label="Play">▷</button>
        <button type="button" className={styles.mediaControlButton} aria-label="Next">▷▷</button>
      </div>

      <section>
        <span className={styles.mediaSectionLabel}>
          Songs I&apos;ve been into lately
        </span>
        {top ? (
          tracks.length === 0 ? (
            <p className={styles.mediaEmpty}>Spotify trends unavailable.</p>
          ) : (
            <ul className={styles.mediaList}>
              {tracks.map((t, i) => (
                <li key={`${t.name}-${i}`}>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mediaListLink}
                    title={`${t.name} — ${t.artist}`}
                  >
                    {String(i + 1).padStart(2, "0")} {t.name}
                    <span className={styles.mediaListArtist}> — {t.artist}</span>
                  </a>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className={styles.mediaEmpty}>Loading…</p>
        )}
      </section>

      <section>
        <span className={styles.mediaSectionLabel}>Recent artists</span>
        {top ? (
          artists.length === 0 ? (
            <p className={styles.mediaEmpty}>Spotify trends unavailable.</p>
          ) : (
            <ul className={styles.mediaArtistRow}>
              {artists.map((a, i) => (
                <li key={`${a.name}-${i}`}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mediaArtistChip}
                    title={a.name}
                  >
                    {a.image ? (
                      <Image
                        src={a.image}
                        alt=""
                        width={28}
                        height={28}
                        className={styles.mediaArtistImg}
                        unoptimized
                      />
                    ) : (
                      <span className={styles.mediaArtistImgFallback} aria-hidden />
                    )}
                    <span className={styles.mediaArtistName}>{a.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className={styles.mediaEmpty}>Loading…</p>
        )}
      </section>
    </div>
  );
}
