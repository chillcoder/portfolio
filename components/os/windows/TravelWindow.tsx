import {
  allVisitedCoords,
  uniqueCountries,
  visitedCityCount,
} from "@/config/travel";
import { ExtensionGlyph } from "@/components/os/FileIcon";
import styles from "@/app/os/os.module.css";

export function TravelWindow() {
  const cities = allVisitedCoords();
  const cityCount = visitedCityCount();
  const countryCount = uniqueCountries();

  return (
    <div>
      <div className={styles.travelStats}>
        <span>
          <span className={styles.travelStatNum}>{cityCount}</span> cities
        </span>
        <span className={styles.travelStatSep}>·</span>
        <span>
          <span className={styles.travelStatNum}>{countryCount}</span> countries
        </span>
        <span className={styles.travelStatSep}>·</span>
        <span>SF home base</span>
      </div>
      <div className={styles.travelGrid}>
        {cities.map((c) => (
          <button
            key={`${c.lat.toFixed(4)},${c.lng.toFixed(4)}`}
            type="button"
            className={styles.travelCell}
            title={`${c.name}, ${c.country} · ${c.lat.toFixed(2)}°, ${c.lng.toFixed(2)}°`}
          >
            <span className={styles.fileIconArt}>
              <ExtensionGlyph extension=".jpg" />
            </span>
            <span className={styles.travelCellLabel}>
              {c.name}
              <span aria-hidden style={{ opacity: 0.6 }}>.jpg</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
