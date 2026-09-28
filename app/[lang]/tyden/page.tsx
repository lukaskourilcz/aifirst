import type { Metadata } from "next";
import { DayGroup } from "@/components/editorial/DayGroup";
import { ArchiveExhausted, WeekAction } from "@/components/editorial/WeekAction";
import { listArticles } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { groupByDay, weekBeforeWindow, weekTitle, withinLastDays } from "@/lib/weeks";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).sections;
  return { title: t.lastWeek, description: t.weekIntro, alternates: localeAlternates(lang, "/tyden") };
}

// Every article of the last seven days, by the day it came out: a date column
// on the left, the day's articles on the right. No rail on list pages.
export default async function WeekPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).sections;
  const lp = localePrefixer(locale);

  const articles = await listArticles(locale);
  // The anchor is the newest edition, never a clock, so the window is stable.
  const anchor = articles[0]?.date;
  const days = groupByDay(anchor ? withinLastDays(articles, anchor, 7) : []);
  const older = anchor ? weekBeforeWindow(articles, anchor) : null;

  return (
    <div className="list-page">
      <header className="list-head">
        <h1 className="list-head__title">{t.lastWeek}</h1>
        <p className="list-head__scope">{t.weekIntro}</p>
      </header>

      {days.length === 0 ? (
        <p className="empty-line">{t.talkedEmpty}</p>
      ) : (
        days.map((day) => <DayGroup key={day.date} date={day.date} articles={day.articles} locale={locale} variant="week" />)
      )}

      {older ? (
        <WeekAction locale={locale} href={lp(`/tyden/${older.id}`)} kicker={t.previousWeek} label={weekTitle(older)} />
      ) : (
        <ArchiveExhausted locale={locale} />
      )}
    </div>
  );
}
