import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

/**
 * One row anatomy for Briefs („Ve zkratce") and Watchlist („Na radaru"), used
 * on Today, in the article aside and on Radar so the three read as the same
 * instrument.
 *
 * The row is: tabular mono index, title, an optional serif summary clamped to
 * two lines, and an optional mono meta line. Summary and meta render only when
 * the delivered item actually carries them — a dispatch has a body and
 * sometimes a topic, a wire item has a source and nothing else — so a row
 * never invents a field to look complete.
 *
 * The whole row is the link, which is what carries the 44px target rather than
 * the title's own line box.
 */
export function DigestRow({
  index,
  title,
  summary,
  meta,
  href,
  external = false,
  locale,
}: {
  index: number;
  title: string;
  summary?: string;
  meta?: string;
  href: string;
  external?: boolean;
  locale: Locale;
}) {
  const t = dict(locale).sections;

  const body = (
    <>
      <span aria-hidden className="digest-row__index">{String(index).padStart(2, "0")}</span>
      <span className="digest-row__copy">
        <span className="digest-row__title">
          {title}
          {external ? (
            <>
              <span aria-hidden> ↗</span>
              <span className="sr-only"> {t.opensInNewWindow}</span>
            </>
          ) : null}
        </span>
        {summary ? <span className="digest-row__summary">{summary}</span> : null}
        {meta ? <span className="digest-row__meta">{meta}</span> : null}
      </span>
    </>
  );

  return (
    <li className="digest-row">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="digest-row__link">
          {body}
        </a>
      ) : (
        <Link href={href} className="digest-row__link">
          {body}
        </Link>
      )}
    </li>
  );
}
