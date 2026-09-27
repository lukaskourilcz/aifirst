import type { Dispatch } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { DigestRow } from "./editorial/DigestRow";
import { SectionMasthead } from "./editorial/SectionMasthead";
import { topicLabel } from "@/lib/labels";

type Props = {
  items: Dispatch[];
  locale: Locale;
};

/**
 * Briefs („Krátce"), in the article aside. Both variants render the shared digest row, so a brief
 * looks the same here as it does on Today. A dispatch carries a body and
 * sometimes a topic; the row shows what the item has and nothing more.
 *
 * The row links to the dispatch's own source when it has one. Items without a
 * source_url are not links, because a row that goes nowhere is worse than a
 * row that is plainly text.
 */
export function Dispatches({ items, locale }: Props) {
  if (!items?.length) return null;
  const t = dict(locale).article;
  const shown = items.slice(0, 6);

  const rows = (
    <ol className="digest-list">
      {shown.map((d, i) =>
        d.source_url ? (
          <DigestRow
            key={i}
            index={i + 1}
            title={d.title}
            summary={d.body}
            meta={d.topic ? topicLabel(d.topic) ?? undefined : undefined}
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
              {d.topic && topicLabel(d.topic) ? <span className="digest-row__meta">{topicLabel(d.topic)}</span> : null}
            </span>
          </li>
        ),
      )}
    </ol>
  );

  return (
    <section aria-label={t.dispatchesLabel} className="digest digest--aside">
      <SectionMasthead kicker={t.dispatchesLabel} heading={false} />
      {rows}
    </section>
  );
}
