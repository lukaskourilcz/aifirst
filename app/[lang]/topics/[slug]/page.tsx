import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FeedRow } from "@/components/editorial/FeedRow";
import { PageShell } from "@/components/PageShell";
import { listArticles } from "@/lib/content";
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
  const glossaryTerms = glossary.filter((term) => (term.tags ?? []).some((tag) => topic.tags.includes(tag)));

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
      {/* One list: every edition on the topic, newest first. */}
      <section className="route-section" aria-labelledby="topic-editions">
        <h2 id="topic-editions">{t.editions}</h2>
        <ul className="feed-list">
          {articles.map((article) => (
            <FeedRow key={article.slug} article={article} locale={locale} thumbnail={false} />
          ))}
        </ul>
      </section>
      {glossaryTerms.length ? (
        <section className="route-section reference-section">
          <h2>{t.glossary}</h2>
          <ul className="reference-list">{glossaryTerms.map((term) => <li key={term.term}><Link href={`${localePath(locale, "/glossary")}#${slugForTerm(term.term)}`}>{term.term}</Link></li>)}</ul>
        </section>
      ) : null}
      <p className="kicker topic-feed">
        <a href={localePath(locale, `/topics/${topic.slug}/feed.xml`)} type="application/atom+xml">{t.rss} ↗</a>
      </p>
    </PageShell>
  );
}
