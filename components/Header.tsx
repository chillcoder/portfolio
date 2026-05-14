"use client";

import { PROFILE } from "@/config/profile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NowPlayingMarquee } from "@/components/NowPlayingMarquee";
import { SocialIconLinks } from "@/components/SocialIconLinks";

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
        <nav className="flex items-center gap-1" aria-label="Social links">
          <SocialIconLinks source="header" />
          <div className="hidden shrink-0 items-center md:flex">
            <span
              className="max-w-[7.5rem] pr-1 text-right text-[11px] leading-snug text-[var(--color-fg-muted)]"
              aria-hidden
            >
              Try a new theme
            </span>
            <svg
              width="30"
              height="26"
              viewBox="0 0 30 26"
              className="-mr-1 shrink-0 text-[var(--color-fg-muted)]"
              aria-hidden
            >
              <path
                d="M1 20 C6 20, 10 18, 14 14 C18 10, 22 8, 27 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
              />
              <path
                d="M22 8 L27 13 L24 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <ThemeToggle />
          </div>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
