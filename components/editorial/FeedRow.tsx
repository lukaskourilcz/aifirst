import Link from "next/link";
import type { ArticleSummary } from "@/lib/content";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { czechNumericDate } from "@/lib/weeks";

const CATEGORY_LABELS: Record<string, string> = { "ai-models": "AI modely" };

/**
 * One edition in a feed. The whole row is a single link, so the thumbnail is
 * decorative and carries an empty alt.
 *
 * The kicker only exists for a categorised edition: an uncategorised row starts
 * at the headline with no reserved space, rather than showing a blank line
 * where a label would be.
 */
export function FeedRow({
  article,
  locale,
  readingMinutes,
}: {
  article: ArticleSummary;
  locale: Locale;
  readingMinutes?: number;
}) {
  const t = dict(locale).common;
  const category = article.categories?.[0];
  const kicker = category ? CATEGORY_LABELS[category] : undefined;

  return (
    <li className="feed-row">
      <Link href={localePath(locale, `/articles/${article.slug}`)} className="feed-row__link">
        <div className="feed-row__copy">
          {kicker ? <p className="feed-row__kicker">{kicker}</p> : null}
          <h3 className="feed-row__title">{article.title}</h3>
          {article.dek ? <p className="feed-row__dek">{article.dek}</p> : null}
          <p className="feed-row__meta">
            <time dateTime={article.date}>{czechNumericDate(article.date)}</time>
            {readingMinutes ? (
              <>
                <span aria-hidden> · </span>
                <span>{readingMinutes} {t.minutesShort} {t.readMinutes}</span>
              </>
            ) : null}
          </p>
        </div>
        {article.heroPhoto ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={article.heroPhoto}
            alt=""
            width={160}
            height={120}
            loading="lazy"
            decoding="async"
            className="feed-row__thumb"
          />
        ) : null}
      </Link>
    </li>
  );
}

export function FeedList({
  articles,
  locale,
  label,
}: {
  articles: ArticleSummary[];
  locale: Locale;
  label?: string;
}) {
  return (
    <ul className="feed-list" aria-label={label}>
      {articles.map((article) => (
        <FeedRow key={article.slug} article={article} locale={locale} />
      ))}
    </ul>
  );
}
