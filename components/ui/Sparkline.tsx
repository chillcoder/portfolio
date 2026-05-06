"use client";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  fill?: boolean;
  className?: string;
}

export function Sparkline({
  values,
  width = 120,
  height = 32,
  strokeWidth = 1.5,
  color = "var(--tile-accent, var(--color-accent-primary))",
  fill = true,
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

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const areaPath = `M0,${height} L${points
    .split(" ")
    .join(" L")} L${width},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="trend sparkline"
    >
      {fill && (
        <path
          d={areaPath}
          fill={color}
          opacity={0.15}
          stroke="none"
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
