# Caught Up — architecture and operations

This is the detailed reference for the Caught Up publication. The repository,
package, bot identity and compatibility environment variables remain `aifirst`;
all reader-facing identity is Caught Up.

## System shape

```text
BoardlessAI/quorum source collection + edition quality gates
  → EditionPackage v1
  → bounded content-only GitHub App commit
  → aifirst schema/content validation
  → Next.js static build
  → reader CDN
```

Git and MDX are canonical. The reader application has no runtime content
database, public login, per-request AI call or public dependency on the
BoardlessAI. A producer outage becomes an honest missed or NO_EDITION day; it
does not activate a second generator in this repository.

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
- `/api/today.json`, `/api/weekly.json`, `/api/topics.json`, `/api/radar.json`,
  `/api/sources.json` and `/api/health.json` — static, public syndication/health
  contracts

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

All reader content routes above are SSG or static output. Default Open Graph
image generation remains a metadata endpoint, not a content read path. The
retired `/promotion` route returns 404.

`lib/i18n/config.ts` owns locale conventions. `localeAlternates` emits
localized canonical, `hreflang` and `x-default` links. Localized feeds use the
same URL convention. UI, About, Topics, Radar and Weekly are bilingual.

BoardlessAI deliveries contain both English and Czech when status is `edition`.
The reader preserves its existing locale, canonical and hreflang behavior. A
NO_EDITION package contains only sanitized board context.

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

Weekly renders the existing committed schema-v2 bilingual archive and feeds.
Its former writer and workflow are retired; a future replacement requires a
new board proposal instead of a dormant fallback.

## Delivery pipeline

1. Parse `edition-package/1` with the mirrored contract.
2. Verify the canonical idempotency hash and exact bilingual MDX bytes.
3. Reject a wrong major, content mismatch or unauthorized hero path.
4. If the English date already exists, accept only the same package hash as a
   success no-op; a different hash fails closed.
5. Materialize only dated English/Czech MDX, optional dated WebP and sanitized
   board JSON through temporary files.
6. Run `check:content`, commit only those authorized paths, and let Vercel run
   the same validation independently during build.

Source collection, models, budget enforcement, regeneration, illustration and
social production live in Quorum. `lib/sources.ts` reads `sources.yml` only for
reader attribution and content validation.

## Configuration

`sources.yml` is a read-only citation registry. `config/topics.yml` remains
curated discovery truth and `config/board-changelog.json` controls reader-safe
board history. Producer models, budgets, source collection and media policy
live only in Quorum. Changes branch, validate, show a diff and pass CI.

## Workflow controls

`daily.yml` runs only at 07:00 UTC and may be dispatched with an optional date.
It checks for that Prague day's English article or a valid NO_EDITION board
record. If both are missing, it opens one `missed-day: <date>` issue and fails.
It has contents read and issues write permissions; there are no generation,
weekly or regeneration workflows.

## Telemetry and cost

Sanitized board JSON exposes a real package hash, status, room URL, rationale or
NO_EDITION reason, and generation cost only when a measured number exists.
Provider token details, source-run errors and queues do not cross the boundary.

## OwnDashboard boundary

OwnDashboard may read public health and repository history, but aifirst has no
generation callback or mutation control. Producer operations belong to Quorum.

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

The former internal promotion route and its token gate were removed at the
BoardlessAI cutover; promotion artifacts are no longer generated or served by
this repository.

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

The final 2026-07-22 overhaul validation passed 31 Vitest files and 127 tests,
8 MDX files plus configuration, 199 static/SSG route outputs, and 25 guarded
page entries with a maximum of 103.7 kB gzip. Playwright passed 154 tests with
2 intentional desktop-layout skips, 0 failures, and an empty responsive-audit
report.

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

Weekly and Open Graph identity remain deterministic without media. Article
heroes are optional files delivered by BoardlessAI through the bounded package
contract. The reader has no generated-media provider, Topic-cover production
hook or runtime provider dependency.

Project AI instructions live in `CLAUDE.md`, `AGENTS.md`, and `.claude/`.
They require reuse, mobile/Czech/keyboard validation, semantic tokens,
incremental commits, and the full release gates. The former incompatible
future-terminal design guidance has been removed.
