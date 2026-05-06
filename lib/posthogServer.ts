import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.POSTHOG_SERVER_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!_client) {
    _client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

export function captureServerEvent(
  event: string,
  properties: Record<string, unknown> = {},
  distinctId = "server_anonymous",
) {
  try {
    const client = getClient();
    if (!client) return;
    client.capture({ distinctId, event, properties });
  } catch {
    /* swallow */
  }
}

export function getDistinctIdFromHeaders(headers: Headers): string {
  return headers.get("x-posthog-distinct-id") ?? "server_anonymous";
}
