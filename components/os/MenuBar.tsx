import styles from "@/app/os/os.module.css";

const ITEMS = ["File", "Edit", "View", "Help"] as const;

export function MenuBar() {
  return (
    <div className={styles.menuBar} role="menubar" aria-label="Lucas-OS menu">
      <span className={styles.menuBarBrand} role="menuitem">
        LUCAS-OS
      </span>
      {ITEMS.map((item) => (
        <span key={item} className={styles.menuBarItem} role="menuitem">
          {item}
        </span>
      ))}
    </div>
  );
}
