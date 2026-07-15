import { request } from "undici";

// Clean, LLM-ready readable extraction — the resilient fallback for the generic
// HTML adapter. When a site's markup defeats the raw cheerio pass, we ask a
// reader service for main-content markdown instead:
//
//   • Firecrawl (https://firecrawl.dev) when FIRECRAWL_API_KEY is set —
//     strips nav/boilerplate server-side, most robust.
//   • Jina Reader (https://r.jina.ai) otherwise — keyless at low rates,
//     JINA_API_KEY optional to raise them.
//
// Returns markdown text, or null on any failure so the caller keeps its own
// behaviour. Never throws.
export async function fetchReadable(url: string): Promise<string | null> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  try {
    if (firecrawlKey) {
      const res = await request("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${firecrawlKey}`,
        },
        body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
        signal: AbortSignal.timeout(20_000),
      });
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const json = (await res.body.json()) as { data?: { markdown?: string } };
        const md = json.data?.markdown;
        if (md && md.trim()) return md;
      }
    }

    // Jina Reader: GET https://r.jina.ai/<full-url> → markdown.
    const jinaKey = process.env.JINA_API_KEY;
    const res = await request(`https://r.jina.ai/${url}`, {
      headers: {
        "user-agent": "aifirst-magazine/0.1 (+contact via repo)",
        "x-return-format": "markdown",
        ...(jinaKey ? { authorization: `Bearer ${jinaKey}` } : {}),
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const text = await res.body.text();
      if (text && text.trim()) return text;
    }
    return null;
  } catch {
    return null;
  }
}

/** Pull `[title](https://…)` markdown links out of reader output as scrape
 * candidates. Dedupes by URL, skips too-short titles, honours a cap. */
export function linksFromMarkdown(
  md: string,
  max = 25,
): Array<{ title: string; url: string }> {
  const re = /\[([^\]]{8,})\]\((https?:\/\/[^)\s]+)\)/g;
  const seen = new Set<string>();
  const out: Array<{ title: string; url: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) && out.length < max) {
    const rawTitle = m[1];
    const url = m[2];
    if (!rawTitle || !url) continue;
    const title = rawTitle.replace(/\s+/g, " ").trim();
    if (seen.has(url) || title.length < 8) continue;
    seen.add(url);
    out.push({ title, url });
  }
  return out;
}
