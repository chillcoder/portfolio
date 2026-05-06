"use client";

import Link from "next/link";
import { PROFILE } from "@/config/profile";
import { track } from "@/lib/track";

const FOOTER_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Tweets", href: "/tweets" },
  { label: "GitHub", href: PROFILE.socials.github, external: true },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--color-border)]">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-4 py-8 text-xs text-[var(--color-fg-muted)] md:flex-row md:items-center md:px-6">
        <p className="font-mono">
          © {new Date().getFullYear()} {PROFILE.name}. Built in {PROFILE.location}.
        </p>
        <nav className="flex flex-wrap items-center gap-4">
          {FOOTER_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("external_link_clicked", { source: "footer", url: link.href })
                }
                className="hover:text-[var(--color-fg)]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[var(--color-fg)]"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}
