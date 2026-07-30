---
description: Add a new tech/AI source to sources.yml. Usage - /add-source <url or publication name>
argument-hint: <url-or-name>
---

Add a new source to `sources.yml`. Argument: $ARGUMENTS — either a
homepage URL or a publication name.

## Steps

1. If `$ARGUMENTS` is a name (not a URL), search via WebSearch to find
   the homepage, then WebFetch it.
2. Detect the best adapter type, in priority order:
   - `rss` — look for `<link rel="alternate" type="application/rss+xml">`
     in the homepage HTML, or try `/feed`, `/rss`, `/atom.xml`.
   - Known specialised types: `hn`, `arxiv`, `lobsters`, `reddit`.
   - `html` only as a last resort, after checking `robots.txt`. Give it
     just the homepage `url`; `lib/scraping/html.ts` scrapes `<article>`
     links and, for JS-rendered or Cloudflare-gated pages (e.g. Nieman
     Lab, Tubefilter), falls back to a reader service (keyless Jina, or
     Firecrawl when `FIRECRAWL_API_KEY` is set). Note in the entry that
     it needs the reader fallback so the owner knows to configure a key.
3. Verify the feed with WebFetch — it must return well-formed XML/JSON
   and contain at least 5 recent items dated within the last 30 days.
4. Infer tags and weight from `sources.yml`, `config/topics.yml`, and the
   observed evidence when the choice is routine. Ask only when a materially
   different editorial choice cannot be resolved from repository context.
   ```yaml
   - id: <kebab-case-id>
     type: rss
     name: <Human readable name>
     url: <feed-url>
     weight: 0.6
     tags: [ai, news]
   ```
5. Append to `sources.yml`, keeping the file sorted by `id`.
6. Run `pnpm scrape:dry <id>` if the project is scaffolded. Report the
   item count and a couple of sample titles.
7. Run the focused config tests and dry scrape. Commit only when the task
   authorizes commits; during a larger autonomous implementation, include the
   addition in a coherent validated milestone.

If the source already exists, do not duplicate it. Distinguish verified source
behavior from assumptions and never expose private scrape diagnostics.
