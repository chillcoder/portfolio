"use client";

import { PROFILE } from "@/config/profile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NowPlayingMarquee } from "@/components/NowPlayingMarquee";
import { track } from "@/lib/track";

const SOCIAL_LINKS: { label: string; href: string }[] = [
  { label: "GH", href: PROFILE.socials.github },
  { label: "LI", href: PROFILE.socials.linkedin },
  { label: "X", href: PROFILE.socials.twitter },
  { label: "IG", href: PROFILE.socials.instagram },
];

export function Header() {
  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 backdrop-blur md:px-6"
        style={{
          background: "color-mix(in oklab, var(--color-bg) 75%, transparent)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <button
          type="button"
          onClick={scrollToTop}
          className="text-sm font-mono uppercase tracking-[0.18em] text-[var(--color-fg)] transition hover:opacity-70"
          aria-label="Scroll to top"
        >
          {PROFILE.shortName}.
        </button>
        <NowPlayingMarquee />
        <nav className="flex items-center gap-1">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track("external_link_clicked", { source: "header", url: link.href })
              }
              className="grid size-9 place-items-center rounded-full font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)] transition hover:bg-[var(--color-tile)] hover:text-[var(--color-fg)]"
            >
              {link.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
