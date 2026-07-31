---
name: testing-strategy
description: Test Caught Up's pure logic, content/delivery schemas, static routes, accessibility interactions, responsive overflow, security headers, and release gates without brittle snapshot lock-in. Use when adding, reviewing, or repairing tests.
---

# Testing strategy

Use Vitest for deterministic logic, content/config and delivery tests, and
Playwright for real static route behavior. Normal tests must not call live
publishers or external paid services.

## Coverage priorities

- Pure helpers, sorting/grouping, locale resolution, signal math, validation,
  serialization and delivery authorization.
- Edition-package parsing, byte-exact materialization, path authorization, idempotent replay and same-date conflict handling with local fixtures.
- Legacy and schema-v2 MDX, bilingual linkage/fallback, optional media, evidence, provenance, corrections, sponsorship, and distribution contracts.
- Playwright semantics and behavior: one `h1`, landmarks, navigation, focus/dialog containment, redirects, locale routes, noindex/gating, feeds/JSON, CSP, print, reduced motion, touch targets, and horizontal overflow.

Keep the responsive route audit in one serial project so the shared report is deterministic. Use screenshots/traces for diagnosis; do not add broad pixel snapshots for routine editorial changes.

## Validation gates

- Run the focused test while iterating.
- Run `pnpm test` and `pnpm check:content` for content or delivery changes.
- Run `pnpm build` and `pnpm check:bundle` for route/client-boundary changes.
- Run `pnpm verify` plus `pnpm e2e` for release-level work.

Assert one behavior clearly, prefer fixtures over elaborate mocks, and never claim an unrun check passed.
