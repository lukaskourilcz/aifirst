import type { Dispatch } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { DigestRow } from "./editorial/DigestRow";
import { SectionMasthead } from "./editorial/SectionMasthead";

type Props = {
  items: Dispatch[];
  locale: Locale;
  // "default" — appears below the article body as a full-width list.
  // "aside"   — sticky rail beside the article column.
  variant?: "default" | "aside";
};

/**
 * Briefs („Ve zkratce"). Both variants render the shared digest row, so a brief
 * looks the same here as it does on Today. A dispatch carries a body and
 * sometimes a topic; the row shows what the item has and nothing more.
 *
 * The row links to the dispatch's own source when it has one. Items without a
 * source_url are not links, because a row that goes nowhere is worse than a
 * row that is plainly text.
 */
export function Dispatches({ items, locale, variant = "default" }: Props) {
  if (!items?.length) return null;
  const t = dict(locale).article;
  const isAside = variant === "aside";
  const shown = isAside ? items.slice(0, 6) : items;

  const rows = (
    <ol className="digest-list">
      {shown.map((d, i) =>
        d.source_url ? (
          <DigestRow
            key={i}
            index={i + 1}
            title={d.title}
            summary={d.body}
            meta={d.topic}
            href={d.source_url}
            external
            locale={locale}
          />
        ) : (
          <li key={i} className="digest-row digest-row--plain">
            <span aria-hidden className="digest-row__index">{String(i + 1).padStart(2, "0")}</span>
            <span className="digest-row__copy">
              <span className="digest-row__title">{d.title}</span>
              <span className="digest-row__summary">{d.body}</span>
              {d.topic ? <span className="digest-row__meta">{d.topic}</span> : null}
            </span>
          </li>
        ),
      )}
    </ol>
  );

  if (isAside) {
    return (
      <section aria-label={t.dispatchesLabel} className="digest digest--aside">
        <SectionMasthead kicker={t.dispatchesLabel} heading={false} />
        {rows}
      </section>
    );
  }

  return (
    <section aria-label={t.dispatchesLabel} className="digest">
      <SectionMasthead kicker={t.dispatchesLabel} heading={false} />
      <h2 className="digest__heading">{t.dispatchesHeading}</h2>
      {rows}
    </section>
  );
}
