# Caught Up

**The AI stories that actually mattered today.** One edition and you’re caught
up on AI.

Caught Up is a bilingual, Git-native AI publication. A scheduled newsroom
pipeline gathers a curated source registry, selects the strongest developments,
writes daily and weekly editions, and commits MDX plus static distribution
artifacts. Next.js materializes the complete reader experience at build time.

The repository and package deliberately remain `aifirst`; that is a stable
technical identifier, not the public publication name.

## What the app can do

- Publish a complete daily edition with a lead story, Why it matters, Briefs,
  Watchlist, uncertainty, signal strength, corrections and a source ledger.
- Publish a bilingual weekly digest derived only from the preceding committed
  daily editions.
- Turn the archive’s existing tags, statistics, trends and pulse data into
  curated Topics and a static Radar view.
- Serve English at unprefixed URLs and Czech under `/cs`, while exposing only
  real locale files in canonicals, hreflang, sitemaps and feeds.
- Preserve legacy MDX, article URLs, tag URLs and feed consumers while
  redirecting renamed reader surfaces to the new product structure.
- Generate Atom feeds, static JSON contracts, share packs, newsletter files,
  Open Graph images, print pages, sitemap entries and structured metadata.
- Provide static search, related issues, glossary disclosures, keyboard
  shortcuts, a command palette, accessible navigation and reduced-motion
  behavior without a client-side state framework.
- Run daily, weekly and regeneration workflows in `auto`, `pull_request` or
  `dry_run` mode with idempotency, concurrency controls, quality guardrails,
  regeneration limits and private telemetry artifacts.
- Measure Anthropic token cost per stage, keep unknown cost unavailable rather
  than reporting a false zero, and optionally send bounded non-fatal run reports
  to OwnDashboard.

No database, CMS, reader login or runtime model call sits in the public path.
Reader growth increases static delivery, not editorial model usage.

## Reader and compatibility routes

| Route | Purpose |
| --- | --- |
| `/` | Today’s full edition and completion state |
| `/articles/[slug]` | Static issue, provenance, corrections, topics and related reading |
| `/weekly` | Current weekly digest, archive and localized feed entry point |
| `/radar` | Static signals, trend movement, timelines and pulse data |
| `/topics`, `/topics/[slug]` | Curated destinations backed by existing tag metadata |
| `/archive` | Filterable context-rich issue history |
| `/about`, `/sources`, `/glossary`, `/corrections`, `/health` | Methodology, accountability and sanitized publication health |
| `/search` | Static client-side discovery over committed content |
| `/feed.xml`, `/weekly/feed.xml`, topic feeds | Locale-correct Atom distribution |
| `/api/today.json`, `/api/weekly.json`, `/api/topics.json`, `/api/radar.json`, `/api/sources.json` | Build-time JSON contracts |
| `/api/health.json` | Sanitized publication freshness; no workflow secrets or stack traces |

English is unprefixed and Czech mirrors supported routes under `/cs`.
`/stats` and `/trends` permanently redirect to `/radar`, `/tags` to `/topics`,
and `/colophon` to `/about`. Legacy article and tag-detail URLs remain valid.
`/admin` is a noindex migration notice; operations belong in GitHub Actions and
the optional OwnDashboard control plane. `/promotion` is an unlisted, noindex
operator utility that returns 404 unless its token gate is configured and met.

## Tech stack

| Layer | Current implementation |
| --- | --- |
| Web | Next.js 15 App Router, React 19, server components and static route generation |
| Language/runtime | Strict TypeScript 5.6, Node.js 22, pnpm 10 |
| Content | Git-tracked MDX, `gray-matter`, `next-mdx-remote`; Git is canonical |
| Editorial AI | Anthropic SDK with structured tool output and standard/economical model profiles |
| Collection | YAML source registry, `rss-parser`, Cheerio and Undici adapters with per-source failure isolation |
| Images | Sharp plus `none`, NASA, Picsum and fal.ai provider adapters |
| Delivery | Vercel static output, Web Analytics and Speed Insights |
| Automation | GitHub Actions for CI, daily, weekly and controlled regeneration |
| Quality | ESLint, TypeScript, Vitest, schema/content validation, bundle checks and Playwright |
| Operations | Versioned run reports, cost registry, static health, heartbeat and optional OwnDashboard callback |

There is intentionally no runtime content database, Supabase dependency,
public authentication, queue, advertising SDK or per-request AI generation.

## Local development

Requirements: Node.js 22 and pnpm 10.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm verify
pnpm e2e
```

`pnpm verify` runs lint, TypeScript, all unit tests, content/config validation, a
production build and the compressed-JavaScript guard. The current measured
shared Next.js/React runtime is 102 kB gzip and the enforced page-entry ceiling
is 110 kB; the original 80 kB product target is documented as a framework-level
constraint in `docs/CAUGHT_UP_IMPLEMENTATION.md`.

## Generate content locally

```bash
cp .env.example .env.local
# Add ANTHROPIC_API_KEY. Keep IMAGE_PROVIDER=none for the zero-image-cost path.

pnpm generate:daily
pnpm generate:daily 2026-07-21
ISSUE_LANGUAGE=all pnpm generate:weekly
pnpm generate:artifacts
```

Generation is idempotent unless `FORCE_GENERATION=true` is explicit. Scheduled
runs take their publishing, language, model, review, quality, budget and
illustration defaults from `config/editorial.yml`. Validated manual workflow
inputs can override them. `sources.yml` and `config/topics.yml` provide the
other committed editorial controls.

The scheduled defaults currently produce English daily editions and bilingual
weekly editions, use the standard model profile, publish automatically, report
quality violations without blocking, and generate no paid image.

## Content and provenance

Legacy MDX remains supported. New schema-v2 issues add structured editorial and
operational fields; a shortened example is below.

```yaml
---
schema_version: 2
title: "..."
slug: "..."
date: "YYYY-MM-DD"
lang: en
translation_of: "shared-slug"
type: daily # or weekly
dek: "..."
tags: [ai, developer-tools]
signal_strength: 72
why_it_matters: ["..."]
what_changed: ["..."]
uncertainty: ["..."]
sources:
  - id: item-id
    source_id: registered-source-id
    title: "..."
    url: "https://..."
    source_type: rss
    classification: primary
    published_at: "2026-07-21T05:00:00Z"
    supports: ["claim or section"]
illustration:
  prompt: "..."
  alt: "..."
generation:
  generated_at: "2026-07-21T06:00:00Z"
  human_reviewed: false
  models: { curation: "...", writing: "..." }
  source_candidates: 40
  cited_sources: 5
  image_provider: none
  cost: { amount: 0.1234, currency: USD }
corrections:
  - date: "2026-07-22"
    description: "..."
---
```

Weekly issues additionally require `digest.from`, `digest.to` and
`digest.covered_slugs`. Content validation covers legacy compatibility,
schema-v2 bounds, registered source IDs, translations, provenance, correction
dates, sponsorship safety and weekly linkage.

## Distribution and operations

Every generated issue writes provider-independent JSON under
`public/data/share/`. Weekly runs also produce private HTML, text and metadata
newsletter artifacts under `generated/`. The repository does not automatically
send newsletters or social posts.

Each generation run records stage timings, per-source outcomes, editorial
metrics, structured warnings, model usage, illustration state and repository
references. Official Anthropic list prices are versioned in
`lib/telemetry/pricing.ts`. Per-run hard budgets can block persistence;
cross-run monthly enforcement requires an external ledger such as
OwnDashboard.

OwnDashboard remains optional. If `OWNDASHBOARD_RUN_REPORT_URL` and
`OWNDASHBOARD_RUN_REPORT_TOKEN` are configured, the same report is sent with an
idempotency key, short timeout and one bounded retry. A callback failure never
blocks scheduled publishing.

## Deployment setup

Required to generate new content:

- GitHub Actions secret `ANTHROPIC_API_KEY`.
- GitHub Actions variable `NEXT_PUBLIC_SITE_URL`.

Recommended in Vercel:

- `NEXT_PUBLIC_SITE_URL` — canonical HTTPS origin without a trailing slash.
- `NEXT_PUBLIC_GITHUB_REPO=lukaskourilcz/aifirst`.
- Production Branch set to `main`.

Optional provider and operations values are documented in `.env.example`.
GitHub workflows already request contents and pull-request write permissions;
review-mode PR creation also needs the repository setting that allows Actions
to create pull requests. No database migration is required.

See [`NEEDED.md`](NEEDED.md) for the exact remaining operator checklist.

## Documentation

- [`DOCS.md`](DOCS.md) — detailed architecture and operational reference
- [`docs/CAUGHT_UP_IMPLEMENTATION.md`](docs/CAUGHT_UP_IMPLEMENTATION.md) — rebrand audit, compatibility decisions and validation record
- [`docs/OWNDASHBOARD_INTEGRATION.md`](docs/OWNDASHBOARD_INTEGRATION.md) — optional control-plane contract
- [`stack-and-scaling.md`](stack-and-scaling.md) — current cost baseline, formulas and growth scenarios
- [`docs/design/PRODUCT_UX_AUDIT.md`](docs/design/PRODUCT_UX_AUDIT.md) — route, task, state and reuse audit
- [`docs/design/DESIGN_THESIS.md`](docs/design/DESIGN_THESIS.md) and [`docs/design/BRAND_SYSTEM.md`](docs/design/BRAND_SYSTEM.md) — product and identity direction
- [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md) — implemented tokens, composition, motion, responsive and print rules
- [`docs/design/VISUAL_QA.md`](docs/design/VISUAL_QA.md) — actual route/viewport review protocol and findings
- [`docs/design/HIGGSFIELD_ASSET_MANIFEST.md`](docs/design/HIGGSFIELD_ASSET_MANIFEST.md) — deferred media inventory and future provenance requirements; no assets were generated in this overhaul
