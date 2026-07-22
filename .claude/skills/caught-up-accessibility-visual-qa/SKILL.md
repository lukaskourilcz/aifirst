---
name: caught-up-accessibility-visual-qa
description: Audit and fix Caught Up accessibility, keyboard interaction, focus, responsive reflow, Czech wrapping, overflow, reduced motion, media crops, and route-level visual quality. Use after UI changes, before releases, for Playwright work, or when investigating usability and visual defects.
---

# Caught Up accessibility and visual QA

Read `docs/design/VISUAL_QA.md` and inspect `e2e/smoke.spec.ts` plus `e2e/audit.spec.ts`.

## Execute the audit

1. Build or start the real app; do not validate a mock page.
2. Review Today, a recent issue, an older legacy issue, print, Radar, Topics/detail, Weekly, Archive, Search, About, Sources, Glossary, Corrections, Health, Czech routes, and safely accessible operator-adjacent states.
3. Check 360, 430, 768, 1024, 1280–1440, and 1600px; include 320px reflow when a defect is suspected.
4. Inspect landmarks, heading hierarchy, language, names, current navigation, skip link, focus order/visibility, dialogs, Escape, focus restoration, live feedback, tables, corrections, sponsorship, and 44px touch targets.
5. Exercise reduced motion, empty/no-image states, long titles/URLs/translations, and fallback content without inventing fixtures that masquerade as editorial output.
6. Inspect console/hydration output, horizontal document overflow, sticky behavior, media sizing/crops, and print page breaks.
7. Implement feasible fixes in the source; do not return a recommendation-only audit.
8. Run targeted Playwright checks, then `pnpm e2e` for a release-level change.
9. Update `docs/design/VISUAL_QA.md` with evidence and unresolved external limitations. Keep temporary screenshots and traces uncommitted.

Every visual indicator must have a textual equivalent. Never sacrifice content or accessibility to make a screenshot cleaner.
