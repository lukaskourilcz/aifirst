import { IssueRow } from "@/components/IssueRow";
import { PageShell } from "@/components/PageShell";
import { SearchPalette } from "@/components/SearchPalette";
import { buildSearchIndex } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
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
  const lp = localePrefixer(locale);

  return (
    <PageShell kicker={t.kicker} title={t.title}>
      <p style={{ color: "var(--ink-muted)", maxWidth: "60ch" }}>
        {t.introBefore} <kbd>⌘K</kbd> (<kbd>/</kbd>) {t.introAfter}
      </p>
      <div style={{ marginTop: "var(--block-gap)", display: "flex", gap: 16 }}>
        <SearchPalette index={index} locale={locale} />
      </div>

      <section style={{ marginTop: "var(--gutter-gap)" }}>
        <p className="label" style={{ marginBottom: 16 }}>
          {t.fullIndex} ({index.length})
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {index.map((e) => (
            <IssueRow
              key={e.slug}
              href={lp(`/articles/${e.slug}`)}
              date={e.date}
              title={e.title}
              titleSize="1rem"
              titleColor="var(--ink-primary)"
              padding="12px 0"
            />
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
