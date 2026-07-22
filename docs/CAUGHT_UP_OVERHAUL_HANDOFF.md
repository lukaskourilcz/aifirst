# Caught Up overhaul continuation handoff

Last updated: 2026-07-22

This file is the restart point for the autonomous product-design, brand, frontend, validation, documentation, and AI-agent architecture overhaul requested in the current Codex session. Continue on branch `agent/caught-up-design-overhaul`. Do not treat this checkpoint as completion.

## Non-negotiable product direction

- The public publication name is **Caught Up**. Stable internal `aifirst` identifiers remain where compatibility requires them; do not run a blind rename.
- The design thesis is **calm editorial intelligence with a clear sense of completion**.
- Today is a finite daily edition, not a marketing landing page. Preserve the existing editorial structure, routes, feeds, JSON contracts, localization, static rendering, Git/MDX content model, pipeline, and operator boundary.
- English is unprefixed; Czech uses `/cs`. Keep the brand untranslated and validate real Czech copy and fallbacks.
- Preserve the existing approximately 110 kB gzip page-entry guard. Do not claim the historical 80 kB total target, add a component library, Tailwind, charting, motion, or runtime media dependencies.
- Higgsfield is unavailable for this session. All Higgsfield work is explicitly deferred: do not research it, connect to it, wait for it, generate substitute assets, or add fake placeholders. Prepare only deterministic layout and asset integration hooks where useful.

## Initial repository state

- Initial branch: `main` at `9042cf7`.
- Initial worktree: clean; no staged, unstaged, untracked, or overlapping user work.
- No active custom Git hook path; only sample hooks were present.
- Baseline `pnpm verify` passed when run with normal host permissions:
  - ESLint passed.
  - TypeScript passed.
  - Vitest passed: 31 files, 126 tests.
  - Content/config validation passed: 8 MDX/config inputs.
  - Next production build produced 199 static pages.
  - Bundle guard passed: 25 page entries under 110 kB gzip; largest entry was approximately 103.7 kB.
- Baseline `pnpm e2e` did not pass. The existing audit suite multiplies viewport coverage across all Playwright projects, runs shared report writes in parallel, waits for `networkidle` against the development server, and eventually caused timeouts/server parsing errors. This was observed before production route changes and must be repaired during the QA phase rather than reported as a regression.

## Completed work

### Audit, research, and design direction

The repository, routes, content model, generation pipeline, visual system, tests, documentation, and `.claude` architecture were audited. Refero and Collect UI were inspected directly for relevant publication, archive, navigation, and reading patterns. Transferable principles were documented without copying trade dress.

Created:

- `docs/design/PRODUCT_UX_AUDIT.md`
- `docs/design/DESIGN_THESIS.md`
- `docs/design/REFERENCE_RESEARCH.md`
- `docs/design/BRAND_SYSTEM.md`
- `docs/design/HIGGSFIELD_ART_DIRECTION.md`

The Higgsfield document records only the deferred opportunity/integration contract and expressly forbids substitute generation in this session.

Committed milestone:

- `2607eaa Document Caught Up design direction`

### Design foundations currently included in this checkpoint

- Added a deterministic vector completion-period mark in `public/brand/completion-mark.svg`.
- Added reusable `BrandMark` and `BrandLockup` components in `components/BrandMark.tsx`.
- Migrated Sidebar and Footer branding to the shared lockup.
- Reworked `PageShell` to semantic classes and semantic kicker tones (`primary` / `warning`) instead of stale cyan/magenta language.
- Updated the admin notice and promotion surface to use the semantic warning tone.
- Replaced the old `CU` application icon treatment with the completion mark.
- Recast the global visual foundation around warm paper, editorial serif headings, readable sans-serif interface/body copy, restrained hairlines, low radii, semantic surfaces, semantic status colors, controlled spacing, and an editorial reading rhythm.
- Added shell, wordmark, hero, editorial module, completion, archive, topic, footer, focus, selection, and responsive foundation styles while retaining compatibility aliases needed by existing components.

These changes are a foundation, not a completed route migration. Repeated inline styles and old compatibility variables still exist in routes/components and should be migrated deliberately as those surfaces are refined.

## Required continuation sequence

Continue autonomously and use coherent incremental commits. Do not stop after any item below.

1. **Finish and validate design foundations**
   - Review the pending CSS/component diff in context.
   - Add `docs/design/DESIGN_SYSTEM.md` describing only the implemented tokens, typography, spacing, surfaces, motion, focus, responsive, and print rules.
   - Redesign deterministic Open Graph composition in `lib/og-theme.ts` and both locale/article OG routes to warm paper, ink, blueprint accent, and the code-rendered completion mark. Do not add generated media.
   - Run targeted lint, typecheck, unit/content checks, and commit the foundation milestone.

2. **Global shell**
   - Refine Sidebar/mobile navigation, Footer, SearchPalette/ModalOverlay, language switching, keyboard/focus behavior, and common layouts.
   - Replace repeated route-level visual decisions with existing components/classes before creating abstractions.

3. **Today and article reading**
   - Extract a shared issue masthead only if it removes the existing home/article duplication cleanly.
   - Add the schema-v2 uncertainty section with centralized EN/CZ labels.
   - Preserve Briefs/Watchlist internal storage keys, evidence, provenance, corrections, topics, feeds, related/adjacent navigation, print, legacy issues, and no-image states.
   - Ensure a meaningful completion state exists in the full reading arc.

4. **Discovery and retention**
   - Refine Radar with only real static data and textual equivalents for indicators.
   - Make Topics curated without image-heavy cards; optional topic-media fields/hooks may be prepared but must render nothing when no asset exists.
   - Give Weekly a distinct code-rendered edition cover treatment.
   - Make Archive and Search dense, responsive, keyboard-safe, and useful.

5. **Trust and secondary surfaces**
   - Refine About, Sources, source profiles, Glossary, Corrections, Health, print, promotion, and compatibility notices.
   - The Glossary should scan alphabetically; Health stays sanitized/noindex; promotion stays token-gated/unlisted/noindex.

6. **Responsive, accessibility, and visual QA**
   - Validate 320/360, 430, 768, 1024, 1280–1440, and 1600+ widths, including Czech and long-content states.
   - Fix Playwright audit determinism: run the viewport matrix only once (not once per project), use serial report writes, avoid brittle `networkidle`, and keep semantic/behavioral assertions.
   - Review representative public/trust/operator routes, schema-v2 and legacy articles, print, keyboard/focus, reduced motion, overflow, console, CSP, feeds, JSON, sitemap, and redirects.

7. **AI-development architecture**
   - Before editing skills, read and follow the installed `skill-creator` skill.
   - Rewrite `CLAUDE.md` and add/update `AGENTS.md` if appropriate.
   - Retire `.claude/skills/sci-fi-design-system` and remove contradictory dark-only, cyberpunk, cyan/magenta, scanline, glow, parallax, terminal-first, 80 kB, and old public AIfirst instructions from agents/skills/commands.
   - Create a minimal non-overlapping Caught Up skill set for brand, editorial UI, deferred Higgsfield production, accessibility/visual QA, and release validation.
   - Add distinct editorial-product-design, brand/media, and accessibility/visual-QA agents; preserve and correct useful source/scraper/writer specialists.
   - Commands must perform real inspect/implement/validate workflows, not print checklists.

8. **Documentation and final validation**
   - Reconcile README, DOCS, stack/scaling, implementation, OwnDashboard, NEEDED, env example, and agent docs with actual implementation.
   - Add `docs/design/HIGGSFIELD_ASSET_MANIFEST.md` as a deferred manifest only—no generated claims, prompts, paths to nonexistent assets, or placeholder files.
   - Run `git diff --check`, complete diff review, stale-language searches, formatting if configured, lint, TypeScript, unit tests, content validation, build, bundle guard, fixed Playwright suite, responsive/visual/accessibility review, and final Git status.

## Deferred Higgsfield asset inventory

Record these in the eventual deferred manifest and final report; do not generate them until the actual Higgsfield MCP is available:

- Launch editorial-evidence key visual: wide desktop, landscape social, square campaign/avatar, and vertical story crops; intended for launch/About/social use, not behind core article text.
- Six coherent Topic covers: AI Models, AI Regulation, Open Source, Developer Tools, Research, and AI Companies; text-free with safe responsive crops.
- Recurring Weekly cover background/framing system; issue title/date/topics remain code-rendered.
- Static Open Graph/social background foundation; all brand/title/date/topic text remains deterministic.
- Small brand texture/crop library: paper, registration details, restrained signal line, neutral photographic fragments.
- Optional About/methodology visual, newsletter header, and restrained launch motion only if a later opportunity audit proves they improve comprehension and meet performance/accessibility constraints.

## Process notes for the next agent

- A long-running local TypeScript process was interrupted before this checkpoint because test/dev process cleanup had made commands unusually slow. Do not claim that post-foundation typecheck passed until it is rerun.
- Use `rg` first for searches and `apply_patch` for source edits.
- Preserve compatibility names and schemas unless there is a concrete migration reason.
- Do not push directly to `main`; continue on `agent/caught-up-design-overhaul` and keep commits coherent.
- The final required report must list every created commit, actual validation results, static/bundle/media/cost impact, concrete external limitations, and a dedicated **Deferred Higgsfield AI Tasks** section.
