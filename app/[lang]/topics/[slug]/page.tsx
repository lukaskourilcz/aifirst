import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { Card, ImageOrFallback } from "@/components/editorial/Card";
import { SectionMasthead } from "@/components/editorial/SectionMasthead";
import { listArticles, type ArticleSummary } from "@/lib/content";
import { localePath, type Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { RETIRED_TOPICS, SECTIONS, SECTION_TO_TOPIC, sectionOf, topicToSection } from "@/lib/sections";
import { StructuredData } from "@/components/editorial/StructuredData";
import { siteUrl } from "@/lib/config";
import { brand } from "@/lib/brand";
import { czechWeekdayDate } from "@/lib/weeks";

export const dynamic = "force-static";

// Round 2: the five sections are served here until Part B moves them to
// /<section>. The two topics no section keeps redirect to the one that
// absorbed them (DECISIONS.md Q6).
export async function generateStaticParams() {
  return [...Object.values(SECTION_TO_TOPIC), ...Object.keys(RETIRED_TOPICS)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const key = topicToSection(slug);
  const section = SECTIONS.find((item) => item.key === key);
  if (!section) return {};
  return {
    title: section.label,
    description: section.scope,
    alternates: localeAlternates(lang, `/topics/${slug}`),
  };
}

export default async function SectionPage({ params }: { params: Promise<{ lang: Locale; slug: string }> }) {
  const { lang: locale, slug } = await params;
  const retired = RETIRED_TOPICS[slug];
  if (retired) permanentRedirect(localePath(locale, `/topics/${retired}`));
  const key = topicToSection(slug);
  const section = SECTIONS.find((item) => item.key === key);
  if (!section) notFound();

  const t = dict(locale);
  // Every article whose one section this is, newest first.
  const articles = (await listArticles(locale)).filter((article) => sectionOf(article.tags) === section.key);
  const [lead, ...rest] = articles;
  const side = rest.slice(0, 2);
  const covers = rest.slice(2, 5);
  const older = rest.slice(5, 25);
  const href = (article: ArticleSummary) => localePath(locale, `/articles/${article.slug}`);
  const lang = (article: ArticleSummary) => (article.lang === "en" ? "en" : undefined);
  const date = (article: ArticleSummary) => <time dateTime={article.date}>{czechWeekdayDate(article.date)}</time>;
  const url = `${siteUrl()}${localePath(locale, `/topics/${slug}`)}`;

  return (
    <div className="section-page">
      <StructuredData data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            name: section.label,
            description: section.scope,
            url,
            inLanguage: locale,
            publisher: { "@type": "Organization", name: brand.name, url: siteUrl() },
            hasPart: articles.map((article) => ({ "@type": article.type === "weekly" ? "Article" : "NewsArticle", headline: article.title, datePublished: article.date, url: `${siteUrl()}${href(article)}` })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: brand.name, item: `${siteUrl()}${localePath(locale, "/")}` },
              { "@type": "ListItem", position: 2, name: section.label, item: url },
            ],
          },
        ],
      }} />

      <header className="section-head">
        <h1 className="section-head__title">{section.label}</h1>
        <p className="section-head__scope">{section.scope}</p>
      </header>

      {lead ? (
        <div className="section-top">
          <article className="section-top__lead">
            <Link href={href(lead)} className="lead__media section-lead">
              <ImageOrFallback src={lead.heroPhoto} ratio="3/2" date={lead.date} eager />
              <div className="lead__band section-lead__band">
                <p className="label lead__section">{date(lead)}</p>
                <h2 className="lead__title section-lead__title" lang={lang(lead)}>{lead.title}</h2>
              </div>
            </Link>
            {lead.dek ? <p className="section-top__dek" lang={lang(lead)}>{lead.dek}</p> : null}
          </article>
          {side.length ? (
            <ul className="section-top__side">
              {side.map((article) => (
                <li key={article.slug}>
                  <Card
                    variant="compact"
                    square={120}
                    href={href(article)}
                    title={article.title}
                    titleLang={lang(article)}
                    label={date(article)}
                    dek={article.dek}
                    image={article.heroPhoto}
                    titleSize={2}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="empty-line">{t.topics.empty}</p>
      )}

      {covers.length ? (
        <ul className="section-covers">
          {covers.map((article) => (
            <li key={article.slug}>
              <Card
                variant="cover"
                href={href(article)}
                title={article.title}
                titleLang={lang(article)}
                label={date(article)}
                image={article.heroPhoto}
                date={article.date}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {older.length ? (
        <section className="section-older" aria-labelledby="section-older">
          <SectionMasthead id="section-older" kicker={t.topics.older} />
          <ul className="section-older__grid">
            {older.map((article) => (
              <li key={article.slug}>
                <Card
                  variant="compact"
                  square={64}
                  href={href(article)}
                  title={article.title}
                  titleLang={lang(article)}
                  label={<span className="meta">{czechWeekdayDate(article.date)}</span>}
                  image={article.heroPhoto}
                  titleSize={3}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="section-foot">
        <Link href={localePath(locale, "/archive")}>{t.topics.allInArchive}&nbsp;→</Link>
        <span aria-hidden> · </span>
        <a href={localePath(locale, `/topics/${slug}/feed.xml`)} type="application/atom+xml">{t.topics.rss}&nbsp;↗</a>
      </p>
    </div>
  );
}
