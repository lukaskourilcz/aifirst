import type { Metadata } from "next";
import { czechLongDate, czechNumericDate } from "@/lib/weeks";
import { topicLabel } from "@/lib/labels";
import { looksEnglish } from "@/lib/text";
import { ArticleRow } from "@/components/editorial/Card";
import { PageShell } from "@/components/PageShell";
import { listArticles } from "@/lib/content";
import { getArticle } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { StructuredData } from "@/components/editorial/StructuredData";
import { siteUrl } from "@/lib/config";
import { brand } from "@/lib/brand";
import Link from "next/link";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).weekly;
  // Noindex while the digest is dormant (last one 17. 5. 2026). Lift it when a
  // new digest ships: see docs/audit-2026-09/IMPLEMENTATION_NOTES.md.
  return {
    title: t.title,
    description: t.description,
    alternates: localeAlternates(lang, "/weekly"),
    robots: { index: false },
  };
}

export default async function WeeklyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).weekly;
  const summaries = (await listArticles(locale)).filter((article) => article.type === "weekly");
  const issues = await Promise.all(summaries.map(async (summary) => ({
    ...summary,
    digest: (await getArticle(summary.slug, locale))?.frontmatter.digest,
  })));
  const latest = issues[0];
  const range = (from: string, to: string) => `${czechNumericDate(from)} – ${czechNumericDate(to)}`;
  const topicsOf = (tags: string[] | undefined) =>
    (tags ?? []).map(topicLabel).filter((label): label is string => label !== null);
  const latestTopics = [...new Set(topicsOf(latest?.tags))];
  const intro = latest ? t.intro.replace("{date}", czechLongDate(latest.date)) : t.description;
  return (
    <PageShell kicker={t.kicker} title={t.title} intro={intro}>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: t.title,
        description: t.description,
        url: `${siteUrl()}${localePath(locale, "/weekly")}`,
        inLanguage: locale,
        publisher: { "@type": "Organization", name: brand.name, url: siteUrl() },
        hasPart: issues.map((issue) => ({ "@type": "Article", headline: issue.title, datePublished: issue.date, url: `${siteUrl()}${localePath(locale, `/articles/${issue.slug}`)}` })),
      }} />
      {latest ? (
        <section className={latest.heroPhoto ? "weekly-cover weekly-cover--with-media" : "weekly-cover"}>
          {latest.heroPhoto ? (
            <Link className="weekly-cover__media" href={localePath(locale, `/articles/${latest.slug}`)}>
              {/* Explicit dimensions carry the 4:3 ratio before the stylesheet
                  arrives, so the cover does not shift as it loads. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={latest.heroPhoto} alt="" width={480} height={360} loading="eager" decoding="async" />
            </Link>
          ) : null}
          <div className="weekly-cover__copy">
            <p className="label label--accent weekly-cover__kicker">{t.latest} · {czechNumericDate(latest.date)}</p>
            <h2 {...(looksEnglish(latest.title) ? { lang: "en" } : {})}>
              <Link href={localePath(locale, `/articles/${latest.slug}`)}>{latest.title}</Link>
            </h2>
            {latest.dek ? <p className="weekly-cover__dek" {...(looksEnglish(latest.dek) ? { lang: "en" } : {})}>{latest.dek}</p> : null}
            <p className="label weekly-cover__meta">
              {latest.digest ? range(latest.digest.from, latest.digest.to) : czechNumericDate(latest.date)}
              {latestTopics.length ? ` · ${t.topics}: ${latestTopics.join(", ")}` : ""}
            </p>
          </div>
        </section>
      ) : null}
      {issues.length > 1 ? (
        <section className="route-section">
          <h2>{t.archive}</h2>
          <ul className="feed-list">
            {issues.slice(1).map((article) => <ArticleRow key={article.slug} article={article} href={localePath(locale, `/articles/${article.slug}`)} />)}
          </ul>
        </section>
      ) : null}
      {!latest ? <p className="empty-line">{t.empty}</p> : null}
    </PageShell>
  );
}
