"use client";

import { useEffect, useState } from "react";

interface NowPlaying {
  isPlaying: boolean;
  song?: string;
  artist?: string;
  lastPlayedAt?: string;
}

const POLL_MS = 60_000;

export function NowPlayingMarquee() {
  const [data, setData] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/spotify-stats", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as NowPlaying;
        if (!cancelled) setData(json);
      } catch {
        /* swallow */
      }
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const display = data?.song
    ? `${data.isPlaying ? "Now playing" : "Last played"} · ${data.song} — ${data.artist ?? ""}`
    : "Quietly thinking · Lucas";

  const repeated = `${display}   ·   ${display}   ·   ${display}   ·   ${display}`;

  return (
    <div className="relative hidden flex-1 overflow-hidden text-xs text-[var(--color-fg-muted)] md:block">
      <div className="marquee-track flex gap-12 whitespace-nowrap font-mono">
        <span>{repeated}</span>
        <span>{repeated}</span>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-12"
        style={{ background: "linear-gradient(90deg, var(--color-bg) 0%, transparent 100%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12"
        style={{ background: "linear-gradient(270deg, var(--color-bg) 0%, transparent 100%)" }}
      />
    </div>
  );
}
