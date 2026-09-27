import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { listArticles } from "@/lib/content";
import { listBoardContexts } from "@/lib/board";
import { publicationStatus } from "@/lib/public-health";
import { localePath, type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { czechNumericDate, czechWeekdayDate } from "@/lib/weeks";

export const dynamic = "force-static";
export const metadata = { robots: { index: false } };

// Freshness is measured in publishing days against the newest board record,
// never against the build clock: a static page that says „N hours old" is
// wrong the moment after it is built.
export default async function HealthPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).health;
  const [articles, boards] = await Promise.all([listArticles(locale), listBoardContexts()]);
  const latestDaily = articles.find((article) => (article.type ?? "daily") === "daily");
  const latestWeekly = articles.find((article) => article.type === "weekly");
  const anchor = boards[0]?.date ?? null;
  const status = publicationStatus(latestDaily?.date ?? null, anchor);
  const statusCopy = {
    healthy: [t.healthyTitle, t.healthyBody],
    degraded: [t.healthyTitle, t.healthyBody],
    stale: [t.staleTitle.replace("{date}", latestDaily ? czechWeekdayDate(latestDaily.date) : ""), t.staleBody],
    failed: [t.failedTitle, t.failedBody],
  }[status];

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      <section className="public-status" data-status={status} aria-labelledby="public-status-heading">
        <p className="label">{t.overallStatus}</p>
        <h2 id="public-status-heading">{statusCopy[0]}</h2>
        <p>{statusCopy[1]}</p>
        <dl>
          <div><dt>{t.latestDaily}</dt><dd>{latestDaily ? czechWeekdayDate(latestDaily.date) : t.unavailable}</dd></div>
          <div><dt>{t.latestWeekly}</dt><dd>{latestWeekly ? czechNumericDate(latestWeekly.date) : t.unavailable}</dd></div>
        </dl>
        {latestDaily ? <Link href={localePath(locale, `/articles/${latestDaily.slug}`)}>{t.currentIssue} →</Link> : null}
      </section>
    </PageShell>
  );
}
