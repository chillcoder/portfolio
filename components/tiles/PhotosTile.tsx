"use client";

import { useMemo, useState } from "react";
import { CldImage } from "next-cloudinary";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Tile } from "@/components/ui/Tile";
import { TileSkeleton } from "@/components/ui/TileSkeleton";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { track } from "@/lib/track";

interface PhotosResponse {
  photos: {
    id: string;
    src: string;
    width: number;
    height: number;
    alt: string;
    caption?: string;
  }[];
}

export function PhotosTile({ span }: { span?: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const { data, isLoading } = useCachedFetch<PhotosResponse>("/api/photos", {
    cacheKey: "photos_tile_v2",
    ttl: 60 * 60 * 1000,
  });

  const preview = data?.photos?.slice(0, 6) ?? [];
  const slides = useMemo(
    () =>
      (data?.photos ?? []).map((p) => ({
        src: p.src,
        width: p.width,
        height: p.height,
        alt: p.alt,
      })),
    [data],
  );

  return (
    <Tile
      span={span}
      eyebrow="Photography"
      title="Recent frames"
      accent="secondary"
      action={
        <button
          type="button"
          onClick={() => {
            setIndex(0);
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
        ) : preview.length ? (
          <div className="grid grid-cols-3 gap-2">
            {preview.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                  track("photo_open", { id: p.id, index: i });
                }}
                className="group relative aspect-square overflow-hidden rounded-lg"
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

      <Lightbox open={open} close={() => setOpen(false)} index={index} slides={slides} />
    </Tile>
  );
}
