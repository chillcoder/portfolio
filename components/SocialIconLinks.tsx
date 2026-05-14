"use client";

import { PROFILE } from "@/config/profile";
import { IconGithub, IconLinkedIn } from "@/components/icons/social";
import { cn } from "@/lib/cn";
import { track } from "@/lib/track";

const ITEMS = [
  { key: "github", label: "GitHub", href: PROFILE.socials.github, Icon: IconGithub },
  { key: "linkedin", label: "LinkedIn", href: PROFILE.socials.linkedin, Icon: IconLinkedIn },
] as const;

export function SocialIconLinks({
  source,
  buttonClassName,
}: {
  source: "header" | "footer";
  buttonClassName?: string;
}) {
  return (
    <>
      {ITEMS.map(({ key, label, href, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          onClick={() => track("external_link_clicked", { source, url: href })}
          className={cn(
            "inline-flex items-center justify-center rounded-full text-[var(--color-fg-muted)] transition hover:bg-[var(--color-tile)] hover:text-[var(--color-fg)]",
            source === "header" ? "size-9" : "size-8",
            buttonClassName,
          )}
        >
          <Icon
            className={cn(source === "header" ? "size-[18px]" : "size-4")}
          />
        </a>
      ))}
    </>
  );
}
