# DNESKAi repository control document

This repository publishes **DNESKAi**, a Czech, Git-native daily briefing about the AI and technology stories that actually mattered. The repository/package, bot identity, compatibility environment variables, and other stable technical identifiers intentionally remain `aifirst`, and the venture id upstream remains `caught-up`.

**The name is unified.** `brand.name` and `brand.wordmark` are both DNESKAi, and that name carries everything: the navigation lockup, the footer, print, page titles, Open Graph and Twitter cards, `openGraph.siteName`, structured data, the JSON endpoints, the Atom feeds and the drawn covers. The owner approved the switch on 2026-08-09; the split that preceded it existed only so the new name could reach readers before every indexed title moved at once.

`brand.legalName` stays Caught Up, and the repository, package, bot identity, venture id (`caught-up`), skill slugs, compatibility environment variables and Actions variables all stay `aifirst`/`caught-up`. Those are stable identifiers, not the publication name, and renaming them is not a branding decision.

## Product

DNESKAi reduces AI-news overload. A reader should open Today, understand the lead development, why it matters, what changed, Briefs, Watchlist, and evidence, then reach **Máte přehled.** and feel able to stop scrolling.

Primary readers are busy Czech developers, founders, product/technology leaders, AI practitioners, and informed professionals. Secondary readers include researchers, analysts, journalists, and search/feed/weekly readers. Operators use GitHub Actions and eventually optional OwnDashboard controls; operator functionality stays separate from the public reader experience.

Public positioning:

- “To podstatné z AI. Každý den.” / “Jedno vydání a máte přehled.”
- Never translate the brand name.

## Reader routes and terminology

Czech serves at the root. The `/cs` prefix and the English routes behind it are legacy
compatibility only; nothing new is published under them.

- Sections: `/` Dnes, `/tyden` and `/tyden/[week]`, `/o-cem-se-mluvi`,
  `/ai-modely`, `/podcasty`, `/akce`
- Secondary: `/radar`, `/topics`, `/weekly`, `/archive`, `/lekce`, `/about`, `/pulse`.
  The rail labels these in Czech; the paths stay English and are a compatibility
  contract. This redesign creates no Czech aliases for them.
- Reading: `/articles/[slug]`, `/articles/[slug]/print`
- Trust/reference: `/corrections`, `/sources`, `/sources/[id]`, `/glossary`, `/search`
- Distribution: site, Weekly, Topic, and preserved tag Atom feeds; public Today/Weekly/Topics/Radar/Sources/health JSON; static Open Graph
- Operator-adjacent: sanitized noindex health and the noindex `/admin` migration notice; `/promotion` is retired
- Preserve redirects `/stats` and `/trends` → `/radar`, `/tags` → `/topics`, `/colophon` → `/about`, legacy articles/tags/feeds, locale behavior, and canonical metadata.

Internal `dispatches` render as **Briefs / Ve zkratce**. Internal `wire` renders as **Watchlist / Na radaru**. Do not migrate stable storage keys for cosmetic consistency.

## Architecture and boundaries

The static path is deliberate:

`BoardlessAI/quorum source + edition gates → EditionPackage v1 → content-only GitHub App commit → aifirst validation → Next.js static build → Vercel CDN`

Every edition is written once, natively in Czech, upstream. There is no translation stage
anywhere in this pipeline and none is coming back.

- Git and MDX are canonical. No content database, runtime CMS, reader auth/accounts, comments, per-request generation, runtime summary/chat, or runtime OwnDashboard dependency.
- Reader pages never scrape sources or call a model.
- Keep server components by default. Client boundaries are limited to actual interaction such as search, reading progress, keyboard help, or copy feedback.
- Preserve delivery idempotency, static Next routes, Vercel delivery, CSP, analytics, and compatibility contracts.
- No code path in this repository may scrape, call an editorial model,
  regenerate an edition, or accept BoardlessAI writes outside the authorized
  delivery paths: dated MDX, the edition's hero and thumbnail, board JSON, the
  two append-only datasets, and the three synced stream and event files.
  `docs/GOVERNANCE.md` is the enumeration.
- Do not add Tailwind, CSS-in-JS, a component/state/chart/motion library, WebGL, programmatic ads, or new tracking.

## Content and delivery

`lib/content.ts` is the frontmatter/read contract and legacy compatibility layer. `lib/delivery/` is the only write boundary and validates `edition-package/1`, exact MDX serialization, the required Czech article, authorized paths and same-date hashes. An English article is accepted only as legacy and is never required. Schema v2 adds `why_it_matters`, `what_changed`, `uncertainty`, structured evidence-aware `sources`, `generation`, `corrections`, `translation_of`, optional `sponsor`, and alternative headlines while retaining legacy MDX.

- Editorial production, source collection, regeneration, illustration composition and social promotion are owned by Quorum. Do not recreate dormant fallbacks here.
- The daily workflow is a sentinel only: it checks that the day has either a Czech article whose `package_hash` matches the board record, or an honest no-edition board record. Weekly pages render existing committed content; there is no weekly generation workflow.
- Never fabricate sources, provenance, metrics, human review, or cost.

## Daily widgets and the banner slot

Three Server Components on Today read `data/`, not the edition pipeline. They add
no client JavaScript and make no network or model call.

- **`DailyLesson`** and **`DidYouKnow`** live in the right rail through their
  `variant="rail"` form and both take the lead edition's date as a prop. The
  strip and block variants remain for any surface that wants them inline.
- The pick is `daysBetween(anchor, dateKey) % length` from `lib/daily.ts`. The date
  is the newest edition's `frontmatter.date` — a Prague publishing day by contract —
  never a clock. Nothing in these paths may call `new Date()`, `Date.now()` or
  `Math.random()`, or the build stops being reproducible.
- `data/ai-facts.json` and `data/ai-lessons.json` are append-only; `data/README.md`
  is the contract and `lib/__tests__/datasets.test.ts` is the gate. Counts are
  asserted as minimums so an append needs no test edit.
- The lessons are a dated curriculum, `glossary.yml` is a reference list. They
  coexist; do not merge them or cross-wire their loaders.
- **`BannerSlot`** renders `config/banner.json` and both slots ship empty. An
  empty slot either collapses or reserves its box, and which one is config:
  `today-partner-belt` returns `null` and reserves no space, while `rail-square`
  carries `placeholder: true` and holds a 300×250 reservation so filling it later
  shifts nothing. The flag stops applying once a real creative exists, because a
  filled slot is its own reservation. A creative must be a local file under
  `public/images/banners/` with explicit dimensions; anything else reads as empty.
  No ad script, no third-party host, no tracking, so CSP is untouched.

## Important paths and reuse

- `app/`: App Router pages, feeds, JSON, metadata, OG, print
- `components/`: shared reader/editorial UI
- `lib/content.ts`, `lib/delivery/`: content reads and the bounded package consumer
- `lib/i18n/`: locale dictionaries/path/metadata helpers
- `lib/editorial/`: validation/config-facing editorial contracts
- `lib/sources.ts`, `sources.yml`: read-only citation registry
- `data/`, `lib/daily.ts`, `lib/facts.ts`, `lib/lessons.ts`: the daily-widget datasets and their build-time read surface, separate from the edition pipeline
- `config/`: topics, board changelog and banner-slot configuration
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

Use the completion mark through `BrandMark`/`BrandLockup`, a light paper canvas, white reading surfaces, blueprint blue `#2f5ae6`, restrained semantic status colors, Space Grotesk for display/interface hierarchy, IBM Plex Mono for machine metadata, and Source Serif 4 for reading prose. Use semantic custom properties, flat zero-radius surfaces, one-pixel hairlines, measured reading widths, accessible focus, and purposeful density.

**The reader shows no production instrumentation and never describes itself as
AI-operated.** No run costs, model names, candidate counts, signal scores, agent
references or build vocabulary in reader copy. Telemetry lives only in `/health`,
`/api/health.json` and the BoardlessAI admin. Keep the journalism trust
surfaces: source ledger, corrections, sponsor labelling, the completion mark.

Today is the product, not a marketing landing page. Radar is editorial intelligence, not an operator dashboard. Topics are curated, Weekly is a distinct edition, Archive/Search/reference surfaces are compact, and completion is meaningful rather than gamified.

The public reader uses one light theme; print remains black on white. Avoid terminal cosplay, neon, scanlines, parallax, glow, startup gradients, glass, fake interfaces, robots/brains/circuits, excessive pills, fake charts or metrics, mascots, testimonials, and infinite-feed styling. Do not use generated imagery as filler or replace authentic UI with generated UI.

Copy is concise, calm, direct, evidence-aware, and honest about uncertainty. Avoid startup hype and generic “AI-powered” language.

## Media boundary

BoardlessAI owns illustration selection, provenance and licensing. Every new
`edition-package/1` article carries a hero and a thumbnail under
`public/images/editions/<slug>/`, in WebP, PNG or SVG, with attribution;
DNESKAi rehosts and serves them locally. The deterministic SVG plate is a
legitimate delivered state, not a failure — a day whose licensed search found
no usable photo still ships. Historical and legacy issues may have no image at
all, so the reader keeps its complete text-first fallback. Do not add provider
credentials, generation adapters, Topic-cover production or social-media assets
to this repository.

## Responsive, accessibility, localization, and states

Validate 360, 430, 768, 1024, 1280–1440, and 1600px where layout changes; include 320px reflow when relevant. Test long Czech copy, which sets the wrapping worst case. No horizontal page overflow; wide tables may use an accessible scroll region.

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
`--status-*`, `--focus-ring`) in new rules. The light palette's metadata floor is
`#5f6672`, which holds 5.02:1 on its worst surface; do not introduce dimmer
text. Controls whose border carries the affordance use `--border-control`
(`#8e8e88`), because the grouping hairlines cannot reach 3:1 on paper without
becoming noise. Re-measure text and status contrast
before changing gray or status colors, and mirror palette changes in
`lib/og-theme.ts` because `next/og` cannot read CSS variables.

## Project AI workflows

Skills (their slugs keep the `caught-up-` prefix, which is the stable venture id):

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
