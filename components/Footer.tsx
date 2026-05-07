"use client";

import Link from "next/link";
import { PROFILE } from "@/config/profile";
import { SocialIconLinks } from "@/components/SocialIconLinks";

const FOOTER_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--color-border)]">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-4 py-8 text-xs text-[var(--color-fg-muted)] md:flex-row md:items-center md:px-6">
        <p className="font-mono">
          © {new Date().getFullYear()} {PROFILE.name}. Built in {PROFILE.location}.
        </p>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <nav className="flex flex-wrap items-center gap-4" aria-label="Legal and pages">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[var(--color-fg)]">
                {link.label}
              </Link>
            ))}
          </nav>
          <nav
            className="flex items-center gap-1 border-t border-[var(--color-border)] pt-4 sm:border-t-0 sm:pt-0 sm:pl-4 md:border-l md:pl-6"
            aria-label="Social links"
          >
            <SocialIconLinks source="footer" />
          </nav>
        </div>
      </div>
    </footer>
  );
}
