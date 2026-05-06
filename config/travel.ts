/**
 * Travel data powering the GlobeTile.
 * Add or remove cities in VISITED below — the globe will draw arcs from HOME to each.
 */

export interface TravelPoint {
  name: string;
  country: string;
  lat: number;
  lng: number;
  year: number;
}

export const HOME: { name: string; lat: number; lng: number } = {
  name: "San Francisco",
  lat: 37.7749,
  lng: -122.4194,
};

export const VISITED: TravelPoint[] = [
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, year: 2024 },
  { name: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681, year: 2024 },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393, year: 2024 },
  { name: "Porto", country: "Portugal", lat: 41.1579, lng: -8.6291, year: 2024 },
  { name: "Reykjavík", country: "Iceland", lat: 64.1466, lng: -21.9426, year: 2023 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332, year: 2023 },
  { name: "Oaxaca", country: "Mexico", lat: 17.0732, lng: -96.7266, year: 2023 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, year: 2022 },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734, year: 2022 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, year: 2022 },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405, year: 2022 },
  { name: "Reykjanes", country: "Iceland", lat: 63.85, lng: -22.45, year: 2023 },
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.006, year: 2024 },
  { name: "Boulder", country: "USA", lat: 40.0149, lng: -105.2705, year: 2024 },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207, year: 2023 },
  { name: "Banff", country: "Canada", lat: 51.1784, lng: -115.5708, year: 2023 },
  { name: "Bali", country: "Indonesia", lat: -8.4095, lng: 115.1889, year: 2023 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816, year: 2022 },
  { name: "Patagonia", country: "Argentina", lat: -49.3, lng: -73.05, year: 2022 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, year: 2021 },
];

export function uniqueCountries(): number {
  return new Set(VISITED.map((v) => v.country)).size;
}
