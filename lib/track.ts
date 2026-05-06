"use client";

import posthog from "posthog-js";

export function track(event: string, properties: Record<string, unknown> = {}) {
  try {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") {
      console.debug("[track]", event, properties);
      return;
    }
    posthog.capture(event, properties);
  } catch {
    /* swallow */
  }
}
