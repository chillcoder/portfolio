/**
 * Single source of truth for personal/profile content.
 * Consumed by both the bento route (`/`) and the OS route (`/os`).
 *
 * Static content lives here as typed objects. Content that is fetched at
 * runtime (Spotify, GitHub, WakaTime, Cloudinary photos) is described in
 * `DATA_SOURCES` so any view can discover the endpoint + response shape
 * without reaching into individual tile components.
 *
 * Travel content stays in `config/travel.ts` to avoid disturbing the
 * computed helpers (`hubArcsFromHome`, `tripRouteArcs`, etc.) that the
 * `GlobeTile` already depends on.
 */

export const PROFILE = {
  name: "Lucas O'Brien",
  shortName: "Lucas",
  title: "Customer Success & Applied AI",
  location: "San Francisco, CA",
  homeCoords: { lat: 37.7749, lng: -122.4194 },
  domain: "lucas-obrien.com",
  email: "lucasobrien123@gmail.com",
  careerStart: new Date("2019-08-01"),
  bio: "Senior CSM at Juniper Square, with a concurrent applied-AI role shipping internal tools in Claude Code. I connect revenue and retention goals to shipped apps for CS and GTM.",
  socials: {
    github: "https://github.com/chillcoder",
    twitter: "https://x.com/lucas_obrien",
    linkedin: "https://www.linkedin.com/in/lucas-obrien",
    instagram: "https://instagram.com/lucas.obrien",
    bluesky: "https://bsky.app/profile/lucas-obrien.com",
  },
} as const;

export const ABOUT_FACTS: { label: string; value: string }[] = [
  {
    label: "Currently",
    value:
      "Applied AI at Juniper Square (concurrent with Senior CSM)—B2B investment management software",
  },
  {
    label: "Impact",
    value:
      "115% net retention across 70+ accounts (~$6.3M ARR); $1.7M expansion ARR in 2025 from usage-led motions",
  },
  {
    label: "Earlier",
    value:
      "HackerRank—enterprise pipeline and technical discovery; built Python/SQL tooling for reporting",
  },
  {
    label: "Education",
    value:
      "UCSB B.S. Economics; Professional Graduate Certificate in Technology Management",
  },
  { label: "Also", value: "Travel and photography when the light is right" },
];

export const QUOTE = {
  text: "Translate the business case into something shipped—then scale it for the team.",
  attribution: "— how I work with CS & GTM",
};

export interface WorkRole {
  company: string;
  role: string;
  start: string;
  end: string | "Present";
  summary: string;
  bullets: string[];
  /** Single highlight shown when a role is expanded (candidate-facing). */
  spotlight?: string;
}

export const WORK: WorkRole[] = [
  {
    company: "Juniper Square",
    role: "Applied AI",
    start: "Mar 2026",
    end: "Present",
    summary:
      "Production internal applications with Claude Code—discovery through delivery for CS and GTM.",
    spotlight:
      "Ship internal apps with Claude Code from discovery through delivery—tooling that contextualizes customer data, speeds CS responses, and automates account health scoring.",
    bullets: [
      "Ship tooling that contextualizes customer data, speeds responses, surfaces product knowledge, and automates account health scoring—less manual CSM work, better coverage.",
      "Partner with CS and GTM to turn business cases into fully built internal apps.",
    ],
  },
  {
    company: "Juniper Square",
    role: "Senior Customer Success Manager",
    start: "Nov 2024",
    end: "Present",
    summary: "Enterprise and mid-market adoption across a large book of business.",
    spotlight:
      "115% net retention across 70+ accounts (~$6.3M ARR) with technical enablement, expansion, and scaled digital engagement.",
    bullets: [
      "Drive adoption across 70+ accounts (~$6.3M ARR); 115% net retention via technical enablement, expansion, and scaled digital engagement.",
      "$1.7M expansion ARR in 2025 from usage data, health scoring, and timely expansion plays.",
      "Advise executives and enable technical/ops teams; scalable AI and product enablement workshops across segments.",
      "Voice of customer with Product—roadmap input, beta programs, GTM for new features.",
    ],
  },
  {
    company: "Juniper Square",
    role: "Customer Success Manager",
    start: "Aug 2022",
    end: "2024",
    summary: "Onboarding, adoption playbooks, and early AI product guidance.",
    spotlight:
      "Scaled onboarding and adoption playbooks across CX; led early AI product adoption with technical enablement and stakeholder alignment.",
    bullets: [
      "Structured onboarding and repeatable adoption processes that scaled across CX.",
      "Led early AI product adoption with value articulation, technical enablement, and stakeholder alignment.",
    ],
  },
  {
    company: "Juniper Square",
    role: "Senior Institutional Reporting Analyst",
    start: "Apr 2022",
    end: "Aug 2022",
    summary: "Data model SME and reporting at scale.",
    spotlight:
      "Partnered with Product to streamline quarterly reporting across ~$250B in equity—~40% faster delivery via analytics and process redesign.",
    bullets: [
      "Go-to for Support, CSM, and Technical Consulting on data integrations and connectivity.",
      "With Product, streamlined quarterly reporting across ~$250B equity—~40% faster delivery via analytics and process redesign.",
    ],
  },
  {
    company: "HackerRank",
    role: "Senior Enterprise Sales Development & Small Market Sales Executive",
    start: "Jan 2020",
    end: "Mar 2021",
    summary: "New business and technical discovery for developer-focused SaaS.",
    spotlight:
      "~$4.5M pipeline to ~$1.2M new ARR through technical discovery; built Python/SQL tooling for pipeline and reporting.",
    bullets: [
      "Beat quota; ~$4.5M pipeline converting to ~$1.2M new ARR through technical discovery and developer audience enablement.",
      "Built internal Python/SQL tooling for pipeline tracking and reporting.",
    ],
  },
  {
    company: "HackerRank",
    role: "Enterprise Sales Development",
    start: "Aug 2019",
    end: "Jan 2020",
    summary: "Technical demos and enterprise discovery.",
    spotlight:
      "Enterprise technical demos and discovery; consistently above 120% of quota.",
    bullets: ["Technical product demos and discovery with enterprise teams; 120%+ quota."],
  },
];

export const SKILLS: string[] = [
  "Customer success",
  "Renewals & expansion",
  "Executive advisory",
  "Usage analytics",
  "Health scoring",
  "Enablement & training",
  "Change management",
  "Salesforce",
  "Looker",
  "Tableau",
  "Jira",
  "Claude Code",
  "Cursor",
  "TypeScript",
  "Next.js",
  "Python",
  "SQL",
  "REST APIs",
  "Webhooks",
  "Prompt engineering",
  "AI agents",
];

export interface Education {
  school: string;
  degree: string;
  start: string;
  end: string;
  details?: string;
  coursework?: string[];
}

export const EDUCATION: Education[] = [
  {
    school: "University of California, Santa Barbara",
    degree: "B.S. Economics",
    start: "2014",
    end: "2018",
    details:
      "June 2018. Professional Graduate Certificate in Technology Management.",
  },
];

export interface Certification {
  name: string;
  issuer: string;
  href: string;
  initials: string;
}

export const CERTIFICATIONS: Certification[] = [];

export interface Project {
  name: string;
  description: string;
  href: string;
  status: "live" | "wip" | "archived";
  /** When set, shown on the badge instead of the default label for `status`. */
  statusLabel?: string;
  tags: string[];
  /** Optional kebab-case slug for filename-style displays in /os. Auto-derived from name if absent. */
  slug?: string;
}

export const PROJECTS: Project[] = [
  {
    name: "lucas-obrien.com",
    description:
      "This portfolio—bento dashboard with live tiles (GitHub, Spotify, travel globe, photos).",
    href: "https://github.com/chillcoder/portfolio",
    status: "live",
    statusLabel: "Live - Always Tinkering",
    tags: ["next.js", "tailwind", "posthog"],
  },
  {
    name: "Scout VC",
    description: "Seed-stage due diligence AI tool.",
    href: "https://www.scoutvc.ai/",
    status: "live",
    tags: ["ai", "due diligence", "seed"],
  },
  {
    name: "Applied AI internal tooling",
    description:
      "Production internal apps at Juniper Square—Claude Code, CS/GTM workflows, health and knowledge automation.",
    href: "https://www.linkedin.com/in/lucas-obrien",
    status: "wip",
    tags: ["claude code", "internal tools", "cs"],
    slug: "applied-ai-tooling",
  },
  {
    name: "E-ink commuter dashboard",
    description:
      "Pulls weather, calendar, and SF Muni transit data onto a low-power e-ink display. Built end-to-end with Cursor and Claude Code.",
    href: "https://github.com/chillcoder",
    status: "wip",
    tags: ["esp32", "python", "e-ink"],
    slug: "e-ink-display",
  },
  {
    name: "PromptOps",
    description: "AI model eval tool.",
    href: "https://github.com/chillcoder",
    status: "archived",
    tags: ["ai", "eval"],
  },
  {
    name: "Pipeline & reporting utilities",
    description:
      "Python/SQL tooling for pipeline tracking and reporting (HackerRank era).",
    href: "https://github.com/chillcoder",
    status: "archived",
    tags: ["python", "sql"],
    slug: "pipeline-utilities",
  },
];

/**
 * Project helpers used by the /os route. Pure derivations, no schema change.
 */
export function projectSlug(p: Project): string {
  if (p.slug) return p.slug;
  return p.name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function projectExtension(p: Project): ".app" | ".archive" {
  return p.status === "archived" ? ".archive" : ".app";
}

export function projectDisplayStatus(
  p: Project,
): "LIVE" | "BUILDING" | "ARCHIVE" {
  if (p.status === "live") return "LIVE";
  if (p.status === "wip") return "BUILDING";
  return "ARCHIVE";
}

/**
 * Career log derived from WORK for the /os `career.log` view.
 * One entry per role start, reverse chronological.
 */
export interface CareerLogEntry {
  /** YYYY-MM */
  date: string;
  event: "STARTED";
  role: string;
  company: string;
}

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

function startStringToYM(start: string): string {
  const [mo, yr] = start.split(" ");
  const mm = MONTHS[mo] ?? "??";
  return yr ? `${yr}-${mm}` : "??-??";
}

export function careerLog(): CareerLogEntry[] {
  return WORK.map((w) => ({
    date: startStringToYM(w.start),
    event: "STARTED" as const,
    role: w.role,
    company: w.company,
  })).sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * /os easter-egg "secrets/" content. Not surfaced anywhere in the bento route.
 */
export interface PickupEvent {
  day: string;
  activity: string;
}

export const SECRETS = {
  chess: { format: "Rapid", rating: 1080 },
  pickup: [
    { day: "Tuesday", activity: "Basketball pickup, SF JCC" },
    { day: "Wednesday", activity: "Softball" },
    { day: "Thursday", activity: "HH" },
  ] as PickupEvent[],
} as const;

/**
 * Registry of runtime-fetched content. Each entry names the API endpoint
 * the bento tiles already use and the response payload shape, so the /os
 * route (or any future view) can consume the same data without
 * duplicating fetch logic.
 *
 * Phase 1 just declares the registry; consumers are not wired yet.
 */
export interface SpotifyNowPayload {
  isPlaying: boolean;
  song?: string;
  artist?: string;
  album?: string;
  albumImage?: string | null;
  url?: string;
  lastPlayedAt?: string;
}

export interface SpotifyTopPayload {
  topArtists: { name: string; image: string | null; url: string }[];
  topTracks: {
    name: string;
    artist: string;
    image: string | null;
    url: string;
  }[];
}

export interface PhotosPayload {
  photos: {
    id: string;
    src: string;
    width: number;
    height: number;
    alt: string;
    caption?: string;
  }[];
}

export interface DataSource<T> {
  id: string;
  endpoint: string;
  description: string;
  /** Phantom field — only used to attach the payload type to each entry. */
  __payload?: T;
}

export const DATA_SOURCES = {
  spotifyNow: {
    id: "spotifyNow",
    endpoint: "/api/spotify-stats",
    description: "Spotify now-playing or last-played track.",
  } as DataSource<SpotifyNowPayload>,
  spotifyTop: {
    id: "spotifyTop",
    endpoint: "/api/spotify-top",
    description: "Spotify top artists + top tracks (rolling).",
  } as DataSource<SpotifyTopPayload>,
  photos: {
    id: "photos",
    endpoint: "/api/photos",
    description: "Cloudinary photos in the portfolio prefix.",
  } as DataSource<PhotosPayload>,
  github: {
    id: "github",
    endpoint: "/api/github-stats",
    description: "GitHub commits in the last 7 days + sparkline trend.",
  } as DataSource<unknown>,
  wakatime: {
    id: "wakatime",
    endpoint: "/api/wakatime-stats",
    description: "WakaTime coding hours, daily average, language breakdown.",
  } as DataSource<unknown>,
} as const;
