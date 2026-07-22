---
name: caught-up-editorial-ui
description: Implement and refine Caught Up reader-facing editorial routes and shared components. Use for Today, articles, Radar, Topics, Weekly, Archive, Search, trust surfaces, print, responsive layouts, content states, or changes under app/, components/, and app/globals.css.
---

# Caught Up editorial UI

Read `CLAUDE.md`, `docs/design/DESIGN_THESIS.md`, `docs/design/DESIGN_SYSTEM.md`, and the route being changed.

## Workflow

1. Inspect the route, its loader, localization dictionary, tests, and shared components.
2. Search before creating. Extend `PageShell`, `IssueRow`, `IssueMasthead`, editorial components, source/provenance/corrections blocks, `FeedActions`, `ModalOverlay`, navigation, and existing helpers where possible.
3. Preserve the content model, compatibility routes, Atom/JSON contracts, metadata, static generation, and legacy MDX branches.
4. Keep server components by default. Place client boundaries only around real interaction such as search, progress, or copy feedback.
5. Use semantic tokens/classes. Move duplicated route-level styles into the existing CSS system without mechanical churn.
6. Implement real empty, long, fallback, no-image, correction, sponsorship, and unavailable-metadata states. Never fabricate content.

## Route character

- **Today/articles:** finite reading arc, strong lead, evidence after orientation, and an earned completion state.
- **Radar:** real static signals with textual equivalents; no KPI dashboard or fake chart.
- **Topics:** curated recognition and chronology; optional media must disappear cleanly when absent.
- **Weekly:** a distinct code-rendered edition cover and digest hierarchy.
- **Archive/search/reference:** compact, fast, scannable, and not image-card grids.
- **Trust/operator-adjacent:** clear, restrained, noindex/gating preserved.

## Responsive and accessible behavior

Validate 360, 430, 768, 1024, 1440, and 1600px where layout changes. Keep one clear `h1`, landmarks, visible focus, 44px mobile targets, keyboard order, Czech wrapping, 320px reflow, reduced motion, and accessible table scroll. Do not hide important content to solve overflow.

## Performance and validation

Keep the static reader path and the 110 kB gzip page-entry ceiling. Add no component, chart, state, or motion libraries. Run targeted unit/content tests, lint/typecheck, build/bundle when shared UI changes, and Playwright for responsive or interactive changes. Inspect the actual route before reporting completion.
