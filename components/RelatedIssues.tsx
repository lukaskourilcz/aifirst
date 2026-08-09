import Link from "next/link";
import type { ArticleSummary } from "@/lib/content";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function RelatedIssues({
  items,
  locale,
  variant = "block",
}: {
  items: ArticleSummary[];
  locale: Locale;
  /** "rail" is the compact numbered list used in the article right rail. */
  variant?: "block" | "rail";
}) {
  if (!items.length) return null;

  if (variant === "rail") {
    return (
      <ol className="rail-related">
        {items.slice(0, 3).map((a, i) => (
          <li key={a.slug}>
            <span aria-hidden className="rail-related__index">{String(i + 1).padStart(2, "0")}</span>
            <Link href={localePath(locale, `/articles/${a.slug}`)}>{a.title}</Link>
          </li>
        ))}
      </ol>
    );
  }

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
