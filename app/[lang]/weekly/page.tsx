import type { Metadata } from "next";
import { czechNumericDate } from "@/lib/weeks";
import { FeedActions } from "@/components/editorial/FeedActions";
import { IssueRow } from "@/components/IssueRow";
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
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/weekly") };
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
          <div className="weekly-cover__index" aria-hidden>W</div>
          <div className="weekly-cover__copy">
            <p className="label label--accent weekly-cover__kicker">{t.latest}</p>
            <h2><Link href={localePath(locale, `/articles/${latest.slug}`)}>{latest.title}</Link></h2>
            {latest.dek ? <p className="weekly-cover__dek">{latest.dek}</p> : null}
            <p className="label weekly-cover__meta">
              {latest.digest ? `${t.dateRange}: ${czechNumericDate(latest.digest.from)} → ${czechNumericDate(latest.digest.to)}` : czechNumericDate(latest.date)}
              {(latest.tags ?? []).filter((tag) => tag !== "weekly").length
                ? ` · ${t.topics}: ${(latest.tags ?? []).filter((tag) => tag !== "weekly").join(", ")}`
                : ""}
            </p>
          </div>
        </section>
      ) : null}
      {issues.length > 1 ? (
        <section className="route-section">
          <h2>{t.archive}</h2>
          <ul className="dense-list">
            {issues.slice(1).map((article) => <IssueRow key={article.slug} href={localePath(locale, `/articles/${article.slug}`)} date={article.digest ? `${czechNumericDate(article.digest.from)} → ${czechNumericDate(article.digest.to)}` : article.date} title={article.title} variant="meta" trailing={<span className="label">{(article.tags ?? []).filter((tag) => tag !== "weekly").slice(0, 2).join(" · ")}</span>} />)}
          </ul>
        </section>
      ) : null}
      {!latest ? <p className="route-empty-state">{t.empty}</p> : null}
    </PageShell>
  );
}
