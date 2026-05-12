import {
  LANE_DEFENSE_ECONOMY,
  LANE_DEFENSE_PAD_T,
  LANE_DEFENSE_TOWER_TYPES,
  LANE_DEFENSE_UNLOCKS,
  LANE_DEFENSE_WAVES,
  type TowerTypeId,
} from "@/config/laneDefense";

let nextEnemyId = 1;

export interface PlacedTower {
  padIndex: number;
  /** Lane position t in [0,1]. */
  t: number;
  typeId: TowerTypeId;
}

export interface Enemy {
  id: number;
  t: number;
  hp: number;
  maxHp: number;
  speed: number;
}

export type GamePhase = "idle" | "intermission" | "combat" | "won" | "lost";

export interface GameState {
  phase: GamePhase;
  /** Wave currently in combat or next to start (0-based). */
  waveIndex: number;
  gold: number;
  lives: number;
  towers: Partial<Record<number, PlacedTower>>;
  enemies: Enemy[];
  spawnRemaining: number;
  spawnCooldown: number;
  /** Waves cleared (0..WAVES.length). */
  wavesCleared: number;
  /** Unlock milestones already surfaced to UI. */
  unlocksShown: Set<number>;
  /** Pending unlock afterWaveCleared for UI (cleared when dismissed). */
  pendingUnlockAfterWave: number | null;
}

export function towerTypeDef(id: TowerTypeId) {
  const def = LANE_DEFENSE_TOWER_TYPES.find((t) => t.id === id);
  if (!def) throw new Error(`Unknown tower type: ${id}`);
  return def;
}

export function createInitialState(): GameState {
  nextEnemyId = 1;
  return {
    phase: "idle",
    waveIndex: 0,
    gold: LANE_DEFENSE_ECONOMY.startingGold,
    lives: LANE_DEFENSE_ECONOMY.startingLives,
    towers: {},
    enemies: [],
    spawnRemaining: 0,
    spawnCooldown: 0,
    wavesCleared: 0,
    unlocksShown: new Set(),
    pendingUnlockAfterWave: null,
  };
}

/** First start from tile idle, or full restart after win/loss. */
export function restartRun(state: GameState): void {
  state.phase = "intermission";
  state.waveIndex = 0;
  state.gold = LANE_DEFENSE_ECONOMY.startingGold;
  state.lives = LANE_DEFENSE_ECONOMY.startingLives;
  state.towers = {};
  state.enemies = [];
  state.spawnRemaining = 0;
  state.spawnCooldown = 0;
  state.wavesCleared = 0;
  state.unlocksShown = new Set();
  state.pendingUnlockAfterWave = null;
  nextEnemyId = 1;
}

/** Transition from idle to intermission so the player can place towers. */
export function beginRun(state: GameState): void {
  if (state.phase !== "idle") return;
  restartRun(state);
}

export function startNextWave(state: GameState): void {
  if (state.phase === "won" || state.phase === "lost") return;
  if (state.phase === "combat") return;
  if (state.waveIndex >= LANE_DEFENSE_WAVES.length) return;

  const w = LANE_DEFENSE_WAVES[state.waveIndex];
  if (!w) return;

  state.phase = "combat";
  state.spawnRemaining = w.enemyCount;
  state.spawnCooldown = 0.01;
}

function applyUnlockMilestone(state: GameState, clearedWave1Based: number): void {
  for (const u of LANE_DEFENSE_UNLOCKS) {
    if (u.afterWaveCleared !== clearedWave1Based) continue;
    if (state.unlocksShown.has(u.afterWaveCleared)) continue;
    state.unlocksShown.add(u.afterWaveCleared);
    state.pendingUnlockAfterWave = u.afterWaveCleared;
  }
}

function finishWave(state: GameState): void {
  const cleared1Based = state.waveIndex + 1;
  state.wavesCleared = cleared1Based;
  applyUnlockMilestone(state, cleared1Based);

  state.waveIndex += 1;
  state.phase = "intermission";
  state.spawnRemaining = 0;
  state.enemies = [];

  if (state.waveIndex >= LANE_DEFENSE_WAVES.length) {
    state.phase = "won";
  }
}

export function tryPlaceTower(state: GameState, padIndex: number, typeId: TowerTypeId): boolean {
  if (state.phase === "won" || state.phase === "lost") return false;
  if (state.phase === "combat") return false;
  if (padIndex < 0 || padIndex >= LANE_DEFENSE_PAD_T.length) return false;
  if (state.towers[padIndex]) return false;

  const def = towerTypeDef(typeId);
  if (state.gold < def.cost) return false;

  state.gold -= def.cost;
  const t = LANE_DEFENSE_PAD_T[padIndex];
  if (t === undefined) return false;
  state.towers[padIndex] = { padIndex, t, typeId };
  return true;
}

export function dismissPendingUnlock(state: GameState): void {
  state.pendingUnlockAfterWave = null;
}

function spawnEnemy(state: GameState): void {
  const w = LANE_DEFENSE_WAVES[state.waveIndex];
  if (!w) return;
  state.enemies.push({
    id: nextEnemyId++,
    t: 0,
    hp: w.enemyHp,
    maxHp: w.enemyHp,
    speed: w.enemySpeed,
  });
  state.spawnRemaining -= 1;
}

function effectiveSlowForEnemy(state: GameState, enemyT: number): number {
  let slow = 1;
  for (const tower of Object.values(state.towers)) {
    if (!tower) continue;
    const def = towerTypeDef(tower.typeId);
    if (def.slowFactor >= 1) continue;
    const dist = Math.abs(enemyT - tower.t);
    if (dist <= def.range) {
      slow = Math.min(slow, def.slowFactor);
    }
  }
  return slow;
}

function applyTowerDamage(state: GameState, dt: number): void {
  for (const tower of Object.values(state.towers)) {
    if (!tower) continue;
    const def = towerTypeDef(tower.typeId);

    let best: Enemy | null = null;
    let bestDist = Infinity;
    for (const e of state.enemies) {
      const dist = Math.abs(e.t - tower.t);
      if (dist > def.range) continue;
      if (dist < bestDist) {
        bestDist = dist;
        best = e;
      }
    }
    if (best) {
      best.hp -= def.dps * dt;
    }
  }
}

export function tick(state: GameState, dt: number): void {
  if (state.phase !== "combat") return;

  const w = LANE_DEFENSE_WAVES[state.waveIndex];
  if (!w) return;

  if (state.spawnRemaining > 0) {
    state.spawnCooldown -= dt;
    while (state.spawnCooldown <= 0 && state.spawnRemaining > 0) {
      spawnEnemy(state);
      state.spawnCooldown += w.spawnIntervalSec;
    }
  }

  for (const e of state.enemies) {
    const slow = effectiveSlowForEnemy(state, e.t);
    e.t += e.speed * slow * dt;
  }

  applyTowerDamage(state, dt);

  const survived: Enemy[] = [];
  for (const e of state.enemies) {
    if (e.hp <= 0) {
      state.gold += LANE_DEFENSE_ECONOMY.goldPerKill;
      continue;
    }
    if (e.t >= 1) {
      state.lives -= 1;
      continue;
    }
    survived.push(e);
  }
  state.enemies = survived;

  if (state.lives <= 0) {
    state.phase = "lost";
    state.enemies = [];
    return;
  }

  const waveDone = state.spawnRemaining <= 0 && state.enemies.length === 0;
  if (waveDone) {
    finishWave(state);
  }
}
