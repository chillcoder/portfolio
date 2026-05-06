# Lucas Portfolio

Personal bento-style portfolio built with Next.js App Router.

## Stack
- Next.js 15 + React 19 + TypeScript
- Tailwind v4
- GSAP, Lenis, Matter.js, react-globe.gl
- next-cloudinary + yet-another-react-lightbox
- PostHog analytics

## Run locally
```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Integrations included
- GitHub stats
- WakaTime stats
- Spotify now playing/top tracks
- Cloudinary photos

## Deploy to Vercel (lucas-obrien.com)

1. Push this repo to GitHub (HTTPS works fine if SSH keys are painful).
2. In [Vercel](https://vercel.com): **Add New → Project** → import `chillcoder/portfolio` (or your fork).
3. **Settings → Environment Variables**: paste values from `.env.example` for Production (and Preview if you want previews wired).
4. **Settings → Domains**: add `lucas-obrien.com` and `www.lucas-obrien.com`, then add the DNS records Vercel shows at your registrar (or point nameservers to Vercel).
5. **Redeploy** after env vars change.

### Spotify OAuth once

Open `https://lucas-obrien.com/api/spotify-callback` in the browser (with app credentials set). Complete Spotify login so the refresh token is stored (Redis or `SPOTIFY_LIVE_REFRESH_TOKEN`).

### Cloudinary

Create folder `portfolio/photos` in the Media Library and upload images. The Photos tile lists that prefix.

### PostHog

Set `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (e.g. `https://us.i.posthog.com`), and `POSTHOG_SERVER_KEY`. The app proxies ingestion through `/ingest/*` (see `next.config.ts`).

### Optional: Upstash Redis

In Vercel: **Storage → Marketplace → Upstash Redis** and connect. Used for rotating Spotify refresh tokens.
