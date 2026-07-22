import Link from "next/link";
import type { ArticleSummary } from "@/lib/content";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function RelatedIssues({
  items,
  locale,
}: {
  items: ArticleSummary[];
  locale: Locale;
}) {
  if (!items.length) return null;
  return (
    <section aria-label={dict(locale).article.related} className="related-issues">
      <p className="label related-issues__label">
        {dict(locale).article.related}
      </p>
      <ul>
        {items.map((a) => (
          <li key={a.slug}>
            <p className="label">{a.date}</p>
            <Link
              href={localePath(locale, `/articles/${a.slug}`)}
            >
              {a.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
