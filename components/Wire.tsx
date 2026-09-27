import type { WireItem } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { DigestRow } from "./editorial/DigestRow";
import { SectionMasthead } from "./editorial/SectionMasthead";
import { sourceName } from "@/lib/labels";
import { loadSources } from "@/lib/sources";
import { looksEnglish } from "@/lib/text";

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
export async function Wire({ items, locale, variant = "default" }: Props) {
  if (!items?.length) return null;
  const registry = await loadSources();
  const isAside = variant === "aside";
  const heading = dict(locale).article.wireHeading;
  return (
    <section
      aria-label={heading}
      className={isAside ? "digest digest--aside" : "digest digest--wire"}
    >
      <SectionMasthead kicker={heading} heading={false} />
      <ol className="digest-list">
        {items.slice(0, isAside ? 6 : items.length).map((item, i) => (
          <DigestRow
            key={item.url}
            index={i + 1}
            title={item.title}
            titleLang={looksEnglish(item.title) ? "en" : undefined}
            meta={sourceName(item.source, registry, item.url) || undefined}
            href={item.url}
            external
            locale={locale}
          />
        ))}
      </ol>
    </section>
  );
}
