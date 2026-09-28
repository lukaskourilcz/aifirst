import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ArticleRow } from "@/components/editorial/Card";
import { listArticles } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).sections;
  // Unlinked and noindex: one categorised edition is too thin to stand as a
  // section. The route keeps building; lift this when the category fills.
  return { title: t.modelsTitle, description: t.modelsEmptyBody, alternates: localeAlternates(lang, "/ai-modely"), robots: { index: false } };
}

export default async function ModelsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).sections;
  const lp = localePrefixer(locale);

  const articles = await listArticles(locale);
  // No day grouping here: the density is too low to earn a heading per day.
  const filed = articles.filter((article) => article.categories?.includes("ai-models"));

  return (
    <div className="list-page">
      <div>
        <PageShell kicker={t.modelsKicker} title={t.modelsTitle}>
          {filed.length === 0 ? (
            /* The launch state. No illustration, no skeleton rows, no badge. */
            <>
              <p className="empty-line">{t.modelsEmpty} {t.modelsEmptyBody}</p>
              <p className="empty-line">
                <Link href={lp("/tyden")}>{t.lastWeek} →</Link>
              </p>
            </>
          ) : (
            <ul className="feed-list">
              {filed.map((article) => (
                <ArticleRow key={article.slug} article={article} href={lp(`/articles/${article.slug}`)} square={96} />
              ))}
            </ul>
          )}
        </PageShell>
      </div>
    </div>
  );
}
