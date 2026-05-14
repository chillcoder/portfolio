"use client";

import { useCallback, useEffect, useState } from "react";
import { Window } from "@/components/os/Window";
import { DesktopIcon } from "@/components/os/DesktopIcon";
import { ExtensionGlyph, type FileExtension } from "@/components/os/FileIcon";
import { AboutWindow } from "@/components/os/windows/AboutWindow";
import { CareerWindow } from "@/components/os/windows/CareerWindow";
import { ProjectsWindow } from "@/components/os/windows/ProjectsWindow";
import { FieldNotesWindow } from "@/components/os/windows/FieldNotesWindow";
import { TravelWindow } from "@/components/os/windows/TravelWindow";
import { PhotographyWindow } from "@/components/os/windows/PhotographyWindow";
import { NowPlayingWindow } from "@/components/os/windows/NowPlayingWindow";
import { PlayWindow } from "@/components/os/windows/PlayWindow";
import { ContactWindow } from "@/components/os/windows/ContactWindow";
import { SecretsWindow } from "@/components/os/windows/SecretsWindow";
import { PROFILE } from "@/lib/portfolio-data";
import { track } from "@/lib/track";
import styles from "@/app/os/os.module.css";
import { MenuBar } from "@/components/os/MenuBar";
import type { MainWindowId } from "@/components/os/mainWindowTypes";

const MAIN_TITLES: Record<MainWindowId, string> = {
  about: "about.md",
  work: "career.log",
  projects: "Projects",
  "field-notes": "field-notes.txt",
  travel: "travel.album",
  photography: "photography/",
  play: "renewal-defense.exe",
  contact: "contact.app",
  secrets: "secrets/",
};

const MAIN_ICON: Record<MainWindowId, FileExtension> = {
  about: ".md",
  work: ".txt",
  projects: ".app",
  "field-notes": ".txt",
  travel: ".jpg",
  photography: ".jpg",
  play: ".exe",
  contact: ".app",
  secrets: ".txt",
};

function MainWindowBody({ id }: { id: MainWindowId }) {
  switch (id) {
    case "about":
      return <AboutWindow />;
    case "work":
      return <CareerWindow />;
    case "projects":
      return <ProjectsWindow />;
    case "field-notes":
      return <FieldNotesWindow />;
    case "travel":
      return <TravelWindow />;
    case "photography":
      return <PhotographyWindow />;
    case "play":
      return <PlayWindow />;
    case "contact":
      return <ContactWindow />;
    case "secrets":
      return <SecretsWindow />;
  }
}

const KONAMI: ReadonlyArray<string> = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const KONAMI_DURATION_MS = 5000;

// Left-side icon columns (portfolio sections). Two columns to match the
// PostHog-style edge layout.
const LEFT_COL_A: { id: MainWindowId; label: string; ext: FileExtension }[] = [
  { id: "about", label: "about.md", ext: ".md" },
  { id: "work", label: "career.log", ext: ".txt" },
  { id: "projects", label: "Projects", ext: ".app" },
  { id: "field-notes", label: "field-notes.txt", ext: ".txt" },
  { id: "travel", label: "travel.album", ext: ".jpg" },
];

const LEFT_COL_B: { id: MainWindowId; label: string; ext: FileExtension }[] = [
  { id: "photography", label: "photography/", ext: ".jpg" },
  { id: "play", label: "renewal-defense.exe", ext: ".exe" },
  { id: "contact", label: "contact.app", ext: ".app" },
  { id: "secrets", label: "secrets/", ext: ".archive" },
];

// Right-side icon column (external links + escape hatch).
const RIGHT_COL: {
  label: string;
  href: string;
  ext: FileExtension;
  target?: string;
}[] = [
  { label: "github.url", href: PROFILE.socials.github, ext: ".url" },
  { label: "linkedin.url", href: PROFILE.socials.linkedin, ext: ".url" },
  { label: "email.url", href: `mailto:${PROFILE.email}`, ext: ".url" },
  { label: "view-bento.url", href: "/", ext: ".url", target: "_self" },
];

export function WindowManager() {
  const [activeMain, setActiveMain] = useState<MainWindowId | null>("about");
  const [pinnedClosed, setPinnedClosed] = useState(false);
  const [konami, setKonami] = useState(false);

  const openMain = useCallback((id: MainWindowId) => {
    setActiveMain(id);
    track("os_window_open", { id });
  }, []);

  const closeMain = useCallback(() => {
    setActiveMain(null);
    track("os_window_close", { id: "main" });
  }, []);

  // Konami code → swap the desktop wallpaper to a chess board for 5 seconds.
  // Skipped while the Play window is active (LaneDefenseTile owns the same
  // sequence in-game) and ignored for keys typed into form fields.
  useEffect(() => {
    let idx = 0;
    function onKey(e: KeyboardEvent) {
      if (activeMain === "play") return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      const want = KONAMI[idx];
      const match =
        want === "b" || want === "a"
          ? e.key.toLowerCase() === want
          : e.key === want;
      if (match) {
        idx += 1;
        if (idx >= KONAMI.length) {
          idx = 0;
          setKonami(true);
          track("os_konami");
        }
      } else {
        idx = e.key === KONAMI[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeMain]);

  useEffect(() => {
    if (!konami) return;
    const t = setTimeout(() => setKonami(false), KONAMI_DURATION_MS);
    return () => clearTimeout(t);
  }, [konami]);

  const mainSlotClass =
    activeMain === "play" ? styles.windowSlotPlay : styles.windowSlotMain;
  const surfaceClass = `${styles.desktopSurface}${
    konami ? ` ${styles.konamiWallpaper}` : ""
  }`;

  return (
    <>
      <MenuBar
        activeMain={activeMain}
        onOpenMain={openMain}
        onCloseMain={closeMain}
        pinnedClosed={pinnedClosed}
        onTogglePinned={() => setPinnedClosed((v) => !v)}
      />
      <main className={surfaceClass} aria-label="Desktop">
      <div className={styles.iconLayer} aria-hidden={false}>
        <div className={styles.iconColumns}>
          <div className={styles.iconColumn}>
            {LEFT_COL_A.map((it) => (
              <DesktopIcon
                key={it.id}
                label={it.label}
                icon={<ExtensionGlyph extension={it.ext} size={32} />}
                onClick={() => openMain(it.id)}
                selected={activeMain === it.id}
              />
            ))}
          </div>
          <div className={styles.iconColumn}>
            {LEFT_COL_B.map((it) => (
              <DesktopIcon
                key={it.id}
                label={it.label}
                icon={<ExtensionGlyph extension={it.ext} size={32} />}
                onClick={() => openMain(it.id)}
                selected={activeMain === it.id}
              />
            ))}
          </div>
        </div>
        <div className={styles.iconColumn}>
          {RIGHT_COL.map((it) => (
            <DesktopIcon
              key={it.label}
              label={it.label}
              icon={<ExtensionGlyph extension={it.ext} size={32} />}
              href={it.href}
              target={it.target}
            />
          ))}
          {!pinnedClosed ? null : (
            <DesktopIcon
              key="reopen-now-playing"
              label="media-player.exe"
              icon={<ExtensionGlyph extension=".exe" size={32} />}
              onClick={() => setPinnedClosed(false)}
            />
          )}
        </div>
      </div>

      {activeMain && (
        <Window
          key={activeMain}
          title={MAIN_TITLES[activeMain]}
          icon={<ExtensionGlyph extension={MAIN_ICON[activeMain]} />}
          active
          onClose={closeMain}
          className={mainSlotClass}
        >
          <MainWindowBody id={activeMain} />
        </Window>
      )}

      {!pinnedClosed && (
        <Window
          title="media-player.exe"
          icon={<ExtensionGlyph extension=".exe" />}
          onClose={() => setPinnedClosed(true)}
          className={styles.windowSlotPinned}
        >
          <NowPlayingWindow />
        </Window>
      )}
    </main>
    </>
  );
}
