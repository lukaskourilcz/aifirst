// Lightweight health endpoint for uptime monitors. Returns ok if the
// build is alive and a daily issue has been published in the last
// 48 hours; warn if the last issue is between 48–96 hours; degraded
// otherwise. Always 200 — monitors decide what to alert on by
// inspecting the `status` field.

import { listArticles } from "@/lib/content";
import { siteUrl } from "@/lib/config";

export const dynamic = "force-static";

type Status = "ok" | "warn" | "degraded";

function classify(ageHours: number | null): Status {
  if (ageHours === null) return "degraded";
  if (ageHours <= 48) return "ok";
  if (ageHours <= 96) return "warn";
  return "degraded";
}

export async function GET() {
  const all = await listArticles();
  const latest = all[0];
  const ageHours = latest
    ? Math.floor((Date.now() - new Date(latest.date).getTime()) / 36e5)
    : null;

  const status = classify(ageHours);

  return Response.json(
    {
      status,
      built_at: new Date().toISOString(),
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
