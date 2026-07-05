import Link from "next/link";
import { Sparkline } from "./Sparkline";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Props = {
  id: string;
  name: string;
  type: string;
  weight: number;
  tags?: string[];
  citations?: number;
  latestDate?: string | null;
  cadence?: number[];
  locale: Locale;
};

export function SourceCard({
  id,
  name,
  type,
  weight,
  tags = [],
  citations = 0,
  latestDate,
  cadence,
  locale,
}: Props) {
  const pct = Math.round(weight * 100);
  const t = dict(locale).sources;
  return (
    <article
      style={{
        position: "relative",
        padding: 20,
        border: "1px solid var(--color-fog)",
        background: "var(--color-canvas)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 12,
          gap: 12,
        }}
      >
        <div>
          <p className="label" style={{ marginBottom: 4 }}>
            {type}
          </p>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            <Link
              href={localePath(locale, `/sources/${encodeURIComponent(id)}`)}
              style={{ color: "var(--ink-primary)", borderBottom: "none" }}
            >
              {name}
            </Link>
          </h3>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              color: "var(--ink-dim)",
              margin: "4px 0 0",
            }}
          >
            {id}
          </p>
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            color: "var(--color-blueprint-blue)",
          }}
        >
          {String(pct).padStart(2, "0")}
        </span>
      </header>

      <div
        aria-label={`weight ${pct} of 100`}
        style={{
          height: 4,
          background: "var(--color-paper)",
          border: "1px solid var(--color-fog)",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, var(--color-blueprint-blue), var(--color-blueprint-blue))",
            boxShadow: "0 0 8px rgba(92, 240, 255, 0.45)",
          }}
        />
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {tags.map((t) => (
          <li
            key={t}
            className="label"
            style={{
              padding: "2px 8px",
              border: "1px solid var(--color-fog)",
              color: "var(--ink-muted)",
            }}
          >
            {t}
          </li>
        ))}
      </ul>

      <p
        className="label"
        style={{ margin: 0, color: "var(--ink-dim)" }}
      >
        {t.cited} {String(citations).padStart(2, "0")} ×
        {latestDate ? ` · ${t.last} ${latestDate}` : ` · ${t.never}`}
      </p>

      {cadence && cadence.some((n) => n > 0) && (
        <div style={{ marginTop: 12, opacity: 0.9 }}>
          <Sparkline data={cadence} width={240} height={28} compact />
        </div>
      )}
    </article>
  );
}
