import { describe, expect, it } from "vitest";
import {
  HOME,
  HOME_MARKER_SLO,
  VISITED,
  approximateTotalMiles,
  allVisitedCoords,
  haversineMiles,
  hubArcsFromHome,
  splitTripLegsIntoJourneys,
  travelMarqueeLines,
  tripOutboundJourneyCount,
  tripRouteArcs,
  TRIP_ROUTE_LEGS,
  REPEATED_SF_HUBS,
  uniqueCountries,
  visitedCityCount,
} from "@/config/travel";

describe("travel config", () => {
  it("has SF as home", () => {
    expect(HOME.name).toBe("San Francisco");
  });

  it("has San Luis Obispo home marker", () => {
    expect(HOME_MARKER_SLO.name).toBe("San Luis Obispo");
    expect(HOME_MARKER_SLO.lat).toBeGreaterThan(34);
    expect(HOME_MARKER_SLO.lat).toBeLessThan(36);
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

  it("lists unique visited coords excluding SF", () => {
    const coords = allVisitedCoords();
    expect(coords.some((c) => c.lat === HOME.lat && c.lng === HOME.lng)).toBe(false);
    expect(coords.some((c) => c.name === HOME_MARKER_SLO.name)).toBe(true);
  });

  it("hub mode has one arc per visited pin", () => {
    expect(hubArcsFromHome().length).toBe(visitedCityCount());
  });

  it("trip mode exposes sequential legs", () => {
    expect(tripRouteArcs().length).toBeGreaterThan(10);
    expect(tripRouteArcs()[0].name).toContain("→");
  });

  it("haversine is sane for short hop", () => {
    const mi = haversineMiles(HOME.lat, HOME.lng, HOME_MARKER_SLO.lat, HOME_MARKER_SLO.lng);
    expect(mi).toBeGreaterThan(150);
    expect(mi).toBeLessThan(350);
  });

  it("approximate total miles is a large plausible aggregate", () => {
    const total = approximateTotalMiles();
    expect(total).toBeGreaterThan(120_000);
    expect(total).toBeLessThan(600_000);
  });

  it("counts return-to-SF miles beyond one-way legs only", () => {
    let oneWay = 0;
    for (const leg of TRIP_ROUTE_LEGS) {
      oneWay += haversineMiles(leg.from.lat, leg.from.lng, leg.to.lat, leg.to.lng);
    }
    for (const { coord, visits } of REPEATED_SF_HUBS) {
      oneWay += visits * haversineMiles(HOME.lat, HOME.lng, coord.lat, coord.lng);
    }
    expect(approximateTotalMiles()).toBeGreaterThan(oneWay);
  });

  it("splits trip legs into journeys starting from SF", () => {
    const journeys = splitTripLegsIntoJourneys(TRIP_ROUTE_LEGS);
    expect(journeys.length).toBe(tripOutboundJourneyCount());
    expect(journeys.length).toBeGreaterThan(5);
    expect(journeys[0][0].from.name).toBe(HOME.name);
  });

  it("exposes four marquee lines", () => {
    const lines = travelMarqueeLines({
      totalMiles: 200_000,
      cities: 10,
      countries: 4,
      journeyCount: 3,
    });
    expect(lines).toHaveLength(4);
    expect(lines[0]).toMatch(/Moon/i);
  });
});
