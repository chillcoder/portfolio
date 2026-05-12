"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Tile } from "@/components/ui/Tile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import {
  LANE_DEFENSE_TOWER_TYPES,
  LANE_DEFENSE_UNLOCKS,
  LANE_DEFENSE_WAVES,
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

const SESSION_BEST_KEY = "laneDefense_bestWave";
const STEP = 1 / 60;
const LAYOUT_PADDING = 28;

function readBestWave(): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = window.sessionStorage.getItem(SESSION_BEST_KEY);
    const n = v ? parseInt(v, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeBestWave(wavesCleared: number): void {
  if (typeof window === "undefined") return;
  try {
    const prev = readBestWave();
    if (wavesCleared > prev) {
      window.sessionStorage.setItem(SESSION_BEST_KEY, String(wavesCleared));
    }
  } catch {
    /* ignore */
  }
}

function readTheme(el: HTMLElement): {
  fg: string;
  fgMuted: string;
  accent: string;
  border: string;
  lane: string;
} {
  const cs = getComputedStyle(el);
  const fg = cs.getPropertyValue("--color-fg").trim() || "#1a1a1a";
  const fgMuted = cs.getPropertyValue("--color-fg-muted").trim() || "#555";
  const accent = cs.getPropertyValue("--tile-accent").trim() || "#2563eb";
  const border = cs.getPropertyValue("--color-border").trim() || "rgba(0,0,0,0.12)";
  return {
    fg,
    fgMuted,
    accent,
    border,
    lane: accent,
  };
}

export function LaneDefenseTile({ span }: { span?: string }) {
  const reduced = useReducedMotion();
  const stateRef = useRef<GameState>(createInitialState());
  const [expanded, setExpanded] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [selectedType, setSelectedType] = useState<TowerTypeId>("automate");
  const [uiPhase, setUiPhase] = useState(stateRef.current.phase);
  const [bestWave, setBestWave] = useState(0);
  const [unlockAfterWave, setUnlockAfterWave] = useState<number | null>(null);

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

  const goldRef = useRef<HTMLSpanElement>(null);
  const livesRef = useRef<HTMLSpanElement>(null);
  const waveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);
  useEffect(() => {
    userPausedRef.current = userPaused;
  }, [userPaused]);

  useEffect(() => {
    setBestWave(readBestWave());
  }, []);

  const syncHudDom = useCallback((s: GameState) => {
    if (goldRef.current) goldRef.current.textContent = String(s.gold);
    if (livesRef.current) livesRef.current.textContent = String(s.lives);
    if (waveRef.current) {
      const cur = Math.min(s.waveIndex + 1, LANE_DEFENSE_WAVES.length);
      waveRef.current.textContent =
        s.phase === "won" ? "Complete" : s.phase === "lost" ? "—" : `${cur} / ${LANE_DEFENSE_WAVES.length}`;
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
    const theme = readTheme(host);
    drawLaneDefense(ctx, stateRef.current, layout, theme, { reducedMotion: reduced });
    syncHudDom(stateRef.current);
  }, [reduced, syncHudDom]);

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
        uiPhaseTrackRef.current = s.phase;
        setUiPhase(s.phase);
        if (s.phase === "won" || s.phase === "lost") {
          writeBestWave(s.wavesCleared);
          setBestWave(readBestWave());
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
  }, [expanded, paint]);

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
      aria-controls="lane-defense-panel"
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

  return (
    <Tile
      span={span}
      accent="secondary"
      eyebrow="Play"
      title="Lane defense"
      action={collapseToggle}
      className="min-h-0"
    >
      <div ref={themeHostRef} className="flex flex-col gap-3">
        {!expanded && (
          <p className="text-sm text-[var(--color-fg-muted)]">
            One lane, three build types—hold the line between risk and the base. Best wave cleared:{" "}
            <span className="font-mono text-[var(--color-fg)]">{bestWave}</span>.
          </p>
        )}

        {expanded && (
          <div id="lane-defense-panel" className="flex flex-col gap-3">
            <div
              className="flex flex-wrap items-center gap-3 text-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="font-mono text-[var(--color-fg-muted)]">
                Gold <span ref={goldRef} className="text-[var(--color-fg)]">{state.gold}</span>
              </span>
              <span className="font-mono text-[var(--color-fg-muted)]">
                Lives <span ref={livesRef} className="text-[var(--color-fg)]">{state.lives}</span>
              </span>
              <span className="font-mono text-[var(--color-fg-muted)]">
                Wave <span ref={waveRef} className="text-[var(--color-fg)]">—</span>
              </span>
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
                aria-label="Single-lane tower defense playfield. Enemies move left to right; you place towers on pads during breaks between waves."
                className="block h-full w-full touch-manipulation"
                onClick={handleCanvasClick}
              />
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Tower type">
              {LANE_DEFENSE_TOWER_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
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
                  <span className="font-mono text-[10px] text-[var(--color-fg-muted)]">{t.cost}g</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-[var(--color-fg-muted)]">
              Between waves, pick a tower type and tap a pad on the lane. Start each wave when ready.
            </p>

            <div className="flex flex-wrap gap-2">
              {state.phase === "idle" && (
                <button
                  type="button"
                  className="min-h-11 rounded-lg bg-[var(--tile-accent)] px-4 text-sm font-medium text-white"
                  onClick={() => {
                    beginRun(stateRef.current);
                    uiPhaseTrackRef.current = stateRef.current.phase;
                    setUiPhase(stateRef.current.phase);
                    lastUnlockShownRef.current = null;
                    paint();
                  }}
                >
                  Begin run
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
                  Start wave {state.waveIndex + 1}
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
                    uiPhaseTrackRef.current = stateRef.current.phase;
                    setUiPhase(stateRef.current.phase);
                    accRef.current = 0;
                    paint();
                  }}
                >
                  Restart run
                </button>
              )}
            </div>

            {(uiPhase === "won" || uiPhase === "lost") && (
              <p className="text-sm font-medium text-[var(--color-fg)]">
                {uiPhase === "won" ?
                  "You cleared all waves—thanks for playing."
                : "Base overrun—restart and try a different layout."}
              </p>
            )}
          </div>
        )}
      </div>
    </Tile>
  );
}
