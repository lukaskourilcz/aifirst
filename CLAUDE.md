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

- TypeScript strict, no `any`. `noUncheckedIndexedAccess` is on — index
  access and `.split()`/destructuring yield `T | undefined`; narrow or cast
  at the boundary (see `parseSize` in `lib/images/provider.ts`).
- Server components by default; only opt into `'use client'` for interactive
  pieces.
- Content is immutable once committed — regenerating a day overwrites the same
  filename and is reviewed via PR.
- Never commit API keys. Use `.env.local` and document required vars in
  `.env.example`.

## Foundation & shared helpers

Before writing a transformation inline, check whether one of these already
covers it. New cross-cutting logic belongs in `lib/helpers/` or a focused
`lib/*` module, not copy-pasted into a route or component.

- **`lib/helpers/`** — small, pure, single-purpose utilities:
  - `group.ts` `groupBy(items, keyFn)` — bucket into a `Map`; use instead of
    the hand-rolled `map.get(k) ?? []; push` idiom (archive/glossary/stats).
  - `date.ts` `toIsoDate(d?)`, `todayIso()`, `byDateDesc` — date formatting and
    the newest-first comparator used by content listings and the scripts.
  - `dom.ts` `isEditableTarget(target)` — "is the event inside a text field"
    guard shared by all global keyboard handlers.
  - `signal.ts` `signalBars(value)` + `SIGNAL_BARS` — the clamp/fill maths for
    the signal-strength segment bar (component **and** OG image).
- **`lib/hooks/`** — client-only React hooks:
  - `useWindowEvent.ts` `useWindowEvent(type, handler, options?)` — subscribe to
    one or more `window` events with automatic cleanup; the latest handler is
    always invoked, so callers pass no dependency array. Shared by the search
    palette, keyboard-help overlay and reading-progress bar.
- **`lib/content.ts`** is the single source of truth for the frontmatter
  contract and the `ArticleSummary` projection (`toSummary`). Read MDX through
  `readMdxFiles` / the internal frontmatter iterator — don't re-`readdir`.
- **`lib/content-write.ts`** `serializeMdx` / `writeMdxFile` / `quoteYamlDates`
  — the one way to render frontmatter + body to an MDX file (daily, weekly,
  seed). gray-matter coerces unquoted ISO dates to `Date`, so dates stay
  quoted; never re-implement this regex.
- **`lib/feed.ts`** `atomDocument` / `atomEntry` / `escapeXml` / `feedUpdated`
  / `PUBLISH_TIME` — all Atom feeds (site + per-tag) build through these.
- **`lib/anthropic/models.ts`** `MODELS` — the only place model ids live.
  Import it (not a string literal) anywhere a model id is shown or sent;
  `client.ts` re-exports it for the pipeline. Keep it SDK-free so UI/display
  code can import it without pulling in `@anthropic-ai/sdk`.
- **`lib/og-theme.ts`** `OG` — palette/background/font for the OpenGraph
  images (mirrors the CSS custom properties, which `next/og` can't read).
- **Scrapers** build items via `makeItem(url, fields, source)` in
  `lib/scraping/util.ts`; RSS-shaped adapters project through
  `projectRssItem` / `projectFeedItems` (`rss.ts`). Source dispatch is the
  exported `fetchOne` in `run.ts` — the dry-run script reuses it.
- **`lib/config.ts`** `resolveRepo()` (nullable) / `githubRepo()` (with
  fallback) — the canonical owner/repo resolution; don't read the repo env
  vars directly.
- **`lib/i18n/config.ts`** `localePath(locale, path)` builds locale-prefixed
  URLs; `localePrefixer(locale)` returns the `lp` shorthand pages bind once and
  reuse; `resolveLocale(value)` coerces a raw `lang` segment/param to a `Locale`
  (use it in route handlers and the print view). `lib/i18n/metadata.ts`
  `localeAlternates(locale, path)` builds the canonical + hreflang + Atom block
  shared by the home and article `generateMetadata`.
- **`lib/glossary.ts`** `resolveGlossaryTerms(names, terms)` turns an issue's
  `glossary_terms` name list into resolved `GlossaryTerm`s (home/article/print).
- **Shared presentational components** (`components/`): `PageShell` (the
  `.container` section + kicker/title/intro every secondary page opens with),
  `IssueRow` (the `entry-row` date + title list item), `StatCard` (the bordered
  label + big-number tile) and `ModalOverlay` (the click-out backdrop + panel
  behind the search and keyboard-help dialogs). Reach for these before hand-
  rolling the same markup again.

### Import specifiers (build gotcha)

- Relative **value** imports in lib modules that are reached from `app/`
  (server components, routes) must be **extensionless** (`./text`,
  `./helpers/date`) — Next's webpack will not resolve a `.js` specifier to a
  `.ts` source for a runtime import, and the build fails.
- `import type` is erased before bundling, so type-only relative imports may
  keep the repo's `.js` suffix.
- Script-only and pipeline modules (run via `tsx`/vitest) tolerate `.js`
  specifiers; the existing `.js`-suffixed imports there are fine. When in
  doubt, prefer extensionless relative or the `@/` alias for UI code.

## Common tasks

- `/scaffold-magazine` — bootstrap the Next.js app and lib/ skeleton.
- `/add-source <url-or-name>` — add a scraping source.
- `/generate-article` — run the daily pipeline locally.
- `/preview-magazine` — start the dev server.

Specialized agents (`source-scout`, `scraper-builder`, `article-writer`,
`ui-designer`) handle larger pieces — see `.claude/agents/`.
