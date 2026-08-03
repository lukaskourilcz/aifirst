---
name: magazine-architecture
description: Conventions and module boundaries for the aifirst AI tech magazine. Use whenever creating routes, lib modules, or wiring the daily pipeline so the pieces stay decoupled.
---

# Magazine architecture

The project is split into three layers that must not leak into each other:

1. **Sources & scraping** (`lib/scraping/`)
   - One adapter per source type: `rss.ts`, `html.ts`, `hn.ts`, `arxiv.ts`.
   - Each adapter exports `fetch(source): Promise<ScrapedItem[]>`.
   - `ScrapedItem` shape:
     ```ts
     type ScrapedItem = {
       id: string;         // stable hash of url
       url: string;
       title: string;
       summary: string;    // 1-3 sentences
       publishedAt: string;// ISO
       source: string;     // source id from sources.yml
       tags: string[];
       raw?: string;       // optional full text/html
     };
     ```
   - `lib/scraping/run.ts` iterates `sources.yml`, fans out adapters in
     parallel with a small concurrency cap, dedupes by URL, returns
     `ScrapedItem[]`.

2. **Pipeline** (`lib/pipeline/`)
   - `curate.ts` — given `ScrapedItem[]`, asks Codex Sonnet to pick the
     top 5-8 items and write a 1-line angle for each. Returns
     `CuratedBrief`.
   - `write.ts` — given `CuratedBrief`, asks Codex Opus to write the
     daily feature article in MDX (frontmatter + body). Returns
     `{ frontmatter, mdx, illustrationPrompt }`.
   - `illustrate.ts` — calls the image provider with
     `illustrationPrompt`, saves to `public/illustrations/YYYY-MM-DD.webp`.
   - `persist.ts` — writes the MDX file under `content/articles/`.

3. **Presentation** (`app/`, `components/`)
   - Reads MDX from `content/articles/`, never imports from `lib/scraping`
     or `lib/pipeline`.
   - All server components unless interactivity is required.

## Daily entry point

`scripts/generate-daily.ts`:

```ts
const items = await runScrapers(loadSources());
const brief = await curate(items);
const article = await write(brief);
const image = await illustrate(article.illustrationPrompt);
await persist(article, image);
```

This is what the GitHub Actions cron runs. It must be idempotent for a given
date — re-running overwrites the same files.

## Anthropic client

- One shared client in `lib/anthropic/client.ts`.
- Models: `Codex-opus-4-7` for the article, `Codex-sonnet-4-6` for
  curation and summarisation, `Codex-haiku-4-5-20251001` for cheap utility
  passes (e.g. tag extraction).
- Use prompt caching: put the long stable system prompt and the article
  style guide as a cached block. See `.Codex/skills/article-pipeline`.

## Environment variables

Document every var in `.env.example`. Required:

- `ANTHROPIC_API_KEY`
- `IMAGE_PROVIDER` (`fal` | `replicate` | `none`)
- `FAL_KEY` / `REPLICATE_API_TOKEN` (whichever is selected)

## Don'ts

- Don't bundle scraping libraries into the client. Scraping only runs in
  `scripts/` and route handlers explicitly marked `runtime = 'nodejs'`.
- Don't fetch live sources during page rendering — always read from
  committed MDX.
- Don't introduce a database without discussion; the markdown-in-repo
  model is intentional.
