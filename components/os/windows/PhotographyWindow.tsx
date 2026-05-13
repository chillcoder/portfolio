"use client";

import { CldImage } from "next-cloudinary";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import styles from "@/app/os/os.module.css";

interface Photo {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
}

interface PhotosResponse {
  photos: Photo[];
}

/** Strip Cloudinary's trailing `_xxxxx` hash for a cleaner display name. */
function displayName(id: string): string {
  return id.replace(/_[a-z0-9]{5,}$/i, "");
}

export function PhotographyWindow() {
  const { data, isLoading } = useCachedFetch<PhotosResponse>("/api/photos", {
    cacheKey: "os_photos_window_v1",
    ttl: 60 * 60 * 1000,
  });

  const photos = data?.photos ?? [];

  if (isLoading && photos.length === 0) {
    return <p className={styles.windowEmpty}>Loading photos…</p>;
  }

  if (photos.length === 0) {
    return (
      <p className={styles.windowEmpty}>
        No photos yet. Add images in Cloudinary under <code>portfolio/photos</code>.
      </p>
    );
  }

  return (
    <div className={styles.photoGrid}>
      {photos.slice(0, 24).map((p) => (
        <figure key={p.id} className={styles.photoThumb}>
          <CldImage
            src={p.id}
            alt={p.alt}
            width={160}
            height={160}
            crop="fill"
            gravity="auto"
            quality="auto"
            format="auto"
          />
          <figcaption className={styles.photoThumbCaption}>
            {displayName(p.id)}.jpg
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
