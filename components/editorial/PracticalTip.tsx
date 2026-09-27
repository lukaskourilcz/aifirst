import { hostOf } from "@/lib/labels";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { practicalTypeLabel, type PracticalBlock } from "@/lib/practical";
import { czechTypography } from "@/lib/typography";
import { czechLongDate } from "@/lib/weeks";
import { WidgetModule } from "./RightRail";

/**
 * „Prakticky": the edition's one actionable item (four on the Friday tools
 * issue), beside the term of the day. Server-rendered, no client code: a
 * prompt is plain selectable text, not a copy button. Absent renders nothing.
 */
export function PracticalTip({ practical, locale }: { practical: PracticalBlock | null; locale: Locale }) {
  if (!practical || practical.items.length === 0) return null;
  const t = dict(locale).daily;

  return (
    <WidgetModule
      kicker={practical.variant === "friday-tools" ? t.practicalFridayKicker : t.practicalKicker}
      headingId="practical-heading"
    >
      <ul className="rail-practical">
        {practical.items.map((item) => (
          <li key={item.title} className="rail-practical__item">
            <p className="rail-practical__type">{practicalTypeLabel(item.type)}</p>
            <p className="rail-module__body">
              <b className="rail-module__term">{czechTypography(item.title)}</b>
            </p>
            {/* A prompt is copied verbatim, so its text is shown as delivered. */}
            <p className={item.type === "prompt" ? "rail-practical__prompt" : "rail-module__body"}>
              {item.type === "prompt" ? item.text : czechTypography(item.text)}
            </p>
            {item.url || item.verified_at ? (
              <p className="rail-module__meta">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="rail-practical__link">
                    {hostOf(item.url) || t.practicalOpen} ↗<span className="sr-only"> {dict(locale).sections.opensInNewWindow}</span>
                  </a>
                ) : null}
                {item.url && item.verified_at ? " · " : null}
                {item.verified_at ? (
                  <>
                    {t.practicalVerified} <time dateTime={item.verified_at}>{czechLongDate(item.verified_at)}</time>
                  </>
                ) : null}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </WidgetModule>
  );
}
