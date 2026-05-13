"use client";

import { useEffect, useState } from "react";
import { PROFILE } from "@/lib/portfolio-data";
import styles from "@/app/os/os.module.css";

export function AboutWindow() {
  const [years, setYears] = useState<string>("0");

  useEffect(() => {
    const ms = Date.now() - PROFILE.careerStart.getTime();
    const yrs = ms / (1000 * 60 * 60 * 24 * 365.25);
    setYears(yrs.toFixed(1));
  }, []);

  return (
    <article>
      <pre className={styles.markdownFrontmatter}>
{`---
name: ${PROFILE.name}
role: ${PROFILE.title}
location: ${PROFILE.location}
years_building: ${years}
---`}
      </pre>
      <div className={styles.markdownBody}>
        <p>{PROFILE.bio}</p>
      </div>
    </article>
  );
}
