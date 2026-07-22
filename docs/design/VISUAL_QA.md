# Caught Up visual QA

Last reviewed: 2026-07-22

This is the evidence record for the implemented Caught Up interface. It is not a screenshot baseline. Temporary captures, traces, and Playwright output remain ignored and are not production assets.

## Review matrix

The production build was reviewed in Chromium at 360, 430, 768, 1024, 1440, and 1600 CSS pixels. The automated audit additionally probes desktop (1280 × 800), tablet (820 × 1180), and mobile (390 × 844).

Routes reviewed directly or through the route audit:

- Today in English and Czech
- a recent legacy issue, an older legacy issue, and print
- Radar, Topics, a Topic detail, Weekly, Archive, and Search
- About, Sources, Glossary, Corrections, and Health
- the no-image Today state and the no-topic-media state

The repository currently contains legacy MDX only. Schema-v2 parsing, validation, and component branches are covered by unit/content tests, but no fabricated schema-v2 issue was added solely for a screenshot.

## Findings and fixes

- The shell changes from a fixed editorial rail to a compact top navigation below 900px. Primary destinations remain visible; none are hidden behind a decorative interaction.
- No horizontal document overflow was found at the reviewed widths. Wide evidence tables retain an explicit scroll region rather than dropping columns.
- English and Czech Today and Weekly views wrap without clipping. The brand remains untranslated.
- Search moves focus to the query input, contains keyboard focus, closes with Escape, restores the trigger, and announces result counts.
- The skip link moves focus to `#main-content`. Current navigation, dialog, details disclosures, and copy feedback retain semantic names and keyboard operation.
- Reduced-motion mode disables entrance animations. The interface does not use parallax, auto-playing media, motion frameworks, or continuous decorative loops.
- The current Today issue has no hero image and renders the intentional `hero--no-photo` treatment. Topic covers are optional and render no empty media shell when no local asset exists.
- Weekly uses a deterministic, code-rendered edition cover. Print uses the real publication lockup, editorial highlights, sources, and corrections.
- Browser console inspection found no errors or hydration warnings on the representative production routes.
- The Playwright audit writes a single serial findings report and no longer multiplies the viewport audit across device projects. The latest audit produced an empty findings list.

## Automated coverage

`e2e/smoke.spec.ts` verifies route status, a single visible page heading, overflow, navigation, compatibility redirects, legacy print routing, language switching, source semantics, topic composition, feeds, search focus behavior, touch targets, reduced motion, deterministic no-media states, noindex/operator boundaries, public JSON contracts, CSP, and frame denial.

`e2e/audit.spec.ts` records shell fill, overflow, and heading anomalies for the representative route matrix at three widths. Audit output is temporary and must not be committed.

## Manual review protocol

For future visual changes:

1. Build and serve the production app locally.
2. Review Today, one issue, Radar, Topics, Weekly, Archive, Search, About, trust surfaces, and print at the matrix above.
3. Include Czech and the longest available content; do not invent content to fill an empty state.
4. Exercise search, skip navigation, details disclosures, language switching, and reduced motion with the keyboard.
5. Inspect console output, horizontal overflow, table scrolling, image intrinsic sizing, and focus visibility.
6. Run `pnpm e2e`; retain screenshots only when the repository intentionally establishes a visual baseline.

## Deferred media review

Higgsfield media was not generated or substituted in this implementation. When the actual MCP is available, every selected asset must be reviewed in the real route at all relevant crops, checked for text or logo artifacts, optimized locally, given correct alternative-text treatment, and recorded in `HIGGSFIELD_ASSET_MANIFEST.md`.
