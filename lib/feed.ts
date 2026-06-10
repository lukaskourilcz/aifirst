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
  return latestDate ? `${latestDate}${PUBLISH_TIME}` : new Date().toISOString();
}

export type AtomEntry = {
  title: string;
  url: string;
  date: string;
  summary: string;
  category?: string;
};

export function atomEntry(e: AtomEntry): string {
  const category = e.category
    ? `\n    <category term="${escapeXml(e.category)}"/>`
    : "";
  return `  <entry>
    <title>${escapeXml(e.title)}</title>
    <link href="${e.url}"/>
    <id>${e.url}</id>
    <updated>${e.date}${PUBLISH_TIME}</updated>
    <summary>${escapeXml(e.summary)}</summary>${category}
  </entry>`;
}

export function atomDocument(opts: {
  title: string;
  alternateHref: string;
  selfHref: string;
  id: string;
  updated: string;
  entries: string[];
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(opts.title)}</title>
  <link href="${opts.alternateHref}" rel="alternate"/>
  <link href="${opts.selfHref}" rel="self"/>
  <id>${opts.id}</id>
  <updated>${opts.updated}</updated>
${opts.entries.join("\n")}
</feed>
`;
}
