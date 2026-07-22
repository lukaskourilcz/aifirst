# Caught Up — architecture and operations

This is the detailed reference for the Caught Up publication. The repository,
package, bot identity and compatibility environment variables remain `aifirst`;
all reader-facing identity is Caught Up.

## System shape

```text
sources.yml + committed editorial/topic configuration
  → GitHub Actions
  → scrape → curate → write → optional illustrate → validate
  → MDX + static images + share/newsletter artifacts + private run report
  → Git commit or review pull request
  → Next.js static build
  → reader CDN

optional: private run report → bounded OwnDashboard callback
```

Git and MDX are canonical. The reader application has no runtime content
database, public login, per-request AI call or public dependency on the
dashboard. A dashboard outage cannot stop scheduled publishing.

## Reader routes

English is unprefixed and Czech uses `/cs`.

- `/` — Today
- `/articles/[slug]` — issue detail
- `/articles/[slug]/print` and `/cs/articles/[slug]/print` — static print views
- `/radar` — trends, signal, archive timeline, Watchlist and static pulse data
- `/topics`, `/topics/[slug]` — curated destinations over raw tag metadata
- `/weekly` — weekly index and feed call to action
- `/archive` — complete context-rich archive
- `/about` — trust center
- `/corrections` — public correction history
- `/sources`, `/sources/[id]`, `/glossary`, `/search` — secondary reference
- `/feed.xml`, `/weekly/feed.xml`, `/topics/[slug]/feed.xml` — Atom
- `/api/today.json`, `/api/weekly.json`, `/api/topics.json`, `/api/radar.json`
  and `/api/health.json` — static, public syndication/health contracts

Compatibility decisions:

- `/stats` and `/trends` return permanent redirects to `/radar`.
- `/tags` permanently redirects to `/topics`; tag detail pages and feeds remain.
- `/colophon` permanently redirects to `/about`.
- `/admin` is a noindex migration notice, not an operator console.
- `/health` remains noindex and outside the primary navigation.
- `/pulse` is retained as a demoted compatibility/detail surface; its useful
  content is composed into Radar.
- The old `?lang=cs` print URL permanently redirects to the Czech static path.

Primary navigation is Today, Radar, Topics, Weekly, Archive and About. Search
and the language switcher remain available in the sidebar. Sources, glossary,
corrections and feeds are visible from the footer or relevant reading context.

## Rendering and localization

All reader content routes above are SSG or static output. The only dynamic app
route is the token-gated, noindex internal promotion console. Default Open
Graph image generation remains a metadata endpoint, not a content read path.

`lib/i18n/config.ts` owns locale conventions. `localeAlternates` emits
localized canonical, `hreflang` and `x-default` links. Localized feeds use the
same URL convention. UI, About, Topics, Radar and Weekly are bilingual.

Daily generation is selective: the scheduled workflow requests English only.
Manual `language=all` requests both committed locales when selected-daily
translation is enabled. Weekly requests both by default. The writing tool only
asks for the requested locale fields, so an English-only daily does not pay for
unused Czech output.

## Content model

`lib/content.ts` is the single reader-side MDX loader. Legacy files without a
schema version remain supported. Schema version 2 adds:

- `why_it_matters`, `what_changed`, `uncertainty`
- structured source references (`source_id`, publisher/type, primary or
  secondary classification, published time and supported claims/sections)
- generation time, review state, models, source counts, image provider and
  measured cost when complete
- alternative distribution headlines
- corrections
- language linkage through `translation_of`
- optional, build-time-only sponsor metadata

The existing `dispatches` and `wire` storage keys remain for compatibility;
reader labels are Briefs and Watchlist. Existing `signal_strength`, source IDs,
article slugs and weekly digest linkage are preserved.

`pnpm check:content` validates every MDX file and both configuration files. It
checks real dates, URLs, source duplication, registered schema-v2 source IDs,
field bounds, weekly coverage, provenance, measured cost, corrections,
sponsorship safety and deterministic translation linkage (date, type, source
URLs, topics/tags, signal, correction shape and weekly coverage).

## Reader composition

New issues can display:

- edition masthead, lead and reading metadata
- Why it matters and What changed
- Briefs and Watchlist
- optional sponsor block, clearly labeled with safe link attributes
- semantic MDX article body
- keyboard-accessible `<details>` glossary definitions with full-entry links
- source ledger with source profile links when registry IDs are known
- corrections and generation provenance
- related issues, topics, previous/next navigation and feed actions
- completion state: “You’re caught up.”

Legacy issues omit unavailable sections; no facts or provenance are invented.

## Topics, Radar and Weekly

`config/topics.yml` is the curated taxonomy. The current threshold is one issue
because the committed seed archive is small; the threshold is explicit and can
be raised without a route migration. Empty/disabled topics are excluded from
static params, feeds, indexes and the sitemap.

Radar deterministically composes existing tag trend, signal, Watchlist, pulse
and issue timeline data. It does not expose scrape failures, raw operator logs
or cost.

Weekly reuses the existing seven-day coverage logic and writes schema-v2,
bilingual MDX. It generates localized share packs and provider-independent
HTML/plain-text/metadata newsletter artifacts. Newsletter files live under
ignored `generated/` and are uploaded privately by Actions.

## Generation pipeline

Daily:

1. Load and validate committed configuration.
2. Resolve language and model profile; stop idempotently if all requested
   locale files already exist.
3. Scrape source adapters with partial-failure isolation.
4. Evaluate early source/candidate guardrails.
5. Curate with structured tool output and explicit evidence classification.
6. Write only requested locales with structured editorial/source output.
7. Calculate signal, source diversity and measured provider usage.
8. Apply quality, translation and hard per-run cost guardrails.
9. Optionally illustrate and, only when explicitly enabled, write promotion
   copy; paid-image cost uncertainty fails closed when a hard limit exists.
10. Persist MDX and static share packs.
11. Write and optionally deliver the private run report.

Weekly follows the same configuration, model, language, idempotency, cost and
reporting conventions, then produces newsletter/share artifacts.

Committed model profiles:

- `standard`: Sonnet curation, Opus writing, Haiku utility
- `economical`: Haiku curation, Sonnet writing, Haiku utility

The committed illustration default is `none`. Scheduled runs resolve that value
from `config/editorial.yml`, with an optional validated `IMAGE_PROVIDER` Actions
variable override; manual runs use their workflow input. fal.ai is paid and
requires `FAL_KEY`; NASA and Picsum are optional non-generative image sources.
Model-written promotion and Jina embeddings are opt-in for scheduled dailies.

## Configuration

`config/editorial.yml` owns:

- daily/weekly enablement, primary/enabled languages and default mode
- quality thresholds and report-only/enforced behavior
- target length, Brief/Watchlist/output/candidate limits
- weekly, selected-daily and full-daily translation controls and budget
- committed model profiles
- illustration default
- warning/hard per-run and monthly budget fields
- maximum regeneration attempts and review default

`sources.yml` remains executable source truth. `config/topics.yml` remains
curated discovery truth. Dashboard editing must branch, validate, show a diff,
open a pull request and let CI run; it must not maintain a second permanent
copy.

## Workflow controls

Daily, weekly and regenerate workflows accept validated date, language,
publishing mode, image provider, model profile, force and embedding inputs.
Concurrency groups isolate issue kind/date/language. Generation is idempotent
unless `force` is explicit.

Publishing modes:

- `auto` — verify, commit and push generated public files.
- `pull_request` — create a generated branch and review PR after verification.
- `dry_run` — generate, verify and upload private artifacts without commit.

Every workflow uploads reports and relevant artifacts with `if: always()` and a
30-day retention period.
Article persistence/validation/build failure fails the job. Optional
illustration, distribution, promotion, embeddings, heartbeat and dashboard
delivery do not make the reader dependent on those services. Dry-run artifacts
include the complete validation log.

## Telemetry and cost

`GenerationRunReport` schema v1 records identity, timing, status, repository
references, every stage, bounded per-source scrape results, editorial metrics,
token/cache usage, image state, cost, compatibility warnings and structured
events. `examples/generation-run-report.v1.json` is a fixture; TypeScript is
authoritative in `lib/telemetry/types.ts`.

Anthropic usage comes from actual API response counters. A versioned pricing
registry converts input, output, five-minute cache-write and cache-read tokens
to USD. Unknown models, missing counters or missing paid-image cost make the
complete cost unavailable; they never become zero. Token line items remain
visible when a complete total cannot be claimed.

Hard per-run limits are evaluated in committed pipeline logic and fail closed.
Monthly budget fields are committed, but aggregation/enforcement requires the
external telemetry ledger because Actions runners are ephemeral. Scheduled
publishing otherwise remains independent of that ledger.

## OwnDashboard boundary

When both callback variables are present, the report is POSTed with Bearer
authorization and an idempotency key. There are at most two eight-second
attempts. Failure adds a warning to the local report and never removes a valid
edition. See `docs/OWNDASHBOARD_INTEGRATION.md` for the versioned receiver,
GitHub App permissions, command center, review, recovery and alert contract.

## SEO and distribution

- Caught Up metadata and restrained editorial Open Graph visuals
- Article/NewsArticle, Organization, WebSite, BreadcrumbList and CollectionPage
  structured data where semantically applicable
- localized canonical/hreflang/x-default links and article metadata
- one static sitemap covering general pages, articles, weekly editions, topics
  and source profiles; small archive size does not justify multiple files yet
- operator, health, deprecated duplicates, previews and empty topics excluded
- deterministic internal related/topic/source/glossary/adjacent links
- localized site, weekly, topic and preserved tag feeds
- static JSON syndication and locale-specific distribution packs

The single sitemap is intentional for the current small archive. Next.js
supports nested/generated sitemap partitions when URL count or build time makes
segmentation useful; the current output is well below search-engine limits.

## Security and privacy

`next.config.mjs` preserves HSTS, strict CSP, frame denial, MIME-sniffing
protection, restrictive permissions policy and no `X-Powered-By`. External
links use safe relationships. Sponsor images must be local paths and cannot
inject HTML or script. Public health contains status/cadence only—no secrets,
stack traces, internal URLs or cost ledger. Vercel telemetry components render
only in the Vercel environment, preventing local 404/script errors.

The internal promotion route returns 404 unless `PROMOTION_TOKEN` is configured
and correct. It remains dynamic, noindex, robots-disallowed and outside all
navigation/sitemaps.

## Performance and validation

The implementation removed the `motion` dependency and experimental React View
Transitions; reading progress now uses a small native listener. The final build
reports 102 kB compressed shared framework JS and 106 kB for normal pages,
versus 115/118 kB during the initial rebrand pass. The repository’s previous
documentation recorded an approximately 105 kB
baseline. This is still above the prompt’s requested 80 kB because the Next 15
App Router/React client runtime alone is 102 kB; reaching 80 kB would require an
architecture or framework change, or stripping the client router and existing
keyboard/search behavior.

`pnpm check:bundle` reads the production app manifest and enforces a 110 kB gzip
ceiling per page entry. `pnpm verify` runs it after every production build so a
later change cannot silently erase the measured improvement.

Validation commands:

```bash
pnpm verify
pnpm e2e
pnpm generate:artifacts
```

Playwright smoke tests cover routes, compatibility redirects, trust surfaces,
print compatibility, navigation, localization, overflow and console errors at
desktop/tablet/mobile sizes. The visual audit captures the main public routes
at all three viewport classes and reports dead-space findings.

## Product and design implementation

The production interface follows “calm editorial intelligence with a clear
sense of completion.” The completion-period vector, shared brand lockup,
semantic warm-paper/ink/blue tokens, editorial masthead, finite completion
state, data-first Radar, curated Topics, distinct Weekly cover, compact
Archive/Search/reference surfaces, and print styling are implemented in the
real routes. `docs/design/DESIGN_SYSTEM.md` is authoritative for the current
CSS/component system; `docs/design/VISUAL_QA.md` records the route and viewport
evidence.

Topic media is an optional local-only field and disappears when absent. Weekly
and Open Graph identity remain deterministic without media. Higgsfield was not
available for the 2026-07-22 overhaul, so no generated or substitute assets
were added. `docs/design/HIGGSFIELD_ASSET_MANIFEST.md` lists only deferred
deliverables and the provenance required after real generation.

Project AI instructions live in `CLAUDE.md`, `AGENTS.md`, and `.claude/`.
They require reuse, mobile/Czech/keyboard validation, semantic tokens,
incremental commits, and the full release gates. The former incompatible
future-terminal design guidance has been removed.
