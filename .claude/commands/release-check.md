---
description: Execute the complete Caught Up release gate, repair feasible failures, and produce an evidence-based summary.
---

Read `.claude/skills/caught-up-release-validation/SKILL.md` and execute it.

1. Audit branch, status, staged/unstaged diff, recent commits, and pre-existing user work.
2. Run diff/stale-guidance/secret/dead-reference checks and fix feasible inconsistencies.
3. Run `pnpm verify`; fix regressions and rerun affected checks.
4. Run `pnpm e2e`; fix regressions and rerun until clean or a concrete external blocker is proven.
5. Inspect representative production routes, Czech, responsive widths, no-image/legacy states, focus, print, console, CSP, redirects, feeds, JSON, sitemap, and gating.
6. Confirm the 110 kB guard, static reader architecture, optional OwnDashboard boundary, bounded BoardlessAI delivery contract, and local media policy.
7. Reconcile documentation and Git state.
8. Commit finished in-scope work and push/open a PR only when the user or repository workflow authorizes it.

Report exact commands, counts, bundle maximum, route/build output, dependency/media/runtime-cost impact, commits, and only concrete remaining limitations.
