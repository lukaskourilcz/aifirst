// Lightweight health endpoint for uptime monitors. Returns ok if the
// build is alive and a daily issue has been published in the last
// 48 hours; stale when it is older. Always 200 — monitors decide what to alert on by
// inspecting the `status` field.

import { listArticles } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { classifyPublicHealth } from "@/lib/public-health";

export const dynamic = "force-static";

export async function GET() {
  const all = await listArticles();
  const latest = all[0];
  const latestDaily = all.find((article) => (article.type ?? "daily") === "daily");
  const latestWeekly = all.find((article) => article.type === "weekly");
  const ageHours = latest
    ? Math.floor((Date.now() - new Date(latest.date).getTime()) / 36e5)
    : null;
  const weeklyAgeDays = latestWeekly
    ? Math.floor((Date.now() - new Date(latestWeekly.date).getTime()) / 86_400_000)
    : null;

  const status = classifyPublicHealth(ageHours, weeklyAgeDays === null || weeklyAgeDays > 10);

  return Response.json(
    {
      status,
      built_at: new Date().toISOString(),
      degradation_reason: status === "stale" ? "content_stale" : status === "failed" ? "no_published_issue" : status === "degraded" ? "weekly_cadence_late" : null,
      content_stale: status === "stale",
      latest_daily_success: latestDaily?.date ?? null,
      latest_weekly_success: latestWeekly?.date ?? null,
      latest_issue: latest
        ? {
            slug: latest.slug,
            date: latest.date,
            type: latest.type ?? "daily",
            age_hours: ageHours,
            url: `${siteUrl()}/articles/${latest.slug}`,
          }
        : null,
      total_issues: all.length,
    },
    {
      headers: {
        "cache-control": "public, max-age=60, s-maxage=60",
      },
    },
  );
}
