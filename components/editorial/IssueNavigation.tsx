import Link from "next/link";
import type { ArticleSummary } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function IssueNavigation({ previous, next, locale }: {
  previous: ArticleSummary | null;
  next: ArticleSummary | null;
  locale: Locale;
}) {
  if (!previous && !next) return null;
  const t = dict(locale).article;
  return (
    <nav className="issue-navigation" aria-label={locale === "cs" ? "Navigace mezi vydáními" : "Issue navigation"}>
      {previous ? (
        <Link href={localePath(locale, `/articles/${previous.slug}`)}>
          <span>← {t.previousIssue}</span><strong>{previous.title}</strong>
        </Link>
      ) : <span />}
      {next ? (
        <Link href={localePath(locale, `/articles/${next.slug}`)}>
          <span>{t.nextIssue} →</span><strong>{next.title}</strong>
        </Link>
      ) : null}
    </nav>
  );
}
