type Props = {
  data: number[];
  width?: number;
  height?: number;
  label?: string;
};

export function Sparkline({ data, width = 320, height = 60, label }: Props) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data);
  const step = width / Math.max(1, data.length - 1);
  const points = data
    .map((v, i) => `${(i * step).toFixed(1)},${(height - (v / max) * (height - 4) - 2).toFixed(1)}`)
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
      >
        <defs>
          <linearGradient id="spark-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5cf0ff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#ff4fd8" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="url(#spark-grad)"
          strokeWidth={1.5}
          points={points}
        />
        <circle cx={lastX} cy={lastY} r={3} fill="#ff4fd8" />
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
