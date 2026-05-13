"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Sidebar, type SidebarFolderId } from "@/components/os/Sidebar";
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
import { track } from "@/lib/track";
import styles from "@/app/os/os.module.css";

type MainWindowId = Exclude<SidebarFolderId, "now-playing"> | "contact";

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

function TitleGlyph({ extension }: { extension: FileExtension }) {
  return <ExtensionGlyph extension={extension} />;
}

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

  const handleSidebarSelect = useCallback(
    (id: SidebarFolderId) => {
      if (id === "now-playing") {
        setPinnedClosed(false);
        track("os_window_open", { id: "now-playing" });
        return;
      }
      openMain(id);
    },
    [openMain],
  );

  // Konami code → swap to chess wallpaper for 5 seconds.
  // Skip if focus is inside the play window (LaneDefense has its own konami handler).
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

  // Sidebar's `activeId` is what's highlighted. `contact` is desktop-only
  // (no sidebar folder), so map to null in that case.
  const sidebarActive: SidebarFolderId | null =
    activeMain && activeMain !== "contact" ? activeMain : null;

  return (
    <div className={styles.desktopBody}>
      <Sidebar activeId={sidebarActive} onSelect={handleSidebarSelect} />
      <main className={surfaceClass} aria-label="Desktop">
        <DesktopIcon
          label="README.txt"
          icon={<ExtensionGlyph extension=".txt" size={32} />}
          onClick={() => openMain("about")}
        />
        <DesktopIcon
          label="renewal-defense.exe"
          icon={<ExtensionGlyph extension=".exe" size={32} />}
          onClick={() => openMain("play")}
        />
        <DesktopIcon
          label="contact.app"
          icon={<ExtensionGlyph extension=".app" size={32} />}
          onClick={() => openMain("contact")}
        />

        {activeMain && (
          <WindowSlot key={activeMain} className={mainSlotClass}>
            <Window
              title={MAIN_TITLES[activeMain]}
              icon={<TitleGlyph extension={MAIN_ICON[activeMain]} />}
              active
              onClose={closeMain}
            >
              <MainWindowBody id={activeMain} />
            </Window>
          </WindowSlot>
        )}

        {!pinnedClosed && (
          <WindowSlot className={styles.windowSlotPinned}>
            <Window
              title="media-player.exe"
              icon={<TitleGlyph extension=".exe" />}
              onClose={() => setPinnedClosed(true)}
            >
              <NowPlayingWindow />
            </Window>
          </WindowSlot>
        )}
      </main>
    </div>
  );
}

function WindowSlot({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return <div className={className}>{children}</div>;
}
