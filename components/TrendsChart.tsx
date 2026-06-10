import type { TrendsMatrix } from "@/lib/trends";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

const PALETTE = [
  "#5cf0ff",
  "#ff4fd8",
  "#ffb547",
  "#7ab7ff",
  "#a380ff",
  "#8aff9c",
  "#ff8da1",
  "#c1e667",
];

type Props = { matrix: TrendsMatrix; locale: Locale };

export function TrendsChart({ matrix, locale }: Props) {
  const { months, tags, cells, byMonthTotals } = matrix;
  if (months.length === 0 || tags.length === 0) {
    return (
      <p className="label" style={{ color: "var(--ink-dim)" }}>
        {dict(locale).trends.notEnoughData}
      </p>
    );
  }

  const maxTotal = Math.max(1, ...byMonthTotals);
  const width = 760;
  const height = 320;
  const padTop = 24;
  const padBottom = 36;
  const padLeft = 36;
  const padRight = 12;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const barW = Math.max(8, Math.min(56, plotW / months.length - 12));
  const gap = (plotW - barW * months.length) / Math.max(1, months.length);

  const colorFor = (tag: string) => {
    const idx = tags.indexOf(tag);
    return PALETTE[idx % PALETTE.length];
  };

  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="tag frequency by month"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* axis baseline */}
        <line
          x1={padLeft}
          x2={width - padRight}
          y1={height - padBottom + 0.5}
          y2={height - padBottom + 0.5}
          stroke="var(--hairline)"
        />
        {/* gridline at half height */}
        <line
          x1={padLeft}
          x2={width - padRight}
          y1={padTop + plotH / 2}
          y2={padTop + plotH / 2}
          stroke="var(--hairline)"
          strokeDasharray="2 4"
        />

        {months.map((month, mi) => {
          const x = padLeft + gap / 2 + mi * (barW + gap);
          let yCursor = height - padBottom;
          const segments: React.ReactNode[] = [];
          for (const tag of tags) {
            const cell = cells.find(
              (c) => c.tag === tag && c.month === month,
            );
            const count = cell?.count ?? 0;
            if (count === 0) continue;
            const segH = (count / maxTotal) * plotH;
            yCursor -= segH;
            segments.push(
              <rect
                key={`${tag}-${month}`}
                x={x}
                y={yCursor}
                width={barW}
                height={segH}
                fill={colorFor(tag)}
                opacity={0.85}
              >
                <title>
                  {tag} · {month} · {count}
                </title>
              </rect>,
            );
          }
          return (
            <g key={month}>
              {segments}
              <text
                x={x + barW / 2}
                y={height - padBottom + 18}
                textAnchor="middle"
                fontSize={10}
                fontFamily="var(--font-display)"
                fill="var(--ink-muted)"
                letterSpacing={1.2}
              >
                {month.replace("-", "·")}
              </text>
              <text
                x={x + barW / 2}
                y={yCursor - 6}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-display)"
                fill="var(--ink-primary)"
              >
                {byMonthTotals[mi]}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption
        style={{
          marginTop: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-display)",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: colorFor(tag),
              }}
            />
            #{tag}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
