import { sourceCitationStats } from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";

export const dynamic = "force-static";

export async function GET() {
  const [sources, stats] = await Promise.all([
    loadSources(),
    sourceCitationStats(),
  ]);

  const payload = {
    status: "ok",
    sources: sources.map((s) => {
      const stat = stats.get(s.id);
      return {
        id: s.id,
        name: s.name,
        type: s.type,
        weight: s.weight ?? 0.5,
        tags: s.tags ?? [],
        citations: stat?.count ?? 0,
        last_cited: stat?.latestDate ?? null,
      };
    }),
  };

  return Response.json(payload, {
    headers: {
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
