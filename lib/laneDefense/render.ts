import { ENEMY_KIND_LABEL, LANE_DEFENSE_PAD_T, type TowerTypeId } from "@/config/laneDefense";
import { towerTypeDef, type GameState } from "@/lib/laneDefense/sim";

export interface LaneRenderTheme {
  fg: string;
  fgMuted: string;
  accent: string;
  border: string;
  lane: string;
  canvasBg: string;
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

function drawTowerGlyph(
  ctx: CanvasRenderingContext2D,
  px: number,
  y: number,
  r: number,
  typeId: TowerTypeId,
  chessMode: boolean,
  ink: string,
): void {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = Math.max(1.2, r * 0.12);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (chessMode) {
    ctx.font = `${r * 1.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const sym =
      typeId === "discover" ? "\u2658"
      : typeId === "enable" ? "\u2657"
      : typeId === "automate" ? "\u2659"
      : "\u2655";
    ctx.fillText(sym, px, y);
    ctx.restore();
    return;
  }

  if (typeId === "discover") {
    const g = r * 0.45;
    ctx.beginPath();
    ctx.arc(px - g * 0.2, y - g * 0.15, g * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + g * 0.55, y + g * 0.55);
    ctx.lineTo(px + g * 1.25, y + g * 1.25);
    ctx.stroke();
  } else if (typeId === "enable") {
    const w = r * 0.9;
    const h = r * 0.75;
    ctx.strokeRect(px - w / 2, y - h / 2, w, h);
    ctx.beginPath();
    ctx.moveTo(px - w / 2, y - h * 0.05);
    ctx.lineTo(px + w / 2, y - h * 0.05);
    ctx.stroke();
  } else if (typeId === "automate") {
    const c = r * 0.35;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(px + Math.cos(a) * c, y + Math.sin(a) * c);
      ctx.lineTo(px + Math.cos(a) * (r * 0.95), y + Math.sin(a) * (r * 0.95));
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(px, y, c * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(px - r * 0.55, y + r * 0.15);
    ctx.bezierCurveTo(px - r * 0.2, y - r * 0.55, px + r * 0.2, y - r * 0.55, px + r * 0.55, y + r * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px - r * 0.35, y + r * 0.35);
    ctx.lineTo(px + r * 0.35, y + r * 0.35);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawLaneDefense(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  layout: LaneLayout,
  theme: LaneRenderTheme,
  opts: { reducedMotion: boolean; chessMode: boolean },
): void {
  const { width, height, padding } = layout;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = theme.canvasBg;
  ctx.fillRect(0, 0, width, height);

  const y = laneY(layout);
  const x0 = laneX(layout, 0);
  const x1 = laneX(layout, 1);

  ctx.strokeStyle = theme.lane;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();

  const baseR = Math.min(width, height) * 0.042;
  ctx.strokeStyle = theme.fg;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x1 + baseR * 0.32, y, baseR * 0.92, 0, Math.PI * 2);
  ctx.stroke();

  const mono =
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

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
      const rangePx = def.range * (layout.width - 2 * padding);
      ctx.fillStyle = theme.accent;
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.arc(px, y, rangePx, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      drawTowerGlyph(ctx, px, y, r, placed.typeId, opts.chessMode, theme.fg);
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

    const hpw = er * 2.4;
    ctx.fillStyle = theme.border;
    ctx.fillRect(ex - hpw / 2, y - er * 2.05, hpw, 3);
    ctx.fillStyle = theme.accent;
    ctx.fillRect(ex - hpw / 2, y - er * 2.05, hpw * Math.max(0, e.hp / e.maxHp), 3);

    ctx.font = `${Math.max(7, er * 2.2)}px ${mono}`;
    ctx.fillStyle = theme.fgMuted;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const label = ENEMY_KIND_LABEL[e.kind];
    const short = label.length > 14 ? `${label.slice(0, 12)}…` : label;
    ctx.fillText(short, ex, y + er * 1.15);
  }

  if (!opts.reducedMotion && state.phase === "combat") {
    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.05;
    ctx.lineWidth = 5;
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
