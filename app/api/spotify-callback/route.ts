import { NextResponse } from "next/server";
import { persistRefreshToken } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
  if (!code) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = getRedirectUri(req);
    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "missing SPOTIFY_CLIENT_ID" },
        { status: 500 },
      );
    }
    const scopes = [
      "user-read-currently-playing",
      "user-read-recently-played",
      "user-top-read",
    ].join(" ");
    const authorize = new URL("https://accounts.spotify.com/authorize");
    authorize.searchParams.set("client_id", clientId);
    authorize.searchParams.set("response_type", "code");
    authorize.searchParams.set("redirect_uri", redirectUri);
    authorize.searchParams.set("scope", scopes);
    return NextResponse.redirect(authorize.toString());
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { ok: false, error: "missing SPOTIFY_CLIENT_ID/SECRET" },
      { status: 500 },
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(req),
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json(
      { ok: false, error: `spotify token exchange failed: ${text}` },
      { status: 500 },
    );
  }

  const json = (await tokenRes.json()) as { refresh_token?: string; access_token?: string };
  if (!json.refresh_token) {
    return NextResponse.json(
      { ok: false, error: "no refresh_token in spotify response" },
      { status: 500 },
    );
  }

  await persistRefreshToken(json.refresh_token);

  return NextResponse.json({
    ok: true,
    message:
      "Spotify refresh token persisted. Add this to SPOTIFY_LIVE_REFRESH_TOKEN env if not using Redis.",
    refresh_token: json.refresh_token,
  });
}

function getRedirectUri(req: Request): string {
  if (process.env.SPOTIFY_REDIRECT_URI) return process.env.SPOTIFY_REDIRECT_URI;
  const url = new URL(req.url);
  return `${url.origin}/api/spotify-callback`;
}
