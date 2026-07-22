# Caught Up implementation checklist

## Current-state findings

- Next.js App Router pages are statically generated from bilingual MDX in
  `content/articles`; Git is the canonical store and no reader database exists.
- The daily pipeline already separates scraping, curation, writing,
  illustration and persistence. Weekly generation reuses the same content
  loader and writing style guide.
- Existing Stats, Trends and Pulse data can be composed into Radar. Tags remain
  valuable metadata, while source and glossary pages are useful trust surfaces.
- Feed, sitemap, Open Graph, search, related-issue, health and keyboard helpers
  already exist and should be extended, not replaced.
- Legacy MDX is bilingual-capable and uses `dispatches` and `wire`; those keys
  remain compatible while the reader labels become Briefs and Watchlist.
- `aifirst` remains appropriate for the package, repository, environment
  variables, bot identity and HTTP user agents. Reader-facing branding changes
  to Caught Up.

## Implemented route changes

- Primary: `/`, `/radar`, `/topics`, `/topics/[slug]`, `/weekly`, `/archive`,
  `/about`, `/corrections`, `/search`, `/articles/[slug]` and print routes.
- `/stats` and `/trends` permanently redirect to `/radar`; `/tags` redirects to
  `/topics`; `/colophon` redirects to `/about`.
- `/tags/[tag]`, tag feeds, `/sources`, source details and `/glossary` remain as
  secondary compatibility/reference surfaces.
- `/admin` remains noindex as a minimal migration notice. `/health` stays
  sanitized, noindex and outside primary navigation.

## Implemented schema and compatibility strategy

- Add optional `why_it_matters`, `what_changed`, `corrections`, structured
  source-ledger fields, generation provenance, language linkage and sponsor
  metadata to the shared MDX type.
- Legacy content remains valid and missing editorial fields are omitted rather
  than invented. Newly generated dailies receive the expanded fields.
- Keep internal `dispatches`, `wire`, `signal_strength`, repository and
  environment identifiers to avoid risky migrations.
- Curated topics currently publish at one matching issue because the committed
  seed archive is small; the explicit threshold can be raised as history grows.
- Validate topic/editorial YAML, corrections, provenance, sponsorship,
  translations and new-generation content during `pnpm check:content`.

## Operational changes

- Generation produces a versioned run report, distribution pack and weekly
  newsletter artifacts. Reports remain private workflow artifacts.
- Token use is captured from provider responses. A centralized, versioned
  pricing registry computes cost only when sufficient usage is available.
- Daily, weekly and regenerate workflows accept validated dispatch inputs,
  isolate concurrent issue runs and support `auto`, `pull_request` and
  `dry_run` modes.
- OwnDashboard callbacks are optional, bounded and non-fatal. Scheduled runs
  continue solely from committed configuration.

## Static architecture and cost impact

- Reader pages and JSON/feed routes continue to materialize at build time.
- Topics, Radar, corrections and weekly indexes derive from committed MDX/YAML.
- No public runtime content fetch, database, authentication or AI call is added.
- Paid illustration and translation controls are configuration-driven.
  OwnDashboard, newsletter sending and social posting remain disabled/optional.

## Implementation phases

- [x] Audit architecture, routes, schema, prompts, workflows, tests and brand.
- [x] Foundation: brand config, navigation, metadata, compatibility routes,
  About and documentation.
- [x] Editorial: schema, generation prompts, Briefs, Watchlist, Why it matters,
  What changed, source ledger, provenance and corrections.
- [x] Discovery: Topics, Radar, Weekly, archive and glossary integration.
- [x] Distribution: structured data, sitemap, feeds, JSON, share and newsletter
  artifacts, optional sponsorship.
- [x] Operations: telemetry, pricing, guardrails, health, workflows and
  OwnDashboard integration contract.
- [x] Validation: unit/content/build/E2E tests, static output, security,
  accessibility and final diff review.

## Blocking unknowns

- The OwnDashboard repository is not present, so only the Caught Up side and
  versioned integration contract can be implemented locally.
- No OwnDashboard URL, callback endpoint, GitHub App or paid-provider credentials
  are configured; all related features therefore remain optional and disabled.
- Next.js 15's shared App Router/React client runtime is 102 kB compressed in
  the final build, before any page code. This improves the repository's previous
  documented ~105 kB baseline but cannot meet the requested 80 kB total without
  changing the framework/read architecture or removing preserved client
  navigation, keyboard and search behavior.
- Provider prices were verified against Anthropic's official list-price document
  effective 2026-05-12. The registry records that effective date and unknown
  models return unavailable cost instead of zero.

## Completion re-audit (2026-07-21)

The post-merge audit rechecked the requested acceptance criteria against the
rendered product and the scheduled workflows. The follow-up closes gaps that
were not covered by the first implementation:

- Accessibility now includes a focusable skip link, route-aware
  `aria-current`, localized dialog/navigation names, 44px navigation targets,
  modal focus containment and trigger-focus restoration.
- Source type and evidence class are separate fields. Legacy issues no longer
  invent generation timestamps, review status, model names or source counts.
- Weekly and topic destinations expose a current edition, date range, archive,
  timeline and recurring entities as distinct reader concepts.
- Article canonicals, hreflang and sitemap variants now reflect committed
  locale files rather than fallback pages. Corrections advance article sitemap
  and Atom update times.
- Atom output carries language, published/updated timestamps, all categories,
  image metadata and source/sponsor attribution. Empty-feed timestamps and
  Radar generation timestamps are deterministic.
- Scraping tolerates individual source failures and reports bounded per-source
  telemetry. Structured events accompany compatibility warning strings.
- Diversity, duplicate-story similarity, repeated-topic frequency,
  primary-source relevance and unsupported-Watchlist thresholds are executable.
  Enforced failures can switch the workflow to review mode or skip it.
- Translation and utility model roles are applied, all measured usage reaches
  issue cost provenance, optional distribution/image/embedding/heartbeat work
  is non-fatal, dry runs preserve validation logs, and regeneration attempts
  have a committed-history circuit breaker.

The only in-repository acceptance target still not met is the requested 80 kB
compressed JavaScript ceiling. The measured Next.js 15/React App Router shared
runtime alone is approximately 102 kB; the repository keeps the explicit
110 kB measured guard and records the 80 kB target as an architectural blocker.
OwnDashboard implementation and live paid-provider generation remain external
blockers because their repository, endpoints and credentials were not supplied.

## Operator-readiness follow-up (2026-07-21)

- Scheduled daily and weekly runs now resolve illustration defaults from the
  committed editorial configuration, while retaining an optional validated
  Actions-variable override. This closes the last committed-default mismatch.
- Generation workflows receive the canonical site/repository identity, so
  committed share packs no longer depend on the example URL when the Actions
  variable is configured.
- Regeneration now receives the same optional Firecrawl and promotion controls
  as daily generation. Anthropic gateway and fal model overrides are wired into
  all relevant workflows.
- Private workflow artifacts have an explicit 30-day retention period, and the
  official Anthropic rate registry was reverified against the live pricing page.
- Print routes now participate in the single App Router document layout instead
  of nesting a second `<html>/<body>` pair, eliminating React hydration warnings
  while preserving the dedicated print stylesheet and localized document lang.
- `NEEDED.md`, the GitHub README and `stack-and-scaling.md` now distinguish
  completed implementation from required operator credentials, deployment
  settings and optional paid services.

## Product-design and agent-architecture follow-up (2026-07-22)

- Implemented the completion-period vector and reusable brand lockup, semantic
  visual tokens, editorial typography, shared issue masthead, schema-v2
  uncertainty treatment, search focus containment, and deterministic Open
  Graph/Weekly identity.
- Refined Today and article reading as a finite arc, including progressive
  evidence/provenance, meaningful completion, no-image handling, print, and
  legacy compatibility.
- Refined Radar, Topics, Weekly, Archive, Search, About, Sources, Glossary,
  Corrections, Health, and promotion using real static data and existing
  loaders/components. Optional Topic media renders nothing when no local asset
  exists.
- Verified representative English/Czech production routes at mobile, tablet,
  desktop, and wide widths; added deterministic responsive/behavior/security
  Playwright coverage and an auditable QA record.
- Replaced contradictory design-agent instructions with focused Caught Up
  brand, editorial UI, accessibility/visual-QA, release, and deferred-media
  skills plus distinct specialist agents and executable commands.
- Higgsfield media is explicitly deferred because its MCP was unavailable. No
  substitute or placeholder assets were generated; the code has optional hooks
  and the manifest contains the complete future inventory.
