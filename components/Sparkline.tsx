type Props = {
  data: number[];
  width?: number;
  height?: number;
  label?: string;
  compact?: boolean;
};

export function Sparkline({
  data,
  width = 320,
  height = 60,
  label,
  compact = false,
}: Props) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data);
  const step = width / Math.max(1, data.length - 1);
  const points = data
    .map((v, i) =>
      `${(i * step).toFixed(1)},${(height - (v / max) * (height - 4) - 2).toFixed(1)}`,
    )
    .join(" ");
  const last = data[data.length - 1] ?? 0;
  const lastX = (data.length - 1) * step;
  const lastY = height - (last / max) * (height - 4) - 2;

  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={label ?? "sparkline"}
        style={{
          width: "100%",
          height: "auto",
          maxWidth: width,
          display: "block",
        }}
      >
        <polyline
          fill="none"
          stroke="var(--color-blueprint-blue)"
          strokeWidth={compact ? 1.25 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle
          cx={lastX}
          cy={lastY}
          r={compact ? 2 : 3}
          fill="var(--color-blueprint-blue)"
        />
      </svg>
      {label && (
        <figcaption
          className="label"
          style={{ marginTop: 4, color: "var(--ink-dim)" }}
        >
          {label}
        </figcaption>
      )}
    </figure>
  );
}
