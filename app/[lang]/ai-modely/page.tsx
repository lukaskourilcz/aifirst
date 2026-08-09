import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { FeedRow } from "@/components/editorial/FeedRow";
import { RightRail } from "@/components/editorial/RightRail";
import { listArticles } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { loadEvents, splitByAnchor } from "@/lib/events";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).sections;
  return { title: t.modelsTitle, description: t.modelsEmptyBody, alternates: localeAlternates(lang, "/ai-modely") };
}

export default async function ModelsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).sections;
  const r = dict(locale).rail;
  const lp = localePrefixer(locale);

  const articles = await listArticles(locale);
  const anchor = articles[0]?.date;
  // No day grouping here: the density is too low to earn a heading per day.
  const filed = articles.filter((article) => article.categories?.includes("ai-models"));
  const { upcoming } = splitByAnchor(loadEvents(), anchor ?? "1970-01-01");

  return (
    <div className="page-with-rail">
      <div className="page-with-rail__main">
        <PageShell kicker={r.models} title={t.modelsTitle}>
          {filed.length === 0 ? (
            /* The launch state. No illustration, no skeleton rows, no badge. */
            <div className="empty-state">
              <p className="empty-line">{t.modelsEmpty}</p>
              <p className="empty-line">{t.modelsEmptyBody}</p>
              <p className="empty-state__link">
                <Link href={lp("/tyden")}>{r.week} →</Link>
              </p>
            </div>
          ) : (
            <ul className="feed-list">
              {filed.map((article) => (
                <FeedRow key={article.slug} article={article} locale={locale} />
              ))}
            </ul>
          )}
        </PageShell>
      </div>
      <RightRail locale={locale} dateKey={anchor} events={upcoming} />
    </div>
  );
}
