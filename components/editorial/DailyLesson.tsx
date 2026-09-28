import { lessonOfTheDay } from "@/lib/lessons";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { WidgetModule } from "./WidgetModule";

/**
 * „Pojem dne": one term a day in the right rail, the term and its one-line
 * gloss, linking into the Slovník. Everything resolves at build time from the
 * lead edition's date, so there is no client boundary and no clock.
 */
// „Teplota (temperature) – kolečko náhodnosti…": the gloss continues the
// sentence, so its first letter drops unless it starts an acronym (GPU, LLM).
function lowerFirst(text: string): string {
  const second = text.charAt(1);
  return second && second === second.toLocaleUpperCase("cs") && second !== second.toLocaleLowerCase("cs")
    ? text
    : text.charAt(0).toLocaleLowerCase("cs") + text.slice(1);
}

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
        <b className="rail-module__term">{entry.term}</b> – {lowerFirst(text.short)}.
      </p>
    </WidgetModule>
  );
}
