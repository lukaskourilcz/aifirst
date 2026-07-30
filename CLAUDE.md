# Caught Up repository control document

This repository publishes **Caught Up**, a bilingual, Git-native daily briefing about the AI and technology stories that actually mattered. The repository/package, bot identity, compatibility environment variables, and other stable technical identifiers intentionally remain `aifirst`.

## Product

Caught Up reduces AI-news overload. A reader should open Today, understand the lead development, why it matters, what changed, Briefs, Watchlist, and evidence, then reach **You’re caught up. / Máte přehled.** and feel able to stop scrolling.

Primary readers are busy developers, founders, product/technology leaders, AI practitioners, and informed professionals. Secondary readers include researchers, analysts, journalists, search/feed/weekly readers, and English/Czech audiences. Operators use GitHub Actions and eventually optional OwnDashboard controls; operator functionality stays separate from the public reader experience.

Public positioning:

- English: “The AI stories that actually mattered today.” / “One edition and you’re caught up on AI.”
- Czech: “To podstatné z AI. Každý den.” / “Jedno vydání a máte přehled.”
- Never translate the brand name.

## Reader routes and terminology

English is unprefixed; Czech uses `/cs`.

- Primary: `/` Today, `/radar`, `/topics`, `/weekly`, `/archive`, `/about`
- Reading: `/articles/[slug]`, `/articles/[slug]/print`
- Trust/reference: `/corrections`, `/sources`, `/sources/[id]`, `/glossary`, `/search`
- Distribution: site, Weekly, Topic, and preserved tag Atom feeds; public Today/Weekly/Topics/Radar/Sources/health JSON; static Open Graph
- Operator-adjacent: sanitized noindex health, token-gated/unlisted/noindex `/promotion`, noindex `/admin` migration notice
- Preserve redirects `/stats` and `/trends` → `/radar`, `/tags` → `/topics`, `/colophon` → `/about`, legacy articles/tags/feeds, locale behavior, and canonical metadata.

Internal `dispatches` render as **Briefs / Ve zkratce**. Internal `wire` renders as **Watchlist / Na radaru**. Do not migrate stable storage keys for cosmetic consistency.

## Architecture and boundaries

The static path is deliberate:

`sources.yml + config/*.yml → GitHub Actions → scrape → curate → write → optional illustration → validate → MDX/static artifacts/private telemetry → Git commit/review PR → Next.js static build → Vercel CDN`

An optional bounded private run-report callback may reach OwnDashboard. Dashboard failure must never block scheduled publication.

- Git and MDX are canonical. No content database, runtime CMS, reader auth/accounts, comments, per-request generation, runtime summary/chat, or runtime OwnDashboard dependency.
- Reader pages never scrape sources or call a model.
- Keep server components by default. Client boundaries are limited to actual interaction such as search, reading progress, keyboard help, or copy feedback.
- Preserve GitHub Actions mutation/idempotency, static Next routes, Vercel delivery, CSP, analytics, and compatibility contracts.
- Do not add Tailwind, CSS-in-JS, a component/state/chart/motion library, WebGL, programmatic ads, or new tracking.

## Content and generation

`lib/content.ts` is the frontmatter/read contract and legacy compatibility layer. `lib/content-write.ts` is the MDX serialization path. Schema v2 adds `why_it_matters`, `what_changed`, `uncertainty`, structured evidence-aware `sources`, `generation`, `corrections`, `translation_of`, optional `sponsor`, and alternative headlines while retaining legacy MDX.

The daily/weekly pipeline already performs committed config loading, idempotency, per-source isolation, structured curation/writing, requested locales, quality/source/diversity/duplicate checks, provider-usage cost calculation, optional illustration/promotion, persistence, static distribution output, private run reports, and an optional callback. Preserve these stages and their tests.

- Resolve models through `lib/anthropic/models.ts` and `config/editorial.yml`; do not duplicate IDs.
- Illustration defaults to `none`; quality enforcement defaults to `report_only`; budgets remain unset unless operations intentionally change.
- Do not enable paid media, extra model passes, locale expansion, or stricter enforcement as a side effect of product work.
- Never fabricate sources, provenance, metrics, human review, or cost.

## Important paths and reuse

- `app/`: App Router pages, feeds, JSON, metadata, OG, print
- `components/`: shared reader/editorial UI
- `lib/content.ts`, `lib/content-write.ts`: content reads/writes
- `lib/i18n/`: locale dictionaries/path/metadata helpers
- `lib/editorial/`: validation/config-facing editorial contracts
- `lib/pipeline/`, `lib/scraping/`, `lib/anthropic/`, `lib/telemetry/`: generation system
- `config/`, `sources.yml`: committed operations/editorial configuration
- `docs/design/`: product audit, thesis, brand/design system, QA, and queued media production
- `.claude/`: project skills, agents, and executable workflow commands

Search before creating. Prefer extending `PageShell`, `IssueRow`, `IssueMasthead`, existing editorial components, `SourceLedger`, `Provenance`, `EditorialHighlights`, `FeedActions`, `IssueNavigation`, `CorrectionsNotice`, `SponsorBlock`, `StructuredData`, `Dispatches`, `Wire`, `ModalOverlay`, navigation/icons, localization helpers, content/feed/topic/Radar/signal helpers, and existing tests. Do not create parallel cards, dialogs, content loaders, grids, tokens, or hooks without a concrete gap.

TypeScript is strict and `noUncheckedIndexedAccess` is enabled. Keep server-reached relative value imports extensionless. Never commit `.env.local`, secrets, generated caches, rejected media, or private run reports.

## Brand and design system

The design thesis is **calm editorial intelligence with a clear sense of completion**. Read:

- `docs/design/DESIGN_THESIS.md`
- `docs/design/BRAND_SYSTEM.md`
- `docs/design/DESIGN_SYSTEM.md`
- `docs/design/VISUAL_QA.md`

Use the completion-period vector through `BrandMark`/`BrandLockup`, warm paper and ink, blueprint blue, restrained semantic status colors, editorial serif headlines, readable sans body/interface text, and mono only for identifiers/measured values. Use semantic custom properties, flat surfaces, hairlines, low radii, measured reading widths, accessible focus, and purposeful density.

Today is the product, not a marketing landing page. Radar is editorial intelligence, not an operator dashboard. Topics are curated, Weekly is a distinct edition, Archive/Search/reference surfaces are compact, and completion is meaningful rather than gamified.

Never restore terminal-first, neon, scanline, parallax, glow, dark-only, generic startup-gradient, glass, fake-interface, robot/brain/circuit, excessive-card/pill, fake-chart/metric, mascot, testimonial, or infinite-feed styling. Do not use generated imagery as filler or replace authentic UI with generated UI.

Copy is concise, calm, direct, evidence-aware, and honest about uncertainty. Avoid startup hype and generic “AI-powered” language.

## Generated-media provider policy

Use `.claude/skills/caught-up-media-production/SKILL.md` when generated
brand/media work is in scope. No generated-media platform is selected. The
current implementation contains optional layout/media hooks but no generated
assets.

At the start of the next media-production session, perform current web research
using official provider/model/license sources. Compare at least three genuinely
available free-tier, open-source/local, or low-cost generators. Record price per
usable image and free quota, card/signup requirements, commercial-use rights,
ownership/training/privacy terms, watermark/public-gallery behavior, resolution
and aspect ratios, API/MCP or original-download access, rate limits, and likely
fit for Editorial Evidence Collage. Prefer a no-card, commercially usable,
private, watermark-free option; a cheap paid option requires explicit operator
authority. If a safe provider is selected, use the existing briefs and record
real provenance in `docs/design/GENERATED_MEDIA_ASSET_MANIFEST.md`. If none
qualifies, publish the evidence matrix and defer without producing a placeholder.

## Responsive, accessibility, localization, and states

Validate 360, 430, 768, 1024, 1280–1440, and 1600px where layout changes; include 320px reflow when relevant. Test Czech and long copy. No horizontal page overflow; wide tables may use an accessible scroll region.

Maintain skip links, landmarks, one clear page `h1`, current navigation, keyboard order, visible focus, dialog containment/Escape/restoration, accessible names, live feedback, source/corrections/sponsorship semantics, 44px touch targets, non-color state cues, contrast, zoom, reduced motion, and correct image alt/decorative handling.

Handle real missing/legacy/fallback/no-image/no-Briefs/no-Watchlist/no-Topics/no-Weekly/empty-search/stale-health/correction/sponsorship/cost-review-unavailable/long-content states. Never fabricate content to fill a layout.

## SEO, security, privacy, and performance

Preserve static metadata, canonical/hreflang, structured data, sitemap, robots, Atom/JSON contracts, Open Graph, article URLs, and print. Keep HSTS, CSP, frame denial, MIME protection, restrictive permissions policy, safe links, no X-Powered-By, token gates, noindex operator surfaces, and sanitized health output.

The enforceable bundle target is the existing **110 kB gzip page-entry ceiling**. The latest validated Next/React shared runtime is 102 kB. Do not claim the historical 80 kB aspiration, add heavy client dependencies, preload unnecessary media, or introduce runtime media/API cost. Use local optimized assets with dimensions and lazy loading.

## Validation and Git

Inspect `package.json` before running commands. The release gates are:

```bash
pnpm verify   # lint, TypeScript, unit tests, content/config, build, bundle
pnpm e2e      # route, behavior, responsive and accessibility checks
```

For focused work, run the smallest relevant commands while iterating, then the complete gates for release-level changes. Inspect the real UI; never claim a browser, test, or command passed unless it actually ran successfully.

Before editing, inspect branch/status/staged and unstaged diffs/recent log. Preserve unrelated work and stage deliberately. Use coherent incremental commits for large autonomous tasks and continue immediately after each checkpoint. Do not reset, discard user changes, rewrite unrelated history, force push, commit secrets/caches, or push unless authorized.

Tokens live in the palette block at the top of `app/globals.css`. Prefer the
semantic roles (`--surface-*`, `--text-*`, `--border-*`, `--accent-*`,
`--status-*`, `--focus-ring`) in new rules. Re-measure text and status contrast
before changing slate or mint, and mirror palette changes in `lib/og-theme.ts`
because `next/og` cannot read CSS variables.

## Project AI workflows

Skills:

- `caught-up-brand-system`
- `caught-up-editorial-ui`
- `caught-up-media-production`
- `caught-up-accessibility-visual-qa`
- `caught-up-release-validation`
- focused pipeline/source/weekly/testing skills retained under `.claude/skills/`

Agents:

- `editorial-product-designer`
- `brand-media-art-director`
- `accessibility-visual-qa`
- `source-scout`, `scraper-builder`, `article-writer`

Commands:

- `/design-audit`
- `/implement-editorial-route <route>`
- `/generate-brand-media <asset-purpose>`
- `/visual-qa [scope]`
- `/release-check`
- `/add-source`, `/generate-article`, `/preview-magazine`

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

## Git workflow

- Commit coherent checkpoints during large work.
- Push or merge only when the user authorizes it.
- Remove stale merged branches only when branch cleanup is in scope.

## Definition of done

The implementation, documentation, localization, states, tests, responsive/accessibility behavior, feeds/JSON/metadata/security, bundle guard, and Git history agree. Feasible defects are fixed, checks are reported accurately, design guidance contains no contradictory legacy identity, and any unavailable external capability is named as a concrete limitation rather than replaced with fiction.
