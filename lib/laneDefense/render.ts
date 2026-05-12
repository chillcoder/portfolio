import { LANE_DEFENSE_PAD_T } from "@/config/laneDefense";
import { towerTypeDef, type GameState } from "@/lib/laneDefense/sim";

export interface LaneRenderTheme {
  fg: string;
  fgMuted: string;
  accent: string;
  border: string;
  lane: string;
}

export interface LaneLayout {
  width: number;
  height: number;
  padding: number;
}

function laneX(layout: LaneLayout, t: number): number {
  const innerW = layout.width - 2 * layout.padding;
  return layout.padding + t * innerW;
}

function laneY(layout: LaneLayout): number {
  return layout.height * 0.52;
}

export function drawLaneDefense(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  layout: LaneLayout,
  theme: LaneRenderTheme,
  opts: { reducedMotion: boolean },
): void {
  const { width, height, padding } = layout;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = theme.fgMuted;
  ctx.globalAlpha = 0.06;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  const y = laneY(layout);
  const x0 = laneX(layout, 0);
  const x1 = laneX(layout, 1);

  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();

  ctx.strokeStyle = theme.lane;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();

  const baseR = Math.min(width, height) * 0.045;
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(x1 + baseR * 0.35, y, baseR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < LANE_DEFENSE_PAD_T.length; i++) {
    const t = LANE_DEFENSE_PAD_T[i]!;
    const px = laneX(layout, t);
    const placed = state.towers[i];
    const r = Math.min(width, height) * 0.028;

    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, y, r, 0, Math.PI * 2);
    ctx.stroke();

    if (placed) {
      const def = towerTypeDef(placed.typeId);
      ctx.fillStyle = theme.accent;
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(px, y, def.range * (layout.width - 2 * padding), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = theme.fg;
      ctx.beginPath();
      ctx.moveTo(px, y - r * 1.1);
      ctx.lineTo(px - r * 0.95, y + r * 0.75);
      ctx.lineTo(px + r * 0.95, y + r * 0.75);
      ctx.closePath();
      ctx.fill();
    }
  }

  for (const e of state.enemies) {
    const ex = laneX(layout, e.t);
    const er = Math.min(width, height) * 0.022;
    ctx.fillStyle = theme.fgMuted;
    ctx.beginPath();
    ctx.arc(ex, y, er, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    const hpw = er * 2.2;
    ctx.fillStyle = theme.border;
    ctx.fillRect(ex - hpw / 2, y - er * 1.8, hpw, 3);
    ctx.fillStyle = theme.accent;
    ctx.fillRect(ex - hpw / 2, y - er * 1.8, hpw * Math.max(0, e.hp / e.maxHp), 3);
  }

  if (!opts.reducedMotion && state.phase === "combat") {
    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

export function padIndexAtClient(
  layout: LaneLayout,
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
): number | null {
  const x = clientX - canvasRect.left;
  const y = clientY - canvasRect.top;
  const ly = laneY(layout);
  const hitR = Math.min(layout.width, layout.height) * 0.04;
  for (let i = 0; i < LANE_DEFENSE_PAD_T.length; i++) {
    const t = LANE_DEFENSE_PAD_T[i]!;
    const px = laneX(layout, t);
    const dx = x - px;
    const dy = y - ly;
    if (dx * dx + dy * dy <= hitR * hitR) return i;
  }
  return null;
}
