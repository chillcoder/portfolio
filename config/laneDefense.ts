import { ABOUT_FACTS, QUOTE } from "@/config/profile";

export type TowerTypeId = "automate" | "enable" | "discover";

export interface TowerTypeDef {
  id: TowerTypeId;
  label: string;
  blurb: string;
  cost: number;
  /** Lane distance (0–1) within which the tower can target enemies. */
  range: number;
  /** Damage per second applied to one target in range. */
  dps: number;
  /** Multiplies enemy speed when in range (stacked as minimum). 1 = no slow. */
  slowFactor: number;
}

export const LANE_DEFENSE_PAD_T: readonly number[] = [0.14, 0.32, 0.5, 0.68, 0.86];

export const LANE_DEFENSE_TOWER_TYPES: readonly TowerTypeDef[] = [
  {
    id: "automate",
    label: "Automate",
    blurb: "Steady throughput—internal tooling energy.",
    cost: 55,
    range: 0.34,
    dps: 22,
    slowFactor: 1,
  },
  {
    id: "enable",
    label: "Enable",
    blurb: "Slows risk so the org can respond.",
    cost: 70,
    range: 0.42,
    dps: 12,
    slowFactor: 0.72,
  },
  {
    id: "discover",
    label: "Discover",
    blurb: "High discovery damage—technical depth.",
    cost: 85,
    range: 0.28,
    dps: 32,
    slowFactor: 1,
  },
] as const;

export interface WaveDef {
  enemyCount: number;
  spawnIntervalSec: number;
  enemyHp: number;
  /** Progress along full lane per second at slowFactor 1. */
  enemySpeed: number;
}

/** Ten waves tuned for roughly 3–5 minute runs with five pads and three tower types. */
export const LANE_DEFENSE_WAVES: readonly WaveDef[] = [
  { enemyCount: 8, spawnIntervalSec: 1.1, enemyHp: 28, enemySpeed: 0.055 },
  { enemyCount: 10, spawnIntervalSec: 1.0, enemyHp: 36, enemySpeed: 0.058 },
  { enemyCount: 11, spawnIntervalSec: 0.95, enemyHp: 44, enemySpeed: 0.06 },
  { enemyCount: 12, spawnIntervalSec: 0.9, enemyHp: 52, enemySpeed: 0.062 },
  { enemyCount: 13, spawnIntervalSec: 0.85, enemyHp: 60, enemySpeed: 0.064 },
  { enemyCount: 14, spawnIntervalSec: 0.82, enemyHp: 70, enemySpeed: 0.066 },
  { enemyCount: 15, spawnIntervalSec: 0.78, enemyHp: 82, enemySpeed: 0.068 },
  { enemyCount: 16, spawnIntervalSec: 0.75, enemyHp: 95, enemySpeed: 0.07 },
  { enemyCount: 17, spawnIntervalSec: 0.72, enemyHp: 108, enemySpeed: 0.072 },
  { enemyCount: 18, spawnIntervalSec: 0.68, enemyHp: 120, enemySpeed: 0.074 },
];

export const LANE_DEFENSE_ECONOMY = {
  startingGold: 210,
  startingLives: 10,
  goldPerKill: 12,
} as const;

/** 1-based wave index after a wave is fully cleared. */
export const LANE_DEFENSE_UNLOCKS: readonly {
  afterWaveCleared: number;
  title: string;
  body: string;
}[] = [
  {
    afterWaveCleared: 3,
    title: ABOUT_FACTS[0]!.label,
    body: ABOUT_FACTS[0]!.value,
  },
  {
    afterWaveCleared: 6,
    title: ABOUT_FACTS[1]!.label,
    body: ABOUT_FACTS[1]!.value,
  },
  {
    afterWaveCleared: 9,
    title: "How I work",
    body: `“${QUOTE.text}” ${QUOTE.attribution}`,
  },
  {
    afterWaveCleared: 10,
    title: "Earlier & education",
    body: `${ABOUT_FACTS[2]!.value} ${ABOUT_FACTS[3]!.value}`,
  },
];
