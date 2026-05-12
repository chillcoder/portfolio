"use client";

import { useEffect, useMemo, useState } from "react";
import { CldImage } from "next-cloudinary";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Tile } from "@/components/ui/Tile";
import { TileSkeleton } from "@/components/ui/TileSkeleton";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { track } from "@/lib/track";

interface Photo {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

interface PhotosResponse {
  photos: Photo[];
}

const PREVIEW_COUNT = 10;
/**
 * How often to swap one tile in the grid for a fresh photo from the pool.
 * One tile at a time keeps the rotation calm rather than thrashing the whole grid.
 */
const ROTATE_MS = 20000;

export function PhotosTile({ span }: { span?: string }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [displayed, setDisplayed] = useState<Photo[]>([]);

  const { data, isLoading } = useCachedFetch<PhotosResponse>("/api/photos", {
    cacheKey: "photos_tile_v3",
    ttl: 60 * 60 * 1000,
  });

  const all = useMemo(() => data?.photos ?? [], [data]);

  // Seed the displayed window whenever new data arrives.
  useEffect(() => {
    if (all.length === 0) {
      setDisplayed([]);
      return;
    }
    setDisplayed(all.slice(0, PREVIEW_COUNT));
  }, [all]);

  // Occasionally swap one slot for a photo not currently shown.
  useEffect(() => {
    if (reduced) return;
    if (all.length <= PREVIEW_COUNT) return;

    const id = setInterval(() => {
      setDisplayed((current) => {
        if (current.length === 0) return current;
        const usedIds = new Set(current.map((p) => p.id));
        const candidates = all.filter((p) => !usedIds.has(p.id));
        if (candidates.length === 0) return current;
        const slotIdx = Math.floor(Math.random() * current.length);
        const next = [...current];
        next[slotIdx] = candidates[Math.floor(Math.random() * candidates.length)];
        return next;
      });
    }, ROTATE_MS);

    return () => clearInterval(id);
  }, [all, reduced]);

  const slides = useMemo(
    () =>
      all.map((p) => ({
        src: p.src,
        width: p.width,
        height: p.height,
        alt: p.alt,
      })),
    [all],
  );

  function openAt(photoId: string, fallbackIdx: number) {
    const idx = slides.findIndex((s, i) => all[i]?.id === photoId);
    setLightboxIndex(idx >= 0 ? idx : fallbackIdx);
    setOpen(true);
  }

  return (
    <Tile
      span={span}
      eyebrow="Photography"
      title="Very very amateur photographer"
      accent="secondary"
      action={
        <button
          type="button"
          onClick={() => {
            setLightboxIndex(0);
            setOpen(true);
            track("photos_view_all", { count: slides.length });
          }}
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-tile)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)] transition hover:bg-[var(--color-tile-hover)]"
        >
          View all
        </button>
      }
    >
      <div className="mt-4">
        {isLoading && !data ? (
          <TileSkeleton lines={4} />
        ) : displayed.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-1.5">
            {displayed.map((p, i) => (
              <button
                key={`${i}-${p.id}`}
                type="button"
                onClick={() => {
                  openAt(p.id, i);
                  track("photo_open", { id: p.id, index: i });
                }}
                className="photo-fade-in group relative aspect-square overflow-hidden rounded-lg"
              >
                <CldImage
                  src={p.id}
                  alt={p.alt}
                  width={240}
                  height={240}
                  crop="fill"
                  gravity="auto"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  quality="auto"
                  format="auto"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-fg-muted)]">
            Add images in Cloudinary. By default the tile lists public IDs under{" "}
            <code className="rounded bg-[var(--color-bg-2)] px-1 font-mono text-xs">
              portfolio/photos
            </code>
            . For root uploads (e.g.{" "}
            <code className="rounded bg-[var(--color-bg-2)] px-1 font-mono text-xs">
              Morro-20_f3ayys
            </code>
            ), set{" "}
            <code className="rounded bg-[var(--color-bg-2)] px-1 font-mono text-xs">
              CLOUDINARY_PHOTOS_PREFIX=
            </code>{" "}
            (empty) in{" "}
            <code className="rounded bg-[var(--color-bg-2)] px-1 font-mono text-xs">
              .env.local
            </code>
            .
          </p>
        )}
      </div>

      <Lightbox open={open} close={() => setOpen(false)} index={lightboxIndex} slides={slides} />
    </Tile>
  );
}
