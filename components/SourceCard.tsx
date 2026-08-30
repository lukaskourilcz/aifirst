import { czechDisplayDate } from "@/lib/weeks";
import Link from "next/link";
import { Sparkline } from "./Sparkline";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import type { CSSProperties } from "react";

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

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1
    ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
    : (parts[0] ?? "").slice(0, 2);
  return letters.toLocaleUpperCase();
}

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
    <article className="source-card">
      <span className="source-card__monogram" aria-hidden>{monogram(name)}</span>
      <header className="source-card__header">
        <div>
          <p className="label source-card__type">
            {type}
          </p>
          <h3>
            <Link
              href={localePath(locale, `/sources/${encodeURIComponent(id)}`)}
            >
              {name}
            </Link>
          </h3>
          <p className="source-card__id">
            {id}
          </p>
        </div>
        <span className="source-card__weight">
          <small>{t.weight}</small>
          {String(pct).padStart(2, "0")}
        </span>
      </header>

      <div
        aria-label={locale === "cs" ? `váha ${pct} ze 100` : `weight ${pct} of 100`}
        className="source-card__bar"
      >
        <div style={{ "--source-weight": `${pct}%` } as CSSProperties} />
      </div>

      <ul className="source-card__tags">
        {tags.map((t) => (
          <li key={t} className="label">
            {t}
          </li>
        ))}
      </ul>

      <p className="label label--muted source-card__citation">
        {t.cited} {String(citations).padStart(2, "0")} ×
        {latestDate ? ` · ${t.last} ${czechDisplayDate(latestDate)}` : ` · ${t.never}`}
      </p>

      {cadence && cadence.some((n) => n > 0) && (
        <div className="source-card__cadence">
          <Sparkline data={cadence} width={240} height={28} compact />
        </div>
      )}
    </article>
  );
}
