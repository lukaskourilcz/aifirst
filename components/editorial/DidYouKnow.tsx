import { factOfTheDay } from "@/lib/facts";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { WidgetModule } from "./RightRail";

/**
 * One verified AI fact a day, closing the reference blocks below the briefing.
 * Text is the design: no image, no chart, no decoration. The trailing mono line
 * carries the entry's own receipt — when it was checked and against what.
 */
export function DidYouKnow({
  dateKey,
  locale,
  variant = "block",
}: {
  dateKey: string | undefined;
  locale: Locale;
  /** "rail" renders inside the right-rail module frame instead of as a block. */
  variant?: "block" | "rail";
}) {
  const { entry } = factOfTheDay(dateKey);
  const t = dict(locale).daily;
  const text = locale === "cs" ? entry.cs : entry.en;

  if (variant === "rail") {
    return (
      <WidgetModule kicker={t.factKicker} headingId="did-you-know-heading">
        <p className="rail-module__body">{text.full}</p>
        <p className="rail-module__meta">
          {t.verified} <time dateTime={entry.verified}>{entry.verified}</time> · {entry.source}
        </p>
      </WidgetModule>
    );
  }

  return (
    <aside className="did-you-know" aria-labelledby="did-you-know-heading">
      <h2 id="did-you-know-heading" className="did-you-know__kicker">
        {t.factKicker}
      </h2>
      <p className="did-you-know__fact">{text.full}</p>
      <p className="did-you-know__meta">
        {t.verified} <time dateTime={entry.verified}>{entry.verified}</time> · {entry.source}
      </p>
    </aside>
  );
}
