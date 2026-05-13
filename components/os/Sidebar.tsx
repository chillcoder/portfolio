import styles from "@/app/os/os.module.css";

interface FolderNode {
  id: string;
  label: string;
  children?: FolderNode[];
}

const TREE: FolderNode = {
  id: "lucas",
  label: "Lucas",
  children: [
    { id: "about", label: "About" },
    { id: "work", label: "Work history" },
    { id: "projects", label: "Projects" },
    { id: "field-notes", label: "Field notes" },
    { id: "travel", label: "Travel" },
    { id: "photography", label: "Photography" },
    { id: "now-playing", label: "Now playing" },
    { id: "play", label: "Play (game)" },
  ],
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
}

function FolderRow({
  label,
  hasChildren = false,
  expanded = false,
  active = false,
  depth = 0,
}: FolderRowProps) {
  const className = active
    ? `${styles.sidebarFolder} ${styles.sidebarFolderActive}`
    : styles.sidebarFolder;

  return (
    <button
      type="button"
      className={className}
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

export function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Lucas-OS file explorer">
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarBrand}>LUCAS-OS</div>
        <div className={styles.sidebarMeta}>v1.0 · San Francisco · online</div>
      </div>
      <nav className={styles.sidebarTree}>
        <FolderRow
          label={TREE.label}
          hasChildren={!!TREE.children?.length}
          expanded
          depth={0}
        />
        {TREE.children?.map((child) => (
          <FolderRow
            key={child.id}
            label={child.label}
            hasChildren={!!child.children?.length}
            expanded={false}
            depth={1}
          />
        ))}
      </nav>
    </aside>
  );
}
