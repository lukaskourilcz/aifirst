import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { isPublishingDay, listBoardContexts, type NoEditionBoardContext } from "@/lib/board";
import { listArticles } from "@/lib/content";
import { groupBy } from "@/lib/helpers/group";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { czechLongDate, czechMonthLabel } from "@/lib/weeks";
import { CoverCard } from "@/components/editorial/CoverCard";
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
  const lp = localePrefixer(locale);

  const [all, boardContexts] = await Promise.all([listArticles(locale), listBoardContexts()]);
  const entries = all.map((summary) => ({ kind: "article" as const, ...summary }));
  const publishedDates = new Set(all.map((article) => article.date));
  const noEditions = boardContexts
    .filter((context): context is NoEditionBoardContext =>
      context.status === "no_edition" && !publishedDates.has(context.date) && isPublishingDay(context.date))
    .map((context) => ({ kind: "no_edition" as const, ...context }));
  const byYearMonth = groupBy([...entries, ...noEditions].sort((a, b) => b.date.localeCompare(a.date)), (a) => a.date.slice(0, 7));

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      {[...byYearMonth.entries()].map(([month, issues]) => (
        <section key={month} className="archive-month">
          <p className="label archive-month__label">
            {czechMonthLabel(month)}
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
                      {a.type === "weekly" ? ` · ${t.weeklyMarker}` : null}
                      {a.lang === "en" ? ` · ${t.englishMarker}` : null}
                    </>
                  }
                  title={a.title}
                  titleLang={a.lang === "en" ? "en" : undefined}
                  dek={a.dek}
                  media={a.heroPhoto}
                  mediaWidth={140}
                  mediaHeight={105}
                />
              </li>
            ) : (
              // One quiet line. The reason, the code and the board room stay
              // with the operator; the reader only needs to know the day is empty.
              <li key={`no-edition-${a.date}`} className="archive-system-row">
                <p className="kicker"><time dateTime={a.date}>{czechLongDate(a.date)}</time> · {locale === "cs" ? "bez vydání" : "no edition"}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {all.length === 0 && noEditions.length === 0 && (
        <p className="empty-line">{t.empty}</p>
      )}
    </PageShell>
  );
}
