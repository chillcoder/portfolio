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

export async function GET(req: Request) {
  const distinctId = getDistinctIdFromHeaders(req.headers);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    captureServerEvent("photos_stats_error", { reason: "missing_cloudinary_env" }, distinctId);
    return NextResponse.json({ photos: [] } satisfies PhotosResponse);
  }

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`);
    url.searchParams.set("prefix", "portfolio/photos");
    url.searchParams.set("max_results", "30");
    url.searchParams.set("direction", "desc");
    url.searchParams.set("context", "true");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Cloudinary HTTP ${res.status}`);

    const json = (await res.json()) as { resources?: PhotoItem[] };
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
