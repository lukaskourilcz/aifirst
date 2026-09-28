# Prompt for Claude Design: DNESKAi review, round 2

Paste everything below the line into Claude Design. Attach the `screens/` folder and `SITE_FACTS.md` from `docs/design-review-r2/`, or point it at the repository `lukaskourilcz/aifirst` and the live site https://dneskai.vercel.app.

---

You are reviewing and redesigning **DNESKAi**, a Czech daily publication about AI (Next.js, static, live at https://dneskai.vercel.app, repository `lukaskourilcz/aifirst`). This is round 2. In round 1 you produced a pre-launch audit (`docs/audit-2026-09/`), and it has been implemented and shipped; `docs/audit-2026-09/IMPLEMENTATION_NOTES.md` says what was done and what was skipped. Read `SITE_FACTS.md` first. It holds the current structure, content inventory, cadence and hard constraints. The screenshots in `screens/` show the live site today at 1440 px and 390 px.

Round 1 was cutting and tightening. Round 2 is different: the owner wants the site to **look like a serious, professional news magazine that publishes original articles every day**, and is ready to change layout and navigation to get there. Be decisive. For every question below, give one recommended answer with a short rationale. Show at most two options, and only where the choice depends on something the owner must decide.

## What the owner asked for

1. **A second review pass of the shipped site.** Using the screenshots and the live site, list what still reads as unfinished, amateur, generic or „AI-generated site“. Look at hierarchy, rhythm, density, typography, headlines, the rail, the footer, empty space and repeated patterns. Rank the findings the way you did in round 1 (P0/P1/P2).
2. **A more serious and professional look.** Propose a visual direction that reads like an established publication (think of the register of a quality news site or business daily, not a startup landing page or a developer tool). You may evolve the type scale, the use of the three typefaces, the palette and the grid. The logo and the name DNESKAi are fixed. Say what you keep from the current system and what you change, and why each change makes it read as more serious. Everything must still pass WCAG AA with the rules in `SITE_FACTS.md`.
3. **Navigation and overall layout are boring; redesign them.** The persistent left sidebar with a numbered list is the main complaint. Propose the navigation pattern for desktop and mobile (for example a masthead with a section bar, a sticky condensed header, a mobile section strip or drawer; your call) and the page grid that goes with it. Show how the masthead, date and section navigation work together.
4. **More pictures.** The page should feel like a magazine full of reporting, not a text list. Design image-led layouts for the front page, section pages, the article page and the archive. Mind the constraint: every image is a real, licensed, locally hosted photo delivered upstream, one per article today, and Briefs have none. So:
   - Specify every image slot: where it is, its aspect ratio, minimum pixel size, and what is shown when an article only has a drawn SVG plate or no image at all (honest fallbacks, never generated filler, never fake stock).
   - State the upstream image requirement the design implies. For example: „each article: 1 hero 3:2 at ≥ 1600 px wide + 1 square thumbnail; each Brief: optional 4:3 photo“. Also state how the layout degrades if upstream cannot supply that.
5. **Publishing 1–3 articles a day.** The site will move from one lead article a day to one, two or sometimes three full articles a day, still with weekends off. Design for all three cases and for a Saturday:
   - Front page with 1, with 2 and with 3 articles today. Show what leads, how the others sit, how today stays distinct from earlier days, and where Briefs and the Watchlist go.
   - How the article page links to the day's other articles.
   - How „Poslední týden“ and the Archive group days that hold several articles.
   - The data each article must carry for your layout: for example publish time, section, lead/priority, image set, reading time. `SITE_FACTS.md` explains why this is a delivery contract change. List the fields precisely so they can be specified upstream.
   - Whether the edition as a whole (the „Máte přehled.“ completion idea) still makes sense with several articles a day, or should become a daily digest block, and what replaces it.
6. **Review the categories in the navigation.** They seem off. The owner wants only sections a reader actually wants to open. Using the topic and tag data in `SITE_FACTS.md`, and what Czech readers interested in AI look for, propose the section list:
   - which sections go in the main navigation (name, one-line scope, which existing tags map in), and how many (keep it short)
   - what happens to Témata, Poslední týden, Archiv, Slovník, Zdroje, Opravy, O magazínu and the hidden pages (O čem se mluví, Podcasty, Akce, AI modely): promote, move to the footer or a „více“ menu, merge, or drop
   - the rule that assigns every article to exactly one section, so upstream can set it
   - whether a section with few articles should be hidden until it has enough, and the threshold

## Constraints you must respect

Everything in `SITE_FACTS.md` under „Hard constraints“. In addition:
- Czech is the only reader language; write every visible string in Czech with Czech typography („…“, a non-breaking space after one-letter prepositions, an en dash, dates as `25. 9. 2026`).
- It is implemented with the existing stack: server components, one CSS file on custom properties, no Tailwind, no UI, motion or carousel library, no client-side state beyond small interactions. No autoplaying carousels, parallax, glass, gradients as decoration, neon, robots/brains/circuit imagery, fake charts, or „trending“ counters.
- Keep provenance: the source ledger, corrections, sponsor labels, and the sentence that a language model wrote the text without human review. You may redesign how they look; you may not hide them.
- Keep performance: images lazy-loaded below the fold, explicit dimensions, and no layout shift.

## Deliverables (same package shape as round 1)

Produce a folder `design_handoff_dneskai_r2/` containing:
- `README.md`: what the package is and how to read it.
- `report/`: HTML pages as in round 1, with an index. There must be **before/after mockups** at 1440 px and 390 px for:
  1. the front page with 1, 2 and 3 articles today, and on a Saturday
  2. the navigation: desktop header/section bar, sticky state, mobile
  3. a section page, for example „Modely“
  4. the article page, including the provenance line, sources and „more from today“
  5. Poslední týden and the Archive with multi-article days
  6. the design system changes: type scale, colour, grid, image ratios, card and row anatomy
- `DECISIONS.md`: the recommended section list and mapping, and the answers to questions 5 and 6 above, one paragraph each.
- `UPSTREAM_REQUIREMENTS.md`: exactly what BoardlessAI must deliver for this design (article identity, fields, section values, image slots and sizes). Keep it separate, because it is a contract change owned by another repository.
- `CLAUDE_CODE_PROMPT.md`: an ordered, self-sufficient implementation prompt for Claude Code in this repository, in P0/P1/P2 order with file paths, like round 1. Split it into what can be built now on the current one-article-per-day contract and what must wait for the upstream contract change.

Mockups must use real headlines, deks and dates from the live site, not lorem ipsum, and only images that exist on the live site (`/images/editions/…`). Where a slot needs an image that does not exist yet, draw it as an outlined placeholder labelled with its ratio and the words „dodá BoardlessAI“ so nobody mistakes it for final content.
