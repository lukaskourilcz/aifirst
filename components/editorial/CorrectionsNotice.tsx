import type { Correction } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { czechLongDate } from "@/lib/weeks";
import { SectionMasthead } from "./SectionMasthead";

export function CorrectionsNotice({ corrections, locale }: { corrections?: Correction[]; locale: Locale }) {
  if (!corrections?.length) return null;
  return (
    <aside className="corrections-notice" aria-labelledby="article-corrections">
      <SectionMasthead id="article-corrections" kicker={dict(locale).article.corrections} />
      <ul>
        {corrections.map((correction) => (
          <li key={`${correction.date}-${correction.description}`}>
            <time dateTime={correction.date}>{czechLongDate(correction.date)}</time>
            {correction.section ? <strong>{correction.section}</strong> : null}
            <span>{correction.description}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
