"use client";

import Image from "next/image";
import { Tile } from "@/components/ui/Tile";
import { TileSkeleton } from "@/components/ui/TileSkeleton";
import { useCachedFetch } from "@/hooks/useCachedFetch";

interface SpotifyStats {
  isPlaying: boolean;
  song?: string;
  artist?: string;
  album?: string;
  albumImage?: string | null;
  url?: string;
  lastPlayedAt?: string;
}

interface SpotifyTop {
  topArtists: { name: string; image: string | null; url: string }[];
  topTracks: { name: string; artist: string; image: string | null; url: string }[];
}

export function SpotifyTile({ span }: { span?: string }) {
  const { data: now, isLoading: loadingNow } = useCachedFetch<SpotifyStats>(
    "/api/spotify-stats",
    { cacheKey: "spotify_now", ttl: 60 * 1000, intervalMs: 60 * 1000 },
  );
  const { data: top } = useCachedFetch<SpotifyTop>("/api/spotify-top", {
    cacheKey: "spotify_top",
    ttl: 60 * 60 * 1000,
  });

  const showLive = !!now?.song;

  return (
    <Tile span={span} eyebrow="Spotify" accent="tertiary">
      {loadingNow && !now ? (
        <div className="mt-4">
          <TileSkeleton />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]">
              Now playing
            </span>
            {showLive ? (
              <a
                href={now?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-tile)] p-3 transition hover:bg-[var(--color-tile-hover)]"
              >
                {now?.albumImage ? (
                  <Image
                    src={now.albumImage}
                    alt=""
                    width={48}
                    height={48}
                    className="rounded-md"
                    unoptimized
                  />
                ) : (
                  <div className="size-12 rounded-md bg-[var(--color-bg-2)]" />
                )}
                <div className="flex min-w-0 flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent-tertiary)]">
                    {now?.isPlaying ? "Playing" : "Recently played"}
                  </span>
                  <span className="truncate text-sm font-medium text-[var(--color-fg)]">
                    {now?.song}
                  </span>
                  <span className="truncate text-xs text-[var(--color-fg-muted)]">
                    {now?.artist}
                  </span>
                </div>
                {now?.isPlaying && (
                  <span
                    aria-hidden
                    className="ml-auto flex h-3 items-end gap-0.5"
                    title="playing"
                  >
                    <Bar delay={0} />
                    <Bar delay={120} />
                    <Bar delay={240} />
                  </span>
                )}
              </a>
            ) : (
              <p className="text-sm text-[var(--color-fg-muted)]">
                No music playing—podcasts and audiobooks hidden here.
              </p>
            )}
          </div>

          {!!top?.topArtists?.length && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--color-fg)]">
                Artists I&apos;m into lately
              </span>
              <ul className="flex gap-2 overflow-x-auto pb-1">
                {top.topArtists.slice(0, 5).map((a) => (
                  <li key={a.url} className="shrink-0">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-16 flex-col items-center gap-1 text-center"
                      title={a.name}
                    >
                      {a.image ? (
                        <Image
                          src={a.image}
                          alt=""
                          width={56}
                          height={56}
                          className="size-14 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="size-14 rounded-full bg-[var(--color-bg-2)]" />
                      )}
                      <span className="line-clamp-2 text-[10px] text-[var(--color-fg-muted)]">
                        {a.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!!top?.topTracks?.length && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--color-fg)]">
                Recent tracks
              </span>
              <ul className="flex gap-2 overflow-x-auto pb-1">
                {top.topTracks.slice(0, 5).map((t) => (
                  <li key={t.url} className="shrink-0">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-[4.5rem] flex-col items-center gap-1 text-center"
                      title={`${t.name} — ${t.artist}`}
                    >
                      {t.image ? (
                        <Image
                          src={t.image}
                          alt=""
                          width={56}
                          height={56}
                          className="size-14 rounded-md object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="size-14 rounded-md bg-[var(--color-bg-2)]" />
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
            </div>
          )}
        </div>
      )}
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
