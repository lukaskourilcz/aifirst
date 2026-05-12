# aifirst — AI Tech Magazine

A daily AI-generated magazine about Tech and AI. Each day a pipeline scrapes
configured sources, curates the most interesting items, and uses Claude to
write a single feature article along with a generated sci-fi illustration.

## Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Content**: Markdown / MDX files in `content/articles/YYYY-MM-DD.mdx`
- **Article generation**: Anthropic SDK (`@anthropic-ai/sdk`), model
  `claude-opus-4-7` for drafting, `claude-sonnet-4-6` for summarisation /
  curation. Use prompt caching on system prompts.
- **Scraping**: RSS first, HTML fallback (e.g. `rss-parser`, `cheerio`,
  `undici`). Source list lives in `sources.yml`.
- **Image generation**: pluggable provider behind
  `lib/images/provider.ts`. Default scaffolded as fal.ai (FLUX) but the
  interface is provider-agnostic.
- **Scheduling**: GitHub Actions cron `0 6 * * *` runs `pnpm generate:daily`,
  commits the result to `content/articles/` and `public/illustrations/`.

## Repo layout (target)

```
app/                       # Next.js routes
  page.tsx                 # latest article (today)
  archive/page.tsx         # archive index
  articles/[slug]/page.tsx # individual article
components/                # React components (sci-fi UI)
content/articles/          # generated MDX articles
lib/
  scraping/                # source adapters + runners
  pipeline/                # curate -> write -> illustrate
  images/                  # image provider interface
  anthropic/               # SDK client + shared prompts
public/illustrations/      # generated illustrations
sources.yml                # configured sources
scripts/
  generate-daily.ts        # entry point for the cron job
```

## Design language

Sci-fi / futuristic. See `.claude/skills/sci-fi-design-system`.
Highlights: deep space backgrounds, neon cyan + magenta accents, glass / CRT
scanline textures, monospaced display type for headlines, generous negative
space. Performance-first: no heavy WebGL unless behind a reduced-motion check.

## Conventions

- TypeScript strict, no `any`.
- Server components by default; only opt into `'use client'` for interactive
  pieces.
- Content is immutable once committed — regenerating a day overwrites the same
  filename and is reviewed via PR.
- Never commit API keys. Use `.env.local` and document required vars in
  `.env.example`.

## Common tasks

- `/scaffold-magazine` — bootstrap the Next.js app and lib/ skeleton.
- `/add-source <url-or-name>` — add a scraping source.
- `/generate-article` — run the daily pipeline locally.
- `/preview-magazine` — start the dev server.

Specialized agents (`source-scout`, `scraper-builder`, `article-writer`,
`ui-designer`) handle larger pieces — see `.claude/agents/`.
