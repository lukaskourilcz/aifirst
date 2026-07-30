import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { getArticle, listArticles } from "@/lib/content";
import { groupBy } from "@/lib/helpers/group";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { readingMinutes } from "@/lib/text";
import { localeAlternates } from "@/lib/i18n/metadata";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).archive;
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/archive") };
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).archive;
  const common = dict(locale).common;
  const lp = localePrefixer(locale);

  const all = await listArticles(locale);
  const entries = await Promise.all(all.map(async (summary) => {
    const article = await getArticle(summary.slug, locale);
    return { ...summary, reading: article ? readingMinutes(article.mdx) : null };
  }));
  const byYearMonth = groupBy(entries, (a) => a.date.slice(0, 7));

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      {[...byYearMonth.entries()].map(([month, issues]) => (
        <section key={month} className="archive-month">
          <p className="label archive-month__label">
            {month}
          </p>
          <ul className="archive-list">
            {issues.map((a) => (
              <li key={a.slug}>
                <Link className={a.heroPhoto ? "archive-card archive-card--with-media" : "archive-card"} href={lp(`/articles/${a.slug}`)}>
                  {a.heroPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="archive-card__media" src={a.heroPhoto} alt="" loading="lazy" decoding="async" />
                  ) : null}
                  <div className="archive-card__copy">
                    <div className="archive-card__meta label">
                      <time dateTime={a.date}>{a.date}</time>
                      <span>{a.type === "weekly" ? common.weekly : (locale === "cs" ? "denní" : "daily")}</span>
                      <span>{a.lang?.toUpperCase()}</span>
                      {a.reading ? <span>{a.reading} {common.minutesShort} {common.readMinutes}</span> : null}
                    </div>
                    <h2>{a.title}</h2>
                    {a.dek ? <p>{a.dek}</p> : null}
                    {a.tags?.length ? <div className="archive-card__topics">{a.tags.slice(0, 4).map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div> : null}
                  </div>
                  <div className="archive-card__signal">
                    <span>{a.signal_strength === undefined ? "—" : String(a.signal_strength).padStart(2, "0")}</span>
                    <small>{common.signal}</small>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {all.length === 0 && (
        <p className="route-empty-state">{t.empty}</p>
      )}
    </PageShell>
  );
}
