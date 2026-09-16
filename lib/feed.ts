// Atom feed building shared by the site feed and the per-tag feeds.

// Daily issues publish at 06:00 UTC; appended to the date to form an
// RFC-3339 timestamp.
export const PUBLISH_TIME = "T06:00:00Z";

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Resolve the feed-level <updated> timestamp from the latest issue date.
export function feedUpdated(latestDate?: string): string {
  return latestDate
    ? latestDate.includes("T") ? latestDate : `${latestDate}${PUBLISH_TIME}`
    : "1970-01-01T00:00:00Z";
}

export type FeedAuthor = {
  name: string;
  uri?: string;
};

export type AtomEntry = {
  title: string;
  url: string;
  published: string;
  updated?: string;
  summary: string;
  categories?: string[];
  language: string;
  imageUrl?: string;
  /** Overrides the MIME type derived from the image extension. */
  imageType?: string;
  /** Size of the enclosure in bytes, omitted when it cannot be measured. */
  imageLength?: number;
  related?: Array<{ url: string; title: string }>;
  author?: FeedAuthor;
};

const IMAGE_MIME_TYPES: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

/**
 * The MIME type an enclosure declares. Seven delivered editions ship a drawn
 * `.svg` plate, so a hardcoded `image/webp` was a lie about a third of the
 * archive.
 */
export function imageMimeType(url: string): string {
  const extension = url.split("?")[0]?.split("#")[0]?.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_MIME_TYPES[extension] ?? "application/octet-stream";
}

// RFC 4287 §4.1.1 requires an atom:author on the feed unless every entry
// carries one. Neither did, which was the feeds' one hard validity error.
function authorElement(author: FeedAuthor | undefined, indent: string): string {
  if (!author) return "";
  const uri = author.uri ? `\n${indent}  <uri>${escapeXml(author.uri)}</uri>` : "";
  return `\n${indent}<author>\n${indent}  <name>${escapeXml(author.name)}</name>${uri}\n${indent}</author>`;
}

export function atomEntry(e: AtomEntry): string {
  const categories = (e.categories ?? [])
    .map((category) => `\n    <category term="${escapeXml(category)}"/>`)
    .join("");
  const image = e.imageUrl
    ? `\n    <link href="${escapeXml(e.imageUrl)}" rel="enclosure" type="${escapeXml(e.imageType ?? imageMimeType(e.imageUrl))}"${
        e.imageLength !== undefined ? ` length="${e.imageLength}"` : ""
      }/>`
    : "";
  const related = (e.related ?? [])
    .map(({ url, title }) => `\n    <link href="${escapeXml(url)}" rel="related" title="${escapeXml(title)}"/>`)
    .join("");
  const published = feedUpdated(e.published);
  const updated = feedUpdated(e.updated ?? e.published);
  return `  <entry xml:lang="${escapeXml(e.language)}">
    <title>${escapeXml(e.title)}</title>
    <link href="${escapeXml(e.url)}"/>
    <id>${escapeXml(e.url)}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary>${escapeXml(e.summary)}</summary>${categories}${image}${related}${authorElement(e.author, "    ")}
  </entry>`;
}

export function atomDocument(opts: {
  title: string;
  alternateHref: string;
  selfHref: string;
  id: string;
  updated: string;
  language: string;
  entries: string[];
  author?: FeedAuthor;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${escapeXml(opts.language)}">
  <title>${escapeXml(opts.title)}</title>
  <link href="${escapeXml(opts.alternateHref)}" rel="alternate"/>
  <link href="${escapeXml(opts.selfHref)}" rel="self" type="application/atom+xml"/>
  <id>${escapeXml(opts.id)}</id>
  <updated>${opts.updated}</updated>${authorElement(opts.author, "  ")}
${opts.entries.join("\n")}
</feed>
`;
}

// --- Google News sitemap -----------------------------------------------------
//
// A news sitemap is a sitemap, not a feed, but it is built from the same index
// and wants the same escaping discipline, so its pure builders live here beside
// the Atom ones and stay testable without a filesystem.

/** Google reads the last two days of a news sitemap and ignores anything older. */
export const NEWS_WINDOW_DAYS = 2;

/** The per-file ceiling in Google's news-sitemap specification. */
export const NEWS_SITEMAP_MAX_ENTRIES = 1000;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

/**
 * The oldest edition date the window still admits, counted back from the newest
 * edition rather than from a clock.
 *
 * The site is static and rebuilds when content lands, so a clock-based window
 * would make two builds of the same content tree emit different XML. The
 * trade-off is that a rebuild days after the last edition still lists it, which
 * fails safe: Google ignores entries older than two days either way.
 */
export function newsWindowStart(latestDate: string): string {
  const match = ISO_DATE.exec(latestDate);
  if (!match) return latestDate;
  const day = match[0];
  const start = new Date(
    Date.UTC(
      Number(day.slice(0, 4)),
      Number(day.slice(5, 7)) - 1,
      Number(day.slice(8, 10)) - (NEWS_WINDOW_DAYS - 1),
    ),
  );
  return start.toISOString().slice(0, 10);
}

export type NewsUrl = {
  /** Absolute URL of the reading page. */
  url: string;
  title: string;
  /** An RFC-3339 instant, or a bare `YYYY-MM-DD` that resolves to the publishing slot. */
  published: string;
  /** The language the file is written in, which is not always the served locale. */
  language: string;
  /** The publication name, passed in so this builder stays free of brand imports. */
  publication: string;
};

export function newsUrl(entry: NewsUrl): string {
  return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(entry.publication)}</news:name>
        <news:language>${escapeXml(entry.language)}</news:language>
      </news:publication>
      <news:publication_date>${feedUpdated(entry.published)}</news:publication_date>
      <news:title>${escapeXml(entry.title)}</news:title>
    </news:news>
  </url>`;
}

export function newsSitemapDocument(entries: string[]): string {
  const body = entries.length ? `\n${entries.join("\n")}` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${body}
</urlset>
`;
}
