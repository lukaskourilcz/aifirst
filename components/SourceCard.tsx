import Link from "next/link";
import { czechDisplayDate } from "@/lib/weeks";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { monogram } from "@/lib/labels";

type Props = {
  id: string;
  name: string;
  classLabel: string;
  citations?: number;
  latestDate?: string | null;
  locale: Locale;
};

/**
 * One registered source: monogram, what kind of source it is, its name and how
 * often the editions drew on it. Feed type, id, weight and tags are collection
 * data and stay out of the reader's view.
 */
export function SourceCard({ id, name, classLabel, citations = 0, latestDate, locale }: Props) {
  const t = dict(locale).sources;
  return (
    <article className="source-card">
      <span className="source-card__monogram" aria-hidden>{monogram(name)}</span>
      <div>
        <p className="kicker source-card__type">{classLabel}</p>
        <h3>
          <Link href={localePath(locale, `/sources/${encodeURIComponent(id)}`)}>{name}</Link>
        </h3>
        <p className="kicker source-card__citation">
          {citations > 0 && latestDate
            ? `${t.editions.replace("{n}", String(citations))} · ${t.last} ${czechDisplayDate(latestDate)}`
            : t.never}
        </p>
      </div>
    </article>
  );
}
