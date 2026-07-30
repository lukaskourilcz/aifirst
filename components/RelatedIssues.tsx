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
            <Link href={localePath(locale, `/articles/${a.slug}`)}>
              {a.heroPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.heroPhoto} alt="" loading="lazy" decoding="async" />
              ) : null}
              <span className="label">{a.date}</span>
              <strong>{a.title}</strong>
              {a.dek ? <span className="related-issues__dek">{a.dek}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
