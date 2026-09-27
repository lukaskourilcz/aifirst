import Link from "next/link";
import type { SourceRef } from "@/lib/content";
import type { Source } from "@/lib/sources";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";
import { SectionMasthead } from "./SectionMasthead";
import { czechDisplayDate } from "@/lib/weeks";
import { classificationLabel, hostOf, sourceName } from "@/lib/labels";
import { decodeEntities, looksEnglish } from "@/lib/text";

/**
 * Three columns: number, the source (title, then publisher and date) and the
 * evidence class. Curator notes and feed types are production data and stay
 * out of the reader's table.
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
  if (sources.length === 0) return null;
  const t = dict(locale).article;
  const registryById = new Map((registry ?? []).map((source) => [source.id, source]));

  return (
    <section className="source-ledger" aria-labelledby="source-ledger-heading">
      <SectionMasthead id="source-ledger-heading" kicker={t.sourceLedger} />
      <div className="table-scroll" tabIndex={0} role="region" aria-label={t.sourceLedger}>
        <table>
          <caption className="sr-only">{t.sourceLedger}</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">{t.sourceColumn}</th>
              <th scope="col">{t.evidenceColumn}</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source, index) => {
              const registered = registryById.get(source.source_id ?? source.id);
              const classification = source.classification ??
                (registered?.tags?.includes("primary-source") ? "primary" : undefined);
              const title = decodeEntities(source.title);
              // An aggregator relays other publications' stories. The reader
              // sees who published the piece, and through whom it arrived.
              const host = hostOf(source.url);
              const viaAggregator =
                registered?.tags?.includes("aggregator") && host !== "" && host !== hostOf(registered.url);
              const date = source.published_at ? czechDisplayDate(source.published_at.slice(0, 10)) : null;
              const profile = registered
                ? <Link href={localePath(locale, `/sources/${registered.id}`)}>{sourceName(registered.id, registry ?? [])}</Link>
                : null;
              return (
                <tr key={`${source.id}-${source.url}`}>
                  <td>{String(index + 1).padStart(2, "0")}</td>
                  <td>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      {...(looksEnglish(title) ? { lang: "en" } : {})}
                    >
                      {title}
                    </a>
                    <span className="source-ledger__publisher">
                      {viaAggregator ? host : profile ?? source.publisher ?? host}
                      {date ? ` · ${date}` : null}
                      {viaAggregator && profile ? <> · {t.via} {profile}</> : null}
                    </span>
                  </td>
                  <td>
                    <span className={classification ? `chip chip--evidence-${classification}` : "chip"}>
                      {classificationLabel(classification)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
