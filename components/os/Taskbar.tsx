"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/os/os.module.css";
import { track } from "@/lib/track";

function formatTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function Taskbar() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setTime(formatTime(new Date()));
    const id = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.taskbar} role="contentinfo" aria-label="Taskbar">
      <Link
        href="/"
        className={styles.taskbarBrand}
        aria-label="Exit Lucas-OS, return to bento dashboard"
        onClick={() => track("view_switched", { to: "bento" })}
      >
        LUCAS-OS
      </Link>
      <div className={styles.taskbarRight}>
        <span className={styles.onlineGroup}>
          <span aria-hidden className={styles.onlineDot} />
          online
        </span>
        <span
          className={styles.taskbarTime}
          aria-live="off"
          aria-label="Current time"
          suppressHydrationWarning
        >
          {time || "--:--:--"}
        </span>
      </div>
    </div>
  );
}
