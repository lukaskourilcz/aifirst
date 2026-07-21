# Caught Up

**The AI stories that actually mattered today.** One edition and you’re caught
up on AI.

Caught Up is a bilingual, Git-native publication. A scheduled newsroom pipeline
scrapes a curated source registry, selects the strongest developments, writes a
daily edition and optional weekly digest, and commits MDX plus static artifacts.
Next.js materializes the complete reader experience at build time.

The repository and package deliberately remain `aifirst`; that is a technical
identifier, not the public publication name.

## Product map

| Route | Purpose |
| --- | --- |
| `/` | Today’s complete edition: lead, Why it matters, Briefs, Watchlist, source ledger and completion state |
| `/articles/[slug]` | Static issue with provenance, corrections, topics, glossary disclosures and adjacent/related issues |
| `/radar` | Static signals composed from the existing archive, trend and pulse data |
| `/topics` and `/topics/[slug]` | Curated topic destinations backed by the existing tag metadata |
| `/weekly` | Weekly retention product and localized weekly feed entry point |
| `/archive` | Context-rich issue archive with dek, topics, signal, type, language and reading time |
| `/about` | Methodology, source policy, review, corrections, cost and static-architecture trust center |
| `/corrections` | Public corrections index |
| `/sources`, `/glossary`, `/search` | Secondary trust, reference and discovery surfaces |
| `/feed.xml`, `/weekly/feed.xml`, `/topics/[slug]/feed.xml` | Localized Atom feeds |
| `/api/today.json`, `/api/weekly.json`, `/api/topics.json`, `/api/radar.json` | Static syndication contracts |
| `/api/health.json` | Sanitized public publication health |

English is unprefixed. Czech mirrors supported routes under `/cs`. Existing
article and tag-detail URLs remain valid. `/stats` and `/trends` permanently
redirect to `/radar`, `/tags` to `/topics`, and `/colophon` to `/about`.
`/admin` is a noindex migration notice; repository operations belong in GitHub
Actions and the optional OwnDashboard control plane.

## Architecture

- Next.js 15 App Router, React 19 and strict TypeScript
- MDX in `content/articles/`; Git is the canonical content store
- Server components and static route generation for the public read path
- Anthropic structured tool outputs for curation and writing
- YAML configuration in `sources.yml`, `config/editorial.yml` and
  `config/topics.yml`
- Pluggable illustration provider; `IMAGE_PROVIDER=none` by default
- GitHub Actions for daily, weekly and regeneration workflows
- Vitest, content validation and Playwright

There is no runtime reader database, public authentication, per-request model
call or public dependency on OwnDashboard. Reader traffic is served from static
output and does not increase model-generation cost.

## Develop

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm verify
pnpm e2e
```

`pnpm verify` runs lint, TypeScript, unit tests, content/config validation and a
production build. `pnpm generate:artifacts` regenerates committed static share
packs and workflow-only weekly newsletter files without invoking a model.

## Generate content

```bash
cp .env.example .env.local
# add ANTHROPIC_API_KEY; keep IMAGE_PROVIDER=none for the no-cost image path

pnpm generate:daily
pnpm generate:daily 2026-07-21
ISSUE_LANGUAGE=all pnpm generate:weekly
pnpm generate:artifacts
```

Generation is idempotent by default. Existing dates are skipped unless the
validated `force` control is explicit. Workflows support `auto`, `pull_request`
and `dry_run` publishing modes plus date, language, image-provider, model-profile
and embedding controls. Concurrency groups prevent two runs from publishing the
same issue kind/date simultaneously.

## Editorial schema

Legacy MDX remains valid. Newly generated schema-v2 issues add structured
editorial and operational fields:

```yaml
---
schema_version: 2
title: "..."
slug: "..."
date: "YYYY-MM-DD"
lang: en
translation_of: "shared-slug"
dek: "..."
alternative_headlines: ["...", "..."]
tags: [ai, developer-tools]
type: daily # or weekly
signal_strength: 0
why_it_matters: ["..."]
what_changed: ["..."]
uncertainty: ["..."]
sources:
  - id: item-id
    source_id: registered-source-id
    title: "..."
    url: "https://..."
    publisher: "..."
    source_type: rss
    classification: primary # or secondary
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
  cost: { amount: 0.1234, currency: USD } # only when measured
corrections:
  - date: "2026-07-22"
    description: "..."
    section: "optional section"
sponsor: # optional and disabled unless content supplies it
  name: "..."
  url: "https://..."
  label: "Sponsored"
  copy: "..."
---
```

Weekly issues also require `digest.from`, `digest.to` and
`digest.covered_slugs`. `pnpm check:content` validates legacy compatibility,
schema-v2 bounds, registered source IDs, translations, provenance, correction
dates, sponsorship safety, weekly linkage and both typed YAML files.

## Static distribution

Every generated issue writes provider-independent JSON under
`public/data/share/`. Packs contain canonical URL, primary and alternate
headline slots, platform-ready copy, newsletter excerpt, quote-card text,
topics, illustration metadata and source count. Weekly generation also writes
HTML, plain-text and metadata newsletter artifacts under `generated/`; that
directory is uploaded privately by Actions and ignored by Git.

No social post or newsletter is sent automatically. Sending remains an optional
operator action outside the reader build.

## Telemetry, cost and guardrails

Each generation workflow writes a versioned private run report with stage
timings, scrape counts, editorial metrics, provider usage, image state, warnings
and repository references. Anthropic response usage is converted centrally to
USD using the versioned registry in `lib/telemetry/pricing.ts`. Unknown models
or incomplete usage produce an unavailable cost—not a fabricated zero.

`config/editorial.yml` controls publishing, languages, output limits, quality
thresholds, standard/economical model profiles, illustration defaults and
warning/hard budgets. Quality starts
in `report_only` mode. Per-run hard cost limits can block persistence when
configured; monthly aggregation belongs in the optional dashboard because
ephemeral Actions runners do not hold a canonical ledger.

When `OWNDASHBOARD_RUN_REPORT_URL` and `OWNDASHBOARD_RUN_REPORT_TOKEN` are set,
the same report is sent with an idempotency key, an eight-second timeout and one
bounded retry. Callback failure never blocks scheduled publishing; the local
Actions artifact remains canonical for the run. See
[`docs/OWNDASHBOARD_INTEGRATION.md`](docs/OWNDASHBOARD_INTEGRATION.md).

## Environment and deployment

Required for generated content:

- `ANTHROPIC_API_KEY`

Recommended deployment values:

- `NEXT_PUBLIC_SITE_URL` — canonical HTTPS origin, no trailing slash
- `NEXT_PUBLIC_GITHUB_REPO` — `owner/repo`
- `IMAGE_PROVIDER` — `none` by default; an enabled provider requires its secret

Optional operations:

- `FAL_KEY` for fal.ai illustrations
- `NASA_API_KEY` for the NASA illustration provider (otherwise `DEMO_KEY`)
- `GUARDIAN_API_KEY`, `NYTIMES_API_KEY`, `GNEWS_API_KEY` and
  `STACKEXCHANGE_KEY` for their optional source adapters
- `FIRECRAWL_API_KEY` for the optional article-extraction fallback
- `JINA_API_KEY` for optional embeddings
- `GITHUB_TOKEN`/`AIFIRST_REPO` for the existing build-time health view
- `PROMOTION_TOKEN` to expose the otherwise-404 internal promotion console
- `GENERATE_PROMOTION=true` to enable the optional model-written promotion pack
- `OWNDASHBOARD_RUN_REPORT_URL` and `OWNDASHBOARD_RUN_REPORT_TOKEN` for callbacks

On GitHub, give Actions contents write permission for `auto`, plus pull-request
write permission for `pull_request`. Vercel needs no database migration: import
the repository, set the canonical URL and deploy.

## Documentation

- [`DOCS.md`](DOCS.md) — detailed current architecture and operational reference
- [`docs/CAUGHT_UP_IMPLEMENTATION.md`](docs/CAUGHT_UP_IMPLEMENTATION.md) — audit, migration decisions and completion checklist
- [`docs/OWNDASHBOARD_INTEGRATION.md`](docs/OWNDASHBOARD_INTEGRATION.md) — control-plane contract
- [`stack-and-scaling.md`](stack-and-scaling.md) — cost and scaling model
