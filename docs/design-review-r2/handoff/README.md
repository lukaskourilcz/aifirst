# Handoff: DNESKAi design review, round 2 — implementation package

Repo: `lukaskourilcz/aifirst` (Next.js 15 App Router, static). Live: caughtup-ai.vercel.app.
Review date: 28. 9. 2026. Report language English; every reader-facing string in the mockups and prompts is Czech.

## What this bundle is

- `CLAUDE_CODE_PROMPT.md` — the prompt to give Claude Code. Ordered P0 → P1 → P2, with file paths, and split into **Part A** (buildable now on the one-article-per-day contract) and **Part B** (waits for the upstream contract change).
- `DECISIONS.md` — the recommended section list with tag mapping and the one-section rule, and one-paragraph answers to questions 5 (several articles a day) and 6 (categories), plus the owner decisions taken during the review.
- `UPSTREAM_REQUIREMENTS.md` — the contract change BoardlessAI must deliver: article identity, fields, section values, image slots and sizes, quality rules, and how the site degrades if something is missing. Kept separate because it is owned by another repository.
- `report/` — the review as HTML pages. `R2 Index.dc.html` is the entry point; open it in a browser from disk. `support.js` and `public/` must stay beside the pages. Pages 02–06 are before/after mockups at 1440 px and 390 px; page 01 is the ranked findings; page 07 the design-system changes. Pages 02–06 open in pan/zoom canvas mode because the frames are 1440 px wide.

## Fidelity

The „after“ mockups are high-fidelity and use the product's own tokens, fonts and real content (headlines, deks, Briefs, Watchlist, photos from `/images/editions/`). Days with two or three articles are simulations assembled from the real 25. 9., 13. 9. and 19. 9. editions and are labelled as such. The „before“ views are recreated from `app/`, `components/` and `app/globals.css`, with the owner's name already replaced by „tým DNESKAi“ at the owner's request.

The report HTML is a **design reference**, not code to ship. Implement by changing the existing components, dictionary, config and `globals.css`.

## Scope, in one paragraph

Replace the numbered left rail with a masthead (date · logotype · search) over a 2 px ink rule and a section bar (Dnes · Modely · Firmy a trh · Bezpečnost · Regulace · Vývoj · Více); give every article a 3:2 photo and a 1:1 thumbnail and set the lead headline on the lead photo on a flat ink band; make the day a container of one to three articles with Briefs and Watchlist as the day's fixed modules; switch secondary headlines to Source Serif 4 and restrict IBM Plex Mono to dates, times and credits; rebuild section, week and archive pages on a date-column grid; move the „language model wrote this“ statement from the article to O magazínu and replace it with a verification line, by the owner's decision.

## Files in `report/`

R2 Index · 01 Review · 02 Front Page · 03 Navigation · 04 Section Page · 05 Article · 06 Week Archive · 07 Design System; mockup components New Front Page, New Article, New Lists (section / week / archive), Masthead, Site Footer; recreations Current Home, Current Pages (article / week / archive / section), Current Sidebar, Current Footer; helpers R2 Nav, Finding; `support.js`; `public/brand/*.svg`, `public/images/editions/<slug>/hero.webp|thumb.webp` (copied from the repo), `public/images/banners/devshark-300x250.svg`, `public/screens/*.png` (the live screenshots).

## Where to place this in the repo

Suggested: `docs/design-review-r2/handoff/` (this folder as is). Claude Code needs `CLAUDE_CODE_PROMPT.md` first; it references the others.
