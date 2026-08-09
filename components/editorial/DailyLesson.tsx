import Link from "next/link";
import { lessonOfTheDay } from "@/lib/lessons";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

/**
 * One AI term a day, sitting inside the hero viewport above the masthead. The
 * strip is a single hairline-bounded row: the term, the one-line gloss, and a
 * link into the archive. Everything resolves at build time from the lead
 * edition's date, so there is no client boundary and no clock.
 */
export function DailyLesson({
  dateKey,
  locale,
  variant = "strip",
}: {
  dateKey: string | undefined;
  locale: Locale;
  /** "rail" renders inside the right-rail module frame instead of as a row. */
  variant?: "strip" | "rail";
}) {
  const { entry } = lessonOfTheDay(dateKey);
  const t = dict(locale).daily;
  const lp = localePrefixer(locale);
  const text = locale === "cs" ? entry.cs : entry.en;

  if (variant === "rail") {
    return (
      <section className="rail-module" aria-labelledby="daily-lesson-heading">
        <h2 id="daily-lesson-heading" className="rail-module__kicker">{t.lessonKicker}</h2>
        <p className="rail-module__body">
          <b className="rail-module__term">{entry.term}</b>
          <span>{text.short}</span>
        </p>
        <p className="rail-module__action">
          <Link href={lp("/lekce")}>{t.lessonLink}</Link>
        </p>
      </section>
    );
  }

  return (
    <aside className="daily-lesson" aria-labelledby="daily-lesson-heading">
      <h2 id="daily-lesson-heading" className="daily-lesson__kicker">
        {t.lessonKicker}
      </h2>
      <p className="daily-lesson__body">
        <b className="daily-lesson__term">{entry.term}</b>
        <span className="daily-lesson__short">{text.short}</span>
      </p>
      <Link href={lp("/lekce")} className="daily-lesson__link">
        {t.lessonLink}
      </Link>
    </aside>
  );
}
