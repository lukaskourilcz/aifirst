# aifirst

A daily, AI-written magazine about AI and tech.

Each morning a scheduled job scrapes a curated set of sources, an LLM
selects the day's most interesting items, writes a feature article plus
short dispatches and a runner-up wire, and a generated illustration
goes on the cover. The result is committed as MDX to this repository
and Vercel redeploys.

The site itself is fully static. No databases, no runtime API calls
for content, no third-party scripts at request time. Everything that
appears on the page is materialised at build.

---

## Tour

| Route | What it is |
|---|---|
| `/` | Today's feature, dispatches, wire, sources, recent issues |
| `/articles/[slug]` | A single issue, with reading-progress bar, related issues, glossary block |
| `/articles/[slug]/print` | Print-optimised broadsheet view (no chrome, drop cap, link URLs after each link in `@media print`) |
| `/articles/[slug]/opengraph-image` | Dynamic 1200×630 PNG generated at build time |
| `/archive` | Every issue, grouped by month, weekly digests tagged |
| `/tags` and `/tags/[tag]` | Browse by topic |
| `/tags/[tag]/feed.xml` | Atom feed per tag |
| `/sources` and `/sources/[id]` | The scraping registry with weights, citation counts, per-source detail pages |
| `/stats` | Telemetry: total issues, avg signal, cadence sparkline, most-cited sources |
| `/trends` | Top tags over time, stacked SVG chart |
| `/glossary` | Recurring technical terms |
| `/colophon` | How the magazine is made |
| `/search` | Full text index + global ⌘K / `/` palette |
| `/admin` | Operator console — copy-paste `gh workflow run` commands |
| `/health` | GitHub Actions run history with status dots |
| `/feed.xml` | Site-wide Atom feed |
| `/api/today.json` | Latest issue as JSON |
| `/api/sources.json` | The registry as JSON |
| `/api/health.json` | Uptime monitor endpoint (status + age of latest issue) |

The masthead links to every browseable surface. Keyboard:
`⌘K` (or `/`) opens search, `?` opens the help overlay,
`g→{h,a,t,s,r,g}` jumps between top-level pages.

---

## Stack

- Next.js 15 (App Router), TypeScript strict, React 19
- Anthropic SDK (`claude-opus-4-7` for writing, `claude-sonnet-4-6` for
  curation, `claude-haiku-4-5-20251001` for utility passes), with
  prompt caching on stable prompt prefixes and tool-use for all
  structured outputs
- MDX in `content/articles/YYYY-MM-DD.mdx`, rendered via
  `next-mdx-remote/rsc`
- Pluggable image provider (`lib/images/provider.ts`) — fal.ai (FLUX)
  or `none` (SVG-derived placeholder)
- vitest for tests; fixtures over mocks; no snapshot tests
- GitHub Actions for the daily / weekly / regenerate cron jobs

---

## Documentation

- **[`stack-and-scaling.md`](stack-and-scaling.md)** — the production
  stack, current monthly cost, and a scaling analysis: where the first
  bottleneck is, and what 100 active users would actually cost and require.
- **[`DOCS.md`](DOCS.md)** — the full architecture reference: every
  subsystem, the deployment surface, the editorial contract, the caching
  and static-generation model, and the operational runbook.

---

## Develop

```bash
pnpm install
pnpm seed         # populates sample issues + cover images
pnpm dev          # http://localhost:3000
```

Sample issues live until you replace them with real generated ones.
Run `pnpm seed` any time you need to reset them.

Single-command pre-push check:

```bash
pnpm verify       # lint + typecheck + test + check:content + build
```

---

## Generate a daily issue locally

You'll need an Anthropic key:

```bash
cp .env.example .env.local
# fill in ANTHROPIC_API_KEY; leave IMAGE_PROVIDER=none for now
pnpm generate:daily          # today
pnpm generate:daily 2026-05-12   # a specific date (overwrites)
pnpm generate:weekly         # Sunday digest from last seven dailies
```

Cheap dry-runs:

```bash
pnpm scrape:dry              # exercise every source
pnpm scrape:dry hn-frontpage # one source
```

---

## Deploy

The repo is shaped for **Vercel** + **GitHub Actions**.

### Vercel

1. Import the GitHub repo. Next.js is detected automatically.
2. Set environment variables (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SITE_URL` — your canonical https URL, no trailing slash
   - `NEXT_PUBLIC_GITHUB_REPO` — `owner/repo` (powers the `/admin` page)
   - `IMAGE_PROVIDER` — `none` (or `fal` to enable real illustrations)
   - `FAL_KEY` — required if `IMAGE_PROVIDER=fal`
   - `AIFIRST_REPO` — optional, used by `/health`
   - `GITHUB_TOKEN` — optional, lifts the `/health` API rate limit
3. Deploy. The first build prerenders every static route, every per-
   issue OG image, every per-tag feed, and the JSON endpoints.

### GitHub Actions

The daily / weekly cron lives in `.github/workflows/`. To enable it:

1. Add a repo **secret** `ANTHROPIC_API_KEY`. Add `FAL_KEY` if you
   want real illustrations.
2. Add a repo **variable** `IMAGE_PROVIDER` (`none` or `fal`).
3. Settings → Actions → General → Workflow permissions → **Read and
   write** (so the bot can commit issues back).
4. Trigger `daily` once from Actions → Run workflow to confirm the
   loop works end-to-end. Subsequent runs are scheduled (06:00 UTC).

To regenerate a single date on demand, use the `regenerate` workflow
(date + kind inputs). The `/admin` page on the deployed site shows
copy-paste `gh workflow run` commands for every issue.

---

## Layout

```
app/                              # Next.js App Router
  page.tsx                        # latest issue (home)
  archive/, articles/[slug]/, tags/, sources/, stats/, trends/, search/,
  glossary/, colophon/, admin/, health/
  api/today.json/, api/sources.json/, api/health.json/
  feed.xml/, tags/[tag]/feed.xml/
  opengraph-image.tsx             # default site OG
  articles/[slug]/opengraph-image.tsx
  (print)/articles/[slug]/print/  # print view, escapes the root layout
  error.tsx, global-error.tsx, not-found.tsx
  sitemap.ts, robots.ts, icon.svg
components/                       # one file per component, server-first
content/articles/                 # generated MDX, committed to repo
public/illustrations/             # generated WebPs, same
lib/
  content.ts                      # the only place that reads MDX
  config.ts                       # site URL + repo, env-driven
  glossary.ts, text.ts, trends.ts, health.ts
  anthropic/                      # SDK client + prompts + style guide
  scraping/                       # one adapter per source type
  pipeline/                       # curate -> write -> illustrate -> persist
  images/                         # provider interface + impls
scripts/
  generate-daily.ts, generate-weekly.ts
  scrape-dry.ts, seed.ts, check-content.ts
sources.yml                       # the scraper registry
glossary.yml                      # recurring magazine terms
.claude/                          # subagent + skill + slash-command definitions
.github/workflows/                # ci, daily, weekly, regenerate
```

---

## Editorial contract

Every committed MDX file passes `pnpm check:content`. The required
frontmatter:

```yaml
---
title: "..."
slug: "..."
date: "YYYY-MM-DD"      # quoted; gray-matter parses unquoted YAML 1.1 dates as Date objects
dek: "one sentence"
tags: [ai, ...]
sources:
  - { id, url, title }
illustration:
  path: /illustrations/YYYY-MM-DD.webp
  prompt: "..."
  alt: "..."
signal_strength: 0-100   # optional but recommended; computed by lib/pipeline/signal.ts
dispatches: [{ title, body, source_url? }]
wire: [{ title, url, source }]
type: daily | weekly     # default daily
editors_note: "..."      # optional
glossary_terms: [MCP, ...] # optional, must match glossary.yml entries
digest:                  # weekly issues only
  from: "YYYY-MM-DD"
  to: "YYYY-MM-DD"
  covered_slugs: [...]
---
```

---

## Quality bar

- `pnpm verify` is the single source of truth: lint + typecheck + 65
  vitest cases + content validation + production build, all clean.
- Pure logic is unit-tested with fixtures, not mocks. RSS adapter
  exposes `parseRssFeed(xml, source)` so the network shell is a
  separate, untested concern.
- No component snapshot tests — `pnpm build` is the smoke test.
- A11y guard rails: every image carries an `alt`, every interactive
  element a label, focus rings visible, `prefers-reduced-motion`
  respected by every animation.
- Performance budget: < 80 KB first-load gzipped on every static page.
- Security: HSTS, X-Frame-Options, X-Content-Type-Options, a
  restrictive default CSP, and a no-`X-Powered-By` config. See
  `next.config.mjs`.

---

## .claude/

The repo ships with a working `.claude/` directory: skills documenting
each subsystem, subagents (`source-scout`, `scraper-builder`,
`article-writer`, `ui-designer`), and slash commands (`/scaffold-magazine`,
`/add-source`, `/generate-article`, `/preview-magazine`). Future
Claude Code sessions can pick up where the last left off without a
re-read of the entire codebase.
