import Link from "next/link";
import type { SourceRef } from "@/lib/content";
import type { Source } from "@/lib/scraping/types";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

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
      <h2 id="source-ledger-heading">{t.sourceLedger}</h2>
      <div className="table-scroll" tabIndex={0} role="region" aria-label={t.sourceLedger}>
        <table>
          <caption className="sr-only">{t.sourceLedger}</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">{locale === "cs" ? "Zdroj" : "Source"}</th>
              <th scope="col">{locale === "cs" ? "Typ" : "Type"}</th>
              <th scope="col">{locale === "cs" ? "Třída důkazu" : "Evidence class"}</th>
              <th scope="col">{t.sourceSupports}</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source, index) => {
              const registered = registryById.get(source.source_id ?? source.id);
              const publisher = source.publisher ?? registered?.name ?? hostname(source.url);
              const classification = source.classification ??
                (registered?.tags?.includes("primary-source")
                  ? "primary"
                  : locale === "cs" ? "neurčeno" : "unclassified");
              return (
                <tr key={`${source.id}-${source.url}`}>
                  <td>{String(index + 1).padStart(2, "0")}</td>
                  <td>
                    <a href={source.url} target="_blank" rel="noreferrer noopener">
                      {source.title}
                    </a>
                    <span>{publisher}{source.published_at ? ` · ${source.published_at.slice(0, 10)}` : ""}</span>
                    {registered ? (
                      <Link href={localePath(locale, `/sources/${registered.id}`)}>
                        {locale === "cs" ? "profil zdroje" : "source profile"}
                      </Link>
                    ) : null}
                  </td>
                  <td>{source.source_type ?? registered?.type ?? "—"}</td>
                  <td>{classification}</td>
                  <td>{source.supports?.join("; ") || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
