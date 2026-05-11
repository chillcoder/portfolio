/**
 * Travel data for GlobeTile: hubs from SF, sequential trip legs, mileage, stats.
 */

export interface TravelCoord {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export interface TravelPoint extends TravelCoord {
  year?: number;
}

export interface TripLeg {
  from: TravelCoord;
  to: TravelCoord;
  mode?: string;
}

/** Primary hub for hub-mode arcs and mileage. */
export const HOME: { name: string; lat: number; lng: number } = {
  name: "San Francisco",
  lat: 37.7749,
  lng: -122.4194,
};

/** Second “home” marker on the globe (tiny home icon in UI). */
export const HOME_MARKER_SLO: TravelCoord = {
  name: "San Luis Obispo",
  country: "USA",
  lat: 35.2828,
  lng: -120.6596,
};

const SF: TravelCoord = {
  name: HOME.name,
  country: "USA",
  lat: HOME.lat,
  lng: HOME.lng,
};

/** Named places for legs and labels (representative coords). */
const PLACES = {
  costaRica: { name: "Costa Rica", country: "Costa Rica", lat: 9.9281, lng: -84.0907 },
  london: { name: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  vienna: { name: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  salzburg: { name: "Salzburg", country: "Austria", lat: 47.8095, lng: 13.055 },
  rome: { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  amalfi: { name: "Amalfi Coast", country: "Italy", lat: 40.6333, lng: 14.6027 },
  barcelona: { name: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734 },
  dublin: { name: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603 },
  nice: { name: "Nice", country: "France", lat: 43.7102, lng: 7.262 },
  monaco: { name: "Monaco", country: "Monaco", lat: 43.7384, lng: 7.4246 },
  cabo: { name: "Cabo San Lucas", country: "Mexico", lat: 22.8905, lng: -109.9167 },
  sanJoseDelCabo: { name: "San José del Cabo", country: "Mexico", lat: 23.0594, lng: -109.6978 },
  todosSantos: { name: "Todos Santos", country: "Mexico", lat: 23.4495, lng: -110.2253 },
  hanoi: { name: "Hanoi", country: "Vietnam", lat: 21.0285, lng: 105.8542 },
  hoiAn: { name: "Hội An", country: "Vietnam", lat: 15.8801, lng: 108.338 },
  hcmc: { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lng: 106.6297 },
  seoul: { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978 },
  kyoto: { name: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681 },
  hakone: { name: "Hakone", country: "Japan", lat: 35.2322, lng: 139.038 },
  tokyo: { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  nyc: { name: "New York City", country: "USA", lat: 40.7128, lng: -74.006 },
  nyeMt: { name: "Nye, MT", country: "USA", lat: 46.0249, lng: -109.8499 },
  batonRouge: { name: "Baton Rouge", country: "USA", lat: 30.4515, lng: -91.1871 },
  nashville: { name: "Nashville", country: "USA", lat: 36.1627, lng: -86.7816 },
  austin: { name: "Austin", country: "USA", lat: 30.2672, lng: -97.7431 },
  chicago: { name: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298 },
  area51: { name: "Area 51", country: "USA", lat: 37.2431, lng: -115.793 },
  lasVegas: { name: "Las Vegas", country: "USA", lat: 36.1699, lng: -115.1398 },
  grandCanyon: { name: "Grand Canyon", country: "USA", lat: 36.0544, lng: -112.1401 },
  scottsdale: { name: "Scottsdale", country: "USA", lat: 33.4942, lng: -111.9261 },
  seward: { name: "Seward", country: "USA", lat: 60.1042, lng: -149.4422 },
  homer: { name: "Homer", country: "USA", lat: 59.6425, lng: -151.5483 },
  katmai: { name: "Katmai", country: "USA", lat: 58.688, lng: -156.661 },
  glacierView: { name: "Glacier View", country: "USA", lat: 61.4153, lng: -147.1182 },
  coeurDalene: { name: "Coeur d'Alene", country: "USA", lat: 47.6777, lng: -116.7805 },
  jacksonWy: { name: "Jackson", country: "USA", lat: 43.4799, lng: -110.7624 },
  bigIsland: { name: "Hawaiʻi (Big Island)", country: "USA", lat: 19.64, lng: -155.9969 },
} as const satisfies Record<string, TravelCoord>;

function leg(
  from: TravelCoord,
  to: TravelCoord,
  mode?: string,
): TripLeg {
  return mode ? { from, to, mode } : { from, to };
}

/** Sequential / multi-stop segments (great-circle miles summed for totals). */
export const TRIP_ROUTE_LEGS: TripLeg[] = [
  leg(SF, PLACES.london, "plane"),
  leg(PLACES.london, PLACES.vienna, "plane"),
  leg(PLACES.vienna, PLACES.salzburg, "train"),
  leg(PLACES.salzburg, PLACES.rome, "train"),
  leg(PLACES.rome, PLACES.amalfi, "train"),
  leg(PLACES.rome, PLACES.barcelona),
  leg(PLACES.barcelona, PLACES.dublin),
  leg(SF, PLACES.dublin, "plane"),
  leg(SF, PLACES.nice, "plane"),
  leg(PLACES.nice, PLACES.monaco, "car"),
  leg(SF, PLACES.cabo, "plane"),
  leg(SF, PLACES.sanJoseDelCabo, "plane"),
  leg(SF, PLACES.todosSantos, "plane"),
  leg(SF, PLACES.hanoi, "plane"),
  leg(PLACES.hanoi, PLACES.hoiAn, "plane"),
  leg(PLACES.hoiAn, PLACES.hcmc, "plane"),
  leg(SF, PLACES.seoul, "plane"),
  leg(PLACES.seoul, PLACES.kyoto, "plane"),
  leg(PLACES.kyoto, PLACES.hakone, "bullet train"),
  leg(PLACES.hakone, PLACES.tokyo, "train"),
  leg(SF, PLACES.seward, "plane"),
  leg(PLACES.seward, PLACES.homer, "car"),
  leg(PLACES.homer, PLACES.katmai, "seaplane"),
  leg(PLACES.seward, PLACES.glacierView, "car"),
  leg(SF, PLACES.bigIsland, "plane"),
  leg(SF, PLACES.bigIsland, "plane"),
];

/** SF → same city multiple times (visit counts). Costa Rica ×3 included here. */
export const REPEATED_SF_HUBS: { coord: TravelCoord; visits: number }[] = [
  { coord: PLACES.costaRica, visits: 3 },
  { coord: PLACES.nyc, visits: 4 },
  { coord: PLACES.nyeMt, visits: 3 },
  { coord: PLACES.batonRouge, visits: 5 },
  { coord: PLACES.nashville, visits: 2 },
  { coord: PLACES.austin, visits: 5 },
  { coord: PLACES.chicago, visits: 2 },
  { coord: PLACES.area51, visits: 1 },
  { coord: PLACES.lasVegas, visits: 1 },
  { coord: PLACES.grandCanyon, visits: 1 },
  { coord: PLACES.scottsdale, visits: 1 },
  { coord: PLACES.coeurDalene, visits: 1 },
  { coord: PLACES.jacksonWy, visits: 1 },
];

const EARTH_MI_PER_KM = 0.621371;

/** Mean Earth–Moon center distance (popular “to the Moon” ballpark), statute miles. */
export const MOON_DISTANCE_ONE_WAY_MI = 238_855;

/** Earth equatorial circumference, statute miles (WGS84-ish). */
export const EARTH_EQUATOR_CIRCUMFERENCE_MI = 24_901.461;

function isHomeCoord(lat: number, lng: number): boolean {
  return lat === HOME.lat && lng === HOME.lng;
}

/**
 * Split flat trip legs into journeys: each time a leg departs SF, a new journey starts.
 * Used to append a great-circle return to SF after the last stop of each journey.
 */
export function splitTripLegsIntoJourneys(legs: readonly TripLeg[]): TripLeg[][] {
  const journeys: TripLeg[][] = [];
  let current: TripLeg[] = [];
  for (const leg of legs) {
    if (isHomeCoord(leg.from.lat, leg.from.lng) && current.length > 0) {
      journeys.push(current);
      current = [];
    }
    current.push(leg);
  }
  if (current.length > 0) journeys.push(current);
  return journeys;
}

export function tripOutboundJourneyCount(): number {
  return splitTripLegsIntoJourneys(TRIP_ROUTE_LEGS).length;
}

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return r * c * EARTH_MI_PER_KM;
}

/**
 * Approximate total miles: outbound trip legs + great-circle return to SF per journey,
 * plus repeated domestic/international hub trips counted as round trips (2× outbound per visit).
 */
export function approximateTotalMiles(): number {
  let miles = 0;
  const journeys = splitTripLegsIntoJourneys(TRIP_ROUTE_LEGS);
  for (const journey of journeys) {
    for (const { from, to } of journey) {
      miles += haversineMiles(from.lat, from.lng, to.lat, to.lng);
    }
    const last = journey[journey.length - 1]?.to;
    if (last && !isHomeCoord(last.lat, last.lng)) {
      miles += haversineMiles(last.lat, last.lng, HOME.lat, HOME.lng);
    }
  }
  for (const { coord, visits } of REPEATED_SF_HUBS) {
    const oneWay = haversineMiles(HOME.lat, HOME.lng, coord.lat, coord.lng);
    miles += visits * 2 * oneWay;
  }
  return Math.round(miles);
}

const US_COAST_COAST_MI = 2_800;

/**
 * Short human-readable lines for a scrolling marquee (distance + trip stats).
 */
export function travelMarqueeLines(opts: {
  totalMiles: number;
  cities: number;
  countries: number;
  journeyCount: number;
}): readonly string[] {
  const { totalMiles, cities, countries, journeyCount } = opts;
  const moonPct = (totalMiles / MOON_DISTANCE_ONE_WAY_MI) * 100;
  const earthLaps = totalMiles / EARTH_EQUATOR_CIRCUMFERENCE_MI;
  const usSpans = totalMiles / US_COAST_COAST_MI;

  const round1 = (n: number) => (n >= 10 ? n.toFixed(0) : n.toFixed(1));

  return [
    `About ${moonPct.toFixed(1)}% of the one-way distance to the Moon (~239k mi)`,
    `Roughly ${round1(earthLaps)}× around Earth’s equator by great circle`,
    `About ${round1(usSpans)}× a USA coast-to-coast hop (~${US_COAST_COAST_MI.toLocaleString()} mi each)`,
    `${cities} pins · ${countries} countries · ${journeyCount} outbound trip bundles, each counted back to ${HOME.name}`,
  ] as const;
}

function dedupePoints(points: TravelCoord[]): TravelCoord[] {
  const seen = new Set<string>();
  const out: TravelCoord[] = [];
  for (const p of points) {
    const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

/** All visited endpoints for pins (excluding SF home). */
export function allVisitedCoords(): TravelCoord[] {
  const set = new Map<string, TravelCoord>();
  const add = (c: TravelCoord) => {
    if (c.lat === HOME.lat && c.lng === HOME.lng) return;
    const key = `${c.lat.toFixed(4)},${c.lng.toFixed(4)}`;
    if (!set.has(key)) set.set(key, c);
  };
  for (const leg of TRIP_ROUTE_LEGS) {
    add(leg.from);
    add(leg.to);
  }
  for (const { coord } of REPEATED_SF_HUBS) add(coord);
  add(HOME_MARKER_SLO);
  return dedupePoints([...set.values()]);
}

/** Hub-and-spoke: one arc per unique destination from SF. */
export function hubArcsFromHome(): {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  name: string;
  country: string;
}[] {
  const targets = allVisitedCoords();
  return targets.map((v) => ({
    startLat: HOME.lat,
    startLng: HOME.lng,
    endLat: v.lat,
    endLng: v.lng,
    name: v.name,
    country: v.country,
  }));
}

/** Sequential legs for “Trip routes” mode. */
export function tripRouteArcs(): {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  name: string;
  country: string;
  mode?: string;
}[] {
  return TRIP_ROUTE_LEGS.map((l) => ({
    startLat: l.from.lat,
    startLng: l.from.lng,
    endLat: l.to.lat,
    endLng: l.to.lng,
    name: `${l.from.name} → ${l.to.name}`,
    country: l.to.country,
    mode: l.mode,
  }));
}

export function uniqueCountries(): number {
  const countries = new Set<string>();
  for (const leg of TRIP_ROUTE_LEGS) {
    countries.add(leg.from.country);
    countries.add(leg.to.country);
  }
  for (const { coord } of REPEATED_SF_HUBS) countries.add(coord.country);
  countries.add(HOME_MARKER_SLO.country);
  return countries.size;
}

/** City count: unique pins (excludes SF; includes SLO marker). */
export function visitedCityCount(): number {
  return allVisitedCoords().length;
}

/**
 * @deprecated Use `allVisitedCoords()` or `visitedCityCount()` — kept for tests and gradual migration.
 */
export const VISITED: TravelPoint[] = (() => {
  const y = new Date().getFullYear();
  return allVisitedCoords().map((c) => ({
    ...c,
    year: y,
  }));
})();
