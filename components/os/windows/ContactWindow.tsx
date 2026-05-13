"use client";

import { PROFILE } from "@/lib/portfolio-data";
import { FileIcon } from "@/components/os/FileIcon";
import styles from "@/app/os/os.module.css";

const ROWS: { label: string; href: string }[] = [
  { label: "email", href: `mailto:${PROFILE.email}` },
  { label: "github", href: PROFILE.socials.github },
  { label: "linkedin", href: PROFILE.socials.linkedin },
  { label: "twitter", href: PROFILE.socials.twitter },
];

export function ContactWindow() {
  return (
    <div className={styles.contactList}>
      {ROWS.map((row) => (
        <a
          key={row.label}
          href={row.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLinkWrap}
        >
          <FileIcon label={row.label} extension=".url" />
        </a>
      ))}
    </div>
  );
}
