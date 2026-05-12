import { describe, expect, it } from "vitest";
import { LANE_DEFENSE_ECONOMY, LANE_DEFENSE_WAVES } from "@/config/laneDefense";
import {
  beginRun,
  createInitialState,
  restartRun,
  startNextWave,
  tick,
  tryPlaceTower,
} from "@/lib/laneDefense/sim";

describe("laneDefense sim", () => {
  it("tryPlaceTower rejects occupied pad and insufficient gold", () => {
    const s = createInitialState();
    restartRun(s);
    expect(tryPlaceTower(s, 0, "automate")).toBe(true);
    expect(tryPlaceTower(s, 0, "enable")).toBe(false);
    s.gold = 0;
    expect(tryPlaceTower(s, 1, "automate")).toBe(false);
  });

  it("awards gold on kill and leaks reduce lives", () => {
    const s = createInitialState();
    restartRun(s);
    tryPlaceTower(s, 2, "discover");
    startNextWave(s);
    expect(s.phase).toBe("combat");

    const w = LANE_DEFENSE_WAVES[0]!;
    s.enemies = [{ id: 1, t: 0.5, hp: 1, maxHp: 1, speed: w.enemySpeed }];
    const goldBefore = s.gold;
    tick(s, 1 / 30);
    expect(s.gold).toBeGreaterThan(goldBefore);

    s.enemies = [{ id: 2, t: 0.99, hp: 999, maxHp: 999, speed: 10 }];
    const livesBefore = s.lives;
    tick(s, 0.5);
    expect(s.lives).toBeLessThan(livesBefore);
  });

  it("sets lost when lives reach zero", () => {
    const s = createInitialState();
    restartRun(s);
    startNextWave(s);
    s.lives = 1;
    s.spawnRemaining = 0;
    s.enemies = [{ id: 1, t: 0.99, hp: 999, maxHp: 999, speed: 50 }];
    tick(s, 1);
    expect(s.phase).toBe("lost");
  });

  it("advances wave when combat clears", () => {
    const s = createInitialState();
    restartRun(s);
    startNextWave(s);
    s.spawnRemaining = 0;
    s.enemies = [];
    tick(s, 0.016);
    expect(s.phase).toBe("intermission");
    expect(s.waveIndex).toBe(1);
    expect(s.wavesCleared).toBe(1);
  });

  it("wins after final wave", () => {
    const s = createInitialState();
    restartRun(s);
    s.waveIndex = LANE_DEFENSE_WAVES.length - 1;
    startNextWave(s);
    s.spawnRemaining = 0;
    s.enemies = [];
    tick(s, 0.016);
    expect(s.phase).toBe("won");
  });

  it("beginRun only from idle", () => {
    const s = createInitialState();
    expect(s.phase).toBe("idle");
    beginRun(s);
    expect(s.phase).toBe("intermission");
    beginRun(s);
    expect(s.phase).toBe("intermission");
  });

  it("restartRun resets economy", () => {
    const s = createInitialState();
    restartRun(s);
    s.gold = 0;
    restartRun(s);
    expect(s.gold).toBe(LANE_DEFENSE_ECONOMY.startingGold);
    expect(s.lives).toBe(LANE_DEFENSE_ECONOMY.startingLives);
  });
});
