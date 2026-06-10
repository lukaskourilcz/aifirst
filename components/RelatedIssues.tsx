import Link from "next/link";
import type { ArticleSummary } from "@/lib/content";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function RelatedIssues({
  items,
  locale,
}: {
  items: ArticleSummary[];
  locale: Locale;
}) {
  if (!items.length) return null;
  return (
    <section
      aria-label="Related issues"
      style={{
        marginTop: 64,
        paddingTop: 32,
        borderTop: "1px solid var(--hairline)",
      }}
    >
      <p className="label" style={{ marginBottom: 16 }}>
        {dict(locale).article.related}
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {items.map((a) => (
          <li
            key={a.slug}
            style={{
              padding: 16,
              border: "1px solid var(--hairline)",
              background: "var(--bg-deep)",
            }}
          >
            <p className="label" style={{ marginBottom: 8 }}>{a.date}</p>
            <Link
              href={localePath(locale, `/articles/${a.slug}`)}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
                lineHeight: 1.25,
                color: "var(--ink-primary)",
                borderBottom: "none",
              }}
            >
              {a.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
