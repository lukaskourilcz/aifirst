import Link from "next/link";
import type { ArticleSummary } from "@/lib/content";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { czechLongDate } from "@/lib/weeks";
import { CoverCard } from "./editorial/CoverCard";
import { SectionMasthead } from "./editorial/SectionMasthead";

export function RelatedIssues({
  items,
  locale,
  variant = "block",
}: {
  items: ArticleSummary[];
  locale: Locale;
  /** "rail" is the compact numbered list used in the article right rail. */
  variant?: "block" | "rail";
}) {
  if (!items.length) return null;

  if (variant === "rail") {
    return (
      <ol className="rail-related">
        {items.slice(0, 3).map((a, i) => (
          <li key={a.slug}>
            <span aria-hidden className="rail-related__index">{String(i + 1).padStart(2, "0")}</span>
            <Link href={localePath(locale, `/articles/${a.slug}`)}>{a.title}</Link>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <section aria-labelledby="related-issues-heading" className="related-issues">
      <SectionMasthead id="related-issues-heading" kicker={dict(locale).article.related} />
      <ul className="cover-grid">
        {items.map((a) => (
          <li key={a.slug}>
            <CoverCard
              href={localePath(locale, `/articles/${a.slug}`)}
              kicker={<time dateTime={a.date}>{czechLongDate(a.date)}</time>}
              title={a.title}
              dek={a.dek}
              media={a.heroPhoto}
              mediaWidth={300}
              mediaHeight={200}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
