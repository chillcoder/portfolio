"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/os/os.module.css";
import { track } from "@/lib/track";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { PROFILE } from "@/lib/portfolio-data";

function formatTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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

export function Taskbar() {
  const [time, setTime] = useState<string>("");
  const [uptime, setUptime] = useState("—");

  useEffect(() => {
    setTime(formatTime(new Date()));
    const id = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setUptime(formatUptime());
  }, []);

  const { data: github } = useCachedFetch<GithubStats>("/api/github-stats", {
    cacheKey: "os_github_status",
    ttl: 5 * 60 * 1000,
  });

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
        <span className={styles.taskbarStatus} aria-label="System status">
          <span>
            <span className={styles.taskbarStatusKey}>uptime </span>
            <span className={styles.taskbarStatusVal}>{uptime}</span>
          </span>
          <span aria-hidden>·</span>
          <span>
            <span className={styles.taskbarStatusKey}>last commit </span>
            <span className={styles.taskbarStatusVal}>
              {formatRelativeFromYMD(lastContributionDate(github?.daily))}
            </span>
          </span>
        </span>
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
