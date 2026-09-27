import { lessonOfTheDay } from "@/lib/lessons";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { WidgetModule } from "./RightRail";

/**
 * „Pojem dne": one term a day in the right rail, the term and its one-line
 * gloss, linking into the Slovník. Everything resolves at build time from the
 * lead edition's date, so there is no client boundary and no clock.
 */
export function DailyLesson({ dateKey, locale }: { dateKey: string | undefined; locale: Locale }) {
  const { entry } = lessonOfTheDay(dateKey);
  const t = dict(locale).daily;
  const lp = localePrefixer(locale);
  const text = locale === "cs" ? entry.cs : entry.en;

  return (
    <WidgetModule
      kicker={t.lessonKicker}
      headingId="daily-lesson-heading"
      action={{ href: lp("/lekce"), label: t.lessonLink }}
    >
      <p className="rail-module__body">
        <b className="rail-module__term">{entry.term}</b>
        <span>{text.short}</span>
      </p>
    </WidgetModule>
  );
}
