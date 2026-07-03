export type SourceType =
  | "rss"
  | "html"
  | "hn"
  | "arxiv"
  | "bluesky"
  | "spaceflight"
  | "github"
  | "stackexchange"
  | "guardian"
  | "nytimes"
  | "gnews";

export type Source = {
  id: string;
  type: SourceType;
  name: string;
  weight?: number;
  tags?: string[];
  // type-specific
  url?: string;     // rss, html
  query?: string;   // arxiv, bluesky, guardian, nytimes, gnews, stackexchange (tag)
  repos?: string[]; // github — "owner/repo" list to pull releases from
  section?: string; // guardian — section slug (e.g. "technology")
  site?: string;    // stackexchange — site slug (e.g. "stackoverflow")
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
