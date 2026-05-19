"use client";

import Image from "next/image";
import { Tile } from "@/components/ui/Tile";
import { TileSkeleton } from "@/components/ui/TileSkeleton";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import type { SpotifyTopPayload } from "@/lib/portfolio-data";
import { spotifyTrendsEmptyMessage } from "@/lib/spotifyTrendsCopy";

interface SpotifyStats {
  isPlaying: boolean;
  song?: string;
  artist?: string;
  album?: string;
  albumImage?: string | null;
  url?: string;
  lastPlayedAt?: string;
}

export function SpotifyTile({ span }: { span?: string }) {
  const { data: now, isLoading: loadingNow } = useCachedFetch<SpotifyStats>(
    "/api/spotify-stats",
    { cacheKey: "spotify_now", ttl: 60 * 1000, intervalMs: 60 * 1000 },
  );
  const { data: top } = useCachedFetch<SpotifyTopPayload>("/api/spotify-top", {
    cacheKey: "spotify_top_v3",
    ttl: 60 * 60 * 1000,
  });

  const showLive = !!now?.song;

  return (
    <Tile span={span} eyebrow="Spotify" accent="tertiary">
      <div className="mt-4 flex min-w-0 flex-col gap-5">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]">
            Now playing
          </span>
          {loadingNow && !now ? (
            <TileSkeleton />
          ) : showLive ? (
            <a
              href={now?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-tile)] p-3 transition hover:bg-[var(--color-tile-hover)]"
            >
              <div className="epaper-dither relative aspect-square w-full overflow-hidden rounded-lg">
                {now?.albumImage ? (
                  <Image
                    src={now.albumImage}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 220px, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-[var(--color-bg-2)]" />
                )}
                {now?.isPlaying && (
                  <span
                    aria-hidden
                    className="absolute right-2 top-2 flex h-3 items-end gap-0.5 rounded-full bg-black/55 px-1.5 py-1 backdrop-blur"
                    title="playing"
                  >
                    <Bar delay={0} />
                    <Bar delay={120} />
                    <Bar delay={240} />
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent-tertiary)]">
                  {now?.isPlaying ? "Playing" : "Recently played"}
                </span>
                <span className="truncate text-sm font-medium text-[var(--color-fg)]">{now?.song}</span>
                <span className="truncate text-xs text-[var(--color-fg-muted)]">{now?.artist}</span>
              </div>
            </a>
          ) : (
            <p className="text-sm text-[var(--color-fg-muted)]">
              No music playing—podcasts and audiobooks hidden here.
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-medium text-[var(--color-fg)]">tracks I&apos;ve been into lately</span>
          {top ? (
            top.topTracks.length === 0 ? (
              <p className="text-xs text-[var(--color-fg-muted)]">
                {spotifyTrendsEmptyMessage(top.trendsIssue, top.spotifyHttp)}
              </p>
            ) : (
              <ul className="epaper-dither flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1">
                {top.topTracks.slice(0, 5).map((t) => (
                  <li key={t.url} className="shrink-0">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-14 flex-col items-center gap-1 text-center"
                      title={`${t.name} — ${t.artist}`}
                    >
                      {t.image ? (
                        <Image
                          src={t.image}
                          alt=""
                          width={48}
                          height={48}
                          className="size-12 rounded-md object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="size-12 rounded-md bg-[var(--color-bg-2)]" />
                      )}
                      <span className="line-clamp-2 text-[10px] leading-tight text-[var(--color-fg)]">
                        {t.name}
                      </span>
                      <span className="line-clamp-2 text-[9px] leading-tight text-[var(--color-fg-muted)]">
                        {t.artist}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <ul className="flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" aria-hidden>
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="shrink-0">
                  <div className="flex w-14 flex-col items-center gap-1">
                    <div className="size-12 animate-pulse rounded-md bg-[var(--color-bg-2)]" />
                    <div className="h-2 w-10 animate-pulse rounded bg-[var(--color-bg-2)]" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-medium text-[var(--color-fg)]">Recent artists</span>
          {top ? (
            top.topArtists.length === 0 ? (
              <p className="text-xs text-[var(--color-fg-muted)]">
                {spotifyTrendsEmptyMessage(top.trendsIssue, top.spotifyHttp)}
              </p>
            ) : (
              <ul className="epaper-dither flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1">
                {top.topArtists.slice(0, 5).map((a) => (
                  <li key={a.url} className="shrink-0">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-14 flex-col items-center gap-1 text-center"
                      title={a.name}
                    >
                      {a.image ? (
                        <Image
                          src={a.image}
                          alt=""
                          width={48}
                          height={48}
                          className="size-12 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="size-12 rounded-full bg-[var(--color-bg-2)]" />
                      )}
                      <span className="line-clamp-2 text-[10px] text-[var(--color-fg-muted)]">{a.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <ul className="flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" aria-hidden>
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="shrink-0">
                  <div className="flex w-14 flex-col items-center gap-1">
                    <div className="size-12 animate-pulse rounded-full bg-[var(--color-bg-2)]" />
                    <div className="h-2 w-10 animate-pulse rounded bg-[var(--color-bg-2)]" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Tile>
  );
}

function Bar({ delay }: { delay: number }) {
  return (
    <span
      className="block w-0.5 rounded-full"
      style={{
        height: "100%",
        background: "var(--color-accent-tertiary)",
        animation: "spotify-pulse 900ms ease-in-out infinite",
        animationDelay: `${delay}ms`,
      }}
    />
  );
}
