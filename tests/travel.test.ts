import { describe, expect, it } from "vitest";
import { HOME, VISITED, uniqueCountries } from "@/config/travel";

describe("travel config", () => {
  it("has SF as home", () => {
    expect(HOME.name).toBe("San Francisco");
  });

  it("contains valid lat/lng for visited points", () => {
    for (const city of VISITED) {
      expect(city.lat).toBeGreaterThanOrEqual(-90);
      expect(city.lat).toBeLessThanOrEqual(90);
      expect(city.lng).toBeGreaterThanOrEqual(-180);
      expect(city.lng).toBeLessThanOrEqual(180);
    }
  });

  it("computes unique countries", () => {
    expect(uniqueCountries()).toBeGreaterThan(1);
  });
});
