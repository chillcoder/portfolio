"use client";

import { useEffect, useState } from "react";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { PROFILE } from "@/lib/portfolio-data";
import styles from "@/app/os/os.module.css";

export type SidebarFolderId =
  | "about"
  | "work"
  | "projects"
  | "field-notes"
  | "travel"
  | "photography"
  | "now-playing"
  | "play"
  | "secrets";

interface SidebarProps {
  activeId: SidebarFolderId | null;
  onSelect: (id: SidebarFolderId) => void;
}

const TREE: { id: SidebarFolderId; label: string }[] = [
  { id: "about", label: "About" },
  { id: "work", label: "Work history" },
  { id: "projects", label: "Projects" },
  { id: "field-notes", label: "Field notes" },
  { id: "travel", label: "Travel" },
  { id: "photography", label: "Photography" },
  { id: "now-playing", label: "Now playing" },
  { id: "play", label: "Play (game)" },
];

const SECRET_FOLDER: { id: SidebarFolderId; label: string } = {
  id: "secrets",
  label: "secrets/",
};

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden
    >
      <path d="M0.5 3 L4.5 3 L5.5 4 L13.5 4 L13.5 12.5 L0.5 12.5 Z" />
      <path d="M0.5 5.5 L13.5 5.5" />
    </svg>
  );
}

interface FolderRowProps {
  label: string;
  hasChildren?: boolean;
  expanded?: boolean;
  active?: boolean;
  depth?: number;
  onClick?: () => void;
}

function FolderRow({
  label,
  hasChildren = false,
  expanded = false,
  active = false,
  depth = 0,
  onClick,
}: FolderRowProps) {
  const className = active
    ? `${styles.sidebarFolder} ${styles.sidebarFolderActive}`
    : styles.sidebarFolder;

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-expanded={hasChildren ? expanded : undefined}
      style={depth > 0 ? { paddingLeft: 8 + depth * 14 } : undefined}
    >
      <span className={styles.sidebarChevron} aria-hidden>
        {hasChildren ? (expanded ? "▾" : "▸") : ""}
      </span>
      <span className={styles.sidebarFolderIcon}>
        <FolderIcon />
      </span>
      <span className={styles.sidebarFolderLabel}>{label}</span>
    </button>
  );
}

interface GithubStats {
  daily: { date: string; count: number }[];
}

function lastContributionDate(daily: { date: string; count: number }[] = []): string | undefined {
  for (let i = daily.length - 1; i >= 0; i--) {
    if (daily[i].count > 0) return daily[i].date;
  }
  return undefined;
}

function formatRelativeFromYMD(ymd?: string): string {
  if (!ymd) return "—";
  // GitHub returns YYYY-MM-DD UTC dates. Treat as midnight UTC.
  const then = new Date(`${ymd}T12:00:00Z`).getTime();
  if (Number.isNaN(then)) return "—";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 86_400) return "today";
  if (diffSec < 86_400 * 2) return "1d ago";
  if (diffSec < 86_400 * 30) return `${Math.floor(diffSec / 86_400)}d ago`;
  if (diffSec < 86_400 * 365)
    return `${Math.floor(diffSec / (86_400 * 30))}mo ago`;
  return `${Math.floor(diffSec / (86_400 * 365))}y ago`;
}

function formatUptime(): string {
  const ms = Date.now() - PROFILE.careerStart.getTime();
  const yrs = ms / (1000 * 60 * 60 * 24 * 365.25);
  return `${yrs.toFixed(1)}y`;
}

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  const [rootExpanded, setRootExpanded] = useState(true);
  const [uptime, setUptime] = useState("—");

  useEffect(() => {
    setUptime(formatUptime());
  }, []);

  const { data: github } = useCachedFetch<GithubStats>("/api/github-stats", {
    cacheKey: "os_github_status",
    ttl: 5 * 60 * 1000,
  });

  return (
    <aside className={styles.sidebar} aria-label="Lucas-OS file explorer">
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarBrand}>LUCAS-OS</div>
        <div className={styles.sidebarMeta}>v1.0 · San Francisco · online</div>
      </div>

      <nav className={styles.sidebarTree}>
        <FolderRow
          label="Lucas"
          hasChildren
          expanded={rootExpanded}
          depth={0}
          onClick={() => setRootExpanded((v) => !v)}
        />
        {rootExpanded &&
          TREE.map((node) => (
            <FolderRow
              key={node.id}
              label={node.label}
              depth={1}
              active={activeId === node.id}
              onClick={() => onSelect(node.id)}
            />
          ))}
        {rootExpanded && (
          <FolderRow
            label={SECRET_FOLDER.label}
            depth={1}
            active={activeId === "secrets"}
            onClick={() => onSelect("secrets")}
          />
        )}
      </nav>

      <div className={styles.sidebarStatus}>
        <div>
          <span className={styles.sidebarStatusKey}>uptime: </span>
          <span className={styles.sidebarStatusVal}>{uptime}</span>
        </div>
        <div>
          <span className={styles.sidebarStatusKey}>last commit: </span>
          <span className={styles.sidebarStatusVal}>
            {formatRelativeFromYMD(lastContributionDate(github?.daily))}
          </span>
        </div>
      </div>
    </aside>
  );
}
