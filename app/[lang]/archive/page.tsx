import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { listBoardContexts, type NoEditionBoardContext } from "@/lib/board";
import { getArticle, listArticles } from "@/lib/content";
import { groupBy } from "@/lib/helpers/group";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { czechLongDate } from "@/lib/weeks";
import { CoverCard } from "@/components/editorial/CoverCard";
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

  const [all, boardContexts] = await Promise.all([listArticles(locale), listBoardContexts()]);
  const entries = await Promise.all(all.map(async (summary) => {
    const article = await getArticle(summary.slug, locale);
    return { kind: "article" as const, ...summary, reading: article ? readingMinutes(article.mdx) : null };
  }));
  const publishedDates = new Set(all.map((article) => article.date));
  const noEditions = boardContexts
    .filter((context): context is NoEditionBoardContext => context.status === "no_edition" && !publishedDates.has(context.date))
    .map((context) => ({ kind: "no_edition" as const, ...context }));
  const byYearMonth = groupBy([...entries, ...noEditions].sort((a, b) => b.date.localeCompare(a.date)), (a) => a.date.slice(0, 7));

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      {[...byYearMonth.entries()].map(([month, issues]) => (
        <section key={month} className="archive-month">
          <p className="label archive-month__label">
            {month}
          </p>
          <ul className="archive-list">
            {issues.map((a) => a.kind === "article" ? (
              <li key={a.slug}>
                <CoverCard
                  layout="row"
                  headingLevel={2}
                  href={lp(`/articles/${a.slug}`)}
                  kicker={
                    <>
                      <time dateTime={a.date}>{czechLongDate(a.date)}</time>
                      <span aria-hidden> · </span>
                      <span>{a.type === "weekly" ? common.weekly : (locale === "cs" ? "denní" : "daily")}</span>
                      <span aria-hidden> · </span>
                      <span>{a.lang?.toUpperCase()}</span>
                      {a.reading ? (
                        <>
                          <span aria-hidden> · </span>
                          <span>{a.reading} {common.minutesShort} {common.readMinutes}</span>
                        </>
                      ) : null}
                    </>
                  }
                  title={a.title}
                  dek={a.dek}
                  media={a.heroPhoto}
                  mediaWidth={140}
                  mediaHeight={105}
                >
                  {a.tags?.length ? (
                    <span className="cover-card__topics">
                      {a.tags.slice(0, 4).map((tag) => <span className="chip" key={tag}>{tag}</span>)}
                    </span>
                  ) : null}
                </CoverCard>
              </li>
            ) : (
              <li key={`no-edition-${a.date}`} className="archive-system-row">
                <div>
                  <p className="label"><time dateTime={a.date}>{czechLongDate(a.date)}</time> · {locale === "cs" ? "systém" : "system"}</p>
                  <p>{locale === "cs" ? "Bez vydání" : "No edition"} — {a.noEditionReason || (locale === "cs" ? "pipeline vydání vynechala" : "the pipeline missed")}</p>
                </div>
                <a href={a.roomUrl} target="_blank" rel="noreferrer noopener">{locale === "cs" ? "Přečíst diskusi" : "Read the argument"} ↗</a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {all.length === 0 && noEditions.length === 0 && (
        <p className="route-empty-state">{t.empty}</p>
      )}
    </PageShell>
  );
}
