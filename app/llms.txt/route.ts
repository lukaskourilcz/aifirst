import { buildLlmsTxt } from "@/lib/distribution/discovery";

// https://llmstxt.org — the site in one Markdown file (issue #99).
export const dynamic = "force-static";

export async function GET() {
  return new Response(await buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
