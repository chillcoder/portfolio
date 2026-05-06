/**
 * Single source of truth for personal/profile content rendered on the dashboard.
 * Edit this file to rebrand the portfolio.
 */

export const PROFILE = {
  name: "Lucas O'Brien",
  shortName: "Lucas",
  title: "Builder, traveler, photographer",
  location: "San Francisco, CA",
  homeCoords: { lat: 37.7749, lng: -122.4194 },
  domain: "lucas-obrien.com",
  email: "hello@lucas-obrien.com",
  // Used by the experience tile to compute years in tech
  careerStart: new Date("2018-06-01"),
  bio: "I build calm, useful product surfaces. I travel a lot and shoot photos when the light is right.",
  socials: {
    github: "https://github.com/lucas-obrien",
    twitter: "https://x.com/lucas_obrien",
    linkedin: "https://www.linkedin.com/in/lucas-obrien",
    instagram: "https://instagram.com/lucas.obrien",
    bluesky: "https://bsky.app/profile/lucas-obrien.com",
  },
} as const;

export const ABOUT_FACTS: { label: string; value: string }[] = [
  { label: "Currently", value: "Building product at a Series B startup" },
  { label: "Hometown", value: "Boulder, CO" },
  { label: "Reading", value: "Mostly nonfiction, design + history" },
  { label: "Listening", value: "Indie folk, jazz, ambient" },
  { label: "Camera", value: "Fujifilm X100V" },
];

export const QUOTE = {
  text: "Make it useful, then make it beautiful.",
  attribution: "—  studio mantra",
};

export interface WorkRole {
  company: string;
  role: string;
  start: string;
  end: string | "Present";
  summary: string;
  bullets: string[];
}

export const WORK: WorkRole[] = [
  {
    company: "Acme Software",
    role: "Senior Product Engineer",
    start: "2023",
    end: "Present",
    summary: "Leading the platform pod across infra and DX surfaces.",
    bullets: [
      "Designed v2 plugin runtime cutting cold-start latency 4x.",
      "Owned hiring loop for the foundations team (5 hires).",
    ],
  },
  {
    company: "Northstar Labs",
    role: "Product Engineer",
    start: "2020",
    end: "2023",
    summary: "Full-stack feature delivery on a small product team.",
    bullets: [
      "Shipped real-time collab system on top of Yjs and Postgres.",
      "Built billing + entitlement system from scratch.",
    ],
  },
  {
    company: "Field Studio",
    role: "Software Engineer",
    start: "2018",
    end: "2020",
    summary: "Agency work for early-stage product teams.",
    bullets: ["Shipped 12+ client products across React, Next.js, and Rails."],
  },
];

export const SKILLS: string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Postgres",
  "Redis",
  "Tailwind",
  "GraphQL",
  "tRPC",
  "Rust",
  "Go",
  "AWS",
  "Vercel",
  "Figma",
  "Lightroom",
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
    school: "University of Colorado Boulder",
    degree: "B.S. Computer Science",
    start: "2014",
    end: "2018",
    details: "Minor in Studio Arts. Distinguished Engineering Project award.",
    coursework: [
      "Distributed Systems",
      "Operating Systems",
      "Compilers",
      "HCI",
      "Computational Photography",
    ],
  },
];

export interface Certification {
  name: string;
  issuer: string;
  href: string;
  initials: string;
}

export const CERTIFICATIONS: Certification[] = [
  {
    name: "AWS Certified Solutions Architect — Associate",
    issuer: "Amazon Web Services",
    href: "https://www.credly.com/users/lucas-obrien",
    initials: "AWS",
  },
  {
    name: "Google Professional Cloud Architect",
    issuer: "Google Cloud",
    href: "https://www.credly.com/users/lucas-obrien",
    initials: "GCP",
  },
  {
    name: "HashiCorp Certified: Terraform Associate",
    issuer: "HashiCorp",
    href: "https://www.credly.com/users/lucas-obrien",
    initials: "TF",
  },
];

export interface Project {
  name: string;
  description: string;
  href: string;
  status: "live" | "wip" | "archived";
  tags: string[];
}

export const PROJECTS: Project[] = [
  {
    name: "Tilemaker",
    description: "Bento-style portfolio template; live API tiles + smooth motion.",
    href: "https://github.com/lucas-obrien/tilemaker",
    status: "live",
    tags: ["next.js", "tailwind", "gsap"],
  },
  {
    name: "Roamlog",
    description: "A quiet travel journal that auto-collects city visits from your photos.",
    href: "https://github.com/lucas-obrien/roamlog",
    status: "wip",
    tags: ["expo", "exif", "supabase"],
  },
  {
    name: "Frame.io clone",
    description: "Side-by-side video review tool with timestamped comments.",
    href: "https://github.com/lucas-obrien/frameio-clone",
    status: "archived",
    tags: ["react", "ffmpeg"],
  },
];
