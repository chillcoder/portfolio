"use client";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  fill?: boolean;
  /** 0 = polyline (no smoothing), 1 = full Catmull-Rom. Defaults to 1. */
  smoothing?: number;
  className?: string;
}

/**
 * Builds a smoothed cubic Bezier path through the given points using a
 * Catmull-Rom spline. End segments mirror their neighbor so the curve does not
 * overshoot at the edges.
 */
function buildSmoothPath(points: { x: number; y: number }[], tension = 1): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
  }

  let d = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];

    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

export function Sparkline({
  values,
  width = 120,
  height = 32,
  strokeWidth = 1.5,
  color = "var(--tile-accent, var(--color-accent-primary))",
  fill = true,
  smoothing = 1,
  className,
}: SparklineProps) {
  if (!values?.length) {
    return (
      <div
        className={className}
        style={{ width, height, opacity: 0.25, background: "var(--color-border)" }}
      />
    );
  }

  // Inset the curve by half the stroke so it never clips the SVG box.
  const pad = Math.ceil(strokeWidth);
  const innerW = Math.max(1, width - pad * 2);
  const innerH = Math.max(1, height - pad * 2);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? innerW / (values.length - 1) : innerW;

  const points = values.map((v, i) => ({
    x: pad + i * stepX,
    y: pad + innerH - ((v - min) / range) * innerH,
  }));

  const linePath = buildSmoothPath(points, smoothing);
  const areaPath =
    `M${points[0].x.toFixed(2)},${height} ` +
    `L${points[0].x.toFixed(2)},${points[0].y.toFixed(2)} ` +
    linePath.replace(/^M[^ ]+ ?/, "") +
    ` L${points[points.length - 1].x.toFixed(2)},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="trend sparkline"
      shapeRendering="geometricPrecision"
    >
      {fill && <path d={areaPath} fill={color} opacity={0.15} stroke="none" />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
