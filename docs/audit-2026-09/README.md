# Handoff: DNESKAi pre-launch audit — implementation package

Repo: `lukaskourilcz/aifirst` (Next.js 15 App Router, React 19, static). Live: caughtup-ai.vercel.app.
Audit date: 2026-09-27. Report language English; every reader-facing string in the fixes is Czech.

## What this bundle is
- `CLAUDE_CODE_PROMPT.md` — the prompt to give Claude Code. Self-sufficient, ordered P0 → P1 → P2, with file paths, exact current strings and exact replacements.
- `report/` — the audit itself as HTML pages (`Audit Index.dc.html` is the entry point; open in a browser from disk, `support.js` and `public/` must stay beside them). Each section page shows the current UI recreated from source next to the findings, and three before/after mockups (Home on a weekend, article masthead + source ledger, navigation rail + footer).
- `AUDIT_FACTS.md` — verified facts about the current site the findings rely on (tokens, copy, live values on 27. 9. 2026).

The `report/` HTML files are **design references**, not code to ship. The task is to change the existing Next.js components, dictionary and config so the site matches the proposals; nothing in the report introduces a new component or page.

## Fidelity
High-fidelity for the three mockups (they reuse the product's own tokens, fonts and component anatomy) — recreate them with the existing classes in `app/globals.css`. Everything else is a delete/translate/hide instruction.

## Scope, in one paragraph
Cut and tighten; no new features. Weekends stop showing "Dnes nevyšlo vydání."; every English or machine-id string that reaches a reader is translated through one label map or hidden; the archive stops printing pipeline failure reasons; the About page says a language model writes the editions without human review; dormant or empty sections (Týdeník, Radar, Akce, AI modely) leave the navigation but keep their routes; rail modules that are not today's edition (Víte že, Odebírat, partner belt) go; the completion poster becomes one line; FeedActions, ReadingProgress, AIPulse and the social placeholders are deleted; ten kicker classes become two tokens and six chip variants become one class.

## Where to place this in the repo
Suggested: `docs/audit-2026-09/` (this folder as is). `CLAUDE_CODE_PROMPT.md` is the only file Claude Code needs to read first; it references the others.

## Design tokens (unchanged — keep as reference)
Colours: page #f7f7f5 · reading #ffffff · subtle #efefec · emphasis #eaf0ff · text #14161a / #3c4149 / #5f6672 · border #e2e2de / #c9c9c3 / control #8e8e88 · accent #2f5ae6 (hover #1d43bb) · complete #067a52 · warning #8a5a0d · correction #c0272c.
Type: Space Grotesk (display/UI), Source Serif 4 (deks, prose), IBM Plex Mono (dates, indices, meta). Scale: caption .6875rem · body-sm .9 · body 1 · lead · row · subheading · heading · display (fluid clamps in `:root`). Reading measure 35em. Radius 0 everywhere. Space scale --space-1…9 (.25rem → 6rem).
New tokens introduced by the prompt: `--kicker` and `--kicker-accent` (0.6875rem / letter-spacing .16em / uppercase / mono; tertiary vs accent), one `.chip` with tone modifiers.

## Files in `report/`
Audit Index · 01 Homepage · 02 Issue · 03 Weekly · 04 Radar · 05 Topics · 06 Archive Search · 07 Lessons · 08 Trust Pages · 09 Chrome · 10 Design System · 11 Action List; helpers Finding, CopyRow, Audit Nav, Product Sidebar, Product Footer; `support.js`; `public/brand/DNESKAi-logo.svg`, `public/images/banners/*.svg` (copied from the repo for the recreations).
