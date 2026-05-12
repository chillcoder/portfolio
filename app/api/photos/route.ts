import { NextResponse } from "next/server";
import { captureServerEvent, getDistinctIdFromHeaders } from "@/lib/posthogServer";

export const revalidate = 3600;

interface PhotoItem {
  public_id: string;
  width: number;
  height: number;
  format: string;
  secure_url: string;
  created_at?: string;
  context?: { custom?: { caption?: string } };
}

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

function readCloudinaryEnv(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

function cloudinaryErrorMessage(json: unknown, status: number): string {
  if (json && typeof json === "object" && "error" in json) {
    const err = (json as { error?: { message?: string } }).error;
    if (err?.message) return `Cloudinary: ${err.message}`;
  }
  return `Cloudinary HTTP ${status}`;
}

/**
 * Admin API `prefix` for listing photos.
 * - Unset: default `portfolio/photos`.
 * - Empty string (e.g. `CLOUDINARY_PHOTOS_PREFIX=` in .env): omit prefix → includes root public IDs like `Morro-20_f3ayys`.
 * - Any other value: public IDs must start with that string.
 */
function photosPrefixForList(): string | null {
  const raw = process.env.CLOUDINARY_PHOTOS_PREFIX;
  if (raw === undefined) return "portfolio/photos";
  const t = raw.trim();
  return t.length === 0 ? null : t;
}

export async function GET(request: Request) {
  const distinctId = getDistinctIdFromHeaders(request.headers);
  const creds = readCloudinaryEnv();

  if (!creds) {
    captureServerEvent("photos_stats_error", { reason: "missing_cloudinary_env" }, distinctId);
    return NextResponse.json({ photos: [] } satisfies PhotosResponse);
  }

  const { cloudName, apiKey, apiSecret } = creds;

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`, "utf8").toString("base64");
    const url = new URL(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/image/upload`,
    );
    const prefix = photosPrefixForList();
    if (prefix !== null) {
      url.searchParams.set("prefix", prefix);
    }
    url.searchParams.set("max_results", "30");
    // With `prefix`, Cloudinary sorts by public_id (direction is ignored for created_at).
    url.searchParams.set("direction", "desc");
    url.searchParams.set("context", "true");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      next: { revalidate: 3600 },
    });

    const json = (await res.json()) as {
      resources?: PhotoItem[];
      error?: { message?: string };
    };

    if (!res.ok) {
      throw new Error(cloudinaryErrorMessage(json, res.status));
    }
    if (json.error?.message) {
      throw new Error(`Cloudinary: ${json.error.message}`);
    }

    const photos = (json.resources ?? []).map((p) => ({
      id: p.public_id,
      src: p.secure_url,
      width: p.width,
      height: p.height,
      alt: p.context?.custom?.caption ?? "Portfolio photo",
      caption: p.context?.custom?.caption,
    }));

    captureServerEvent("photos_stats_success", { count: photos.length }, distinctId);
    return NextResponse.json({ photos } satisfies PhotosResponse);
  } catch (error) {
    captureServerEvent(
      "photos_stats_error",
      { reason: error instanceof Error ? error.message : "unknown" },
      distinctId,
    );
    return NextResponse.json({ photos: [] } satisfies PhotosResponse);
  }
}
