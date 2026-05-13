"use client";

import { LaneDefenseTile } from "@/components/tiles/LaneDefenseTile";
import styles from "@/app/os/os.module.css";

export function PlayWindow() {
  return (
    <div className={styles.playWindow}>
      <LaneDefenseTile chromeless />
    </div>
  );
}
