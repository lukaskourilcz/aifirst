import Link from "next/link";
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
  locale,
}: Props) {
  const pct = Math.round(weight * 100);
  const t = dict(locale).sources;
  return (
    <article
      style={{
        position: "relative",
        padding: 20,
        border: "1px solid var(--hairline)",
        background: "var(--bg-deep)",
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
            color: "var(--accent-cyan)",
          }}
        >
          {String(pct).padStart(2, "0")}
        </span>
      </header>

      <div
        aria-label={`weight ${pct} of 100`}
        style={{
          height: 4,
          background: "var(--bg-elev)",
          border: "1px solid var(--hairline)",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta))",
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
              border: "1px solid var(--hairline)",
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
    </article>
  );
}
