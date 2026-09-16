import { listArticles } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { llmsTxtDocument } from "@/lib/llms";

export const dynamic = "force-static";

export async function GET() {
  const d = dict(DEFAULT_LOCALE);
  const body = llmsTxtDocument({
    base: siteUrl(),
    description: d.meta.siteDescription,
    articles: await listArticles(DEFAULT_LOCALE),
  });
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
