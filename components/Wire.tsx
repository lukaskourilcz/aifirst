import type { WireItem } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { DigestRow } from "./editorial/DigestRow";

type Props = {
  items: WireItem[];
  locale: Locale;
  // "default" — full-width panel below the article body and on Radar.
  // "aside"   — compact list rendered beside the article column.
  variant?: "default" | "aside";
};

/**
 * Watchlist („Na radaru"). A wire item carries a title, a url and a source
 * label, so the row is index, title and source — there is no per-item summary
 * to show and none is invented.
 */
export function Wire({ items, locale, variant = "default" }: Props) {
  if (!items?.length) return null;
  const isAside = variant === "aside";
  const heading = dict(locale).article.wireHeading;
  return (
    <section
      aria-label={heading}
      className={isAside ? "digest digest--aside" : "digest digest--wire"}
    >
      <p className="digest__kicker">{heading}</p>
      <ol className="digest-list">
        {items.slice(0, isAside ? 6 : items.length).map((item, i) => (
          <DigestRow
            key={item.url}
            index={i + 1}
            title={item.title}
            meta={item.source}
            href={item.url}
            external
            locale={locale}
          />
        ))}
      </ol>
    </section>
  );
}
