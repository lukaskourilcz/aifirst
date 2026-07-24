---
name: tech-source-scraper
description: How to add and implement scrapers for tech/AI news sources (RSS, HTML, API). Use when adding a new source to sources.yml or building/debugging a scraper adapter under lib/scraping.
---

# Tech source scraper

Goal: turn any tech/AI publication into a stream of `ScrapedItem`s the
pipeline can curate.

## Source registry — `sources.yml`

```yaml
sources:
  - id: hn-frontpage
    type: hn            # rss | html | hn | arxiv | api
    name: Hacker News (front page)
    weight: 0.8         # 0..1, used by curator as a prior
    tags: [general, tech]

  - id: ars-technica-ai
    type: rss
    url: https://feeds.arstechnica.com/arstechnica/index
    filter: { tags: [ai, ml] }
    weight: 0.7
    tags: [ai, news]

  - id: nieman-lab
    type: html            # last resort: no usable feed; reader fallback for gating
    url: https://www.niemanlab.org/
    weight: 0.7
    tags: [platforms, media, ai]
```

Required fields: `id`, `type`, `name`, plus whatever the adapter needs
(`url` for RSS/HTML, nothing for `hn`/`arxiv`). `weight` defaults to `0.5`.
An `html` source only needs a homepage `url`; the reader fallback below
handles pages a plain fetch can't parse.

## Preferred order

1. **RSS** — almost every tech publication has one. Use `rss-parser`.
   Cheapest and most stable.
2. **JSON API** — Hacker News (`https://hacker-news.firebaseio.com/v0/`),
   arXiv (`http://export.arxiv.org/api/query`), Lobsters
   (`https://lobste.rs/hottest.json`), Reddit `.json` endpoints.
3. **HTML scraping** (`type: html`) — only when nothing else works. Use
   `undici` + `cheerio`. Set a real `User-Agent`, respect `robots.txt`,
   cache responses for the run. The shipped `lib/scraping/html.ts` reads
   `<article>` links from the raw markup, and when that yields nothing
   (JS-rendered or Cloudflare-gated pages, e.g. Nieman Lab, Tubefilter) it
   falls back to a **reader service** via `lib/scraping/reader.ts`:
   - **Jina Reader** (`https://r.jina.ai/<url>`) — keyless at low rates,
     the default. Set `JINA_API_KEY` to raise the limits.
   - **Firecrawl** (`https://firecrawl.dev`) — used first when
     `FIRECRAWL_API_KEY` is set; strips boilerplate server-side and is the
     most robust against gating.
   Without either configured, an `html` source that a plain fetch can't
   read simply returns no items (it self-skips, never throws).

## Adapter contract

```ts
// lib/scraping/<type>.ts
export async function fetch(source: Source): Promise<ScrapedItem[]>;
```

- Must not throw on partial failure — return what it can and log warnings.
- Must respect a 10s per-source timeout (`AbortSignal.timeout(10_000)`).
- Must produce stable `id`s (`sha1(url)`).
- Must clamp `summary` to ~500 chars.

## Seed sources to ship with

When scaffolding, populate `sources.yml` with at least:

- Hacker News (`hn`)
- arXiv cs.AI / cs.LG (`arxiv`)
- Ars Technica AI feed (`rss`)
- The Verge AI feed (`rss`)
- MIT Technology Review AI feed (`rss`)
- TechCrunch AI (`rss`)
- Anthropic news (`rss`)
- OpenAI blog (`rss`)
- Google DeepMind blog (`rss`)
- Hugging Face blog (`rss`)
- Simon Willison's blog (`rss`)

URLs change — verify with WebFetch before committing a new source.

## Ethics & rate limits

- Respect `robots.txt`. The `html` adapter must check it before fetching.
- Never republish full text — store at most a 500-char summary plus link.
- Add `from=aifirst-magazine` to outgoing URLs when the source supports
  attribution params.

## Adding a source

Use the `/add-source` slash command — it does the WebFetch verification,
detects the type, and appends to `sources.yml`. If invoked manually,
follow the same steps: verify the feed/endpoint, pick the adapter, add
the entry, run `pnpm scrape:dry <id>` to confirm output.
