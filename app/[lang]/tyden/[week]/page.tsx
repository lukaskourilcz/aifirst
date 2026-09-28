import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DayGroup } from "@/components/editorial/DayGroup";
import { ArchiveExhausted, WeekAction } from "@/components/editorial/WeekAction";
import { listArticles } from "@/lib/content";
import { LOCALES, type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { groupByDay, groupByWeek, weekTitle } from "@/lib/weeks";

export const dynamic = "force-static";
export const dynamicParams = false;

// One page per ISO week that actually has an edition. The chain walks
// backwards through these and stops at the oldest one.
export async function generateStaticParams() {
  const weeks = groupByWeek(await listArticles("cs"));
  return LOCALES.flatMap((lang) => weeks.map((week) => ({ lang, week: week.id })));
}

async function findWeek(locale: Locale, id: string) {
  const weeks = groupByWeek(await listArticles(locale));
  const index = weeks.findIndex((week) => week.id === id);
  return index === -1 ? null : { week: weeks[index]!, older: weeks[index + 1] ?? null };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; week: string }>;
}): Promise<Metadata> {
  const { lang, week: id } = await params;
  const found = await findWeek(lang, id);
  if (!found) return {};
  const title = weekTitle(found.week);
  return {
    title,
    description: dict(lang).sections.weekIntro,
    alternates: localeAlternates(lang, `/tyden/${id}`),
  };
}

export default async function WeekArchivePage({
  params,
}: {
  params: Promise<{ lang: Locale; week: string }>;
}) {
  const { lang: locale, week: id } = await params;
  const found = await findWeek(locale, id);
  if (!found) notFound();

  const t = dict(locale).sections;
  const lp = localePrefixer(locale);
  const days = groupByDay(found.week.articles);

  return (
    <div className="list-page">
      <header className="list-head">
        <h1 className="list-head__title">{weekTitle(found.week)}</h1>
        <p className="list-head__scope">{t.weekIntro}</p>
      </header>

      {days.map((day) => <DayGroup key={day.date} date={day.date} articles={day.articles} locale={locale} variant="week" />)}

      {/* The chain ends with a quiet line, not a disabled-looking control. */}
      {found.older ? (
        <WeekAction locale={locale} href={lp(`/tyden/${found.older.id}`)} kicker={t.previousWeek} label={weekTitle(found.older)} />
      ) : (
        <ArchiveExhausted locale={locale} />
      )}
    </div>
  );
}
