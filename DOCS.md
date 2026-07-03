# aifirst — full documentation

This is the deep reference for the magazine. The
[README](./README.md) is the quick tour. This file covers everything
the app can do, how each piece works, the data contracts, the
deployment surface, and the operational model.

---

## Table of contents

1. [What the magazine is](#what-the-magazine-is)
2. [Surfaces — every route](#surfaces--every-route)
3. [Editorial features](#editorial-features)
4. [The pipeline](#the-pipeline)
5. [Frontmatter contract](#frontmatter-contract)
6. [Sources registry](#sources-registry)
7. [Glossary](#glossary)
8. [Signal strength](#signal-strength)
9. [Weekly digest](#weekly-digest)
10. [Theme system](#theme-system)
11. [Image generation](#image-generation)
12. [Static generation, ISR, and caching](#static-generation-isr-and-caching)
13. [API endpoints](#api-endpoints)
14. [Search](#search)
15. [Keyboard shortcuts](#keyboard-shortcuts)
16. [Accessibility](#accessibility)
17. [Performance budget](#performance-budget)
18. [Security](#security)
19. [Tests](#tests)
20. [Content validation](#content-validation)
21. [Operations](#operations)
22. [Environment variables](#environment-variables)
23. [Deployment to Vercel + GitHub Actions](#deployment)
24. [File and module layout](#file-and-module-layout)
25. [.claude/ — skills, agents, commands](#claude--skills-agents-commands)
26. [Conventions](#conventions)
27. [Known limitations and trade-offs](#known-limitations-and-trade-offs)
28. [Changelog of major rounds](#changelog-of-major-rounds)

---

## What the magazine is

**aifirst is a daily, AI-written magazine about AI and technology.**

Every morning a scheduled job:

1. **Scrapes** a curated list of RSS feeds, the Hacker News API, and
   the arXiv API (plus a generic HTML fallback for stragglers).
2. **Curates** the deduplicated pool with Claude Sonnet — picks 5–8
   items and writes a one-paragraph editorial thesis tying them
   together.
3. **Writes** the day's feature article with Claude Opus (~800–1200
   words) plus 2–4 short *dispatches* and a 4–8-item *wire* of
   runner-up items, all in one tool-use call.
4. **Illustrates** the cover with a pluggable provider (fal.ai by
   default, with a placeholder fallback).
5. **Persists** an MDX file at `content/articles/YYYY-MM-DD.mdx`,
   commits it back to the branch, and Vercel redeploys.

Every Sunday at 07:00 UTC a second cron produces a **weekly digest**
that ties the past seven dailies into a single short feature.

The rendered site itself is fully static: no databases, no third-party
scripts at request time, no live API calls for content. Every route
is prerendered, every per-issue OG image is rendered at build, every
JSON endpoint is materialised once and served from the CDN.

---

## Surfaces — every route

### Reading

| Route | Purpose |
|---|---|
| `/` | Today's feature — cover, dek, body, dispatches, wire, sources, recent issues |
| `/articles/[slug]` | A single issue, with reading-progress bar, related issues, optional weekly badge, glossary block |
| `/articles/[slug]/print` | Print-optimised broadsheet view; escapes the root layout |
| `/articles/[slug]/opengraph-image` | Dynamic 1200×630 PNG with title, dek, date, tags, signal-strength bar |
| `/archive` | Every issue grouped by month, weekly digests tagged |

### Browse

| Route | Purpose |
|---|---|
| `/tags` | All tags, ordered by frequency |
| `/tags/[tag]` | All issues bearing that tag |
| `/tags/[tag]/feed.xml` | Atom feed per tag |
| `/sources` | The scraper registry — name, type, weight bar, tags, citation count |
| `/sources/[id]` | Single source — weight, citation count, last cited, the issues that cited it |
| `/search` | Full index + global ⌘K / `/` palette |
| `/glossary` | Recurring magazine terms, grouped by tag |

### Meta

| Route | Purpose |
|---|---|
| `/stats` | Telemetry — total issues, avg signal, cadence sparkline, top tags, most-cited sources |
| `/trends` | Top tags × months as a stacked SVG chart |
| `/colophon` | How the magazine is made — pipeline steps, models, formulas, editorial standards |
| `/health` | GitHub Actions run history — per-workflow status dots, success rate, last success / failure |
| `/admin` | Operator console — copy-paste `gh workflow run` commands for any issue. `noindex`. |

### Machine-readable

| Route | Format | Purpose |
|---|---|---|
| `/feed.xml` | Atom | Site-wide feed |
| `/tags/[tag]/feed.xml` | Atom | Per-tag feed |
| `/sitemap.xml` | XML | Sitemap, including tag pages |
| `/robots.txt` | text | Allow root, disallow `/admin` and `/health` |
| `/api/today.json` | JSON | Latest issue with type, url, signal, dispatches, wire, digest |
| `/api/sources.json` | JSON | Registry with citation stats |
| `/api/health.json` | JSON | Uptime monitor endpoint — status, age of latest issue |
| `/opengraph-image` | PNG | Default site OG card |
| `/icon.svg` | SVG | Favicon |

### Error states

- `/articles/<unknown>` → 404 page (sci-fi themed)
- `/tags/<unknown>` → 404
- `/sources/<unknown>` → 404
- Runtime exceptions in any route → `app/error.tsx`
- Runtime exceptions in the root layout itself → `app/global-error.tsx`

---

## Editorial features

These are the things that make each issue feel like a magazine rather
than a blog post.

- **Editor's note** — an optional amber-accented italic callout near
  the top of an issue, explaining the curatorial choice for that day.
  Driven by `editors_note` in frontmatter.
- **Dispatches** — 2–4 short prose vignettes (~60–100 words each) per
  issue. Rendered as a 3-up card grid with HUD corner brackets at the
  foot of the article. Generated alongside the feature.
- **Wire** — 4–8 runner-up items the curator considered but didn't
  lead with. HUD-style numbered grid with dashed-underline links and
  source attribution.
- **Signal strength** — a 0–100 integer per issue, computed
  deterministically from cited-source diversity and weight. Surfaced
  as a 12-segment bar in the data strip and on the OG image.
- **Glossary block** — when an issue declares `glossary_terms`, the
  matching entries from `glossary.yml` render at the foot of the
  article.
- **Sources block** — numbered `[01]`, `[02]` citations at the foot
  with the source title and outbound link.
- **Related issues** — three cards at the article foot ranked by tag
  overlap, then date.
- **Reading progress bar** — a fixed 2px cyan-magenta gradient bar at
  the top of the viewport, growing with scroll.
- **Heading anchors** — `##` and `###` get an id and a hover-revealed
  `§` link in the left margin.
- **Print view** — `/articles/[slug]/print` renders a clean serif
  broadsheet with drop cap, justified hyphenated text, and link URLs
  printed inline (`@media print`).
- **Tag chips** — cyan-bordered pills with `#` glyph, linking to the
  tag page.
- **Weekly badge** — when the article is a weekly digest, a magenta
  callout lists the covered daily issues with deep links.

---

## The pipeline

### Architecture

Three layers, intentionally decoupled:

```
sources.yml + glossary.yml
        │
        ▼
┌────────────────────┐   ┌─────────────────────┐   ┌────────────────┐
│ lib/scraping/      │ → │ lib/pipeline/       │ → │ content/       │
│ rss / hn / arxiv / │   │ curate → write →    │   │ articles/      │
│ html               │   │ illustrate → persist│   │ *.mdx          │
└────────────────────┘   └─────────────────────┘   └────────────────┘
                                                          │
                                                          ▼
                                                  ┌────────────────┐
                                                  │ app/ (read-only│
                                                  │ MDX consumer)  │
                                                  └────────────────┘
```

The presentation layer (`app/`, `components/`) never imports from
`lib/scraping` or `lib/pipeline`. Articles are read from MDX at build
time only.

### Scraping (`lib/scraping/`)

One adapter per source type. Each exposes
`fetch(source): Promise<ScrapedItem[]>` with:

- 10-second timeout per source (`AbortSignal.timeout`)
- Stable `id = sha1(url).slice(0, 16)`
- HTML stripped + clamped to 500 chars in `summary`
- Partial-failure tolerance: returns whatever it got, logs warnings,
  never throws
- The HTML adapter checks `robots.txt`

Adapters:

| Type | Adapter | Backing API |
|---|---|---|
| `rss` | `lib/scraping/rss.ts` | `rss-parser` |
| `hn` | `lib/scraping/hn.ts` | Hacker News Firebase API |
| `arxiv` | `lib/scraping/arxiv.ts` | arXiv Atom feed |
| `html` | `lib/scraping/html.ts` | `undici` + `cheerio` |

`lib/scraping/run.ts` fans out across the registry with concurrency 6,
dedupes by URL, returns `ScrapedItem[]`.

`lib/scraping/sources.ts` exposes `loadSources()` independently so
route handlers can import the registry without dragging the
network-touching adapters into the client build graph.

### Curate (`lib/pipeline/curate.ts`)

- Model: `claude-sonnet-4-6`
- System prompt: `lib/anthropic/prompts/curate.ts`, cached with
  `cache_control: { type: "ephemeral" }`
- Tool: `emit_brief` — returns `{ headline, angle, picks }`
- Picks must include 5–8 items with an `itemId` and a one-line `why`
- If fewer than 3 picks, the pipeline aborts

### Write (`lib/pipeline/write.ts`)

- Model: `claude-opus-4-7`
- System prompt embeds the editorial style guide
  (`lib/anthropic/style-guide.ts`), cached
- Tool: `emit_article` — returns `{ title, slug, dek, tags, body_mdx,
  illustration_prompt, illustration_alt, dispatches, wire }`
- Dispatches: 2–4 items with title, body, optional source URL
- Wire: 4–8 items with title, url, source — must reference scraped
  runner-up items (the model is told to pick from a runner-up list,
  not invent)
- Phrasing: no hype words, no inline bullet lists, ~800–1200 words,
  3–5 `##` sections

### Illustrate (`lib/pipeline/illustrate.ts`)

- Calls `getImageProvider().generate(prompt, { size: '1536x1024' })`
- Prepends `STYLE_SUFFIX` from `lib/images/style.ts` — kept in one
  place so the visual style stays consistent
- Transcoded to WebP quality 82 with `sharp`
- Saved to `public/illustrations/YYYY-MM-DD.webp`

### Persist (`lib/pipeline/persist.ts`)

- Loads `sources.yml` to compute `signal_strength`
- Quotes the date scalar in YAML output (`date: "2026-05-12"`) so
  gray-matter reads it as a string everywhere — js-yaml under
  gray-matter still uses YAML 1.1, which would otherwise coerce
  unquoted dates to JS `Date`
- Writes MDX to `content/articles/YYYY-MM-DD.mdx`
- Returns the absolute path so the entry script can log it

### Orchestrator (`scripts/generate-daily.ts`)

```ts
const items = await runScrapers(await loadSources());
const brief = await curate(items, date);
const article = await write(brief, itemsById, runnerUpItems);
const illustration = await illustrate(date, article.illustrationPrompt);
const file = await persist({ article, illustrationPath: illustration.path });
```

Idempotent for a given date: rerunning overwrites the same files.

---

## Frontmatter contract

Every committed MDX file must conform. Run `pnpm check:content` to
validate.

```yaml
---
# Required
title: "..."
slug: "YYYY-MM-DD-some-kebab-slug"
date: "YYYY-MM-DD"        # quoted; unquoted YAML 1.1 dates become Date objects
dek: "one-sentence subhead"
tags: [ai, models, ...]   # at least 1, at most 6
sources:
  - { id: "anthropic-news", url: "https://...", title: "..." }
illustration:
  path: "/illustrations/YYYY-MM-DD.webp"
  prompt: "..."
  alt: "..."

# Optional, used when present
type: daily | weekly       # default daily
signal_strength: 0..100
editors_note: "..."
glossary_terms: ["MCP", "RAG"]    # must match glossary.yml entries
dispatches:
  - { title: "...", body: "60-100 words", source_url: "https://..." }
wire:
  - { title: "...", url: "https://...", source: "kyiv-independent" }
digest:                    # weekly issues only
  from: "YYYY-MM-DD"
  to: "YYYY-MM-DD"
  covered_slugs:
    - "..."
---

Body in MDX. Use `##` for sections. Wrap link URLs in standard
Markdown — the renderer turns them into glowing internal links via a
component override.
```

Validation rules enforced by `scripts/check-content.ts`:

- `title`, `slug`, `dek` must be non-empty strings
- `date` must match `YYYY-MM-DD` and be a string (catches the Date
  coercion bug)
- `illustration.{path, alt}` must exist
- `tags`, `sources`, `dispatches`, `wire` must be arrays if present
- `type` must be `daily` or `weekly` if present
- `signal_strength` must be a number in `[0, 100]` if present
- The filename must start with the frontmatter `date`
- The body must be non-empty

---

## Sources registry

`sources.yml` at the repo root defines every feed the pipeline reads.
Twenty entries ship by default, balanced across:

- **Primary lab blogs** (weight 0.85): Anthropic, OpenAI, DeepMind,
  Google Research, Meta AI, Hugging Face
- **Independent analysis** (0.75): Simon Willison, Interconnects,
  Stratechery, Import AI
- **General tech press** (0.6–0.7): Ars Technica, The Verge, Wired,
  MIT Tech Review, TechCrunch, The Register
- **Non-US lens** (0.6): Rest of World, The Register (UK)
- **Community feeds** (0.5): Hacker News
- **Primary research** (0.6): arXiv cs.AI, arXiv cs.LG

Schema:

```yaml
sources:
  - id: hn-frontpage             # stable, kebab-case
    type: rss | hn | arxiv | html
    name: "Hacker News (front page)"
    url: "https://..."           # required for rss / html
    query: "cat:cs.AI"           # required for arxiv
    weight: 0.5                  # 0..1, editorial prior
    tags: [general, tech]        # optional, attached to scraped items
```

The `/sources` page reads this and renders one card per source with
its weight as a 0–100 bar and a "cited N×" count computed from MDX
frontmatter.

Use `pnpm scrape:dry <id>` to exercise a single source locally.

---

## Glossary

`glossary.yml` at the repo root defines recurring technical terms.

```yaml
terms:
  - term: MCP
    aliases: ["Model Context Protocol"]
    definition: >-
      A protocol for letting language models call external tools
      through a standard interface...
    first_seen: 2026-05-11      # optional
    tags: [protocols]
```

Two ways glossary terms surface:

1. **`/glossary`** — index page, grouped by tag, anchor ids per term.
2. **Per-issue glossary block** — when an article's frontmatter has
   `glossary_terms: [MCP, RAG]`, the matching entries render at the
   foot of the article (handled by `components/GlossaryBlock.tsx`).

Lookup is case-insensitive and matches either canonical form or any
alias. See `lib/glossary.ts`.

---

## Signal strength

Each issue carries a 0–100 integer reflecting the quality + diversity
of its cited sources.

```
diversity = min(100, unique_sources × 22)
quality   = min(100, mean(source.weight) × 110)
signal    = round((diversity + quality) / 2)
```

- Implemented in `lib/pipeline/signal.ts`
- Computed deterministically in `persist.ts` from the issue's
  `sources` and the `sources.yml` weights
- Surfaced in the data strip, on the article page, and baked into the
  per-article OG image

A high signal means the day's feature is grounded in many, well-
regarded outlets. A low signal means the curator stretched.

---

## Weekly digest

Every Sunday at 07:00 UTC, a separate cron run produces a single
weekly digest covering the past seven dailies.

- Skill: `.claude/skills/weekly-digest/SKILL.md`
- Orchestrator: `lib/pipeline/weekly.ts`, entry script
  `scripts/generate-weekly.ts`
- Workflow: `.github/workflows/weekly.yml`

Behaviour:

1. Reads daily issues dated within the last 7 days (inclusive of the
   Sunday). Excludes prior weekly digests.
2. Refuses to publish if fewer than 4 dailies cover the window —
   better no digest than a thin one.
3. Asks Opus to write a 600–900-word digest in three sections:
   throughline, threads (each anchored by a `[link](/articles/<slug>)`),
   and looking ahead.
4. Persists to `content/articles/YYYY-MM-DD-weekly.mdx` with
   `type: weekly` and a `digest` frontmatter block.
5. Mean signal strength of the covered issues is inherited.

The article page renders a magenta `WeeklyBadge` listing the covered
issues with deep links when `type === "weekly"`. The archive page
shows a "weekly" pill in the row.

---

## Theme system

Two themes:

| Mode | Palette |
|---|---|
| `night` | Default. Deep space + cyan + magenta. |
| `term` | Green-phosphor CRT alternate. |

Toggle lives in the masthead as a small button cycling between modes.

The user's choice is stored in `localStorage` under the `mode` key. A
tiny inline `<script>` in `app/layout.tsx` reads it pre-paint and sets
`document.documentElement.dataset.mode = 'term'` if applicable, so
there is no flash of wrong colours on load.

CSS overrides for the alternate theme live under
`[data-mode="term"]` in `app/globals.css`. Every component reads from
CSS custom properties (`--bg-void`, `--ink-primary`, `--accent-cyan`,
etc.), so swapping themes is one selector swap.

---

## Image generation

Pluggable interface, configurable via `IMAGE_PROVIDER`:

```ts
// lib/images/provider.ts
export interface ImageProvider {
  id: string;
  generate(prompt: string, opts: { size: ImageSize; seed?: number })
    : Promise<{ bytes: Buffer; mime: string }>;
}
```

| `IMAGE_PROVIDER` | Module | Backing |
|---|---|---|
| `none` | `lib/images/none.ts` | Flat WebP placeholder, no network |
| `fal` | `lib/images/fal.ts` | fal.ai FLUX (model `fal-ai/flux/schnell`) |

The fal provider checks HTTP status on both the submit and the image
download, surfacing the status code + body excerpt on failure.

`STYLE_SUFFIX` in `lib/images/style.ts` is appended to every prompt so
the look stays consistent regardless of what the writer step asked
for. Editing this single constant changes the visual style of every
future cover.

Output is always WebP, transcoded with `sharp` at quality 82.

---

## Static generation, ISR, and caching

The default for every route is `dynamic = "force-static"`. The build
prerenders **every** path:

- 4 articles → 4 `/articles/[slug]` pages, 4 `/articles/[slug]/print`
  pages, 4 OG image PNGs
- 8 tags → 8 `/tags/[tag]` pages, 8 `/tags/[tag]/feed.xml` files
- 20 sources → 20 `/sources/[id]` pages
- 3 JSON API endpoints, 2 atom feeds, 1 sitemap, 1 robots, 1 favicon,
  1 default OG image, and the static meta pages (stats, trends,
  search, glossary, colophon, admin, health, archive)

`/health` is the one exception: it has `revalidate = 21600` (6 hours)
so the GitHub Actions API is polled in the background after deploy.

Cache headers:

| Route | Cache-Control |
|---|---|
| `/api/today.json` | `public, max-age=300, s-maxage=300` |
| `/api/sources.json` | `public, max-age=3600, s-maxage=3600` |
| `/api/health.json` | `public, max-age=60, s-maxage=60` |
| Feeds, sitemap, robots | `s-maxage=31536000` (Vercel default) |
| OG PNGs | `public, immutable, no-transform, max-age=31536000` |

---

## API endpoints

### `GET /api/today.json`

Returns the latest issue regardless of type, with everything a
newsletter or agent needs:

```json
{
  "status": "ok",
  "issue": {
    "type": "daily" | "weekly",
    "slug": "...",
    "date": "YYYY-MM-DD",
    "title": "...",
    "dek": "...",
    "tags": [...],
    "url": "https://site/articles/...",
    "signal_strength": 84,
    "reading_minutes": 5,
    "illustration": { "path": "...", "prompt": "...", "alt": "..." },
    "sources": [...],
    "dispatches": [...],
    "wire": [...],
    "digest": { "from": "...", "to": "...", "covered_slugs": [...] }
  }
}
```

Returns `{ status: "no-issue" }` with HTTP 404 when nothing is
published yet.

### `GET /api/sources.json`

The full registry plus per-source citation stats:

```json
{
  "status": "ok",
  "sources": [
    {
      "id": "anthropic-news",
      "name": "Anthropic",
      "type": "rss",
      "weight": 0.85,
      "tags": ["ai", "primary-source"],
      "citations": 2,
      "last_cited": "2026-05-12"
    }
  ]
}
```

### `GET /api/health.json`

Designed for uptime monitors. Always 200.

```json
{
  "status": "ok" | "warn" | "degraded",
  "built_at": "2026-05-12T13:38:24Z",
  "latest_issue": {
    "slug": "...",
    "date": "YYYY-MM-DD",
    "type": "daily",
    "age_hours": 6,
    "url": "https://site/articles/..."
  },
  "total_issues": 4
}
```

- `ok` when the latest issue is ≤ 48 hours old
- `warn` between 48 and 96 hours
- `degraded` older than that or when no issue has ever published

---

## Search

A client-side, ⌘K-style palette that fuzzy-matches across title, dek,
tags, and slug.

- Index built at build time by `buildSearchIndex()` in `lib/content.ts`
  — emitted as plain JSON serialised into the page payload
- Palette is the only global client component besides `ThemeToggle`,
  `ReadingProgress`, and `KeyboardHelp`
- Shortcut: `⌘K` (or `Ctrl+K`) toggles. `/` opens it (unless focus is
  in a text field). `Esc` closes.

The matching function is intentionally simple: `score = 3·title +
2·dek + 1·tag + 0.5·slug` for case-insensitive substring matches. Top
12 results render, with date and primary tag in a small caps label
above each row.

---

## Keyboard shortcuts

Press `?` anywhere to open the help overlay. Listed shortcuts:

| Keys | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open search palette |
| `/` | Open search palette (no modifier) |
| `?` | Toggle this help overlay |
| `Esc` | Close any overlay |
| `g h` | Go home |
| `g a` | Go to archive |
| `g t` | Go to tags |
| `g s` | Go to sources |
| `g r` | Go to trends |
| `g g` | Go to glossary |

The `g` chord has a 1.5-second timeout with a small bottom-left
indicator while pending. All shortcuts are gated on focus not being
in an input/textarea/contentEditable element.

---

## Accessibility

- Every illustration carries its `alt` from frontmatter.
- All interactive elements are keyboard-focusable.
- The global focus ring is `outline: 2px solid var(--accent-cyan)`
  with `outline-offset: 3px`, applied via `:focus-visible`.
- Body text contrast is ≥ 7:1 against `--bg-void`.
- Every animation respects `prefers-reduced-motion: reduce`. Entrance
  fades, link transitions, and the article entrance stack all live
  under `@media (prefers-reduced-motion: no-preference)`.
- The search palette is `role="dialog"` with `aria-modal="true"` and
  an `aria-label`.
- The reading-progress bar is `aria-hidden` (decorative).
- Headings are semantic: one `h1` per page, `##` becomes `h2` in MDX.

---

## Performance budget

- First-load JS shared across all pages: ~101 KB gzipped chunks
- Static pages: ~105 KB total first-load
- `/search`: 106 KB (adds 1.5 KB for the palette)
- Article pages: 105 KB (`ReadingProgress` is the only extra client
  component)
- OG images: ~70–90 KB PNGs, served immutable with a 1-year cache
- Illustrations: WebPs targeted under 200 KB

The build prints a route table after every successful build. Watch the
first-load column for regressions over +10 KB.

To inspect what ships, run `pnpm analyze` — it sets `ANALYZE=true` and
builds, then `@next/bundle-analyzer` opens an interactive treemap of the
client and server bundles. The plugin is dev-only and gated behind the env
var, so a normal `pnpm build` is unaffected and nothing extra reaches users.

The hero illustration is the LCP element on the home and article pages. Its
`<img>` carries `loading="eager"` + `fetchPriority="high"` so the browser
fetches it ahead of lower-priority requests, and `.hero__photo` reserves
space with `aspect-ratio: 4 / 3`, so the priority hint costs no layout shift.

---

## Security

Headers, applied to every response in `next.config.mjs`:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
Content-Security-Policy:
  default-src 'self'; img-src 'self' data: blob:;
  style-src 'self' 'unsafe-inline';
  script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com;
  font-src 'self' data:;
  connect-src 'self' https://vitals.vercel-insights.com;
  form-action 'self'; frame-ancestors 'none'; base-uri 'self'
```

`X-Powered-By` is removed (`poweredByHeader: false`).

The CSP allows `'unsafe-inline'` for `style` and `script` because:

- Next.js injects inline `<style>` blocks for component CSS
- A single inline `<script>` reads `localStorage` to apply the theme
  pre-paint without flash

Two first-party Vercel hosts are allow-listed for Speed Insights + Web
Analytics (mounted in `app/layout.tsx`):

- `script-src https://va.vercel-scripts.com` — the collector script. It's
  same-origin once deployed on Vercel; the external host keeps preview and
  local working too.
- `connect-src https://vitals.vercel-insights.com` — the Web Vitals beacon.

Both are inert off Vercel, so they cost nothing locally. In development the
CSP additionally allows `'unsafe-eval'` in `script-src` for webpack HMR. If
you add other third-party scripts (embeds, other analytics), extend the CSP
the same way in `next.config.mjs` rather than inlining.

Other:

- `dangerouslySetInnerHTML` is used in exactly one place: the
  hard-coded theme-init script, with no user input
- All XML feeds escape strings before interpolating
- The fal.ai client validates HTTP status before parsing JSON
- `/admin` is `noindex`; `/health` is `noindex`; `robots.txt`
  disallows both
- Anthropic and fal.ai credentials are server-only env vars and never
  surface in client code

---

## Tests

`pnpm test` runs vitest in ~1.5 seconds. Currently **65 tests** across
12 files. Strategy:

- **Pure logic**, with fixtures over mocks
- **No snapshot tests** — `pnpm build` is the smoke test
- **No component rendering tests** — the cost / value ratio isn't
  there for a static-site UI
- **Integration tests** are opt-in via `RUN_INTEGRATION=1` (not yet
  populated; the slot is there)

What's covered:

| File | What it tests |
|---|---|
| `lib/__tests__/content.test.ts` | listArticles ordering, getArticle by slug, getLatestArticle |
| `lib/__tests__/content-extras.test.ts` | tag frequency, by-tag, related-articles, source-citation stats, search index |
| `lib/__tests__/text.test.ts` | wordCount, readingMinutes, slugify |
| `lib/__tests__/glossary.test.ts` | loadGlossary, lookupTerm, slugForTerm |
| `lib/__tests__/trends.test.ts` | buildTrends ordering, top-N, totals |
| `lib/__tests__/health.test.ts` | summariseRuns counts, mean duration, fmtDuration |
| `lib/scraping/__tests__/util.test.ts` | stableId, clampSummary, withTimeout |
| `lib/scraping/__tests__/rss.test.ts` | parseRssFeed against an XML fixture |
| `lib/pipeline/__tests__/signal.test.ts` | computeSignalStrength edge cases |
| `lib/pipeline/__tests__/persist.test.ts` | frontmatter shape, file path, signal_strength populated |
| `lib/pipeline/__tests__/weekly.test.ts` | coverageFor window inclusion / exclusion |
| `lib/images/__tests__/none.test.ts` | WebP validity, dimensions |

---

## Content validation

`scripts/check-content.ts` (run by `pnpm check:content`) enforces the
frontmatter contract on every MDX file under `content/articles/`.

Run it in CI to keep bad commits out:

```bash
pnpm check:content
# → [check] 4 MDX file(s) validated, no issues
```

What it catches:

- Missing or non-string `title`, `slug`, `dek`
- Unquoted `date` (gray-matter would otherwise return a `Date`)
- Wrong `date` format (must be `YYYY-MM-DD`)
- Filename that doesn't start with the date
- `tags`, `sources`, `dispatches`, `wire` that aren't arrays
- `type` other than `daily` or `weekly`
- `signal_strength` outside `[0, 100]`
- Missing `illustration.{path, alt}`
- Empty body

---

## Operations

### Admin console

`/admin` is the operator surface. It does **not** call any APIs from
the browser. It renders copy-paste `gh workflow run` commands for
every issue. To regenerate an issue, click "copy" and paste into a
terminal authenticated with `gh`.

### Regenerate workflow

`.github/workflows/regenerate.yml` takes `date` and `kind` (daily |
weekly) as `workflow_dispatch` inputs. Validates the date format
before spending API tokens. On success, commits the new MDX +
illustration back to the branch.

Trigger manually:

```bash
gh workflow run regenerate.yml -R owner/repo \
   -f date=2026-05-12 -f kind=daily
```

### Daily cron

`.github/workflows/daily.yml` runs at `0 6 * * *` UTC. Same flow as
the regenerate, dated to today. Commits as `aifirst-bot`.

### Weekly cron

`.github/workflows/weekly.yml` runs at `0 7 * * 0` UTC. One hour after
the daily so the freshest issue is included if it just published.

### CI

`.github/workflows/ci.yml` runs on every push and PR:

```
pnpm install (frozen)
pnpm lint
pnpm typecheck
pnpm test
pnpm check:content
pnpm build
```

10-minute timeout, concurrency-keyed (one in-flight run per ref).

### Single-command verify

```bash
pnpm verify
```

Locally, this runs the exact same five steps as CI. Run it before
pushing.

---

## Environment variables

Full list. Every variable is also documented in `.env.example`.

| Variable | Required by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | the rendered site | Canonical https URL, no trailing slash. Used in sitemap, feeds, OG metadata, JSON `url` fields. Falls back to `VERCEL_URL` (with `https://` prefix), then `https://aifirst.example`. |
| `NEXT_PUBLIC_GITHUB_REPO` | `/admin` | `owner/repo` for the gh CLI snippets and the empty-state link on the home page. |
| `ANTHROPIC_API_KEY` | the pipeline (cron, scripts) | The Anthropic key. Never read by the static site. |
| `IMAGE_PROVIDER` | the pipeline | `none` or `fal`. Selects the image provider. |
| `FAL_KEY` | the pipeline when `IMAGE_PROVIDER=fal` | fal.ai API key. |
| `AIFIRST_REPO` | `/health` build | `owner/repo` for the GitHub Actions API. Falls back to `GITHUB_REPOSITORY`, then `NEXT_PUBLIC_GITHUB_REPO`. |
| `GITHUB_TOKEN` | `/health` build | Optional. Lifts the GitHub REST API rate limit from 60/h to 5000/h. Auto-set inside GitHub Actions. |

---

## Deployment

### Vercel

1. Import the GitHub repo. Next.js is auto-detected.
2. Set environment variables in **Project → Settings → Environment
   Variables**:

   | Name | Suggested value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` |
   | `NEXT_PUBLIC_GITHUB_REPO` | `owner/repo` |
   | `IMAGE_PROVIDER` | `none` (or `fal`) |
   | `FAL_KEY` | only when `IMAGE_PROVIDER=fal` |
   | `AIFIRST_REPO` | `owner/repo` (only if `/health` should populate) |
   | `GITHUB_TOKEN` | optional, for rate-limit headroom |
3. Click Deploy. Every static route, every per-issue OG image, every
   per-tag feed, every JSON endpoint, every per-source detail page is
   prerendered. Build time ~2 minutes.
4. Enable **Speed Insights** and **Web Analytics** for the project (their
   tabs under the Vercel project). The `<SpeedInsights />` and `<Analytics />`
   components in `app/layout.tsx` already emit the beacons — the dashboards
   only populate once the features are toggled on and a deploy is live.

### GitHub Actions

The cron pipeline runs on Actions, not on Vercel. Setup:

1. Add a repo **secret** `ANTHROPIC_API_KEY`. Add `FAL_KEY` if you
   chose `fal`.
2. Add a repo **variable** `IMAGE_PROVIDER` (`none` or `fal`).
3. **Settings → Actions → General → Workflow permissions**:
   set to **Read and write** so the bot can commit issues back.
4. Trigger the `daily` workflow once via **Actions → daily → Run
   workflow**. It should generate today's issue, commit, push. Vercel
   redeploys within ~30s.

### Custom domain

In Vercel, **Project → Domains → Add**, then add the CNAME records as
prompted. Let's Encrypt cert issuance is automatic.

### Costs (rough)

- **Vercel** — free hobby tier covers a static site like this, including
  Speed Insights and Web Analytics within the hobby event limits.
- **Anthropic** — one daily run is ~$0.10–$0.30 depending on item
  count and article size. ~$5/month at one per day. The weekly digest
  is one extra Opus call per week.
- **fal.ai** — FLUX schnell is ~$0.003 per image. ~$0.10/month at one
  per day. Skip entirely with `IMAGE_PROVIDER=none`.
- **GitHub Actions** — free tier (2000 minutes/month) covers ~30+
  daily runs.

---

## File and module layout

```
.
├── README.md                     # quick tour
├── DOCS.md                       # this file
├── CLAUDE.md                     # session memory for future Claude Code runs
├── .env.example
├── .eslintrc.json
├── package.json
├── tsconfig.json
├── next.config.mjs               # security headers + CSP + bundle analyzer
├── vitest.config.ts
├── sources.yml                   # the scraping registry
├── glossary.yml                  # recurring magazine terms
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # root layout + theme-init + Vercel insights
│   ├── globals.css               # design tokens + term-mode overrides
│   ├── page.tsx                  # home: latest issue
│   ├── error.tsx                 # route-level 500
│   ├── global-error.tsx          # root-layout 500
│   ├── not-found.tsx             # 404
│   ├── opengraph-image.tsx       # default OG card
│   ├── icon.svg
│   ├── sitemap.ts, robots.ts
│   ├── feed.xml/route.ts
│   ├── archive/page.tsx
│   ├── articles/[slug]/
│   │   ├── page.tsx
│   │   └── opengraph-image.tsx
│   ├── (print)/                  # route group, escapes the root layout
│   │   ├── layout.tsx
│   │   ├── print.css
│   │   └── articles/[slug]/print/page.tsx
│   ├── tags/
│   │   ├── page.tsx
│   │   └── [tag]/
│   │       ├── page.tsx
│   │       └── feed.xml/route.ts
│   ├── sources/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── stats/page.tsx
│   ├── trends/page.tsx
│   ├── search/page.tsx
│   ├── glossary/page.tsx
│   ├── colophon/page.tsx
│   ├── admin/page.tsx
│   ├── health/page.tsx
│   └── api/
│       ├── today.json/route.ts
│       ├── sources.json/route.ts
│       └── health.json/route.ts
│
├── components/                   # one file per component, server-first
│   ├── Masthead.tsx              # async server component reads search index
│   ├── DataStrip.tsx
│   ├── CoverFrame.tsx
│   ├── ScanlineOverlay.tsx
│   ├── Footer.tsx
│   ├── Mdx.tsx                   # MDXRemote wrapper with overrides
│   ├── GlowLink.tsx
│   ├── TagChip.tsx
│   ├── SignalStrength.tsx
│   ├── Wire.tsx
│   ├── Dispatches.tsx
│   ├── EditorsNote.tsx
│   ├── GlossaryBlock.tsx
│   ├── SourcesBlock.tsx
│   ├── SourceCard.tsx
│   ├── RelatedIssues.tsx
│   ├── WeeklyBadge.tsx
│   ├── Sparkline.tsx
│   ├── TrendsChart.tsx
│   ├── HealthRow.tsx
│   ├── CopyCommand.tsx           # client
│   ├── KeyboardHelp.tsx          # client
│   ├── ReadingProgress.tsx       # client
│   ├── SearchPalette.tsx         # client
│   └── ThemeToggle.tsx           # client
│
├── content/articles/             # generated MDX (committed)
├── public/illustrations/         # generated WebPs (committed)
│
├── lib/
│   ├── config.ts                 # siteUrl(), githubRepo() — env-driven
│   ├── content.ts                # the only place that reads MDX
│   ├── text.ts                   # wordCount, readingMinutes, slugify
│   ├── glossary.ts
│   ├── trends.ts
│   ├── health.ts                 # GitHub Actions API fetcher
│   │
│   ├── anthropic/
│   │   ├── client.ts             # shared SDK client, MODELS map
│   │   ├── style-guide.ts        # cached prompt prefix
│   │   └── prompts/
│   │       ├── curate.ts
│   │       └── write.ts
│   │
│   ├── scraping/
│   │   ├── types.ts              # Source, ScrapedItem
│   │   ├── util.ts               # stableId, clampSummary, withTimeout
│   │   ├── sources.ts            # loadSources() (decoupled from adapters)
│   │   ├── run.ts                # dispatcher + concurrency
│   │   ├── rss.ts
│   │   ├── hn.ts
│   │   ├── arxiv.ts
│   │   └── html.ts
│   │
│   ├── pipeline/
│   │   ├── curate.ts             # Sonnet + emit_brief tool
│   │   ├── write.ts              # Opus + emit_article tool
│   │   ├── illustrate.ts
│   │   ├── persist.ts            # MDX + signal_strength + quoted dates
│   │   ├── weekly.ts             # Sunday digest orchestrator
│   │   └── signal.ts             # computeSignalStrength
│   │
│   └── images/
│       ├── provider.ts           # interface + factory
│       ├── style.ts              # STYLE_SUFFIX (one place)
│       ├── none.ts               # SVG-derived WebP placeholder
│       └── fal.ts                # fal.ai FLUX
│
├── scripts/
│   ├── generate-daily.ts
│   ├── generate-weekly.ts
│   ├── scrape-dry.ts
│   ├── seed.ts                   # populates sample content + covers
│   ├── check-content.ts          # frontmatter validator
│   └── seed-bodies/              # bodies for seeded issues (one .mdx each)
│
├── .github/workflows/
│   ├── ci.yml                    # lint + typecheck + test + check + build
│   ├── daily.yml                 # 0 6 * * *
│   ├── weekly.yml                # 0 7 * * 0
│   └── regenerate.yml            # workflow_dispatch
│
└── .claude/
    ├── skills/
    │   ├── magazine-architecture/SKILL.md
    │   ├── magazine-features/SKILL.md
    │   ├── article-pipeline/SKILL.md
    │   ├── weekly-digest/SKILL.md
    │   ├── tech-source-scraper/SKILL.md
    │   ├── image-provider/SKILL.md
    │   ├── sci-fi-design-system/SKILL.md
    │   ├── frontend-craft/SKILL.md
    │   ├── motion-design/SKILL.md
    │   └── testing-strategy/SKILL.md
    ├── agents/
    │   ├── source-scout.md
    │   ├── scraper-builder.md
    │   ├── article-writer.md
    │   └── ui-designer.md
    └── commands/
        ├── scaffold-magazine.md
        ├── add-source.md
        ├── generate-article.md
        └── preview-magazine.md
```

---

## .claude/ — skills, agents, commands

The repo ships with a working `.claude/` so a future Claude Code
session can pick up without re-reading the entire codebase.

### Skills (reference docs for the model)

| Skill | What it documents |
|---|---|
| `magazine-architecture` | Three-layer separation, daily entry point, env vars |
| `magazine-features` | Wire, Dispatches, Signal, Tags, Glossary, Search, Sources, Stats — the frontmatter contract |
| `article-pipeline` | curate → write → illustrate, prompt caching, MDX shape |
| `weekly-digest` | Sunday cron orchestrator, refusal conditions, display rules |
| `tech-source-scraper` | Adapter contract, registry schema, robots.txt rule |
| `image-provider` | Pluggable interface, STYLE_SUFFIX policy |
| `sci-fi-design-system` | Colour tokens, type scale, components, "don'ts" |
| `frontend-craft` | Component anatomy, a11y, performance budget |
| `motion-design` | Vocabulary, what moves and what doesn't, reduced-motion contract |
| `testing-strategy` | What to test and what to skip |

### Subagents

| Agent | Tools | Purpose |
|---|---|---|
| `source-scout` | WebFetch, WebSearch, Read, Bash | Proposes and verifies new sources |
| `scraper-builder` | Read/Edit/Write/Bash/WebFetch/Grep/Glob | Implements new adapters |
| `article-writer` | Read/Edit/Write/Bash/Grep/Glob | Owns curate/write prompts |
| `ui-designer` | Read/Edit/Write/Bash/Grep/Glob | Builds and refines UI per design-system |

### Slash commands

| Command | Description |
|---|---|
| `/scaffold-magazine` | Bootstraps Next.js + lib skeleton + CI |
| `/add-source <url>` | Verifies a feed, appends to `sources.yml` |
| `/generate-article [YYYY-MM-DD]` | Runs the daily pipeline locally |
| `/preview-magazine` | Starts `pnpm dev` in the background |

---

## Conventions

- TypeScript strict, `noUncheckedIndexedAccess`, no `any`
- Server components by default; `'use client'` only when there's
  genuine interactivity
- One default export per component file
- Inline styles for layout-specific values, CSS custom properties for
  anything that repeats
- No CSS-in-JS runtime libraries
- No `transition: all` — list the properties
- Every animation gated on `prefers-reduced-motion`
- Comments only when the *why* is non-obvious; never narrate the
  *what*
- Trust internal code: don't validate inputs that come from the
  pipeline you wrote. Validate at boundaries (user input, third-party
  APIs)
- Commit messages follow the bold-summary + body convention

---

## Known limitations and trade-offs

- **No comments.** The magazine has no discussion surface. Add giscus
  if you want one.
- **No audio.** No TTS narration. The hooks are there
  (`STYLE_SUFFIX`-equivalent could live in `lib/audio/`); the
  provider isn't built.
- **No multilingual.** Single locale, English. Adding i18n would
  touch the frontmatter contract and the entire UI.
- **No DB.** Articles live in MDX. Past ~10k issues this becomes a
  build-time bottleneck; at that point introduce a content database.
- **No client-side fetching for content.** Every visit to the same
  static URL sees the build-time content. Use ISR + revalidation if
  you want fresher data without redeploys.
- **`/health` depends on the GitHub Actions API.** If the build env
  can't reach api.github.com, the page renders an "offline" notice.
  Acceptable but worth knowing.
- **The pipeline is single-threaded per run.** Scrapes are concurrent
  (6 at a time), but curate, write, and illustrate run sequentially.
  Total wall-clock is ~60–90 seconds per daily.
- **Web previews from VERCEL_URL.** Preview deploys use the
  auto-generated URL, so `metadataBase` and OG image links will
  reflect that, not the canonical domain.

---

## Changelog of major rounds

Rough timeline of what shipped in the build sessions:

1. **Scaffold** — Next.js, lib skeleton, scrapers, pipeline, image
   providers, CI workflow stubs.
2. **20-source registry** — verified canonical paths for the major
   tech / AI feeds.
3. **Design polish + tests + sample content** — entrance animations,
   drop caps, sci-fi components, MDXRemote wiring, 22 vitest cases,
   three seeded issues.
4. **Features round 1** — Wire, Dispatches, Signal Strength, Tags,
   Sources directory, Stats, Search, RSS, related issues, reading
   progress.
5. **Features round 2** — OG images, colophon, per-source pages,
   anchor links, reading time, JSON API.
6. **Trends, Weekly, Term theme, Regenerate flow** — `/trends`,
   Sunday digest pipeline, green-phosphor alternate theme, admin
   console.
7. **Glossary, Print, Editor's note, Keyboard help** — `/glossary`
   + per-issue blocks, print view under route group, `?` overlay
   with `g` chord nav.
8. **Health + per-tag RSS** — `/health` page reading GitHub Actions
   runs, Atom feed per tag.
9. **Production audit** — hardcoded URLs to env-driven, fal.ai error
   handling, `/api/today.json` shape fix, sitemap completeness.
10. **Hardening** — CI workflow, route + global error boundaries,
    security headers + CSP, `/api/health.json`, content validator,
    `pnpm verify`, full README + this DOCS.
