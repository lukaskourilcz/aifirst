import type { Metadata } from "next";
import Link from "next/link";
import { DayGroup } from "@/components/editorial/DayGroup";
import { SectionMasthead } from "@/components/editorial/SectionMasthead";
import { SECTIONS, SECTION_TO_TOPIC } from "@/lib/sections";
import { isPublishingDay, listBoardContexts, type NoEditionBoardContext } from "@/lib/board";
import { listArticles } from "@/lib/content";
import { groupBy } from "@/lib/helpers/group";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { czechMonthLabel } from "@/lib/weeks";
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
  // Month → day → articles; a weekday without an edition keeps its one line.
  const days = groupBy([...entries, ...noEditions].sort((a, b) => b.date.localeCompare(a.date)), (a) => a.date);
  const byMonth = groupBy([...days.entries()], ([date]) => date.slice(0, 7));

  return (
    <div className="list-page">
      <header className="list-head">
        <h1 className="list-head__title">{t.title}</h1>
        <p className="list-head__scope">{t.intro}</p>
      </header>

      {/* Part A: the section chips open the section pages; Part B turns them
          into static per-section archives. */}
      <nav className="archive-filter" aria-label={t.filterLabel}>
        <a className="control archive-filter__chip is-current" aria-current="page" href={lp("/archive")}>{t.filterAll}</a>
        {SECTIONS.map((section) => (
          <Link key={section.key} className="control archive-filter__chip" href={lp(`/topics/${SECTION_TO_TOPIC[section.key]}`)}>
            {section.label}
          </Link>
        ))}
      </nav>

      {[...byMonth.entries()].map(([month, monthDays]) => (
        <section key={month} className="archive-month" aria-labelledby={`month-${month}`}>
          <SectionMasthead id={`month-${month}`} kicker={czechMonthLabel(month)} />
          {monthDays.map(([date, items]) => {
            const articles = items.filter((item) => item.kind === "article");
            return (
              <DayGroup key={date} date={date} articles={articles} locale={locale} variant="archive" withYear={false}>
                {articles.length === 0 ? <p className="meta archive-empty-day">{t.noEdition}</p> : undefined}
              </DayGroup>
            );
          })}
        </section>
      ))}

      {all.length === 0 && noEditions.length === 0 && (
        <p className="empty-line">{t.empty}</p>
      )}
    </div>
  );
}
