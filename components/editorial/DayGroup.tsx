import type { ReactNode } from "react";
import type { ArticleSummary } from "@/lib/content";
import { type Locale, localePath } from "@/lib/i18n/config";
import { sectionLabel, sectionOf } from "@/lib/sections";
import { czechPlural } from "@/lib/text";
import { czechWeekday } from "@/lib/weeks";
import { Card } from "./Card";

/** „1 článek · 4 krátce" for a day's articles. */
export function dayCounts(articles: ArticleSummary[]): string {
  const briefs = articles.reduce((total, article) => total + (article.briefCount ?? 0), 0);
  return [czechPlural(articles.length, "článek", "články", "článků"), briefs ? `${briefs} krátce` : null]
    .filter(Boolean)
    .join(" · ");
}

function shortDate(dateKey: string): string {
  const [, m, d] = dateKey.split("-").map(Number);
  return `${d}. ${m}.`;
}

/**
 * One publishing day on Poslední týden and in the Archive: a fixed 200 px date
 * column (weekday, date, counts) and the day's articles beside it. In the
 * week view the first article is a 280 px 3:2 row; in the archive every
 * article is a compact row with a 56 px square.
 */
export function DayGroup({
  date,
  articles,
  locale,
  variant,
  withYear = true,
  children,
}: {
  date: string;
  articles: ArticleSummary[];
  locale: Locale;
  variant: "week" | "archive";
  withYear?: boolean;
  /** Replaces the article list, e.g. the „bez vydání" line. */
  children?: ReactNode;
}) {
  const [y] = date.split("-");
  const label = (article: ArticleSummary) => {
    const section = sectionLabel(sectionOf(article.tags));
    const markers = [article.type === "weekly" ? "týdenní souhrn" : null, article.lang === "en" ? "anglicky" : null].filter(Boolean);
    if (!section && markers.length === 0) return null;
    return (
      <>
        {section ? <span className="label--section">{section}</span> : null}
        {markers.length ? `${section ? " · " : ""}${markers.join(" · ")}` : null}
      </>
    );
  };
  return (
    <section className={`day-group day-group--${variant}`} aria-labelledby={`day-${date}`}>
      <div className="day-group__date">
        <h2 id={`day-${date}`} className="label day-group__label">
          <time dateTime={date}>{czechWeekday(date)} {shortDate(date)}{withYear ? ` ${y}` : ""}</time>
        </h2>
        {articles.length ? <p className="meta day-group__count">{dayCounts(articles)}</p> : null}
      </div>
      <div className="day-group__items">
        {children ?? (
          <ul className="day-group__list">
            {articles.map((article, index) => (
              <li key={article.slug}>
                <Card
                  variant={variant === "week" && index === 0 ? "row" : "compact"}
                  wide={variant === "week"}
                  square={variant === "archive" ? 56 : 96}
                  href={localePath(locale, `/articles/${article.slug}`)}
                  title={article.title}
                  titleLang={article.lang === "en" ? "en" : undefined}
                  label={label(article)}
                  dek={variant === "week" ? article.dek : undefined}
                  image={article.heroPhoto}
                  date={article.date}
                  titleSize={variant === "week" && index === 0 ? 1 : 3}
                  labelAfter={variant === "archive"}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
