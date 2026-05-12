"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Tile } from "@/components/ui/Tile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import {
  LANE_DEFENSE_TOWER_TYPES,
  LANE_DEFENSE_UNLOCKS,
  LANE_DEFENSE_WAVES,
  QUARTER_NAMES,
  type TowerTypeId,
} from "@/config/laneDefense";
import {
  beginRun,
  createInitialState,
  dismissPendingUnlock,
  restartRun,
  startNextWave,
  tick,
  tryPlaceTower,
  type GameState,
} from "@/lib/laneDefense/sim";
import { drawLaneDefense, padIndexAtClient, type LaneLayout } from "@/lib/laneDefense/render";

const SESSION_BEST_KEY = "renewalDefense_bestQuarter";
const STEP = 1 / 60;
const LAYOUT_PADDING = 28;

const KONAMI_KEYS = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

function readBestQuarter(): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = window.sessionStorage.getItem(SESSION_BEST_KEY);
    const n = v ? parseInt(v, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeBestQuarter(quartersCleared: number): void {
  if (typeof window === "undefined") return;
  try {
    const prev = readBestQuarter();
    if (quartersCleared > prev) {
      window.sessionStorage.setItem(SESSION_BEST_KEY, String(quartersCleared));
    }
  } catch {
    /* ignore */
  }
}

function readRenewalTheme(el: HTMLElement): {
  fg: string;
  fgMuted: string;
  accent: string;
  border: string;
  lane: string;
  canvasBg: string;
} {
  const cs = getComputedStyle(el);
  const fg = cs.getPropertyValue("--color-fg").trim() || "#1a1a1a";
  const fgMuted = cs.getPropertyValue("--color-fg-muted").trim() || "#555";
  const accent = cs.getPropertyValue("--color-accent-primary").trim() || "#ff5a1f";
  const border = cs.getPropertyValue("--color-border").trim() || "rgba(0,0,0,0.12)";
  const canvasBg = cs.getPropertyValue("--color-bg").trim() || "#f5f3ee";
  return {
    fg,
    fgMuted,
    accent,
    border,
    lane: fg,
    canvasBg,
  };
}

function countTowerTypes(state: GameState): Record<TowerTypeId, number> {
  const c: Record<TowerTypeId, number> = {
    automate: 0,
    enable: 0,
    discover: 0,
    engage: 0,
  };
  for (const t of Object.values(state.towers)) {
    if (t) c[t.typeId] += 1;
  }
  return c;
}

export function LaneDefenseTile({ span }: { span?: string }) {
  const reduced = useReducedMotion();
  const stateRef = useRef<GameState>(createInitialState());
  const [expanded, setExpanded] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [selectedType, setSelectedType] = useState<TowerTypeId>("automate");
  const [uiPhase, setUiPhase] = useState(stateRef.current.phase);
  const [bestQuarter, setBestQuarter] = useState(0);
  const [unlockAfterWave, setUnlockAfterWave] = useState<number | null>(null);
  const [chessMode, setChessMode] = useState(false);
  const [subtitleEaster, setSubtitleEaster] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const themeHostRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const accRef = useRef(0);
  const lastTsRef = useRef(0);
  const expandedRef = useRef(expanded);
  const userPausedRef = useRef(userPaused);
  const uiPhaseTrackRef = useRef(stateRef.current.phase);
  const lastUnlockShownRef = useRef<number | null>(null);
  const konamiIdx = useRef(0);
  const typeBuffer = useRef("");
  const automateOnlyWarned = useRef(false);
  const discoverEndToastSent = useRef(false);
  const titleHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const budgetRef = useRef<HTMLSpanElement>(null);
  const healthRef = useRef<HTMLSpanElement>(null);
  const quarterRef = useRef<HTMLSpanElement>(null);
  const quarterNameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);
  useEffect(() => {
    userPausedRef.current = userPaused;
  }, [userPaused]);

  useEffect(() => {
    setBestQuarter(readBestQuarter());
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 5200);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const want = KONAMI_KEYS[konamiIdx.current];
      const match =
        want === "b" || want === "a" ? e.key.toLowerCase() === want : e.key === want;
      if (match) {
        konamiIdx.current += 1;
        if (konamiIdx.current >= KONAMI_KEYS.length) {
          konamiIdx.current = 0;
          setChessMode(true);
        }
      } else {
        konamiIdx.current = e.key === KONAMI_KEYS[0] ? 1 : 0;
      }

      if (e.key.length === 1 && /[a-z']/i.test(e.key)) {
        typeBuffer.current = (typeBuffer.current + e.key.toLowerCase()).slice(-32);
        if (
          typeBuffer.current.includes("queen's gambit") ||
          typeBuffer.current.includes("queens gambit")
        ) {
          setChessMode(true);
          typeBuffer.current = "";
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const syncHudDom = useCallback((s: GameState) => {
    if (budgetRef.current) budgetRef.current.textContent = String(s.gold);
    if (healthRef.current) healthRef.current.textContent = String(s.lives);
    if (quarterRef.current) {
      const cur = Math.min(s.waveIndex + 1, LANE_DEFENSE_WAVES.length);
      quarterRef.current.textContent =
        s.phase === "won" ? "Q10 · closed" : s.phase === "lost" ? "—" : `Q${cur} / Q10`;
    }
    if (quarterNameRef.current) {
      if (s.phase === "won") quarterNameRef.current.textContent = QUARTER_NAMES[9] ?? "";
      else if (s.phase === "lost") quarterNameRef.current.textContent = "";
      else {
        const idx = Math.min(s.waveIndex, QUARTER_NAMES.length - 1);
        quarterNameRef.current.textContent = QUARTER_NAMES[idx] ?? "";
      }
    }
  }, []);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const host = themeHostRef.current;
    if (!canvas || !wrap || !host) return;

    const rect = wrap.getBoundingClientRect();
    const w = Math.max(200, Math.floor(rect.width));
    const h = Math.max(160, Math.floor(rect.height));
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const layout: LaneLayout = { width: w, height: h, padding: LAYOUT_PADDING };
    const theme = readRenewalTheme(host);
    drawLaneDefense(ctx, stateRef.current, layout, theme, {
      reducedMotion: reduced,
      chessMode,
    });
    syncHudDom(stateRef.current);
  }, [reduced, syncHudDom, chessMode]);

  useEffect(() => {
    if (!expanded) {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
      accRef.current = 0;
      return;
    }

    const loop = (ts: number) => {
      if (!expandedRef.current) return;

      const s = stateRef.current;
      if (!lastTsRef.current) lastTsRef.current = ts;
      let dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      dt = Math.min(dt, 0.12);

      const combatGo = s.phase === "combat" && !userPausedRef.current;
      if (combatGo) {
        accRef.current += dt;
        while (accRef.current >= STEP) {
          tick(s, STEP);
          accRef.current -= STEP;
        }
      }

      if (s.phase !== uiPhaseTrackRef.current) {
        const prev = uiPhaseTrackRef.current;
        uiPhaseTrackRef.current = s.phase;
        setUiPhase(s.phase);
        if (s.phase === "won" || s.phase === "lost") {
          writeBestQuarter(s.wavesCleared);
          setBestQuarter(readBestQuarter());
          const counts = countTowerTypes(s);
          if (counts.discover === 0 && !discoverEndToastSent.current) {
            discoverEndToastSent.current = true;
            showToast("Visibility first. Discover catches what dashboards miss.");
          }
        }
        if (prev === "combat" && s.phase === "intermission") {
          const counts = countTowerTypes(s);
          const total = counts.automate + counts.enable + counts.discover + counts.engage;
          if (total >= 3 && counts.automate === total && !automateOnlyWarned.current) {
            automateOnlyWarned.current = true;
            showToast("Automation without enablement = brittle. Try Enable.");
          }
        }
      }

      if (s.pendingUnlockAfterWave != null && lastUnlockShownRef.current !== s.pendingUnlockAfterWave) {
        lastUnlockShownRef.current = s.pendingUnlockAfterWave;
        setUnlockAfterWave(s.pendingUnlockAfterWave);
      }

      paint();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [expanded, paint, showToast]);

  useEffect(() => {
    if (!expanded) return;
    const ro = new ResizeObserver(() => paint());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [expanded, paint]);

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (s.phase !== "intermission") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const layout: LaneLayout = { width: w, height: h, padding: LAYOUT_PADDING };
    const pad = padIndexAtClient(layout, e.clientX, e.clientY, rect);
    if (pad === null) return;
    if (tryPlaceTower(s, pad, selectedType)) {
      const counts = countTowerTypes(s);
      const total = counts.automate + counts.enable + counts.discover + counts.engage;
      if (total >= 3 && counts.automate === total && !automateOnlyWarned.current) {
        automateOnlyWarned.current = true;
        showToast("Automation without enablement = brittle. Try Enable.");
      }
      paint();
    }
  };

  const dismissUnlock = () => {
    dismissPendingUnlock(stateRef.current);
    setUnlockAfterWave(null);
    lastUnlockShownRef.current = null;
    paint();
  };

  const unlockCopy =
    unlockAfterWave === null ?
      null
    : LANE_DEFENSE_UNLOCKS.find((u) => u.afterWaveCleared === unlockAfterWave) ?? null;

  const collapseToggle = (
    <button
      type="button"
      className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-tile)] text-[var(--color-fg)] transition hover:bg-[var(--color-tile-hover)]"
      aria-expanded={expanded}
      aria-controls="renewal-defense-panel"
      onClick={() => {
        setExpanded((v) => !v);
        if (expanded) setUserPaused(true);
        else setUserPaused(false);
      }}
    >
      <span className="sr-only">{expanded ? "Collapse game" : "Expand game"}</span>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={cn("transition-transform", expanded && "rotate-180")}
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );

  const state = stateRef.current;
  const loseCopy =
    state.churnArrDisplay ? `Account churned. -${state.churnArrDisplay} ARR.` : "Account churned.";

  return (
    <Tile
      span={span}
      accent="primary"
      eyebrow="Play"
      title={
        <span className="block">
          <span
            className="inline-block"
            onMouseEnter={() => {
              titleHoverTimer.current = setTimeout(() => setSubtitleEaster(true), 3000);
            }}
            onMouseLeave={() => {
              if (titleHoverTimer.current) clearTimeout(titleHoverTimer.current);
              titleHoverTimer.current = null;
              setSubtitleEaster(false);
            }}
          >
            Renewal defense
          </span>
          <span className="mt-1 block text-xs font-normal font-mono text-[var(--color-fg-muted)]">
            {subtitleEaster ?
              "Built in Cursor between QBRs."
            : "Defend the account. Ten quarters to renewal."}
          </span>
        </span>
      }
      action={collapseToggle}
      className="min-h-0"
    >
      <div ref={themeHostRef} className="relative flex flex-col gap-3 font-[family-name:var(--font-sans)]">
        {!expanded && (
          <p className="text-sm text-[var(--color-fg-muted)]">
            One lane, four motions—defend the account through ten quarters. Best quarter cleared{" "}
            <span className="font-mono text-[var(--color-fg)]">{bestQuarter}</span>.
          </p>
        )}

        {(!expanded || userPaused) && (
          <p className="text-[11px] leading-snug text-[var(--color-fg-muted)]">
            Yes, this is a real portfolio. Yes, I built a game about my job. Builder identity confirmed.
          </p>
        )}

        {toast && (
          <div
            role="status"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] px-3 py-2 font-mono text-[11px] text-[var(--color-fg)]"
          >
            {toast}
          </div>
        )}

        {expanded && (
          <div id="renewal-defense-panel" className="flex flex-col gap-3">
            <div
              className="flex flex-col gap-0.5 font-mono text-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-[var(--color-fg-muted)]">
                  Budget <span ref={budgetRef} className="text-[var(--color-fg)]">{state.gold}</span>
                </span>
                <span className="text-[var(--color-fg-muted)]">
                  Account health{" "}
                  <span ref={healthRef} className="text-[var(--color-fg)]">{state.lives}</span>
                </span>
                <span className="text-[var(--color-fg-muted)]">
                  Quarter <span ref={quarterRef} className="text-[var(--color-fg)]">—</span>
                </span>
              </div>
              <span ref={quarterNameRef} className="text-[11px] text-[var(--color-fg-muted)]" />
            </div>

            {unlockCopy && (
              <div
                role="status"
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)] p-4 text-sm"
              >
                <p className="font-medium text-[var(--color-fg)]">{unlockCopy.title}</p>
                <p className="mt-1 text-[var(--color-fg-muted)]">{unlockCopy.body}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href="#about"
                    className="inline-flex min-h-11 items-center rounded-lg bg-[var(--tile-accent)] px-4 text-sm font-medium text-white"
                  >
                    Jump to About
                  </a>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center rounded-lg border border-[var(--color-border)] px-4 text-sm text-[var(--color-fg)]"
                    onClick={dismissUnlock}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            <div
              ref={wrapRef}
              className="relative aspect-video w-full max-h-[min(50vh,420px)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]"
            >
              <canvas
                ref={canvasRef}
                role="img"
                aria-label="Renewal defense: risk moves along a single lane toward the account; deploy motions on pads between quarters."
                className="block h-full w-full touch-manipulation"
                onClick={handleCanvasClick}
              />
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="CS motion">
              {LANE_DEFENSE_TOWER_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  title={t.tooltip}
                  disabled={
                    state.phase === "combat" || state.phase === "idle" || state.phase === "won" || state.phase === "lost"
                  }
                  onClick={() => setSelectedType(t.id)}
                  className={cn(
                    "min-h-11 min-w-[5.5rem] rounded-lg border px-3 text-left text-xs transition",
                    selectedType === t.id ?
                      "border-[var(--tile-accent)] bg-[var(--color-tile-hover)] text-[var(--color-fg)]"
                    : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
                    (state.phase === "combat" || state.phase === "idle" || state.phase === "won" || state.phase === "lost") &&
                      "opacity-50",
                  )}
                >
                  <span className="block font-medium text-[var(--color-fg)]">{t.label}</span>
                  <span className="font-mono text-[10px] text-[var(--color-fg-muted)]">{t.cost} budget</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-[var(--color-fg-muted)]">
              Between quarters, deploy a CS motion on the lane. Start each quarter when ready.
            </p>

            <div className="flex flex-wrap gap-2">
              {state.phase === "idle" && (
                <button
                  type="button"
                  className="min-h-11 rounded-lg bg-[var(--tile-accent)] px-4 text-sm font-medium text-white"
                  onClick={() => {
                    automateOnlyWarned.current = false;
                    discoverEndToastSent.current = false;
                    beginRun(stateRef.current);
                    uiPhaseTrackRef.current = stateRef.current.phase;
                    setUiPhase(stateRef.current.phase);
                    lastUnlockShownRef.current = null;
                    paint();
                  }}
                >
                  Begin renewal
                </button>
              )}

              {state.phase === "intermission" && state.waveIndex < LANE_DEFENSE_WAVES.length && (
                <button
                  type="button"
                  className="min-h-11 rounded-lg bg-[var(--tile-accent)] px-4 text-sm font-medium text-white"
                  onClick={() => {
                    startNextWave(stateRef.current);
                    uiPhaseTrackRef.current = stateRef.current.phase;
                    setUiPhase(stateRef.current.phase);
                    setUserPaused(false);
                    accRef.current = 0;
                    paint();
                  }}
                >
                  Start Q{state.waveIndex + 1}
                </button>
              )}

              {state.phase === "combat" && (
                <button
                  type="button"
                  className="min-h-11 rounded-lg border border-[var(--color-border)] px-4 text-sm text-[var(--color-fg)]"
                  onClick={() => setUserPaused((p) => !p)}
                >
                  {userPaused ? "Resume" : "Pause"}
                </button>
              )}

              {(state.phase === "won" || state.phase === "lost" || state.phase === "intermission" || state.phase === "combat") && (
                <button
                  type="button"
                  className="min-h-11 rounded-lg border border-[var(--color-border)] px-4 text-sm text-[var(--color-fg)]"
                  onClick={() => {
                    restartRun(stateRef.current);
                    setUserPaused(false);
                    setUnlockAfterWave(null);
                    lastUnlockShownRef.current = null;
                    automateOnlyWarned.current = false;
                    discoverEndToastSent.current = false;
                    uiPhaseTrackRef.current = stateRef.current.phase;
                    setUiPhase(stateRef.current.phase);
                    accRef.current = 0;
                    paint();
                  }}
                >
                  New account
                </button>
              )}
            </div>

            {(uiPhase === "won" || uiPhase === "lost") && (
              <p className="text-sm font-medium text-[var(--color-fg)]">
                {uiPhase === "won" ?
                  "Renewed and expanded. +115% NRR."
                : loseCopy}
              </p>
            )}
          </div>
        )}
      </div>
    </Tile>
  );
}
