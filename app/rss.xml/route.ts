import { buildRss } from "@/lib/distribution/discovery";

// RSS 2.0 beside the Atom feed, for aggregators that read only RSS (issue #99).
export const dynamic = "force-static";

export async function GET() {
  return new Response(await buildRss(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
