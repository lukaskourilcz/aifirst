---
description: Run Caught Up responsive, accessibility, interaction, and visual QA; implement feasible fixes and verify them.
argument-hint: [route-or-scope]
---

Use the accessibility/visual-QA skill for `$ARGUMENTS` or the representative route matrix.

1. Inspect Git and build/start the real application.
2. Review desktop, tablet, and mobile, including Czech, legacy/no-image/empty/long states, print, trust surfaces, and safe operator boundaries.
3. Exercise keyboard order, skip link, search dialog, Escape/focus restoration, touch targets, tables, reduced motion, media crops, and language switching.
4. Inspect console/hydration errors, overflow, dead space, density, hierarchy, borders/radii, and print breaks.
5. Implement concrete source fixes and focused semantic/behavioral tests.
6. Run targeted Playwright, then `pnpm e2e` for broad changes.
7. Update `docs/design/VISUAL_QA.md`; keep temporary screenshots/traces uncommitted.
8. Commit a coherent validated QA milestone when authorized.

Do not merely print a checklist or claim a viewport/browser was reviewed without evidence.
