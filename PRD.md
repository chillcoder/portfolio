# Product Requirements Document (PRD)

## Product Name
Personal portfolio web app (bento dashboard style)

## Purpose
This product is a personal portfolio that combines:
- personal/professional profile content
- interactive UI components and motion
- live personal telemetry from multiple third-party APIs
- lightweight analytics and event tracking

The goal is to create a memorable portfolio that feels alive (real-time-ish activity data) while still functioning as a hiring/credibility surface.

## Vision
Build a portfolio that reads like a product:
- visually distinct and interactive
- fast and resilient (graceful fallback when APIs fail)
- measurable (tracked user behavior)
- easy to fork/customize for another person

---

## Core Goals
- Communicate identity, experience, projects, and credibility quickly.
- Show live signals (coding, fitness, media, productivity, sleep) via API-driven tiles.
- Keep UX smooth with animation, transitions, and responsive layout.
- Instrument key user actions and engagement events with PostHog.
- Support low-friction edits so a new owner can rebrand and swap data sources.

## Non-Goals
- No user accounts/login for visitors.
- No CMS/admin panel.
- No backend database beyond Redis-style token/cache storage.
- No transactional workflows (commerce, messaging, etc.).

---

## Personas
- **Primary:** Recruiters, hiring managers, technical peers.
- **Secondary:** Friends/community, potential collaborators, curious visitors.
- **Builder persona:** A developer cloning this project to create their own version.

---

## Success Criteria
- Visitor can identify who you are and what you do within 10 seconds.
- Visitor can inspect projects, credentials, and live activity without dead states.
- External links and engagement actions are tracked.
- Third-party data failures degrade gracefully without crashing the page.
- New builder can configure required environment variables and integrations in under 2 hours.

---

## Product Scope

### Routes
- `/` Home dashboard (bento tile composition)
- `/tweets` Gallery of tweet screenshots
- `/privacy` Privacy policy page
- `/terms` Terms of service page
- `/api/*` Server routes for integrations, OAuth callbacks, and stats responses

### Major UI Surfaces
- Fixed top header (brand, social links, now-playing marquee, theme toggle)
- Bento grid dashboard with profile + live telemetry tiles
- Footer with legal and outbound links

---

## Information Architecture and Content Model

### Home Dashboard Tile Model
Each tile is either:
- **static content tile** (bio, education, projects, etc.)
- **live data tile** (calls internal `/api/*` route)
- **hybrid tile** (static framing + dynamic data)

Tiles include:
- Hero identity tile
- GitHub commits tile
- Experience years tile
- Work accordion tile
- Skills tile (physics/organized modes)
- About tile
- Oura tile
- WakaTime tile
- Education tile
- Certifications strip
- Spotify tile
- Todoist tile
- Trakt tile
- Projects tile
- Strava tile

### Shared Data UI Patterns
- Loading state via tile skeleton component
- Numeric emphasis via monospaced large text
- Trend visualization via sparkline/charts
- Accent-color signaling by category

---

## Functional Requirements

### Layout and Navigation
- Fixed header remains visible while scrolling.
- Header brand click scrolls to top (Lenis smooth-scroll aware).
- Responsive breakpoints:
  - desktop: explicit 6-column bento placement
  - tablet: 2-column stack with selected full-width tiles
  - mobile: 1-column stack

### Theming
- Light/dark theme support.
- Initial theme applied early in `<head>` script to avoid flash.
- Theme persisted in `localStorage` under `theme`.

### Motion and Interactivity
- Entrance animation for tiles on scroll (GSAP ScrollTrigger).
- Reduced-motion preference disables/limits animations.
- Optional parallax tilt effect on hero tile.
- Magnetic hover effect on selected links/icons.
- Skill tile has toggle between:
  - physics-based "jumble" mode (Matter.js)
  - static organized tag grid

### Accessibility and UX Baselines
- Interactive controls use semantic elements (`button`, links).
- Accordion exposes `aria-expanded`, `aria-controls`, region labels.
- Tooltips for cert badges.
- Reduced-motion handling implemented globally and per-component.

---

## Feature Details (Tile-by-Tile)

### Hero Tile
- Displays name with letter-by-letter animated reveal.
- Shows location and short descriptor.
- Includes tracked internal link to `/tweets`.

### GitHub Tile
- Calls `/api/github-stats`.
- Shows commits in last 7 days, activity indicator, and sparkline trend.

### Experience Tile
- Computes years in tech from fixed start date on client.

### Work Accordion Tile
- Expand/collapse role entries.
- GSAP animation for panel open/close.
- Tracks expansion event (`work_accordion_expand`).

### Skills Tile
- Desktop-capable devices: drag-interactive physics tags.
- Lower-performance or reduced-motion contexts: static tags.
- Toggle to switch visual mode with fade transition.

### About Tile
- Ordered list of personal facts and static quote.

### Oura Tile
- Calls `/api/oura-stats`.
- Displays latest sleep hours, sleep score, readiness score, plus trend sparkline.

### WakaTime Tile
- Calls `/api/wakatime-stats`.
- Displays total coding hours, daily average, and top language distribution chart.

### Education Tile
- Timeline-style list of degrees and coursework chips.

### Certifications Tile
- Displays cert badge icons with tooltips.
- Outbound Credly verification link tracked (`cert_badge_click`).

### Spotify Tile
- Calls `/api/spotify-stats` and `/api/spotify-top`.
- Displays recent and all-time favorites where available.
- Falls back to cached top artist/track if live top data unavailable.
- Shows yearly listening trend sparkline.

### Todoist Tile
- Calls `/api/todoist-stats`.
- Displays active, overdue, completed-today, completed-this-week.

### Trakt Tile
- Calls `/api/trakt-stats`.
- Shows now-watching or last-watched item.
- Displays all-time hours/movies/episodes counters.

### Projects Tile
- Static project list with status badges.
- Tracks outbound project clicks (`tile_click`).

### Strava Tile
- Calls `/api/strava-stats?period=<week|month|year|all>`.
- Period switcher with transition.
- Displays hours, activities, miles, and activity-type bar breakdown.

---

## Backend and Integration Architecture

### App Architecture
- Framework: Next.js App Router
- UI: React + Tailwind v4
- Client animation stack: GSAP, Lenis, react-parallax-tilt, Matter.js
- Data viz: Recharts + custom sparkline wrapper

### API Route Strategy
- Each external integration has a dedicated internal route under `app/api/*`.
- API routes normalize provider-specific payloads into tile-ready JSON.
- Most routes are defensive: return null/default payloads on failure.
- Revalidation and caching vary by source and freshness requirements.

### Third-Party Integrations
- GitHub GraphQL API
- Spotify Web API
- Strava API
- Oura API
- Todoist API
- Trakt API
- WakaTime API
- PostHog (client + server event capture)
- Upstash Redis (token storage + server cache)

---

## OAuth and Token Lifecycle Requirements

### General Pattern
- Callback endpoints exchange auth `code` for token(s).
- Tokens are persisted to Redis when available.
- Stats routes use refresh token to request short-lived access token.
- Rotated refresh tokens are written back to Redis.

### Callback Endpoints
- `/api/spotify-callback`
- `/api/strava-callback`
- `/api/oura-callback`
- `/api/todoist-callback`
- `/api/trakt-callback`

### Token Storage Keys
- `spotify_live_refresh_token`
- `strava_refresh_token`
- `oura_refresh_token`
- `todoist_access_token`
- `trakt_refresh_token`

### Additional Cached Data Keys
- `todoist_stats_cache`
- `trakt_alltime_stats`
- `spotify:overview`
- `spotify:top_artists`
- `spotify:top_tracks`
- `spotify:yearly_hours`
- `strava_stats:<period>`

---

## Tracking and Analytics Requirements

### Analytics Stack
- `posthog-js` initialized in `instrumentation-client.js` (production only).
- API ingestion proxied through Next rewrites (`/ingest/*`) to avoid ad blockers and simplify config.
- Server-side events captured via `posthog-node` helper.

### Client-Side Tracked Events
- `tweets_page_link_clicked`
- `work_accordion_expand`
- `tile_click` (project link clicks)
- `cert_badge_click`
- `external_link_clicked` (footer links)
- `tweet_viewed` (intersection observer at 50% visibility)

### Server-Side Tracked Events (per route)
- Fetch success/error events for GitHub, WakaTime, Oura, Todoist, Trakt, Strava, Spotify routes.
- Distinct ID sourced from request header `x-posthog-distinct-id` or fallback `server_anonymous`.

### Privacy Expectations
- Anonymous usage tracking only (per privacy page copy).
- Cookies used by PostHog session/user identification.
- No first-party account/profile collection in app workflows.

---

## Caching and Performance Requirements

### Client Caching
- Shared hook `useCachedFetch` caches successful payloads in `localStorage`.
- Includes TTL, visibility refresh, interval polling, and stale fallback.

### Server Caching
- Redis used for:
  - token durability across deployments
  - expensive query result caching
- Per-provider TTLs are tuned by data volatility (e.g., Strava periods, Trakt all-time).

### Runtime Behavior
- Some routes use `next: { revalidate: 300 }`.
- Strava route forces dynamic behavior and explicit no-store response headers.
- UI should always render meaningful placeholders if APIs fail.

---

## UI Design and Brand System Requirements

### Visual Language
- Glassmorphism tile surfaces with accent hover states.
- Mono + sans typography (Geist Mono/Sans).
- Warm, personality-forward copy style.
- Textured noise overlay for subtle depth.

### Accent System
- Primary accent
- Secondary accent
- Tertiary accent
- Accent applied at tile-level via CSS variable (`--tile-accent`).

### Reusable UI Building Blocks
- `Tile`
- `TileSkeleton`
- `StatTile`
- `Badge`
- `Sparkline`
- Tooltip primitives

---

## Environment and Setup Requirements

### Local Development
- Install dependencies: `pnpm install`
- Run dev server: `pnpm dev`
- Build: `pnpm build`
- Start prod build locally: `pnpm start`

### Required Environment Variables (Full Build)
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `POSTHOG_SERVER_KEY` (recommended)
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `GITHUB_TOKEN`
- `WAKATIME_API_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI` (optional fallback exists)
- `SPOTIFY_LIVE_REFRESH_TOKEN` (fallback if Redis token missing)
- `OURA_CLIENT_ID`
- `OURA_CLIENT_SECRET`
- `OURA_REFRESH_TOKEN` (fallback if Redis token missing)
- `TODOIST_CLIENT_ID`
- `TODOIST_CLIENT_SECRET`
- `TODOIST_API_TOKEN` (fallback mode)
- `TRAKT_CLIENT_ID`
- `TRAKT_CLIENT_SECRET`
- `TRAKT_REDIRECT_URI` (optional fallback exists)
- `TRAKT_REFRESH_TOKEN` (fallback if Redis token missing)
- `STRAVA_CLIENT_ID`
- `STRAVA_SECRET`
- `STRAVA_REFRESH_TOKEN` (fallback if Redis token missing)

### Optional/Partial Setup Modes
- You can run without most integrations; tiles will gracefully show placeholders.
- To progressively enable features, configure one provider at a time and validate each tile route.

---

## Build-Your-Own Version Plan

### Phase 1: Rebrand and Content
- Replace metadata, hero copy, about facts, work history, projects, education, certifications.
- Update social/contact links and legal page content.
- Keep component structure initially unchanged to preserve layout stability.

### Phase 2: Analytics and Observability
- Create your own PostHog project.
- Set PostHog env vars and verify events in local/prod.
- Rename events only after baseline is stable.

### Phase 3: Data Integrations
- Choose which live tiles you actually want.
- Configure OAuth app credentials for selected providers.
- Run each callback route once to seed Redis tokens.
- Verify each `/api/*-stats` endpoint independently.

### Phase 4: UX Customization
- Adjust accent palette and typography tokens in `app/global.css`.
- Tune animation intensity and motion defaults.
- Rework bento grid placement classes if you add/remove tiles.

### Phase 5: Hardening
- Add rate-limit safeguards if traffic grows.
- Add richer server logs and error dashboards.
- Add tests for critical data transforms and route fallbacks.

---

## Risks and Mitigations
- **Token expiry/rotation breakage:** use Redis persistence and rotated token writes.
- **Provider API outages:** defensive catch/fallback payloads in each route.
- **Client performance on low-end devices:** reduced-motion + static fallback modes.
- **Tracking noise:** standardize event naming and properties before major iteration.
- **Over-coupled personalization:** isolate user-specific constants for easier replacement.

---

## Open Enhancement Opportunities
- Central config file for all profile/tile content.
- Feature flags to toggle tiles without code deletion.
- Integration health panel (internal-only route).
- Unit tests for API normalization logic.
- Snapshot tests for key tile render states.
- CI lint/test pipeline and pre-deploy checks.

---

## Acceptance Checklist for This PRD
- Documents app purpose, architecture, and route map.
- Documents all major tiles and interactions.
- Documents analytics events and tracking flow.
- Documents integration and OAuth setup patterns.
- Documents environment requirements and rebuild workflow.
- Gives practical guidance for creating a personalized fork.

