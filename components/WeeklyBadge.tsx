import Link from "next/link";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Props = {
  from: string;
  to: string;
  coveredSlugs: string[];
  titlesBySlug?: Map<string, string>;
  locale: Locale;
};

export function WeeklyBadge({
  from,
  to,
  coveredSlugs,
  titlesBySlug,
  locale,
}: Props) {
  const t = dict(locale).weekly;
  return (
    <aside
      style={{
        margin: "0 0 32px",
        padding: 16,
        border: "1px solid var(--color-fog)",
        borderLeft: "2px solid var(--color-blueprint-blue)",
        background: "var(--color-canvas)",
      }}
    >
      <p
        className="label"
        style={{ color: "var(--color-blueprint-blue)", marginBottom: 8 }}
      >
        {t.digest} · {from} → {to}
      </p>
      <p
        className="label"
        style={{ color: "var(--ink-muted)", marginBottom: 12 }}
      >
        {t.covering} {coveredSlugs.length} {t.dailyIssue}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {coveredSlugs.map((slug) => (
          <li
            key={slug}
            style={{
              padding: "4px 0",
              fontSize: "0.85rem",
            }}
          >
            <Link
              href={localePath(locale, `/articles/${slug}`)}
              style={{
                color: "var(--ink-primary)",
                borderBottom: "1px dashed var(--color-fog)",
              }}
            >
              {titlesBySlug?.get(slug) ?? slug}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
