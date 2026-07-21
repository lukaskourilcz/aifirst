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

export type AtomEntry = {
  title: string;
  url: string;
  published: string;
  updated?: string;
  summary: string;
  categories?: string[];
  language: string;
  imageUrl?: string;
  related?: Array<{ url: string; title: string }>;
};

export function atomEntry(e: AtomEntry): string {
  const categories = (e.categories ?? [])
    .map((category) => `\n    <category term="${escapeXml(category)}"/>`)
    .join("");
  const image = e.imageUrl
    ? `\n    <link href="${escapeXml(e.imageUrl)}" rel="enclosure" type="image/webp"/>`
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
    <summary>${escapeXml(e.summary)}</summary>${categories}${image}${related}
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
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${escapeXml(opts.language)}">
  <title>${escapeXml(opts.title)}</title>
  <link href="${escapeXml(opts.alternateHref)}" rel="alternate"/>
  <link href="${escapeXml(opts.selfHref)}" rel="self" type="application/atom+xml"/>
  <id>${escapeXml(opts.id)}</id>
  <updated>${opts.updated}</updated>
${opts.entries.join("\n")}
</feed>
`;
}
