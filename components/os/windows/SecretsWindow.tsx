import { SECRETS } from "@/lib/portfolio-data";
import styles from "@/app/os/os.module.css";

export function SecretsWindow() {
  return (
    <div className={styles.secrets}>
      <section className={styles.secretBlock}>
        <h3 className={styles.secretHeading}>chess.com</h3>
        <p className={styles.secretLine}>
          {SECRETS.chess.format} <span className={styles.secretMono}>{SECRETS.chess.rating}</span> elo
        </p>
      </section>
      <section className={styles.secretBlock}>
        <h3 className={styles.secretHeading}>weekly pickup</h3>
        <ul className={styles.secretList}>
          {SECRETS.pickup.map((p) => (
            <li key={p.day}>
              <span className={styles.secretDay}>{p.day}</span>
              {" — "}
              {p.activity}
            </li>
          ))}
        </ul>
      </section>
      <p className={styles.secretFootnote}>
        nothing here is a secret really. you found the easter egg.
      </p>
    </div>
  );
}
