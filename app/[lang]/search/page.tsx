import { IssueRow } from "@/components/IssueRow";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { buildSearchIndex } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localeAlternates } from "@/lib/i18n/metadata";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).search;
  return { title: t.title, alternates: localeAlternates(lang, "/search") };
}

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
