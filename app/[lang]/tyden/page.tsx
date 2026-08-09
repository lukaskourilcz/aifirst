import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { FeedRow } from "@/components/editorial/FeedRow";
import { RightRail } from "@/components/editorial/RightRail";
import { ArchiveExhausted, WeekAction } from "@/components/editorial/WeekAction";
import { listArticles } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { loadEvents, splitByAnchor } from "@/lib/events";
import { czechNumericDate, czechWeekday, groupByDay, weekBeforeWindow, weekTitle, withinLastDays } from "@/lib/weeks";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).sections;
  return { title: t.weekTitle, description: t.weekIntro, alternates: localeAlternates(lang, "/tyden") };
}

export default async function WeekPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).sections;
  const lp = localePrefixer(locale);

  const articles = await listArticles(locale);
  // The anchor is the newest edition, never a clock, so the window is stable.
  const anchor = articles[0]?.date;
  const recent = anchor ? withinLastDays(articles, anchor, 7) : [];
  const days = groupByDay(recent);
  const { upcoming } = splitByAnchor(loadEvents(), anchor ?? "1970-01-01");
  const older = anchor ? weekBeforeWindow(articles, anchor) : null;

  return (
    <div className="page-with-rail">
      <div className="page-with-rail__main">
        <PageShell kicker={t.lastWeek} title={t.weekTitle} intro={t.weekIntro}>
          {days.length === 0 ? (
            <p className="empty-line">{t.talkedEmpty}</p>
          ) : (
            days.map((day) => (
              <section key={day.date} className="day-group">
                <h2 className="day-group__label">
                  {czechWeekday(day.date)}
                  <span aria-hidden> · </span>
                  <time dateTime={day.date}>{czechNumericDate(day.date)}</time>
                </h2>
                <ul className="feed-list">
                  {day.articles.map((article) => (
                    <FeedRow key={article.slug} article={article} locale={locale} />
                  ))}
                </ul>
              </section>
            ))
          )}

          {older ? (
            <WeekAction
              locale={locale}
              href={lp(`/tyden/${older.id}`)}
              kicker={t.previousWeek}
              label={weekTitle(older)}
            />
          ) : (
            <ArchiveExhausted locale={locale} />
          )}
        </PageShell>
      </div>
      <RightRail locale={locale} dateKey={anchor} events={upcoming} />
    </div>
  );
}
