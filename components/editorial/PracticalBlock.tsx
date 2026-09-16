import type { PracticalItem, PracticalVariant } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { DigestRow } from "./DigestRow";
import { SectionMasthead } from "./SectionMasthead";

type Props = {
  items: PracticalItem[];
  locale: Locale;
  // The delivered block variant, which is the only thing that picks the
  // heading. "daily" carries one item, "friday-tools" carries four.
  variant: PracticalVariant;
};

/**
 * The practical block („k vyzkoušení"): the one thing from today's edition a
 * reader can go and try, or, on the Friday variant, three tools and a prompt.
 *
 * It is a peer section of Briefs and Watchlist and renders the same digest row,
 * so nothing new is introduced: mono kicker, sentence heading, index, title,
 * body, kind label. The row's summary clamp is the one thing turned off — a
 * prompt cut to two lines is a fragment, not a prompt.
 *
 * The heading comes from `variant` alone. Upstream decides it from the
 * edition's own date and a "daily" block on a Friday is the honest fallback
 * when only one usable thing was found, so this side never re-derives the
 * weekday. It also has no clock to do it with.
 */
export function PracticalBlock({ items, locale, variant }: Props) {
  if (!items?.length) return null;
  const t = dict(locale).article;
  const isFriday = variant === "friday-tools";
  const label = isFriday ? t.practicalFridayLabel : t.practicalLabel;
  const heading = isFriday ? t.practicalFridayHeading : t.practicalHeading;

  return (
    <section aria-label={label} className="digest" data-practical={variant}>
      <SectionMasthead kicker={label} heading={false} />
      <h2 className="digest__heading">{heading}</h2>
      <ol className="digest-list">
        {items.map((item, i) => (
          <DigestRow
            // Index, like Briefs: two items may legitimately cite one URL, and
            // the list is built once and never reordered.
            key={i}
            index={i + 1}
            title={item.title}
            summary={item.body}
            meta={t.practicalKinds[item.kind]}
            href={item.source_url}
            external
            clamp={false}
            locale={locale}
          />
        ))}
      </ol>
    </section>
  );
}
