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
    <aside className="weekly-badge">
      <p className="label label--accent">
        {t.digest} · {from} → {to}
      </p>
      <p className="label label--muted">
        {t.covering} {coveredSlugs.length} {t.dailyIssue}
      </p>
      <ul>
        {coveredSlugs.map((slug) => (
          <li key={slug}>
            <Link
              href={localePath(locale, `/articles/${slug}`)}
            >
              {titlesBySlug?.get(slug) ?? slug}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
