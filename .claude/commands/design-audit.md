---
description: Audit and implement feasible Caught Up design-system corrections across the existing product.
argument-hint: [route-or-scope]
---

Perform an implementation audit for `$ARGUMENTS` or the representative publication surfaces.

1. Read `CLAUDE.md`, the Caught Up brand/editorial UI/QA skills, and design documents.
2. Inspect Git state, actual routes, shared components, CSS, localization, tests, and real content states.
3. Compare the implementation with the design system, accessibility, density, responsive, and anti-AI-slop rules.
4. Search for reusable components/tokens before creating anything.
5. Implement all safe in-scope corrections; preserve content, static routes, feeds/JSON, SEO, security, and pipeline behavior.
6. Inspect affected routes at representative widths in English and Czech.
7. Run targeted lint, TypeScript, tests, and Playwright; run `pnpm verify` for broad changes.
8. Update the authoritative design/QA document when a reusable rule changes.
9. For substantial autonomous work, make a coherent validated commit and continue until the requested scope is complete.

Report actual changes and executed checks, not a recommendation-only checklist.
