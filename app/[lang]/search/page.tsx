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
    <PageShell kicker={t.kicker} title={t.title} intro={
      <>{t.introBefore} <kbd>⌘K</kbd> (<kbd>/</kbd>) {t.introAfter}</>
    }>
      <section className="search-index">
        <p className="label search-index__label">
          {t.fullIndex} ({index.length})
        </p>
        <ul className="dense-list">
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
