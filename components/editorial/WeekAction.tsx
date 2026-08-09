import Link from "next/link";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

/**
 * The week-boundary action. It is an anchor to a static page, never a button
 * and never a fetch: the whole chain back through the archive is prerendered.
 */
export function WeekAction({
  locale,
  href,
  kicker,
  label,
}: {
  locale: Locale;
  href: string;
  kicker?: string;
  label: string;
}) {
  const t = dict(locale).sections;
  return (
    <Link href={href} className="week-action">
      <span className="week-action__copy">
        <span className="week-action__kicker">{kicker ?? t.previousWeek}</span>
        <span className="week-action__label">{label}</span>
      </span>
      <span aria-hidden className="week-action__arrow">→</span>
    </Link>
  );
}

/** The end of the chain: a quiet line, not a dead-looking disabled control. */
export function ArchiveExhausted({ locale }: { locale: Locale }) {
  const t = dict(locale).sections;
  return (
    <p className="archive-exhausted">
      {t.archiveExhausted}{" "}
      <Link href={localePath(locale, "/archive")}>{t.archiveExhaustedLink} →</Link>
    </p>
  );
}
