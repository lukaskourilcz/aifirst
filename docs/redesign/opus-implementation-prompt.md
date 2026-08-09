# Prompt for Claude Opus (Claude Code) — DNESKAi redesign implementation

Run this in Claude Code with **both repositories** available:
`lukaskourilcz/aifirst` (the DNESKAi reader) and `lukaskourilcz/quorum` (the
BoardlessAI engine). Copy everything below the line as the prompt.

---

You are implementing the DNESKAi launch redesign end to end, across two
repositories. Before touching anything, read in full: `CLAUDE.md` in **both**
repos, `docs/redesign/README.md` (the brief), `docs/redesign/design-spec.md`
(the Claude Design output — token values and layout/component specs), and the
newest `state/decisions/*.md` in quorum. `design-spec.md` is committed and
**authoritative**: its decision summary (light canvas, accent `#2f5ae6`), token
sheet (§2, including the new `--border-control` and `--sponsor-surface`), grid
(§3), page and component specs (§4–6), contrast table (§7.1), removal map (§9)
and build order (§10) override Appendix A, which remains only as an emergency
fallback if the spec file is ever missing.

The work has four parts. Part A rebuilds the aifirst reader as a
TechCrunch-style Czech AI magazine with left-rail navigation and six categories.
Part B extends the quorum engine: agent-assigned category tags, two new
stream fetchers, two new delivery contracts, and a DNESKAi engine tab (manual
Events entry) in the existing admin. Part C is a single owner-gated brand step.
Part D is the final cleanup sweep of both repositories. The work is tracked as
GitHub issues (one per numbered section below) — follow **Working method** next;
every completed issue must leave both repos releasable (`pnpm verify` green in
aifirst, `pnpm test` green in quorum).

## Working method — issues, branches, merges

- Work the GitHub issues **one at a time**, in the order the kickoff prompt
  lists them (aifirst A1→A10, then quorum B1→B6, then C only if the owner has
  approved it in the issue, then close out). One issue = one coherent block of
  commits.
- Branches: aifirst work continues on `claude/dneskai-magazine-redesign-yw9bv1`
  (it already carries the brief and the design spec); in quorum, create the
  same branch name from `main`.
- Commit frequently — small, coherent steps with honest subjects. Reference the
  issue in commits; put `Closes #<n>` in the final commit of each issue so the
  eventual merge to main closes it automatically. Comment on an issue only when
  something genuinely blocks or changes scope.
- Push the work branches as you go. **Do not push or merge to `main` in either
  repository until every issue in BOTH repos is complete** and the full gates
  are green in both. Then merge aifirst first (the reader renders empty stream
  files gracefully), quorum second, and delete the work branches local + remote
  per both repos' conventions. Never force-push main.

## Global non-negotiables

- **Czech-only reader.** Every piece of UI copy in aifirst is Czech (use the
  string canon in Appendix C). English appears only as data: external stream
  item titles. All prompts/specs/docs may be English; the rendered site may not.
- **Static architecture is untouchable.** Reader pages never fetch, scrape, or
  call a model at runtime or build time. New sections read committed JSON under
  `data/` exactly like the widgets do. Nothing in a reader path may call
  `new Date()`, `Date.now()` or `Math.random()` — the date anchor is always the
  newest edition's `frontmatter.date`, via the arithmetic style of `lib/daily.ts`.
- **Guards stay.** Never weaken budget, patch, security, evidence, stage,
  finance, content-quality or release guards or their tests in quorum, nor the
  delivery/idempotency/CSP/bundle gates in aifirst. The 110 kB gzip page-entry
  ceiling (`scripts/check-bundle.ts`) is a hard limit.
- **No new dependencies** for UI: no Tailwind, CSS-in-JS, component/state/motion
  libraries, icon packs, or fonts. Zero border-radius, 1px hairlines, the three
  existing font families. New client components only where interaction demands
  it (the mobile nav drawer is the one expected addition).
- **Preserve compatibility**: every existing route, redirect (`/stats`,
  `/trends`→`/radar`, `/tags`→`/topics`, `/colophon`→`/about`, `/cs` middleware
  behavior, print URLs), Atom feed, JSON endpoint, OG route, and the sitemap
  contract keep working. Storage keys stay English (`dispatches`, `wire`,
  `ai-models`, `cz`/`global`); labels render Czech.
- **Honest states everywhere**: no-edition day, empty streams, no events,
  missing images, tagless articles. Never fabricate content, metrics, or
  engagement. There is no "Most Popular" — do not invent one.
- **Regular-magazine presentation.** The reader must not present itself as an
  AI-operated system, and no production instrumentation reaches readers. Remove
  from every reader route (including Radar, Témata, Archiv, O magazínu): the
  `PublicationData` strip (Datum vydání · Prověřené → citované zdroje ·
  Naměřené náklady · signál; dictionary keys around
  `lib/i18n/dictionaries.ts:544–559`), the `SignalStrength` meter and its
  `Sparkline` usage, the publication-status banner („Vydávání je částečně
  omezené" / „Vydávání je aktuální", `lib/i18n/dictionaries.ts:756–758`), the
  `Provenance` („Jak toto vydání vzniklo") and `MakingOf` blocks, and the footer
  line „statický build · bez runtime volání modelů". No run costs, model names,
  candidate counts, agent references or build vocabulary anywhere in reader
  copy. Keep the journalism trust surfaces: `SourceLedger` citations,
  corrections, sponsor labeling, completion mark. Underlying data contracts,
  board JSON, frontmatter `generation`, `/health` (noindex) and `health.json`
  stay exactly as they are — operators keep the telemetry, readers never see it.
  Prune the removed dictionary keys and delete components that end up unused.
- **Human Czech, zero slop.** Everything a reader can see must read as if a
  Czech editor wrote it. Hard rules: **no em-dash (—, U+2014) anywhere** in
  reader-facing text or new Czech strings; where a dash is genuinely needed,
  Czech convention is the en-dash (–) — spaced as a clause pause, unspaced or
  spaced per norm in ranges („28.–30. 9.", „28. 7. – 3. 8. 2026") — but prefer
  restructuring into shorter sentences. Correct Czech typography throughout:
  „lower-upper" quotation marks, non-breaking space after one-letter
  prepositions and conjunctions (k, s, v, z, o, u, a, i), Czech number/date
  spacing (10 %, 28. 9.). No AI-pattern prose in any shipped copy: no hype
  adjectives, no „v dnešní době" openers, no symmetrical triad sentences, no
  emoji, no filler transitions. Apply the vendored `stop-slop` skill to every
  string, doc line and commit body you write, in both repos. Verification is
  mechanical: grep the built reader HTML for U+2014 — zero matches.
- Commit in small coherent steps per repo convention (aifirst: incremental
  checkpoints; quorum: phase commits). Report test results truthfully.

---

# PART A — aifirst: the reader redesign

### A1. Theme and tokens

`app/globals.css` keeps one `:root` palette block (lines ~4–116 today) and all
existing custom-property **names**; replace **values** with the design-spec
token sheet (fallback: Appendix A). Update the raw palette block, semantic
roles (`--surface-*`, `--text-*`, `--border-*`, `--accent-*`, `--status-*`,
`--focus-ring`, `--selection-background`, `--surface-hover`), and the
compatibility aliases. Mirror the literals in `lib/og-theme.ts` (next/og cannot
read CSS variables) and re-verify both OG routes render. Metadata text must
hold ≥4.5:1 contrast on its surface — re-measure every text/surface pair, and
update the CLAUDE.md "metadata floor" sentence to the new value. One theme
only; print (`app/(print)/`) stays black on white. Type-scale tokens
(`--text-*`, `--leading-*`) take the design-spec values; the front page needs
display-scale hero headlines and 1.125–1.35rem bold feed-row headlines.

### A2. Shell: left rail, mobile top bar, drawer, footer

Rework `components/Sidebar.tsx`: brand lockup (unchanged `BrandLockup`),
primary nav = the six categories (Appendix C, numbered `01`–`06` via the
existing `NavLink` pattern), divider, secondary group (Radar, Témata, Týdeník,
Archiv, Lekce, O magazínu), and `SearchPalette`. That is the complete rail —
**delete the `sidebar-status` panel** (status tone, issue date, run time,
candidates → cited, run cost, signal) with no replacement anywhere in the
reader. `components/Footer.tsx` keeps its current link groups and the
brand/description column, **drops the „statický build · bez runtime volání
modelů" label**, and gains a social row: Facebook, Instagram, Threads, X as
monochrome inline SVGs (hand-drawn paths, no icon library) — linkless,
non-focusable placeholders with accessible names for now, structured (e.g. a
small config map) so real profile URLs later turn them into links without
layout change.

Below the rail-collapse breakpoint, add a mobile top bar (wordmark, menu
trigger, search trigger) and a full-screen nav drawer with the complete rail
contents. Implementation choice is yours (a small `'use client'` component with
focus containment + Escape + scroll lock, reusing `ModalOverlay` semantics, or
the native popover attribute) — 44px touch targets, focus-visible rings,
reduced-motion respected, and the bundle ceiling intact. Update
`e2e/smoke.spec.ts` assertions that pin nav location and the old accent hex.

### A3. Front page (`app/[lang]/page.tsx`)

Rebuild Dnes as the TechCrunch-style front page per the design spec, keeping
every existing data source and honesty element:

- Keep: `boardless-content-hash` meta, `StructuredData`, edition-intro eyebrow,
  `SponsorBlock`, `CorrectionsNotice`, `IssueNavigation`, `FeedActions`, and the
  completion mark „Máte přehled." at the end of the edition content. Removed
  per the presentation rule: `PublicationData`, `Provenance`, `SignalStrength`
  and the status banner — nothing on the front page shows costs, source-path
  counts or signal scores.
- Lead package: hero = today's edition (kicker „Dnešní vydání", display
  headline linking to the article, dek, meta row, hero image 21:9 via
  `resolveHeroPhoto` with the SVG-plate/text-first fallback) beside a condensed
  column built from today's `Dispatches` („Ve zkratce") and `Wire`
  („Na radaru") items.
- Below: „Poslední týden" feed — one row per edition of the last 7 publishing
  days (excluding the hero), reusing/extending `IssueRow`/`post-card` anatomy:
  accent kicker (category label when present, else date), bold headline, dek,
  mono meta (date · minutes · sources), thumbnail from
  `public/images/editions/<slug>/thumb.*` when it exists. Terminal link to
  `/tyden`.
- Right rail (desktop): ad placeholder (A6), `DailyLesson`, `DidYouKnow`,
  „Nejbližší akce" teaser (next two upcoming events via A5 loader, links to
  `/akce`; hidden when none), subscribe/feed module. On mobile these reflow per
  design spec. `DailyLesson`/`DidYouKnow` keep their date-key prop contract.
- The full article body moves off the front page: Dnes shows the lead package +
  highlights teaser linking to `/articles/[slug]` (TechCrunch model), unless
  the design spec explicitly keeps inline reading. Whichever you implement,
  `/articles/[slug]` remains the canonical reading surface and the article page
  keeps its complete spine (A4).
- Design the no-edition-day variant honestly (board record exists, no article):
  lead package states it plainly, feed and rail still render.

### A4. Article page and category chips

`app/[lang]/articles/[slug]/page.tsx` re-skins to the new tokens; the reading
structure (35em measure, `EditorialHighlights`, `SourceLedger`, corrections,
print link) is preserved, while `Provenance`, `MakingOf` and any signal display
stop rendering per the presentation rule. Add a category chip row: `categories`
from frontmatter render as links („AI modely" → `/ai-modely`) beside the
existing topic chips without conflating the two. Right rail per design spec
(ad box + related editions).

### A5. Categories, weeks, streams, events — data layer

- **Frontmatter**: extend `ArticleFrontmatter` in `lib/content.ts` with
  `categories?: string[]`; validate against the enum `["ai-models"]` in
  `lib/editorial/validation.ts` and `scripts/check-content.ts` (unknown key →
  content error; absent field → fine). Tagless/uncategorized is a normal state.
- **Week math**: new `lib/weeks.ts` — ISO week id (`2026-w32`), Prague-day
  string arithmetic in the `lib/daily.ts` style (UTC integer math, no clock),
  Czech range label („Týden 28. 7. – 3. 8. 2026"), grouping of all published
  editions by week.
- **Streams**: new `lib/streams.ts` reading `data/talked-about.json` and
  `data/podcasts.json` (contract `boardless-stream/1`, Appendix B); missing or
  empty file → empty list, never a crash. Items sorted newest-first, grouped by
  Prague date.
- **Events**: new `lib/events.ts` reading `data/events.json`
  (`boardless-events/1`, Appendix B); split upcoming/past against the newest
  edition date anchor; scopes `cz`/`global`.
- Seed `data/talked-about.json`, `data/podcasts.json`, `data/events.json` with
  valid empty envelopes so every page renders from day one. Document all three
  contracts in `data/README.md` beside the dataset contract. Add unit tests in
  the `lib/__tests__/datasets.test.ts` style: envelope shape, id/url uniqueness,
  scope enum, date formats, prune-window respected — counts asserted as
  minimums-of-zero so daily deliveries never require test edits.

### A6. Ad slot

Extend `banner-slot/1` (`config/banner.json`, `lib/banner.ts`,
`components/editorial/BannerSlot.tsx`): add slot `rail-square` (300×250) and an
optional `placeholder` boolean. `active:false, placeholder:true` renders the
reserved 300×250 box — dashed 1px hairline, mono label „Místo pro reklamu" —
so layout never shifts; `placeholder` absent/false keeps today's render-null
behavior. The existing `today-partner-belt` slot and its rules are untouched; a
real creative still requires local files under `public/images/banners/` with
explicit dimensions. No scripts, no third-party hosts, CSP unchanged. Unit-test
the placeholder rule.

### A7. New routes

All under `app/[lang]/`, server components, `force-static`, Czech metadata via
`lib/i18n` helpers, added to `app/sitemap.ts`, each with an honest empty state:

- `/tyden` — last 7 publishing days feed; terminal full-width action „Objevit
  předchozí týden" linking to the newest week page fully before the window.
- `/tyden/[week]` — `generateStaticParams` from `lib/weeks.ts` for every ISO
  week with ≥1 edition; same feed anatomy; chains backwards with the same
  action; oldest week ends with a quiet line + link to `/archive`.
- `/ai-modely` — editions where `categories` includes `ai-models`,
  newest-first, same rows.
- `/o-cem-se-mluvi` — external-link cards grouped by day: source monogram badge
  (Medium/Substack/blog), original title (`hreflang`/`lang` attribute on
  non-Czech titles), author, Czech relative date, optional summary line,
  outbound link (`rel="noopener noreferrer"`), no scraped images.
- `/podcasty` — episode rows grouped by day: show name (mono eyebrow), episode
  title, duration when known, labeled outbound platform links (YouTube /
  Spotify / Apple / RSS) — text links, no embeds.
- `/akce` — „Česko" and „Svět" as the design spec resolved (tabs-as-links or
  stacked sections with anchor nav — zero JS either way); event cards (mono
  date block, title, city/venue or „online", price, organizer, outbound link);
  upcoming ascending, past collapsed under „Proběhlé".

Update `components/Sidebar.tsx` routing, `e2e/smoke.spec.ts` (new routes
respond, no horizontal overflow, drawer works on mobile project), and
`e2e/audit.spec.ts` route list. Wide content scrolls inside its own container.

### A8. SEO, feeds, JSON

Sitemap gains the five new section routes + week pages. `app/robots.ts`
unchanged except nothing new disallowed. Atom feeds and the six JSON endpoints
keep their contracts byte-compatible (they may gain fields, never lose them).
`middleware.ts` untouched. Canonical/hreflang via existing `localeAlternates`.
Structured data on the front page stays valid with the new composition.

### A9. Documentation truth pass

Update so no doc contradicts the shipped reality: `docs/REDESIGN.md` (rewrite
as the new canonical direction), `docs/design/DESIGN_THESIS.md`,
`BRAND_SYSTEM.md`, `DESIGN_SYSTEM.md` (new tokens/components), `VISUAL_QA.md`
(re-run the matrix at 320/360/430/768/820/1024/1280/1600 and record it),
`docs/GOVERNANCE.md` (replace the stale authorized-path list — it still says
`public/illustrations/…` — with the real edition list plus the new
stream/event paths), `data/README.md` (new contracts), `CLAUDE.md` (reader
routes list, theme sentence, metadata floor, banner-slot paragraph, "four
delivery paths" sentence → the updated enumeration), `about-project.md`, and
`NEEDED.md` (tick what this work finishes; add what it newly needs). Record the
presentation repositioning explicitly: the reader shows no production
instrumentation and never self-describes as AI-operated; telemetry lives only
in `/health`, `health.json` and the BoardlessAI admin. Rewrite the reader's
About page copy accordingly — a regular magazine with a founder, not an agent
roster. Apply stop-slop to every sentence you write.

**Part A release gate**: `pnpm verify` and `pnpm e2e` fully green; bundle
report for every page ≤110 kB; screenshots of Dnes, `/tyden`, `/akce` at 390px
and 1280px reviewed against the design spec.

---

# PART B — quorum: categories, streams, events, admin

### B1. Agent-assigned categories

- `orchestrator/src/contracts/article-frontmatter.ts`: add
  `categories: z.array(z.enum(["ai-models"])).max(2).optional()` to
  `ArticleFrontmatterV2Schema`, exported as a named `ARTICLE_CATEGORIES`
  constant. Regenerate/extend `contracts/edition-package.schema.json` and the
  golden + poison fixtures under `contracts/fixtures/` per the repo's contract
  test pattern.
- `orchestrator/src/edition/write.ts`: extend `WRITE_TOOL_INPUT_SCHEMA` (~line
  63) with the optional `categories` output, and add the rule to `WRITE_SYSTEM`
  (~lines 217–220, beside the tag rules), verbatim:

  > Assign `categories: ["ai-models"]` ONLY when the edition's primary subject
  > is a specific AI model or model family: an official release or upgrade
  > announcement, a benchmark/eval/deep-dive centered on one model, an official
  > model behavior/safety report, or an analysis whose main argument is about a
  > specific model. Do NOT assign it because a model is mentioned or used in
  > the story, nor for company, funding, regulation, chips or industry stories
  > that reference models in passing. When unsure, omit the field — an
  > uncategorized article is correct more often than a miscategorized one.
  > Categories are machine keys in English; they are separate from `tags`,
  > which stay Czech.

- `orchestrator/src/edition/package.ts` `frontmatter()` passes `categories`
  through to the package. `repairToolOutput()` drops unknown category values
  rather than failing the run.
- **Do not** let categories feed `repeatedTopicFrequency`
  (`orchestrator/src/edition/production.ts` ~127) or the publication gate —
  `edition-topic-warmup.test.ts` and `edition-publication-gate.test.ts` must
  pass unmodified. Add unit tests: category emitted → lands in frontmatter;
  invalid value → dropped; absent → absent.
- While in `WRITE_SYSTEM`, add the human-Czech prose rules for article output
  (mirroring the global non-negotiable): no em-dash ever, Czech en-dash and
  quotation conventions, natural Czech idiom, no AI-pattern phrasing. Add the
  same rules to `orchestrator/prompts/hacek.md` (the Czech language editor) so
  drafting and review both enforce them. This adds editorial constraints; it
  must not weaken any existing quality gate or its tests.

### B2. Stream contracts and fetchers (no model, no spend)

- New contracts in `orchestrator/src/contracts/`: `boardless-stream.ts` and
  `boardless-events.ts` matching Appendix B, with exported JSON Schemas in
  `contracts/` and golden/poison fixtures. `boardless-dataset/1` is untouched —
  its append-only reveal semantics do not fit streams.
- New module `orchestrator/src/streams/`: a registry loader for
  `config/caught-up-streams.json` (Appendix D seed: Medium tag feeds, Substack
  publication feeds with explicit hosts, YouTube channel RSS ids, Podcast Index
  feed ids, static per-show Spotify/Apple links); fetchers built on the
  existing `orchestrator/src/sources/adapters/rss.ts` + `safeFetch` from
  `orchestrator/src/security/url.ts`; a normalizer producing
  `boardless-stream/1` items (stable id = sha1 of canonical URL, dedupe against
  the current aifirst file, per-day cap, 60-day prune); Podcast Index client
  (auth headers from `PODCASTINDEX_API_KEY`/`PODCASTINDEX_API_SECRET`) used
  only for shows without a workable RSS/YouTube surface.
- Every fetched hostname goes into `config/network-allowlist.json →
  runtimeHosts` (at minimum `medium.com`, `www.youtube.com`,
  `api.podcastindex.org`, plus each curated Substack host). Zero LLM calls in
  the whole path — this work sits outside the $25 model share; the only
  permitted paid dependency is the already-quota-guarded Apify client
  (`orchestrator/src/sources/apify.ts`, $5 free credit, $1.40 reservation), and
  it stays **off** by default behind the registry (`"apify": false`).
- CLI: `pnpm streams:fetch -- [--stream talked-about|podcasts] [--current
  <file>] [--out <file>]` mirroring `datasets:append` ergonomics; always writes
  a receipt to `state/ventures/caught-up/streams/<date>-<stream>.json`
  (schema `stream-sync/1`: counts before/after, added ids, pruned ids, source
  errors). A source that fails just yields zero items and a receipt note —
  never a thrown run.
- Add `PODCASTINDEX_API_KEY`, `PODCASTINDEX_API_SECRET` (and optional
  `YOUTUBE_API_KEY` if you use the Data API instead of channel RSS) to
  `.env.example`, and `CAUGHT_UP_STREAMS_ENABLED` as the live gate.

### B3. Events store + admin tab (the manual category)

- Store `state/ventures/caught-up/events/events.json` (`boardless-events/1`
  envelope, Appendix B) plus per-save receipts under
  `state/ventures/caught-up/events/receipts/`. New site lib
  `site/src/lib/caught-up-events-store.ts` modeled on
  `site/src/lib/fightaiq-odds-store.ts` + `admin-fixed-costs.ts`: parse +
  validate (scope enum `cz|global`, ISO dates, https URL, Czech title 1–120
  chars, description ≤280, price/organizer optional; future events editable,
  past events immutable except an explicit correction flag), atomic local write
  **and** the GitHub Contents API PUT so the deployed Vercel admin persists.
- API route `site/src/app/admin/api/caught-up/events/route.ts` with the exact
  guard stack of `admin/api/fightaiq/odds/route.ts`: `verifyAdminRequest`,
  same-origin check, body-size cap, typed errors, `persistence` in the result.
- Admin UI: add `"events"` to `config/ventures.json → ventures[caught-up].adminTabs`
  (the tab name is already legal in `site/src/lib/admin-portfolio.ts`); build
  the Akce manager panel (list grouped upcoming/past with scope filter, add/edit
  form, archive action) following the existing admin panel conventions on
  `site/src/app/admin/page.tsx`, reachable through the existing
  `dneskai → caught-up` alias. Add a compact read-only **DNESKAi engine** panel:
  last edition delivery (`state/edition/deliveries/`), last stream receipts,
  last dataset appends, upcoming event counts per scope.
- Tests: store validation (golden/poison), route guards (mirror
  `login/submit/route.test.ts` style), immutability of past events.

### B4. Delivery wiring (`.github/workflows/cycle.yml`)

Follow the existing dataset delivery job as the template (App token mint at
~L809, clone-verify-allowlist-commit at ~L834+, allowlists at ~L900–916):

- New job/step `Deliver caught-up streams`, gated by
  `CAUGHT_UP_STREAMS_ENABLED == 'true'`, running once per day after the edition
  delivery slot: run `pnpm streams:fetch` against the current files from the
  aifirst clone, copy results in, run the aifirst verify suite, enforce
  allowlist `^data/(talked-about|podcasts)\.json$`, commit as
  `stream(<date>): talked-about+podcasts [sync:<hash12>]`, push with the
  existing retry pattern. No changes → no commit, job succeeds quietly.
- New step `Deliver caught-up events`, same skeleton, source of truth
  `state/ventures/caught-up/events/events.json`, transform to the reader
  envelope, allowlist `^data/events\.json$`, commit
  `events(<date>): sync [hash12]`. Runs in the same daily slot; a no-diff day
  is a quiet success.
- The edition and dataset allowlists stay **byte-identical**. Do not add a new
  council phase, cron entry, or Vercel cron — these are jobs inside the
  existing daily cycle, spending no model budget. Extend
  `orchestrator/tests/` coverage: allowlist regexes (accept/reject fixtures),
  receipt writing, no-diff quietness; respect `ci-policy`, `security`,
  `vercel-cron`, `delivery` test expectations.

### B5. Quorum docs and state truth pass

Update quorum `CLAUDE.md` (Magazine datasets section gains the stream/event
kinds and their allowlists), `docs/NEEDED.md` (new owner items: create the
free Podcast Index key and add both secrets to Actions; confirm the curated
registries; set `CAUGHT_UP_STREAMS_ENABLED`), and `state/ROADMAP.md` per repo
convention. Do not touch `state/decisions/` (council-owned) and do not mark
INBOX items resolved — `APIFY-ACCOUNT-001` stays pending and this work must not
depend on it.

**Part B release gate**: `pnpm test` green in quorum (all 127+ suites), a dry
`pnpm streams:fetch --dry` run against fixtures, and one rehearsed events save
through the store's test harness.

---

# PART C — owner-gated: brand unification

Only if the operator explicitly answers **yes** when you ask (if running
unattended: skip, and record the open decision in `NEEDED.md`): flip
`brand.name` from "Caught Up" to "DNESKAi" in `lib/brand.ts`, then chase every
machine-facing consumer — page titles, `openGraph.siteName`, JSON-LD,
`app/api/*.json` `publication` fields, feed titles, OG covers, newsletter
subject — plus `lib/__tests__/brand.test.ts` (which currently pins the split)
and the CLAUDE.md paragraph that declares the split deliberate. `legalName`,
repo/package/venture ids, skill slugs and env names stay `aifirst`/`caught-up`.
This renames every indexed title and social card at once; pre-launch is the
cheapest moment. Keep it as its own commit so it can be reverted alone.

---

# PART D — final cleanup sweep (both repositories)

Runs last, after every feature issue and before the merges to main. The goal:
both repositories contain only relevant, current documents — no stale task
lists, no superseded plans, no orphaned files.

**aifirst.** Audit every Markdown and doc file. Deletion candidates to verify
(grep for inbound references first; if something links to a file, update the
reference or keep the file with a one-line supersession note):
`docs/CAUGHT_UP_IMPLEMENTATION.md`, `docs/OWNDASHBOARD_INTEGRATION.md`
(OwnDashboard integration is retired), `docs/design/PRODUCT_UX_AUDIT.md` and
`docs/design/REFERENCE_RESEARCH.md` (both historical and superseded by the new
system docs from A9). Prune `NEEDED.md`: drop completed "Already complete"
narration that no longer earns its place and any ticked item older than the
redesign; keep the file and its marker format. Remove orphaned assets or
scratch files the redesign itself left behind. **Never delete**: `CLAUDE.md`,
`about-project.md`, `scaling.md`, `monetization.md`, `NEEDED.md`,
`data/README.md`, `LICENSE`, anything under `.claude/` (vendored skills carry
`UPSTREAM.md` pinning), `contracts/`, or content/delivery files.

**quorum.** Same audit, tighter guardrails: prune stale completed items from
`docs/NEEDED.md`, remove superseded loose docs, and sweep redesign leftovers —
but **never touch** `state/**` (decisions, INBOX, EVIDENCE, ledgers are
council/owner-owned), `orchestrator/prompts/`, `contracts/`, `config/`,
vendored skills, or any guard test.

Rule for both: when unsure whether a file is dead, keep it and list it in the
final report under "kept but suspicious" instead of deleting. The sweep is
about documents and orphans, not a code refactor — do not rename or restructure
code in this part.

---

# Acceptance checklist (verify each, literally)

1. A newly delivered edition appears on Dnes as the lead, in `/tyden`, and — if
   its `categories` includes `ai-models` — on `/ai-modely` with the chip.
2. The next day it leaves the lead position but stays in `/tyden`; after 7
   publishing days it survives only in archive/topics/categories. No stored
   state drives this — only date arithmetic against the newest edition.
3. An article without categories renders everywhere without any chip. Nothing
   auto-tags on keyword matches anywhere in either repo.
4. `/tyden` ends with „Objevit předchozí týden"; week pages chain to the oldest
   week; every published edition is reachable through the chain; all pages
   static.
5. `/o-cem-se-mluvi` and `/podcasty` render committed JSON only, group by day,
   handle empty files, and link out with correct rel attributes. English titles
   carry a `lang` attribute.
6. `/akce` shows Česko/Svět, upcoming ascending, past collapsed; the front-page
   teaser shows the next two and hides when none.
7. The right rail shows the 300×250 dashed „Místo pro reklamu" box; layout is
   identical with and without a future creative; the old belt slot behavior is
   unchanged; no ad scripts, CSP headers byte-identical.
8. Left rail on desktop; top bar + drawer on mobile; no top ad banner anywhere;
   keyboard and focus behavior verified; 320px reflows without horizontal
   overflow.
9. Reader UI is 100% Czech (grep new components for English literals); print
   still black on white; OG images reflect the new theme.
10. All legacy routes/redirects/feeds/JSON respond as before (e2e proves it).
11. Writer emits `categories` only under the strict rule (unit-tested); tags
    remain Czech; topic-frequency gate outputs unchanged on fixture editions.
12. Stream fetchers run with zero model calls, respect the network allowlist,
    dedupe/prune correctly, write receipts, and deliver only through the new
    allowlist lines; edition + dataset allowlists byte-identical to before.
13. Admin: owner can add/edit a future event and see it in
    `state/ventures/caught-up/events/events.json` with a receipt; past events
    reject edits; unauthenticated and cross-origin requests are refused.
14. `pnpm verify` + `pnpm e2e` green in aifirst; `pnpm test` green in quorum;
    every aifirst page ≤110 kB gzip page-entry.
15. Docs match reality (A9/B5), including the corrected `docs/GOVERNANCE.md`
    path list.
16. No reader route renders „Údaje o vydání", „Prověřené → citované zdroje",
    „Naměřené náklady", „signál", „Vydávání je částečně omezené", „Vydávání je
    aktuální", „Jak toto vydání vzniklo" or „statický build" — verify by
    grepping the built HTML output, and confirm `/health` + `health.json` still
    carry the operator data.
17. The left rail contains exactly: lockup, six primary sections, the secondary
    section group, search. The footer shows the existing link groups plus four
    linkless social icons (Facebook, Instagram, Threads, X) with accessible
    names, ready to accept URLs via config.
18. Reader-facing copy contains no AI-operations vocabulary (models, agents,
    runs, builds, costs); the About page reads as a founder-run magazine.
19. The Part D sweep ran in both repos: superseded docs are gone or carry a
    supersession note, stale completed task-list content is pruned, `state/**`
    and vendored skills are untouched, and the final report lists every
    deletion plus anything kept-but-suspicious.
20. Every redesign issue is closed by the merges, main is green in both repos
    (aifirst merged first), and the work branches are deleted local + remote.
21. The built reader HTML contains zero U+2014 em-dashes; new Czech strings
    follow Czech typographic convention (quotes, en-dash, non-breaking spaces);
    a read-through of all new UI copy finds no AI-tell phrasing, per the
    `stop-slop` skill.

---

# Appendix A — fallback token baseline (light newsroom)

Use only if `design-spec.md` is absent; structured for drop-in replacement.
Canvas `--surface-page: #ffffff`; reading `--surface-reading: #f7f8fa`; subtle
`--surface-subtle: #f1f2f5`; emphasis `--surface-emphasis: #eef2fb`; hover
`--surface-hover: #f4f5f8`. Ink `--text-primary: #0b0c0f`; secondary
`--text-secondary: #363c45`; tertiary (metadata floor) `--text-tertiary:
#5a626e`. Borders `--border-subtle: #e4e6ea`, `--border-strong: #c9cdd4`.
Accent `--accent-primary: #1f56e0`, hover `--accent-primary-hover: #1743b3`
(both ≥4.5:1 on white). Status: complete `#0e7a4f`, warning `#9a6a00`,
correction `#c2333a`. Focus ring `#1f56e0`; selection `rgba(31,86,224,0.16)`.
Type scale and spacing tokens keep current values except hero display
`clamp(2.4rem, 5vw, 3.6rem)`. OG literals mirror these.

# Appendix B — data contracts

`boardless-stream/1` (aifirst `data/talked-about.json`, `data/podcasts.json`):

```json
{ "schemaVersion": "boardless-stream/1", "stream": "talked-about",
  "updated": "2026-08-09", "windowDays": 60, "items": [ {
    "id": "sha1-of-canonical-url", "title": "Original title", "url": "https://…",
    "source": { "kind": "medium|substack|blog|youtube|rss", "name": "Interconnects",
                "feed": "https://…" },
    "author": "Name or null", "published": "2026-08-08",
    "summary": "one line or null", "weight": 1 } ] }
```

Podcast items additionally allow `"show"`, `"durationSec"`, and
`"links": { "youtube"?, "spotify"?, "apple"?, "rss"? }`.

`boardless-events/1` (aifirst `data/events.json`; quorum state file is the
same envelope plus receipt siblings):

```json
{ "schemaVersion": "boardless-events/1", "updated": "2026-08-09", "events": [ {
    "id": "ai-days-praha-2026", "scope": "cz", "title": "Czech title",
    "description": "1–2 Czech sentences", "starts": "2026-09-12",
    "ends": null, "city": "Praha", "venue": null, "online": false,
    "url": "https://…", "price": "od 990 Kč", "organizer": null,
    "added": "2026-08-09" } ] }
```

# Appendix C — Czech string canon

Nav: **Dnes** `/` · **Poslední týden** `/tyden` · **O čem se mluví**
`/o-cem-se-mluvi` · **AI modely** `/ai-modely` · **Podcasty** `/podcasty` ·
**Akce** `/akce`. Secondary: Radar, Témata, Týdeník, Archiv, Lekce, Hledání.
Trust: O magazínu, Zdroje, Korekce, Glosář, Puls. Actions: „Objevit předchozí
týden", „Zpět na dnešek", „Všechny akce". Events: „Česko" / „Svět" (storage
`cz`/`global`), „Proběhlé", „online", „zdarma". Ad: „Místo pro reklamu".
Kickers: „Dnešní vydání", „Ve zkratce", „Na radaru", „Denní lekce",
„Víte, že…", „Nejbližší akce", „Sledujte nás" (social row).
Empty states: „Dnes zatím nic nového." (streams),
„Žádné nadcházející akce." (events), „Tato kategorie se teprve plní." (AI
modely). Completion: „Máte přehled." Week label: „Týden 28. 7. – 3. 8. 2026".

# Appendix D — curated source registry seed (`config/caught-up-streams.json`)

Owner-editable; every entry carries its exact hostname for the network
allowlist. Talked-about: Medium tags `artificial-intelligence`,
`machine-learning`, `llm` (`medium.com`); Substacks: Import AI
(`importai.substack.com`), One Useful Thing (`www.oneusefulthing.org`),
The Algorithmic Bridge (`www.thealgorithmicbridge.com`), Interconnects
(`www.interconnects.ai`), ChinAI (`chinai.substack.com`), AI Supremacy
(`www.ai-supremacy.com`), Latent Space (`www.latent.space`), Don't Worry About
the Vase (`thezvi.substack.com`), SemiAnalysis (`semianalysis.com`). Podcasts
(YouTube channel RSS + static platform links): Lex Fridman, Dwarkesh Podcast,
No Priors, Latent Space, Practical AI, Machine Learning Street Talk,
The Cognitive Revolution, Hard Fork; plus empty slots for Czech AI shows the
owner fills. Resolve each channel id at implementation time; a feed that fails
resolution ships disabled with a note, never a guess.
