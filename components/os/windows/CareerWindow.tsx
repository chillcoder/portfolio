import { careerLog } from "@/lib/portfolio-data";
import styles from "@/app/os/os.module.css";

export function CareerWindow() {
  const entries = careerLog();

  return (
    <pre className={styles.careerLog}>
      {entries.map((e, i) => (
        <span key={i} className={styles.careerLogLine}>
          <span className={styles.careerLogDate}>[{e.date}]</span>{" "}
          <span className={styles.careerLogEvent}>{e.event}</span>{"  "}
          {e.role} <span className={styles.careerLogSep}>·</span> {e.company}
          {"\n"}
        </span>
      ))}
      <span className={styles.careerLogEof}>{"-- END OF LOG --"}</span>
    </pre>
  );
}
