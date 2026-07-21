import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FeedActions } from "@/components/editorial/FeedActions";
import { IssueRow } from "@/components/IssueRow";
import { PageShell } from "@/components/PageShell";
import { getArticle, listArticles } from "@/lib/content";
import { loadGlossary, slugForTerm } from "@/lib/glossary";
import { localePath, type Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { loadTopicsConfig, publishedTopics } from "@/lib/topics/config";
import { StructuredData } from "@/components/editorial/StructuredData";
import { siteUrl } from "@/lib/config";
import { brand } from "@/lib/brand";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const [config, articles] = await Promise.all([loadTopicsConfig(), listArticles()]);
  return publishedTopics(config, articles).map(({ topic }) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const config = await loadTopicsConfig();
  const topic = config.topics.find((item) => item.slug === slug);
  if (!topic) return {};
  return {
    title: topic.title[lang],
    description: topic.description[lang],
    alternates: localeAlternates(lang, `/topics/${slug}`),
  };
}

export default async function TopicPage({ params }: { params: Promise<{ lang: Locale; slug: string }> }) {
  const { lang: locale, slug } = await params;
  const [config, all, glossary] = await Promise.all([loadTopicsConfig(), listArticles(locale), loadGlossary()]);
  const published = publishedTopics(config, all);
  const current = published.find(({ topic }) => topic.slug === slug);
  if (!current) notFound();
  const { topic, articles } = current;
  const t = dict(locale).topics;
  const sourceCounts = new Map<string, { id?: string; title: string; url: string; count: number }>();
  for (const summary of articles) {
    const article = await getArticle(summary.slug, locale);
    for (const source of article?.frontmatter.sources ?? []) {
      const key = source.source_id ?? source.id;
      const known = sourceCounts.get(key);
      sourceCounts.set(key, { id: source.source_id, title: source.publisher ?? source.title, url: source.url, count: (known?.count ?? 0) + 1 });
    }
  }
  const majorSources = [...sourceCounts.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  const glossaryTerms = glossary.filter((term) => (term.tags ?? []).some((tag) => topic.tags.includes(tag)));
  const related = published.filter(({ topic: candidate }) => candidate.slug !== topic.slug && candidate.tags.some((tag) => topic.tags.includes(tag))).slice(0, 4);
  const entityCounts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of new Set(article.tags ?? [])) {
      if (tag === "weekly" || topic.tags.includes(tag)) continue;
      entityCounts.set(tag, (entityCounts.get(tag) ?? 0) + 1);
    }
  }
  const recurringEntities = [...entityCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8);

  return (
    <PageShell kicker={t.kicker} title={topic.title[locale]} intro={topic.description[locale]}>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            name: topic.title[locale],
            description: topic.description[locale],
            url: `${siteUrl()}${localePath(locale, `/topics/${topic.slug}`)}`,
            inLanguage: locale,
            publisher: { "@type": "Organization", name: brand.name, url: siteUrl() },
            hasPart: articles.map((article) => ({ "@type": article.type === "weekly" ? "Article" : "NewsArticle", headline: article.title, datePublished: article.date, url: `${siteUrl()}${localePath(locale, `/articles/${article.slug}`)}` })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: brand.name, item: `${siteUrl()}${localePath(locale, "/")}` },
              { "@type": "ListItem", position: 2, name: t.title, item: `${siteUrl()}${localePath(locale, "/topics")}` },
              { "@type": "ListItem", position: 3, name: topic.title[locale], item: `${siteUrl()}${localePath(locale, `/topics/${topic.slug}`)}` },
            ],
          },
        ],
      }} />
      <FeedActions locale={locale} topicSlug={topic.slug} />
      <section style={{ marginTop: "var(--section-gap)" }}>
        <h2>{t.latest}</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {articles.slice(0, 3).map((article) => (
            <IssueRow key={article.slug} href={localePath(locale, `/articles/${article.slug}`)} date={article.date} title={article.title} variant="meta" />
          ))}
        </ul>
      </section>
      <section style={{ marginTop: "var(--section-gap)" }}>
        <h2>{t.timeline}</h2>
        <ol className="topic-timeline">
          {articles.map((article) => <li key={article.slug}><time dateTime={article.date}>{article.date}</time><Link href={localePath(locale, `/articles/${article.slug}`)}>{article.title}</Link></li>)}
        </ol>
      </section>
      {recurringEntities.length ? (
        <section style={{ marginTop: "var(--section-gap)" }}>
          <h2>{t.entities}</h2>
          <ul className="entity-list">{recurringEntities.map(([entity, count]) => <li key={entity}><Link href={localePath(locale, `/tags/${encodeURIComponent(entity)}`)}>{entity}</Link> <span className="label">{count}</span></li>)}</ul>
        </section>
      ) : null}
      {majorSources.length ? (
        <section style={{ marginTop: "var(--section-gap)" }}>
          <h2>{t.sources}</h2>
          <ul>{majorSources.map((source) => <li key={source.url}>{source.id ? <Link href={localePath(locale, `/sources/${source.id}`)}>{source.title}</Link> : <a href={source.url} target="_blank" rel="noreferrer noopener">{source.title}</a>} · {source.count}</li>)}</ul>
        </section>
      ) : null}
      {glossaryTerms.length ? (
        <section style={{ marginTop: "var(--section-gap)" }}>
          <h2>{t.glossary}</h2>
          <ul>{glossaryTerms.map((term) => <li key={term.term}><Link href={`${localePath(locale, "/glossary")}#${slugForTerm(term.term)}`}>{term.term}</Link></li>)}</ul>
        </section>
      ) : null}
      {related.length ? (
        <section style={{ marginTop: "var(--section-gap)" }}>
          <h2>{t.related}</h2>
          <ul>{related.map(({ topic: item }) => <li key={item.slug}><Link href={localePath(locale, `/topics/${item.slug}`)}>{item.title[locale]}</Link></li>)}</ul>
        </section>
      ) : null}
    </PageShell>
  );
}
