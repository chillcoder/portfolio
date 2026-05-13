import type { ReactNode } from "react";
import styles from "@/app/os/os.module.css";

export function Desktop({ children }: { children: ReactNode }) {
  return (
    <div className={styles.desktop}>
      <div aria-hidden className={styles.noiseOverlay} />
      {children}
    </div>
  );
}
