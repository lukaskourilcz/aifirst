# Caught Up

**The AI stories that actually mattered today.** One edition and you’re caught
up on AI.

Caught Up is a bilingual, Git-native AI publication. BoardlessAI owns source
collection, curation, writing and quality control in the separate `quorum`
repository. Its bounded GitHub App delivers schema-valid content commits here;
Next.js independently validates them and materializes the reader at build time.

The repository and package deliberately remain `aifirst`; that is a stable
technical identifier, not the public publication name.

## What the app can do

- Publish a complete daily edition with a lead story, Why it matters, Briefs,
  Watchlist, uncertainty, signal strength, corrections and a source ledger.
- Render the existing bilingual weekly archive without a dormant weekly writer.
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
- Consume only `edition-package/1` files, accept byte-identical complete replay
  as a no-op, and fail closed on schema, content or same-date byte conflicts.
- Run a daily Prague-aware sentinel that opens one idempotent `missed-day`
  issue when neither an edition nor an honest NO_EDITION record exists.

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
the optional OwnDashboard control plane. The former `/promotion` utility is
retired and returns 404.

## Tech stack

| Layer | Current implementation |
| --- | --- |
| Web | Next.js 15 App Router, React 19, server components and static route generation |
| Language/runtime | Strict TypeScript 5.6, Node.js 22, pnpm 10 |
| Content | Git-tracked MDX, `gray-matter`, `next-mdx-remote`; Git is canonical |
| Editorial producer | BoardlessAI in `lukaskourilcz/quorum`; no model client or scraper remains here |
| Citation registry | Read-only YAML registry used by reader and content validation |
| Delivery | `edition-package/1` consumer, content-only Git commits, Vercel static output |
| Automation | GitHub Actions CI plus the daily missed-publication sentinel |
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

## Validate a delivery locally

```bash
pnpm consume:edition /absolute/path/to/package.json
pnpm check:content
pnpm build
```

The consumer can write only dated English/Czech MDX, the matching optional hero,
and sanitized board JSON. A delivered date is immutable: a complete,
byte-identical replay succeeds without a write. A missing or changed output file
is a reconciliation error even when another file still carries the package
hash. `sources.yml` remains a citation registry; it is not a collection
capability.

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

Existing provider-independent share/newsletter artifacts remain readable. New
editorial generation, measured costs, source outcomes and social packs stay in
BoardlessAI; the delivery boundary exposes only article bytes and sanitized
board context. The weekly page and feeds continue to render committed content
until a future board proposal replaces the retired writer.

## Deployment setup

Required for reader deployment:

- Vercel variable `NEXT_PUBLIC_SITE_URL`.
- The `boardlessai-delivery` GitHub App installed on this repository is
  configured from Quorum, not from aifirst workflow secrets.

Recommended in Vercel:

- `NEXT_PUBLIC_SITE_URL` — canonical HTTPS origin without a trailing slash.
- `NEXT_PUBLIC_GITHUB_REPO=lukaskourilcz/aifirst`.
- Production Branch set to `main`.

The aifirst daily workflow needs only read access plus issue creation for the
sentinel. It has no content write permission, generation secret or model call.
No database migration is required.

See [`NEEDED.md`](NEEDED.md) for the exact remaining operator checklist.

## Documentation

- [`DOCS.md`](DOCS.md) — detailed architecture and operational reference
- [`docs/CAUGHT_UP_IMPLEMENTATION.md`](docs/CAUGHT_UP_IMPLEMENTATION.md) — rebrand audit, compatibility decisions and validation record
- [`docs/OWNDASHBOARD_INTEGRATION.md`](docs/OWNDASHBOARD_INTEGRATION.md) — optional control-plane contract
- [`scaling.md`](scaling.md) — current cost baseline and scaling notes
- [`docs/design/PRODUCT_UX_AUDIT.md`](docs/design/PRODUCT_UX_AUDIT.md) — route, task, state and reuse audit
- [`docs/design/DESIGN_THESIS.md`](docs/design/DESIGN_THESIS.md) and [`docs/design/BRAND_SYSTEM.md`](docs/design/BRAND_SYSTEM.md) — product and identity direction
- [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md) — implemented tokens, composition, motion, responsive and print rules
- [`docs/design/VISUAL_QA.md`](docs/design/VISUAL_QA.md) — actual route/viewport review protocol and findings
- [`docs/design/GENERATED_MEDIA_ASSET_MANIFEST.md`](docs/design/GENERATED_MEDIA_ASSET_MANIFEST.md) — provider-neutral production briefs, mandatory free/low-cost provider research criteria, and provenance requirements
