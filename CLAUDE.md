# Caught Up (`aifirst` repository)

A daily AI-generated magazine about Tech and AI. Each day a pipeline scrapes
configured sources, curates the most interesting items, and uses Claude to
write a single selective feature article with an optional restrained editorial illustration.

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
  promotion/page.tsx       # secret IG/Threads console (direct URL only)
components/                # React components (editorial UI)
content/articles/          # generated MDX articles
content/promotion/         # generated IG/Threads copy (one JSON per date)
lib/
  scraping/                # source adapters + runners
  pipeline/                # curate -> write -> illustrate -> promote
  images/                  # image provider interface
  anthropic/               # SDK client + shared prompts
  promotion.ts             # promotion types + guard (browser-safe)
  promotion-store.ts       # promotion JSON read/write (server only)
public/illustrations/      # generated illustrations
sources.yml                # configured sources
scripts/
  generate-daily.ts        # entry point for the cron job
```

## Design language

Calm editorial design. Reuse the existing typographic, paper, slate and blueprint
tokens; avoid neon, robots, glowing brains, generic circuits and sci-fi clichés.
scanline textures, monospaced display type for headlines, generous negative
space. Performance-first: no heavy WebGL unless behind a reduced-motion check.

Tokens live in the palette block at the top of `app/globals.css`. Prefer the
semantic roles (`--surface-*`, `--text-*`, `--border-*`, `--accent-*`,
`--status-*`, `--focus-ring`) in new rules; the raw `--color-*` values stay for
existing ones. `--color-slate` and `--color-mint` are set for measured contrast
against the paper surfaces, not for taste — re-measure before changing either,
and mirror any palette change into `lib/og-theme.ts`, which `next/og` cannot
read from CSS. Display steps (`--text-lead`, `--text-subheading`,
`--text-heading`, `--text-display`) use `clamp()`; body steps stay fixed,
because reading size should not depend on window width.

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
- Observability: `<SpeedInsights />` + `<Analytics />` (Vercel) mount once in
  `app/layout.tsx`. The CSP in `next.config.mjs` allow-lists their two
  first-party hosts — `va.vercel-scripts.com` (collector script) and
  `vitals.vercel-insights.com` (vitals beacon); extend the CSP there, not
  inline, if you add any other third-party script.
- `pnpm analyze` (`ANALYZE=true next build`) opens a bundle treemap via
  `@next/bundle-analyzer` to catch client-JS regressions. It's dev-only and
  ships nothing; watch the build's first-load column for jumps over +10 KB.

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


## Shared skills

Four skills in `.claude/skills/` are vendored verbatim from upstream and kept
identical across every repository. Each carries an `UPSTREAM.md` with its
source, pinned commit, and license — re-vendor rather than hand-editing them.

- **`task-observer`** — invoke at the **start of every task-oriented session**,
  before producing deliverables. It records corrections and workflow friction in
  an observation log so they can become skill improvements later. Its log lives
  outside the repo; `.claude/observations/` is git-ignored.
- **`stop-slop`** — apply to every piece of prose that ships: documentation,
  `NEEDED.md` entries, UI copy, commit bodies, and pull-request descriptions.
- **`ui-ux-pro-max`** — consult before visual or interaction decisions. Query
  the bundled database with
  `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`
  (domains: `ux`, `style`, `color`, `typography`, `product`, `chart`, `gsap`).
  It is generic advice. **This repository's own design contract always wins**
  where the two disagree — never let a generic recommendation override a
  documented product invariant.
- **`find-skills`** — use when a capability might already exist as an
  installable skill instead of hand-rolling one. Its `npx skills` commands need
  network access; fall back to working directly when that is unavailable.

## Session routine & markdown conventions

This repo follows a shared markdown contract (see the `session-start`,
`session-end`, and `markdown-checkup` skills under `.claude/skills/`):

- **`NEEDED.md`** — owner/agent action items. Each task:
  `- [ ] **Title** — desc. [imp:1-5] [owner:me|ai] [time:30m] [kind:K]`, where
  `[kind:K]` is one of `setup` `deploy` `legal` `content` `decision`.
- **`about-project.md`** — project summary + the tech stack.
- **`scaling.md`** — cost & scaling only (renamed from `stack-and-scaling.md`).
- **`monetization.md`** — how the project could earn (options table).

At session start, check `NEEDED.md` for `[owner:ai]` tasks that can now be done;
at session end, update `NEEDED.md` (finished + newly-needed owner items).

## Git workflow (every session)

- **Commit frequently** in small, coherent steps — never batch a whole session into one commit.
- **At the end of every session, push and merge to `main`** so the change redeploys immediately (this project auto-deploys from `main` on Vercel).
- **Delete the merged / old branch** (local and remote) after merging, to keep the repo clean. Never leave stale branches behind.
