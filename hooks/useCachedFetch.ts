"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CachedEntry<T> {
  data: T;
  ts: number;
}

interface UseCachedFetchOptions {
  /** localStorage key for the cached payload */
  cacheKey: string;
  /** Time-to-live for cache before refetch in ms (default 10 min) */
  ttl?: number;
  /** Polling interval while page is visible (0 disables) */
  intervalMs?: number;
  /** Refetch on tab becoming visible */
  refetchOnVisible?: boolean;
}

interface UseCachedFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  refetch: () => Promise<void>;
}

const DEFAULT_TTL = 10 * 60 * 1000;

export function useCachedFetch<T>(
  url: string | null,
  {
    cacheKey,
    ttl = DEFAULT_TTL,
    intervalMs = 0,
    refetchOnVisible = true,
  }: UseCachedFetchOptions,
): UseCachedFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const lastFetchedAt = useRef<number>(0);
  const inFlight = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    if (!url) return;
    if (inFlight.current) return inFlight.current;

    const promise = (async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as T;
        setData(json);
        setError(null);
        setIsStale(false);
        lastFetchedAt.current = Date.now();
        try {
          const entry: CachedEntry<T> = { data: json, ts: Date.now() };
          localStorage.setItem(cacheKey, JSON.stringify(entry));
        } catch {
          /* storage full or disabled */
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        setIsStale(true);
      } finally {
        setIsLoading(false);
      }
    })();

    inFlight.current = promise;
    await promise;
    inFlight.current = null;
  }, [url, cacheKey]);

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const entry = JSON.parse(raw) as CachedEntry<T>;
        if (!cancelled) {
          setData(entry.data);
          setIsLoading(false);
          const fresh = Date.now() - entry.ts < ttl;
          setIsStale(!fresh);
          if (fresh) return;
        }
      }
    } catch {
      /* corrupt cache */
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [cacheKey, ttl, load]);

  useEffect(() => {
    if (!intervalMs) return;
    const id = setInterval(() => void load(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, load]);

  useEffect(() => {
    if (!refetchOnVisible) return;
    const handler = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - lastFetchedAt.current > ttl) void load();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [refetchOnVisible, ttl, load]);

  return { data, isLoading, error, isStale, refetch: load };
}
