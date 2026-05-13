import styles from "./os.module.css";
import { Desktop } from "@/components/os/Desktop";
import { MenuBar } from "@/components/os/MenuBar";
import { Sidebar } from "@/components/os/Sidebar";
import { Taskbar } from "@/components/os/Taskbar";
import { Window } from "@/components/os/Window";
import { DesktopIcon } from "@/components/os/DesktopIcon";
import { FileIcon } from "@/components/os/FileIcon";

/** Sample 32x32 placeholder for desktop icons (Phase 3 replaces these). */
function PlaceholderArt({ n }: { n: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={32}
      height={32}
      aria-hidden
    >
      <rect
        x={1}
        y={1}
        width={30}
        height={30}
        fill="#fafaf7"
        stroke="#1a1a1a"
        strokeWidth={1}
      />
      <text
        x={16}
        y={21}
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontSize={14}
        fill="#1a1a1a"
      >
        {n}
      </text>
    </svg>
  );
}

/** Sample 16x16 doc glyph for the window title (matches FileIcon's .md style). */
function DocIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden
    >
      <path d="M3 1.5 L10.5 1.5 L13 4 L13 14.5 L3 14.5 Z" />
      <path d="M10.5 1.5 L10.5 4 L13 4" />
    </svg>
  );
}

export default function OsPage() {
  return (
    <Desktop>
      <MenuBar />
      <div className={styles.desktopBody}>
        <Sidebar />
        <main className={styles.desktopSurface} aria-label="Desktop">
          <DesktopIcon label="Test 1" icon={<PlaceholderArt n={1} />} />
          <DesktopIcon label="Test 2" icon={<PlaceholderArt n={2} />} />
          <DesktopIcon label="Test 3" icon={<PlaceholderArt n={3} />} />
          <DesktopIcon label="Test 4" icon={<PlaceholderArt n={4} />} />

          <Window
            title="Welcome.md"
            icon={<DocIcon />}
            active
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px]"
          >
            <p>This is a window.</p>
            <p style={{ marginTop: 12, color: "#6b6b6b" }}>
              Phase 3 will replace this body with real portfolio content
              (About, Work history, Projects, etc.) sourced from
              lib/portfolio-data.ts.
            </p>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
              <FileIcon label="readme" extension=".md" />
              <FileIcon label="resume" extension=".txt" />
              <FileIcon label="lane-defense" extension=".app" />
              <FileIcon label="terminal" extension=".exe" />
              <FileIcon label="morro-20" extension=".jpg" />
            </div>
          </Window>
        </main>
      </div>
      <Taskbar />
    </Desktop>
  );
}
