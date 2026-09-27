import { buildNewsSitemap } from "@/lib/distribution/discovery";

// Google News sitemap: the newest edition's day and the day before (issue #99).
export const dynamic = "force-static";

export async function GET() {
  return new Response(await buildNewsSitemap(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
