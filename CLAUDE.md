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
- Operator-adjacent: sanitized noindex health and the noindex `/admin` migration notice; `/promotion` is retired
- Preserve redirects `/stats` and `/trends` → `/radar`, `/tags` → `/topics`, `/colophon` → `/about`, legacy articles/tags/feeds, locale behavior, and canonical metadata.

Internal `dispatches` render as **Briefs / Ve zkratce**. Internal `wire` renders as **Watchlist / Na radaru**. Do not migrate stable storage keys for cosmetic consistency.

## Architecture and boundaries

The static path is deliberate:

`BoardlessAI/quorum source + edition gates → EditionPackage v1 → content-only GitHub App commit → aifirst validation → Next.js static build → Vercel CDN`

- Git and MDX are canonical. No content database, runtime CMS, reader auth/accounts, comments, per-request generation, runtime summary/chat, or runtime OwnDashboard dependency.
- Reader pages never scrape sources or call a model.
- Keep server components by default. Client boundaries are limited to actual interaction such as search, reading progress, keyboard help, or copy feedback.
- Preserve delivery idempotency, static Next routes, Vercel delivery, CSP, analytics, and compatibility contracts.
- No code path in this repository may scrape, call an editorial model, regenerate an edition, or accept BoardlessAI writes outside the four delivery paths.
- Do not add Tailwind, CSS-in-JS, a component/state/chart/motion library, WebGL, programmatic ads, or new tracking.

## Content and delivery

`lib/content.ts` is the frontmatter/read contract and legacy compatibility layer. `lib/delivery/` is the only write boundary and validates `edition-package/1`, exact MDX serialization, bilingual parity, authorized paths and same-date hashes. Schema v2 adds `why_it_matters`, `what_changed`, `uncertainty`, structured evidence-aware `sources`, `generation`, `corrections`, `translation_of`, optional `sponsor`, and alternative headlines while retaining legacy MDX.

- Editorial production, source collection, regeneration, illustration composition and social promotion are owned by Quorum. Do not recreate dormant fallbacks here.
- The daily workflow is a sentinel only. Weekly pages render existing committed content; there is no weekly generation workflow.
- Never fabricate sources, provenance, metrics, human review, or cost.

## Important paths and reuse

- `app/`: App Router pages, feeds, JSON, metadata, OG, print
- `components/`: shared reader/editorial UI
- `lib/content.ts`, `lib/delivery/`: content reads and the bounded package consumer
- `lib/i18n/`: locale dictionaries/path/metadata helpers
- `lib/editorial/`: validation/config-facing editorial contracts
- `lib/sources.ts`, `sources.yml`: read-only citation registry
- `config/`: topics and board changelog configuration
- `docs/design/`: product audit, thesis, brand/design system and QA
- `.claude/`: project skills, agents, and executable workflow commands

Search before creating. Prefer extending `PageShell`, `IssueRow`, `IssueMasthead`, existing editorial components, `SourceLedger`, `Provenance`, `EditorialHighlights`, `FeedActions`, `IssueNavigation`, `CorrectionsNotice`, `SponsorBlock`, `StructuredData`, `Dispatches`, `Wire`, `ModalOverlay`, navigation/icons, localization helpers, content/feed/topic/Radar/signal helpers, and existing tests. Do not create parallel cards, dialogs, content loaders, grids, tokens, or hooks without a concrete gap.

TypeScript is strict and `noUncheckedIndexedAccess` is enabled. Keep server-reached relative value imports extensionless. Never commit `.env.local`, secrets, generated caches, rejected media, or private run reports.

## Brand and design system

The design thesis is **editorial intelligence presented as a precise publishing instrument, with a clear sense of completion**. Read:

- `docs/design/DESIGN_THESIS.md`
- `docs/design/BRAND_SYSTEM.md`
- `docs/design/DESIGN_SYSTEM.md`
- `docs/design/VISUAL_QA.md`

Use the completion mark through `BrandMark`/`BrandLockup`, a near-black instrument canvas, cool panel surfaces, electric blueprint blue, restrained semantic status colors, Space Grotesk for display/interface hierarchy, IBM Plex Mono for machine metadata, and Source Serif 4 for reading prose. Use semantic custom properties, flat zero-radius surfaces, one-pixel hairlines, measured reading widths, accessible focus, and purposeful density.

Today is the product, not a marketing landing page. Radar is editorial intelligence, not an operator dashboard. Topics are curated, Weekly is a distinct edition, Archive/Search/reference surfaces are compact, and completion is meaningful rather than gamified.

The public reader uses one dark theme; print remains black on white. Avoid terminal cosplay, neon, scanlines, parallax, glow, startup gradients, glass, fake interfaces, robots/brains/circuits, excessive pills, fake charts or metrics, mascots, testimonials, and infinite-feed styling. Do not use generated imagery as filler or replace authentic UI with generated UI.

Copy is concise, calm, direct, evidence-aware, and honest about uncertainty. Avoid startup hype and generic “AI-powered” language.

## Media boundary

BoardlessAI owns illustration selection, generation and provenance. Every new
`edition-package/1` article must include exactly one dated WebP with validated
dimensions and attribution; Caught Up rehosts and serves it locally. Historical
and legacy issues may still have no image, so the reader must keep its complete
text-first fallback. Do not add provider credentials, generation adapters,
Topic-cover production or social-media assets to this repository.

## Responsive, accessibility, localization, and states

Validate 360, 430, 768, 1024, 1280–1440, and 1600px where layout changes; include 320px reflow when relevant. Test Czech and long copy. No horizontal page overflow; wide tables may use an accessible scroll region.

Maintain skip links, landmarks, one clear page `h1`, current navigation, keyboard order, visible focus, dialog containment/Escape/restoration, accessible names, live feedback, source/corrections/sponsorship semantics, 44px touch targets, non-color state cues, contrast, zoom, reduced motion, and correct image alt/decorative handling.

Handle real missing/legacy/fallback/no-image/no-Briefs/no-Watchlist/no-Topics/no-Weekly/empty-search/stale-health/correction/sponsorship/cost-review-unavailable/long-content states. Image positions render only when a real local or cached source asset exists; never fabricate content to fill a layout.

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
`--status-*`, `--focus-ring`) in new rules. The dark palette's metadata floor is
`#8d949f`; do not introduce dimmer text. Re-measure text and status contrast
before changing gray or status colors, and mirror palette changes in
`lib/og-theme.ts` because `next/og` cannot read CSS variables.

## Project AI workflows

Skills:

- `caught-up-brand-system`
- `caught-up-editorial-ui`
- `caught-up-accessibility-visual-qa`
- `caught-up-release-validation`
- focused architecture, editorial-feature and testing skills under `.claude/skills/`

Agents:

- `editorial-product-designer`
- `accessibility-visual-qa`

Commands:

- `/design-audit`
- `/implement-editorial-route <route>`
- `/visual-qa [scope]`
- `/release-check`
- `/preview-magazine`

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
