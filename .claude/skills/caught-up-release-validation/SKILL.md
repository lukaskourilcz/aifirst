---
name: caught-up-release-validation
description: Run and repair the complete evidence-based Caught Up release gate. Use before commits, pushes, pull requests, deployments, handoffs, or completion reports involving production code, content schemas, routes, feeds, JSON, security headers, bundle size, documentation, or Git state.
---

# Caught Up release validation

## Validate in order

1. Inspect `git status`, staged/unstaged diffs, branch, recent commits, and pre-existing work. Preserve unrelated changes.
2. Run `git diff --check` and search for debug output, stale public naming, obsolete design instructions, duplicate abstractions, dead asset references, secrets, and contradictory documentation.
3. Run `pnpm verify`. It is the authoritative lint, TypeScript, unit, content/config, production-build, and 110 kB gzip bundle gate.
4. Run `pnpm e2e`; verify redirects, locale paths, search focus, overflow, noindex/gating, feeds, public JSON, CSP, and print.
5. Inspect representative production routes and the widths in `docs/design/VISUAL_QA.md`. Include Czech, legacy/no-image content, console output, reduced motion, and focus.
6. Fix feasible failures and rerun the affected gate. Distinguish verified pre-existing failures from regressions; never report an unrun check as passed.
7. Confirm static route output, bounded local media, no runtime reader AI/database dependency, optional OwnDashboard behavior, and an unchanged BoardlessAI delivery boundary.
8. Update docs when behavior or validation evidence changed.
9. Stage only the intended milestone, create a coherent commit when authorized, and confirm final Git status. Continue after intermediate commits during an autonomous task.

Report command results, test counts, build page count, bundle maximum, media/dependency/runtime-cost impact, commits, and concrete external limitations. Never claim the historical 80 kB aspiration; enforce the measured 110 kB page-entry ceiling.
