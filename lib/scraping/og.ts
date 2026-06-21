import { request } from "undici";

// Best-effort Open Graph image fetcher. Hits a URL with a short timeout,
// scrapes the HTML for the most popular meta-image conventions, and returns
// an absolute URL or null. Never throws — callers treat null as "no image."
//
// Lookup order:
//   1. <meta property="og:image" content="...">
//   2. <meta name="og:image" ...>
//   3. <meta name="twitter:image" ...>
//   4. <link rel="image_src" href="...">
//
// We deliberately use a regex rather than cheerio: the script runs across
// dozens of URLs and the HTML can be huge — a full DOM parse is overkill.

const META_PATTERNS: Array<{ attr: string; key: string }> = [
  { attr: "property", key: "og:image" },
  { attr: "name", key: "og:image" },
  { attr: "name", key: "twitter:image" },
  { attr: "property", key: "twitter:image" },
];

function metaContent(html: string, attr: string, key: string): string | null {
  // Forward form: <meta attr="key" content="..">
  const fwd = new RegExp(
    `<meta\\s+[^>]*?${attr}=["']${key}["'][^>]*?content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const fwdMatch = html.match(fwd);
  if (fwdMatch?.[1]) return fwdMatch[1];
  // Reverse form: <meta content=".." attr="key">
  const rev = new RegExp(
    `<meta\\s+[^>]*?content=["']([^"']+)["'][^>]*?${attr}=["']${key}["'][^>]*>`,
    "i",
  );
  const revMatch = html.match(rev);
  return revMatch?.[1] ?? null;
}

function linkImageSrc(html: string): string | null {
  const m = html.match(
    /<link\s+[^>]*?rel=["']image_src["'][^>]*?href=["']([^"']+)["'][^>]*>/i,
  );
  return m?.[1] ?? null;
}

export async function fetchOgImage(pageUrl: string): Promise<string | null> {
  try {
    const { statusCode, body, headers } = await request(pageUrl, {
      signal: AbortSignal.timeout(8_000),
      headers: {
        "user-agent": "aifirst-og-bot/0.1 (+https://github.com/lukaskourilcz/aifirst)",
        accept: "text/html,application/xhtml+xml",
      },
      maxRedirections: 4,
    });
    if (statusCode >= 400) return null;
    const ct = String(headers["content-type"] ?? "");
    if (!ct.toLowerCase().includes("html")) return null;
    // 256KB head is enough — meta tags live near the top.
    const decoder = new TextDecoder("utf-8", { fatal: false });
    let collected = "";
    for await (const chunk of body) {
      collected += decoder.decode(chunk as Buffer, { stream: true });
      if (collected.length > 256 * 1024) break;
    }

    let raw: string | null = null;
    for (const { attr, key } of META_PATTERNS) {
      raw = metaContent(collected, attr, key);
      if (raw) break;
    }
    if (!raw) raw = linkImageSrc(collected);
    if (!raw) return null;

    return new URL(raw, pageUrl).toString();
  } catch {
    return null;
  }
}
