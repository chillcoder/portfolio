import { ABOUT_FACTS, QUOTE } from "@/config/profile";

export type TowerTypeId = "automate" | "enable" | "discover" | "engage";

export interface TowerTypeDef {
  id: TowerTypeId;
  label: string;
  tooltip: string;
  cost: number;
  /** Lane distance (0–1) within which the tower can acquire targets. */
  range: number;
  /** Seconds between volleys when a target is available. */
  fireIntervalSec: number;
  /** Damage applied per volley (single target unless `hitsAllInRange`). */
  damagePerShot: number;
  /** If true, one volley damages every enemy in range. */
  hitsAllInRange: boolean;
  /** Multiplies enemy speed when in range (stacked as minimum). 1 = no slow. */
  slowFactor: number;
}

export const LANE_DEFENSE_PAD_T: readonly number[] = [0.14, 0.32, 0.5, 0.68, 0.86];

export const LANE_DEFENSE_TOWER_TYPES: readonly TowerTypeDef[] = [
  {
    id: "automate",
    label: "Automate",
    tooltip: "Compounding workflows. Cheap, fast, relentless.",
    cost: 55,
    range: 0.22,
    fireIntervalSec: 0.11,
    damagePerShot: 3.8,
    hitsAllInRange: false,
    slowFactor: 1,
  },
  {
    id: "enable",
    label: "Enable",
    tooltip: "Trains the customer to self-serve. High range, steady damage.",
    cost: 70,
    range: 0.5,
    fireIntervalSec: 0.26,
    damagePerShot: 12,
    hitsAllInRange: false,
    slowFactor: 0.72,
  },
  {
    id: "discover",
    label: "Discover",
    tooltip: "Surfaces churn signals before they escalate. Wide coverage, slow to fire.",
    cost: 85,
    range: 0.52,
    fireIntervalSec: 0.52,
    damagePerShot: 7,
    hitsAllInRange: true,
    slowFactor: 1,
  },
  {
    id: "engage",
    label: "Engage",
    tooltip: "Executive sponsor outreach. Expensive but decisive.",
    cost: 120,
    range: 0.36,
    fireIntervalSec: 0.88,
    damagePerShot: 78,
    hitsAllInRange: false,
    slowFactor: 1,
  },
] as const;

export type EnemyKind =
  | "stalled_poc"
  | "low_adoption"
  | "budget_freeze"
  | "exec_turnover"
  | "competitive_bakeoff"
  | "renewal_at_risk";

export const ENEMY_KIND_LABEL: Record<EnemyKind, string> = {
  stalled_poc: "Stalled POC",
  low_adoption: "Low adoption",
  budget_freeze: "Budget freeze",
  exec_turnover: "Exec turnover",
  competitive_bakeoff: "Competitive bake-off",
  renewal_at_risk: "Renewal at risk",
};

/** Multipliers applied to the wave's base HP and speed. */
export const ENEMY_KIND_STATS: Record<
  EnemyKind,
  { hpMul: number; speedMul: number }
> = {
  stalled_poc: { hpMul: 0.52, speedMul: 1.28 },
  low_adoption: { hpMul: 1, speedMul: 1 },
  budget_freeze: { hpMul: 1.75, speedMul: 0.62 },
  exec_turnover: { hpMul: 0.95, speedMul: 1.32 },
  competitive_bakeoff: { hpMul: 2.85, speedMul: 0.82 },
  renewal_at_risk: { hpMul: 3.6, speedMul: 0.72 },
};

export interface WaveDef {
  enemyCount: number;
  spawnIntervalSec: number;
  enemyHp: number;
  /** Progress along full lane per second at slowFactor 1, before kind speedMul. */
  enemySpeed: number;
}

/** Ten quarters; per-spawn kind chosen in sim from wave index + spawn index. */
export const LANE_DEFENSE_WAVES: readonly WaveDef[] = [
  { enemyCount: 8, spawnIntervalSec: 1.1, enemyHp: 28, enemySpeed: 0.055 },
  { enemyCount: 10, spawnIntervalSec: 1.0, enemyHp: 34, enemySpeed: 0.057 },
  { enemyCount: 11, spawnIntervalSec: 0.95, enemyHp: 40, enemySpeed: 0.059 },
  { enemyCount: 12, spawnIntervalSec: 0.9, enemyHp: 48, enemySpeed: 0.061 },
  { enemyCount: 13, spawnIntervalSec: 0.85, enemyHp: 56, enemySpeed: 0.063 },
  { enemyCount: 14, spawnIntervalSec: 0.82, enemyHp: 64, enemySpeed: 0.065 },
  { enemyCount: 15, spawnIntervalSec: 0.78, enemyHp: 74, enemySpeed: 0.067 },
  { enemyCount: 16, spawnIntervalSec: 0.75, enemyHp: 86, enemySpeed: 0.069 },
  { enemyCount: 17, spawnIntervalSec: 0.72, enemyHp: 98, enemySpeed: 0.071 },
  { enemyCount: 18, spawnIntervalSec: 0.68, enemyHp: 112, enemySpeed: 0.073 },
];

export const LANE_DEFENSE_ECONOMY = {
  startingGold: 210,
  startingLives: 10,
  goldPerKill: 12,
} as const;

export const QUARTER_NAMES: readonly string[] = [
  "Kickoff",
  "First QBR",
  "Adoption push",
  "Mid-year review",
  "Competitive threat",
  "Expansion conversation",
  "Stakeholder shuffle",
  "Pre-renewal audit",
  "Procurement enters chat",
  "Renewal day",
];

/** Pick enemy archetype for a spawn (0-based wave index, spawn index, total in wave). */
export function pickEnemyKind(waveIndex: number, spawnIndex: number, totalInWave: number): EnemyKind {
  const q = waveIndex + 1;
  const isLast = spawnIndex === totalInWave - 1;
  const isFirst = spawnIndex === 0;

  if (waveIndex === 9) {
    if (isFirst || isLast || spawnIndex === Math.floor(totalInWave / 2)) return "renewal_at_risk";
    if (spawnIndex % 4 === 1) return "budget_freeze";
    return spawnIndex % 2 === 0 ? "low_adoption" : "renewal_at_risk";
  }

  if (waveIndex === 8) {
    if (spawnIndex === Math.floor(totalInWave * 0.45)) return "competitive_bakeoff";
    if (spawnIndex % 5 === 0) return "exec_turnover";
    return spawnIndex % 3 === 0 ? "budget_freeze" : "low_adoption";
  }

  if (waveIndex === 4 && spawnIndex === Math.floor(totalInWave * 0.55)) {
    return "competitive_bakeoff";
  }

  if (waveIndex >= 3) {
    if (spawnIndex % 7 === 2) return "exec_turnover";
  }

  if (spawnIndex % 6 === 0) return "stalled_poc";
  if (spawnIndex % 6 === 3) return "budget_freeze";
  return "low_adoption";
}

/** 1-based quarter index after a quarter is fully cleared. */
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
