import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

/**
 * One row for Krátce (a Brief) and Ke sledování (a Watchlist link), on Today
 * and in the article's side column.
 *
 * A Brief: serif title, a two-line summary, then its topic label and the
 * source's host. A Watchlist item: a Grotesk title and the host, with the feed
 * it arrived through. No index numbers: nobody refers to a row by number. The
 * whole row is the link, which carries the 44 px target.
 */
export function DigestRow({
  title,
  titleLang,
  summary,
  label,
  host,
  via,
  href,
  external = false,
  variant = "brief",
  locale,
}: {
  title: string;
  /** `en` for a quoted English title, so screen readers switch voice. */
  titleLang?: string;
  summary?: string;
  /** The Brief's topic, a section-style label. */
  label?: string;
  /** Host of the linked page, e.g. „github.com". */
  host?: string;
  /** The feed a Watchlist item came through, e.g. „TensorFeed". */
  via?: string;
  href?: string;
  external?: boolean;
  variant?: "brief" | "watch";
  locale: Locale;
}) {
  const t = dict(locale).sections;
  const footer = label || host || via ? (
    <span className="digest-row__foot">
      {label ? <span className="label label--muted digest-row__label">{label}</span> : null}
      {label && (host || via) ? <span aria-hidden className="meta"> · </span> : null}
      {host || via ? (
        <span className="meta">
          {host}
          {host && via ? " · " : null}
          {via ? `přes ${via}` : null}
          {variant === "brief" && external ? " ↗" : null}
        </span>
      ) : null}
    </span>
  ) : null;

  const body = (
    <>
      <span className={variant === "brief" ? "h-serif h-serif--3 digest-row__title" : "digest-row__title digest-row__title--watch"} lang={titleLang}>
        {title}
        {variant === "watch" && external ? <span aria-hidden>{" "}↗</span> : null}
      </span>
      {summary ? <span className="digest-row__summary">{summary}</span> : null}
      {footer}
      {external ? <span className="sr-only"> {t.opensInNewWindow}</span> : null}
    </>
  );

  return (
    <li className={`digest-row digest-row--${variant}`}>
      {href ? (
        external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="digest-row__link">{body}</a>
        ) : (
          <Link href={href} className="digest-row__link">{body}</Link>
        )
      ) : (
        <span className="digest-row__link digest-row__link--plain">{body}</span>
      )}
    </li>
  );
}
