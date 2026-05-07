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
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
