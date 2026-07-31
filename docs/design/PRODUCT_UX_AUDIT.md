# Caught Up product and UX audit

Audit date: 2026-07-22

Document type: initial implementation baseline. The findings below describe the
repository at the start of the overhaul, not its final state. Resolution status
and final validation evidence appear at the end of this document. Current
architecture is recorded in `../CAUGHT_UP_IMPLEMENTATION.md`.

## Scope and repository state

The audit covered the public route tree, shared editorial components, MDX and
localization contracts, metadata and feeds, the then-present generation pipeline, static JSON,
security headers, tests, visual assets, documentation, and `.claude`
instructions.

Initial Git state:

- Branch: `main`.
- HEAD: `9042cf7` (`Merge pull request #28 from
  lukaskourilcz/agent/caught-up-docs-and-setup`).
- Working tree: clean; no staged, unstaged, or untracked user work.
- Hooks: only Git sample hooks; no active custom hook path.
- Commit style: imperative, product-level milestones.

Baseline evidence:

- `pnpm verify`: passed after allowing `tsx` to create its local IPC socket.
- 31 Vitest files and 126 tests passed.
- 8 MDX files plus editorial/topic configuration passed content validation.
- 199 static pages built.
- Maximum page entry: 103.7 kB gzip, below the enforced 110 kB guard.
- The first full `pnpm e2e` baseline exposed a pre-existing audit-runner
  concurrency problem: parallel `networkidle` navigations against `next dev`
  timed out and the run was interrupted after recording the failure. The
  semantic smoke suite and audit runner need to be made deterministic during
  the QA phase.

## Product model confirmed by the code

Caught Up is a finite bilingual daily briefing, not a marketing page or live
dashboard. English is unprefixed; Czech uses `/cs`. Git and MDX are canonical.
The public read path is static and does not depend on a database, runtime AI,
reader authentication, or OwnDashboard.

The strongest existing product assets are:

- Today and article pages already share lead, Briefs, Watchlist, glossary,
  source ledger, corrections, provenance, related reading, issue navigation,
  feeds, and completion patterns.
- `lib/content.ts` supports legacy and schema-v2 MDX without inventing missing
  data.
- Radar, Topics, Weekly, Archive, Search, About, Sources, Glossary, Corrections,
  Health, print, and the now-retired promotion utility existed.
- Compatibility routes, locale metadata, feeds, JSON contracts, sitemap,
  structured data, and security headers are established and tested.
- The completion promise is centralized in `lib/brand.ts` and localized
  dictionaries.

## Reader-task findings

### High-frequency tasks

1. Open Today and identify the lead development.
2. Understand why it matters and what changed.
3. Read the feature, then scan Briefs and Watchlist.
4. Verify a claim through the source ledger.
5. Reach a clear end state and leave.
6. Return through Archive, Search, Topics, Radar, Weekly, or a feed.

### High-trust moments

- The distinction between editorial analysis and source evidence.
- Corrections and source classifications.
- English fallback on Czech routes.
- Human-review and measured-cost disclosures.
- Sponsor labeling.
- Sanitized publication health.

These moments already have data and components. They need stronger visual
hierarchy, progressive disclosure, and consistent status language rather than
new business logic.

## Initial experience findings

### Working well

- A calm light palette, flat surfaces, hairline borders, and restrained motion.
- A narrow persistent navigation model with six correct primary destinations.
- Semantic server-rendered content and minimal client boundaries.
- Visible skip link, focus styles, dialog focus management, reduced motion,
  table scroll regions, and print routes.
- Dense static information on Radar, Archive, Sources, and Glossary.

### Priority defects recorded at audit time

1. **The visual identity is still generic.** `app/globals.css` describes a
   “Hashnode-style” system and uses rounded cards, neutral sans headlines, and
   repetitive panel treatment. Caught Up is present in copy, but not yet in
   composition.
2. **The intended editorial type system is disconnected.** Source Serif 4 and
   Inter are loaded in `app/layout.tsx`; global CSS routes nearly all text back
   to the sans stack. The result lacks a publication voice.
3. **Desktop composition can clip.** The shell, nested container widths, and
   long lead title produced horizontal clipping in the initial 1280px visual
   review. Responsive validation must cover 320–1600px.
4. **The wordmark is fragile.** The narrow sidebar forces “Caught Up” onto two
   lines and the dot is a generic rounded square. The existing SVG icon also
   expresses a `CU` monogram rather than the confirmed completion-period idea.
5. **Too many surfaces read as cards.** Hero, recent issues, Briefs, Watchlist,
   Sources, topics, archive entries, statistics, and supporting modules often
   use similar rounded boundaries. Density and editorial priority flatten.
6. **Today’s arc is incomplete for schema-v2 issues.** Why it matters and What
   changed are reusable, but uncertainty is not surfaced as a distinct reader
   state. Completion is copy in a ruled box rather than a resolved editorial
   moment.
7. **Discovery pages share too much secondary-page scaffolding.** Weekly does
   not yet feel like a cover; Topics resemble a tag-card grid; Radar contains
   useful real data but inherits generic dashboard-adjacent blocks; Search is
   mostly a static index with the useful interaction hidden in the sidebar.
8. **Inline style debt obscures the system.** Repeated section margins,
   list resets, colors, grids, and row treatments appear across routes and
   shared components. Repeated decisions should move to semantic classes,
   while truly dynamic values can stay inline.
9. **Agent guidance conflicts with production.** The retired sci-fi skill,
   UI agent, motion guidance, illustration instructions, and scaffold command
   still mention dark-only terminals, cyan/magenta glow, scanlines, parallax,
   and an obsolete 80 kB target.
10. **The visual audit runner is non-deterministic.** It writes a shared report
    from parallel workers and waits for `networkidle` against a development
    server. This makes broad route QA slower and less reliable than the app.

## Resolution status (2026-07-22)

All ten priority defects above were addressed on
`agent/caught-up-design-overhaul`: editorial typography and the completion mark
now carry the identity; shell overflow and wordmark wrapping were corrected;
card repetition was reduced through task-specific density; uncertainty and the
completion arc are explicit; discovery routes have distinct compositions;
repeated visual decisions moved to semantic classes; obsolete sci-fi guidance
was replaced; and Playwright audit output is deterministic.

Final release validation passed with 31 Vitest files and 127 tests, 8 MDX files
plus configuration, 199 static/SSG route outputs, and a largest guarded page
entry of 103.7 kB gzip. Playwright completed with 154 passed, 2 intentional
desktop-layout skips, 0 failures, and no responsive-audit findings.

## State coverage

Existing code already handles no publication, no image, missing schema-v2
fields, empty topics, no weekly, empty corrections, stale health, sponsorship,
corrections, and English fallback. The redesign must preserve those branches
and add visual coverage for:

- uncertainty and evidence-class states;
- long source titles and URLs;
- long Czech headings and labels;
- no Briefs or Watchlist;
- no article media;
- failed media loading without changing editorial meaning;
- focused horizontal table scrolling;
- reduced-motion equivalents.

## Reuse map

Extend instead of duplicating:

- `PageShell` for route mastheads and page density variants.
- `IssueRow` for Archive, Search, Radar, Topics, and source histories.
- `EditorialHighlights` for why/changed/uncertainty treatment.
- `Dispatches` and `Wire` for Briefs and Watchlist.
- `SourceLedger`, `Provenance`, `CorrectionsNotice`, and `SponsorBlock` for
  trust states.
- `FeedActions`, `IssueNavigation`, `RelatedIssues`, and `WeeklyBadge` for
  retention and continuity.
- `ModalOverlay`, `SearchPalette`, `NavLink`, and `LanguageSwitcher` for shell
  interaction.
- `lib/content.ts`, locale helpers, feed helpers, topic configuration, Radar
  composition, and signal helpers without changing their contracts.

## Implementation priorities

1. Connect the loaded serif/sans assets to semantic typography and rebuild
   raw colors as role-based tokens.
2. Make the completion-dot mark, wordmark, shell, and issue masthead the
   recognizable identity.
3. Replace generic card repetition with editorial rules, rows, columns, and
   selective paper surfaces.
4. Give Today and article detail a finite reading arc with restrained trust
   disclosure.
5. Differentiate Radar, Topics, Weekly, Archive, Search, and trust surfaces by
   task-appropriate density.
6. Repair responsive and QA tooling before final validation.
