import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { listArticles } from "@/lib/content";
import { loadTopicsConfig, publishedTopics } from "@/lib/topics/config";
import type { Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { StructuredData } from "@/components/editorial/StructuredData";
import { siteUrl } from "@/lib/config";
import { brand } from "@/lib/brand";
import { TopicMedia } from "@/components/TopicMedia";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).topics;
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/topics") };
}

export default async function TopicsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).topics;
  const [config, articles] = await Promise.all([loadTopicsConfig(), listArticles(locale)]);
  const topics = publishedTopics(config, articles);
  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: t.title,
        description: t.intro,
        url: `${siteUrl()}${localePath(locale, "/topics")}`,
        inLanguage: locale,
        publisher: { "@type": "Organization", name: brand.name, url: siteUrl() },
        hasPart: topics.map(({ topic }) => ({ "@type": "CollectionPage", name: topic.title[locale], url: `${siteUrl()}${localePath(locale, `/topics/${topic.slug}`)}` })),
      }} />
      {topics.length ? (
        <ul className="topic-grid">
          {topics.map(({ topic, articles: matches }) => (
            <li key={topic.id}>
              <Link className="topic-card" href={localePath(locale, `/topics/${topic.slug}`)}>
                <TopicMedia topic={topic} locale={locale} compact />
                <h2>{topic.title[locale]}</h2>
                <p>{topic.description[locale]}</p>
                <span className="label">{matches.length} {t.issues} →</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p>{t.empty}</p>}
    </PageShell>
  );
}
