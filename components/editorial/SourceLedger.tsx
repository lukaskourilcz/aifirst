import Link from "next/link";
import type { SourceRef } from "@/lib/content";
import type { Source } from "@/lib/sources";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";
import { SectionMasthead } from "./SectionMasthead";
import { czechDisplayDate } from "@/lib/weeks";
import { classificationLabel, hostOf, sourceName } from "@/lib/labels";
import { czechPlural, decodeEntities, looksEnglish } from "@/lib/text";

// Feed hosts carry a `feeds.` or `rss.` prefix the article host does not.
function registryHost(source: Source): string {
  return hostOf(source.url).replace(/^(?:feeds|rss)\./, "");
}

/**
 * Whether a ledger row can be trusted to be what it says: a row that names a
 * registered, non-aggregator source must link to that source's own host
 * (UPSTREAM_REQUIREMENTS §4). Aggregators relay other hosts by design, and
 * registry entries without a URL (arXiv queries, Hacker News) cannot be
 * checked, so both pass.
 */
export function ledgerRowMatches(ref: SourceRef, registered: Source | undefined): boolean {
  if (!registered || registered.tags?.includes("aggregator")) return true;
  const expected = registryHost(registered);
  if (!expected) return true;
  const host = hostOf(ref.url);
  return host === expected || host.endsWith(`.${expected}`);
}

/**
 * „Zdroje tohoto článku" (#zdroje): a two-column numbered list. Each row is
 * the source's title, then publisher, date and the kind of source, with
 * „primární" in the completion colour. Curator notes and feed types are
 * production data and stay out.
 */
export function SourceLedger({
  sources,
  registry,
  locale,
}: {
  sources: SourceRef[];
  registry?: Source[];
  locale: Locale;
}) {
  const t = dict(locale).article;
  const registryById = new Map((registry ?? []).map((source) => [source.id, source]));
  const rows = sources.filter((source) => {
    const ok = ledgerRowMatches(source, registryById.get(source.source_id ?? source.id));
    if (!ok) console.warn(`[ledger] dropped ${source.url}: host does not match source_id ${source.source_id}`);
    return ok;
  });
  if (rows.length === 0) return null;

  return (
    <section className="source-ledger" id="zdroje" aria-labelledby="source-ledger-heading">
      <SectionMasthead
        id="source-ledger-heading"
        kicker={t.sourceLedger}
        note={`${czechPlural(rows.length, "zdroj", "zdroje", "zdrojů")}, u každého druh: primární (původce informace) nebo sekundární (zpravodajství a analýzy).`}
      />
      <ol className="ledger">
        {rows.map((source, index) => {
          const registered = registryById.get(source.source_id ?? source.id);
          const classification = source.classification ??
            (registered?.tags?.includes("primary-source") ? "primary" : undefined);
          const title = decodeEntities(source.title);
          const host = hostOf(source.url);
          const viaAggregator =
            registered?.tags?.includes("aggregator") && host !== "" && host !== hostOf(registered.url);
          const date = source.published_at ? czechDisplayDate(source.published_at.slice(0, 10)) : null;
          const name = registered ? sourceName(registered.id, registry ?? []) : source.publisher ?? host;
          return (
            <li key={`${source.id}-${source.url}`} className="ledger__row">
              <span className="meta ledger__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="ledger__copy">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="h-serif ledger__title"
                  {...(looksEnglish(title) ? { lang: "en" } : {})}
                >
                  {title}&nbsp;↗
                </a>
                <span className="meta ledger__meta">
                  {viaAggregator ? host : registered ? <Link href={localePath(locale, `/sources/${registered.id}`)}>{name}</Link> : name}
                  {date ? ` · ${date}` : null}
                  {viaAggregator && registered ? (
                    <> · {t.via} <Link href={localePath(locale, `/sources/${registered.id}`)}>{name}</Link></>
                  ) : null}
                  {" · "}
                  <span className={classification === "primary" ? "ledger__class ledger__class--primary" : "ledger__class"}>
                    {classificationLabel(classification)}
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
