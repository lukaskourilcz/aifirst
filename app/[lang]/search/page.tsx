import { SearchPalette } from "@/components/SearchPalette";
import { buildSearchIndex } from "@/lib/content";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export default async function SearchPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).search;
  const index = await buildSearchIndex(locale);
  const lp = (p: string) => localePath(locale, p);

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">{t.kicker}</p>
      <h1>{t.title}</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: "60ch" }}>
        {t.introBefore} <kbd>⌘K</kbd> (<kbd>/</kbd>) {t.introAfter}
      </p>
      <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
        <SearchPalette index={index} locale={locale} />
      </div>

      <section style={{ marginTop: 64 }}>
        <p className="label" style={{ marginBottom: 16 }}>
          {t.fullIndex} ({index.length})
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {index.map((e) => (
            <li
              key={e.slug}
              className="entry-row"
              style={{
                padding: "12px 0",
                borderBottom: "1px solid var(--hairline)",
              }}
            >
              <a
                href={lp(`/articles/${e.slug}`)}
                className="label"
                style={{ borderBottom: "none" }}
              >
                {e.date}
              </a>
              <a
                href={lp(`/articles/${e.slug}`)}
                style={{ fontSize: "1rem", color: "var(--ink-primary)" }}
              >
                {e.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
