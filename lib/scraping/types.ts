export type SourceType = "rss" | "html" | "hn" | "arxiv" | "bluesky";

export type Source = {
  id: string;
  type: SourceType;
  name: string;
  weight?: number;
  tags?: string[];
  // type-specific
  url?: string;     // rss, html
  query?: string;   // arxiv, bluesky
};

export type ScrapedItem = {
  id: string;
  url: string;
  title: string;
  summary: string;
  publishedAt: string;
  source: string;
  tags: string[];
  raw?: string;
};
