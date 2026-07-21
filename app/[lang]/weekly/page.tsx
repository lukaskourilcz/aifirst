import type { Metadata } from "next";
import { FeedActions } from "@/components/editorial/FeedActions";
import { IssueRow } from "@/components/IssueRow";
import { PageShell } from "@/components/PageShell";
import { listArticles } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { StructuredData } from "@/components/editorial/StructuredData";
import { siteUrl } from "@/lib/config";
import { brand } from "@/lib/brand";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).weekly;
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/weekly") };
}

export default async function WeeklyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).weekly;
  const issues = (await listArticles(locale)).filter((article) => article.type === "weekly");
  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: t.title,
        description: t.intro,
        url: `${siteUrl()}${localePath(locale, "/weekly")}`,
        inLanguage: locale,
        publisher: { "@type": "Organization", name: brand.name, url: siteUrl() },
        hasPart: issues.map((issue) => ({ "@type": "Article", headline: issue.title, datePublished: issue.date, url: `${siteUrl()}${localePath(locale, `/articles/${issue.slug}`)}` })),
      }} />
      <FeedActions locale={locale} weekly />
      {issues.length ? (
        <section style={{ marginTop: "var(--section-gap)" }}>
          <h2>{t.archive}</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {issues.map((article) => <IssueRow key={article.slug} href={localePath(locale, `/articles/${article.slug}`)} date={article.date} title={article.title} variant="meta" trailing={<span className="label">{(article.tags ?? []).filter((tag) => tag !== "weekly").slice(0, 2).join(" · ")}</span>} />)}
          </ul>
        </section>
      ) : <p style={{ marginTop: 32 }}>{t.empty}</p>}
    </PageShell>
  );
}
