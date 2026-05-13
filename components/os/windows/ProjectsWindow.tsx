"use client";

import { useState } from "react";
import {
  PROJECTS,
  projectDisplayStatus,
  projectExtension,
  projectSlug,
  type Project,
} from "@/lib/portfolio-data";
import { ExtensionGlyph } from "@/components/os/FileIcon";
import styles from "@/app/os/os.module.css";

function StatusBadge({ status }: { status: ReturnType<typeof projectDisplayStatus> }) {
  const className =
    status === "ARCHIVE"
      ? `${styles.statusBadge} ${styles.statusBadgeArchive}`
      : styles.statusBadge;
  return <span className={className}>{status}</span>;
}

function ProjectRow({
  project,
  expanded,
  onToggle,
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
}) {
  const ext = projectExtension(project);
  const slug = projectSlug(project);
  const status = projectDisplayStatus(project);

  return (
    <div className={styles.projectRowWrap}>
      <button
        type="button"
        className={styles.projectRow}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className={styles.projectChevron} aria-hidden>
          {expanded ? "▾" : "▸"}
        </span>
        <span className={styles.fileIconArt}>
          <ExtensionGlyph extension={ext} />
        </span>
        <span className={styles.projectFilename}>
          {slug}
          <span className={styles.projectExt} aria-hidden>
            {ext}
          </span>
        </span>
        <StatusBadge status={status} />
      </button>
      {expanded && (
        <div className={styles.projectDetail}>
          <p>{project.description}</p>
          <div className={styles.projectTags}>
            {project.tags.map((t) => (
              <span key={t} className={styles.projectTag}>
                #{t}
              </span>
            ))}
          </div>
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.projectLink}
          >
            Open ↗
          </a>
        </div>
      )}
    </div>
  );
}

export function ProjectsWindow() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className={styles.projectsList}>
      {PROJECTS.map((p) => {
        const slug = projectSlug(p);
        return (
          <ProjectRow
            key={slug}
            project={p}
            expanded={expanded.has(slug)}
            onToggle={() => toggle(slug)}
          />
        );
      })}
    </div>
  );
}
