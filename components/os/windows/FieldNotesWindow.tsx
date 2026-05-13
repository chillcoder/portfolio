import { ABOUT_FACTS, QUOTE } from "@/lib/portfolio-data";
import styles from "@/app/os/os.module.css";

export function FieldNotesWindow() {
  return (
    <div className={styles.fieldNotes}>
      {ABOUT_FACTS.map((fact, i) => (
        <section
          key={fact.label}
          className={i === ABOUT_FACTS.length - 1 ? styles.fieldSectionLast : styles.fieldSection}
        >
          <div className={styles.fieldSectionLabel}>{fact.label}</div>
          <div className={styles.fieldSectionValue}>{fact.value}</div>
        </section>
      ))}
      <blockquote className={styles.fieldQuote}>
        “{QUOTE.text}”
        <footer className={styles.fieldQuoteAttr}>{QUOTE.attribution}</footer>
      </blockquote>
    </div>
  );
}
