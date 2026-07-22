import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { listArticles } from "@/lib/content";
import { classifyPublicHealth } from "@/lib/public-health";
import { localePath, type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";
export const metadata = { robots: { index: false } };

export default async function HealthPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).health;
  const articles = await listArticles(locale);
  const latest = articles[0];
  const latestDaily = articles.find((article) => (article.type ?? "daily") === "daily");
  const latestWeekly = articles.find((article) => article.type === "weekly");
  const dailyAgeHours = latestDaily
    ? Math.floor((Date.now() - new Date(`${latestDaily.date}T06:00:00Z`).getTime()) / 3_600_000)
    : null;
  const weeklyAgeDays = latestWeekly
    ? Math.floor((Date.now() - new Date(`${latestWeekly.date}T07:00:00Z`).getTime()) / 86_400_000)
    : null;
  const status = classifyPublicHealth(dailyAgeHours, weeklyAgeDays === null || weeklyAgeDays > 10);
  const statusCopy = {
    healthy: [t.healthyTitle, t.healthyBody],
    degraded: [t.degradedTitle, t.degradedBody],
    stale: [t.staleTitle, t.staleBody],
    failed: [t.failedTitle, t.failedBody],
  }[status];

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      <section className="public-status" data-status={status} aria-labelledby="public-status-heading">
        <p className="label">{t.overallStatus}</p>
        <h2 id="public-status-heading">{statusCopy[0]}</h2>
        <p>{statusCopy[1]}</p>
        <dl>
          <div><dt>{t.latestDaily}</dt><dd>{latestDaily?.date ?? t.unavailable}</dd></div>
          <div><dt>{t.latestWeekly}</dt><dd>{latestWeekly?.date ?? t.unavailable}</dd></div>
          <div><dt>{t.issueAge}</dt><dd>{dailyAgeHours === null ? t.unavailable : `${dailyAgeHours} h`}</dd></div>
        </dl>
        {latest ? <Link href={localePath(locale, `/articles/${latest.slug}`)}>{t.currentIssue} →</Link> : null}
      </section>
      <p className="label label--muted public-status__privacy">{t.internalUnavailable}</p>
    </PageShell>
  );
}
