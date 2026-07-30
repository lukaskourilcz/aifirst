# Caught Up (aifirst)

A daily, AI-generated magazine about Tech and AI. Each day a pipeline scrapes
configured sources, curates the most interesting items, and uses Claude to write a
single selective feature article with an optional restrained illustration.

## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Content:** Markdown/MDX in `content/articles/`, rendered with `next-mdx-remote`
- **Scraping:** RSS-first with HTML fallback (`rss-parser`, `cheerio`, `undici`)
- **Scheduling:** GitHub Actions cron generates and commits the daily issue
- **Images:** `sharp` processing; pluggable generation provider

## Connected third parties

- **Anthropic Claude** — drafts the feature article and curates/summarises source items.
- **fal.ai** — generates the optional editorial illustration (pluggable provider).
- **Guardian / NYTimes / GNews / StackExchange / NASA APIs** — source material for curation.
- **Firecrawl / Jina** — web page fetching and content extraction fallbacks.
- **GitHub** — Actions cron plus token to commit generated articles and illustrations.
- **Vercel Analytics + Speed Insights** — privacy-light traffic and Core Web Vitals metrics.
- **OwnDashboard** — reports each pipeline run's status back to the owner's dashboard.

## Key libraries

- `gray-matter` — frontmatter parsing for the MDX article contract.
- `yaml` — reads the `sources.yml` source configuration.
