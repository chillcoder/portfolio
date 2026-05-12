import {
  ENEMY_KIND_STATS,
  LANE_DEFENSE_ECONOMY,
  LANE_DEFENSE_PAD_T,
  LANE_DEFENSE_TOWER_TYPES,
  LANE_DEFENSE_UNLOCKS,
  LANE_DEFENSE_WAVES,
  pickEnemyKind,
  type EnemyKind,
  type TowerTypeId,
} from "@/config/laneDefense";

let nextEnemyId = 1;

export interface PlacedTower {
  padIndex: number;
  /** Lane position t in [0,1]. */
  t: number;
  typeId: TowerTypeId;
  /** Seconds until next volley; <= 0 means ready. */
  cd: number;
}

export interface Enemy {
  id: number;
  t: number;
  hp: number;
  maxHp: number;
  speed: number;
  kind: EnemyKind;
}

export type GamePhase = "idle" | "intermission" | "combat" | "won" | "lost";

export interface GameState {
  phase: GamePhase;
  /** Quarter currently in combat or next to start (0-based). */
  waveIndex: number;
  gold: number;
  lives: number;
  towers: Partial<Record<number, PlacedTower>>;
  enemies: Enemy[];
  spawnRemaining: number;
  spawnCooldown: number;
  /** Quarters cleared (0..WAVES.length). */
  wavesCleared: number;
  unlocksShown: Set<number>;
  pendingUnlockAfterWave: number | null;
  /** Set when phase becomes lost; ARR string for UI. */
  churnArrDisplay: string | null;
}

export function towerTypeDef(id: TowerTypeId) {
  const def = LANE_DEFENSE_TOWER_TYPES.find((t) => t.id === id);
  if (!def) throw new Error(`Unknown tower type: ${id}`);
  return def;
}

function randomChurnArrDisplay(): string {
  const min = 200_000;
  const max = 1_200_000;
  const v = Math.floor(min + Math.random() * (max - min + 1));
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    const s = m >= 10 ? m.toFixed(1) : m.toFixed(2).replace(/\.?0+$/, "");
    return `$${s}M`;
  }
  const k = Math.round(v / 1000);
  return `$${k}K`;
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
    churnArrDisplay: null,
  };
}

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
  state.churnArrDisplay = null;
  nextEnemyId = 1;
}

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

function applyUnlockMilestone(state: GameState, clearedQuarter1Based: number): void {
  for (const u of LANE_DEFENSE_UNLOCKS) {
    if (u.afterWaveCleared !== clearedQuarter1Based) continue;
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
  state.towers[padIndex] = { padIndex, t, typeId, cd: 0 };
  return true;
}

export function dismissPendingUnlock(state: GameState): void {
  state.pendingUnlockAfterWave = null;
}

function spawnEnemy(state: GameState): void {
  const w = LANE_DEFENSE_WAVES[state.waveIndex];
  if (!w) return;
  const spawnIndex = w.enemyCount - state.spawnRemaining;
  const kind = pickEnemyKind(state.waveIndex, spawnIndex, w.enemyCount);
  const mul = ENEMY_KIND_STATS[kind];
  const hp = w.enemyHp * mul.hpMul;
  const speed = w.enemySpeed * mul.speedMul;
  state.enemies.push({
    id: nextEnemyId++,
    t: 0,
    hp,
    maxHp: hp,
    speed,
    kind,
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

function enemiesInRangeSorted(state: GameState, tower: PlacedTower): Enemy[] {
  const def = towerTypeDef(tower.typeId);
  const list: { e: Enemy; d: number }[] = [];
  for (const e of state.enemies) {
    const dist = Math.abs(e.t - tower.t);
    if (dist <= def.range) list.push({ e, d: dist });
  }
  list.sort((a, b) => a.d - b.d);
  return list.map((x) => x.e);
}

const MAX_VOLLEYS_PER_TOWER_PER_TICK = 12;

function applyTowerVolleys(state: GameState, dt: number): void {
  for (const tower of Object.values(state.towers)) {
    if (!tower) continue;
    const def = towerTypeDef(tower.typeId);
    tower.cd -= dt;
    let bursts = 0;
    while (tower.cd <= 0 && bursts < MAX_VOLLEYS_PER_TOWER_PER_TICK) {
      const targets = enemiesInRangeSorted(state, tower);
      if (targets.length === 0) {
        tower.cd = 0;
        break;
      }
      if (def.hitsAllInRange) {
        for (const e of targets) {
          e.hp -= def.damagePerShot;
        }
      } else {
        const e = targets[0];
        if (e) e.hp -= def.damagePerShot;
      }
      tower.cd += def.fireIntervalSec;
      bursts += 1;
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

  applyTowerVolleys(state, dt);

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
    state.churnArrDisplay = randomChurnArrDisplay();
    return;
  }

  const waveDone = state.spawnRemaining <= 0 && state.enemies.length === 0;
  if (waveDone) {
    finishWave(state);
  }
}
