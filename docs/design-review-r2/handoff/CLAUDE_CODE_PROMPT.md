# Claude Code prompt — DNESKAi design review r2 implementation

You are implementing the round-2 redesign of DNESKAi in this repository (`lukaskourilcz/aifirst`, Next.js 15 App Router, static, one hand-written `app/globals.css`, no Tailwind or UI library). Read first, in this order: `CLAUDE.md`, `docs/design-review-r2/handoff/README.md`, `DECISIONS.md`, `UPSTREAM_REQUIREMENTS.md`, then open `report/R2 Index.dc.html` and pages 02–07 in a browser for the target look. Every reader-facing string you write is Czech with Czech typography („…“, NBSP after one-letter prepositions, en dash, `25. 9. 2026`). Keep server components; the only new client code is the sticky-header observer. Keep the 110 kB page-entry budget. Run `pnpm verify` after each part and `pnpm e2e` at the end; check 390, 768, 1440.

Work in two parts. **Part A** ships on the current one-article-per-day contract and can go live. **Part B** needs `edition-package/2` from BoardlessAI and must wait behind it.

Commit per numbered item, message prefix `r2 <item>:`.

---

## Part A — buildable now

### P0

**A-01 Tokens and typeface roles** — `app/globals.css` `:root`, `docs/design/DESIGN_SYSTEM.md`
- Add `--border-ink: #14161a`, `--band-ink: rgba(20,22,26,.84)`, `--band-label: #9db2ff`, `--band-meta: #c9c9c3`, `--grid-gutter: 24px`, `--page-pad: 40px` (12px below 960).
- Add the scale from report page 07: `--text-lead-1: clamp(1.75rem, 1rem + 2.6vw, 3.75rem)`, `--text-lead-2: clamp(1.75rem, 1rem + 1.9vw, 2.75rem)`, `--text-title: clamp(2rem, 1.2rem + 2.2vw, 3.25rem)`, `--text-page: clamp(2.125rem, 1.4rem + 2vw, 3rem)`, `--text-h-serif-1: 1.625rem`, `--text-h-serif-2: 1.375rem`, `--text-h-serif-3: 1.125rem`, `--text-dek: clamp(1.0625rem, 1rem + .3vw, 1.25rem)`, `--text-label: .75rem`, `--text-meta: .75rem`.
- Replace the shared kicker rule (`.kicker, .label, .eyebrow, …` list) with `.label` = Space Grotesk 600 / `--text-label` / letter-spacing .08em / uppercase / `--text-primary`; `.label--muted` `--text-tertiary`; `.label--section` `--accent-primary`. Delete `--kicker-size`, `--kicker-tracking`, `.kicker--bar`, `.eyebrow::before`, `.page-kicker::before`.
- Add `.meta` = IBM Plex Mono 400 / `--text-meta` / `--text-tertiary` / no transform, no tracking. Every date, time, credit and host uses it.
- Add `.h-serif` = Source Serif 4 600 / line-height 1.22 / letter-spacing −.01em, with size modifiers `--1 --2 --3`.
- Add `.module-head` = padding-top 12px, `border-top: 2px solid var(--border-ink)`, flex between a `.label` (13px) and an optional action link (`--accent-primary`, 13px 500). Replace `.masthead` (2px `--border-strong`) with it in `SectionMasthead`.
- Remove: `--sidebar-width`, `--rail-width`, `--plate-overlap`, `.hero--overlay`, `.lead--overlay`, `.hero__figure` padding frame, `.hero-plate`, `.cover-card--overlap`. Keep `--reading` (36em).

**A-02 Masthead + section bar replaces the rail** — new `components/Masthead.tsx` (server) + `components/StickyHeader.tsx` (client, ~40 lines), `lib/rail.ts` → `lib/sections.ts`, `app/[lang]/layout.tsx`, delete `components/Sidebar.tsx`, `components/MobileNav.tsx`, `components/NavLink.tsx`, the `.shell`, `.sidebar*`, `.nav-rail*`, `.nav-item*`, `.topbar*`, `.drawer*` rules.
- `lib/sections.ts` exports `SECTIONS = [{key:"today", slug:"", label:"Dnes"}, {key:"modely", label:"Modely"}, {key:"firmy-a-trh", label:"Firmy a trh"}, {key:"bezpecnost", label:"Bezpečnost"}, {key:"regulace", label:"Regulace"}, {key:"vyvoj", label:"Vývoj"}]` and `MORE = [Poslední týden /tyden, Archiv /archive, Slovník /lekce, Zdroje /sources, Opravy /corrections, O magazínu /about]`. Until Part B, section hrefs point to `/topics/<mapped-slug>` via `SECTION_TO_TOPIC = {modely:"ai-models", "firmy-a-trh":"ai-companies", bezpecnost:"research", regulace:"ai-regulation", vyvoj:"developer-tools"}`.
- Layout: `<header class="masthead">` with a 1360px container: row 1 grid `1fr auto 1fr`, 92px: `<p class="meta">{czechWeekdayDate(anchor)}</p>` (anchor = newest edition date, never a clock), `BrandLockup` at 34px, `SearchPalette` trigger restyled as `.control` (40px, `border: 1px solid var(--border-control)`, „Hledat“ + `<kbd>⌘K</kbd>`). `border-top: 2px solid var(--border-ink)` on row 2. Row 2 `<nav aria-label="Rubriky">` 50px, items Space Grotesk 500 15px `--text-secondary`, `aria-current="page"` item 600 `--text-primary` with `border-bottom: 2px solid var(--border-ink)`; a 1px `--border-strong` divider then „Více“ as a `<details>` menu (no JS). Hairline `--border-strong` below.
- Sticky: wrap row 2 in `<div class="masthead__sticky">` with `position: sticky; top: 0`; `StickyHeader` observes the row-1 sentinel and toggles `is-condensed`, which shows the 20px logotype left, the short date and icon search right, and shrinks to 52px. `@media (prefers-reduced-motion: no-preference)` transitions only.
- Below 960: row 1 becomes the 56px bar (menu button · logotype 20px · search icon), then the 2px rule, then row 2 as a 44px `overflow-x: auto` strip with `scrollbar-width: none`; „Více“ is the last strip item and opens the drawer (`ModalOverlay`, `align="drawer"`) listing sections at 20px, „Více“ items at 16px, search, date. Delete the numbered indices everywhere.
- Footer (`components/Footer.tsx`): 2px `--border-ink` top rule, four columns (brand · Rubriky · Magazín · Odběr), links Space Grotesk 15px `--text-secondary`, headings `.label`. Brand column text = `d.footer.description` replaced by: „Každý den vybíráme to nejdůležitější a nejzajímavější ze světa technologií a AI. Každou informaci ověřujeme u důvěryhodných zdrojů.“ + `<Link href="/sources">Přehled zdrojů →</Link>`. Remove `footer.responsible` and `brand.responsiblePerson`; set `lib/brand.ts` `responsiblePerson: "tým DNESKAi"` for any remaining reader (About). Last line `.meta`: „DNESKAi · To podstatné z AI. Každý den.“
- Dictionary `lib/i18n/dictionaries.ts`: `rail.*` → `nav.sections.*`, `nav.more: "Více"`, `nav.search: "Hledat"`; delete `rail.primary/secondary` group labels.

**A-03 Front page, one-article layout** — `app/[lang]/page.tsx`, `components/editorial/LeadPackage.tsx`, `globals.css`
- Container `.page` 1360px, 12-col grid `repeat(12, minmax(0,1fr))`, gap `--grid-gutter`.
- Dateline row: `.label` 13px „Dnešní vydání · pátek 25. 9. 2026“ (Saturday/Sunday: „Poslední vydání · pátek 25. 9. 2026“) left; `.meta` right „1 článek · 4 krátce · 3 ke sledování“ (+ „ · o víkendu nevychází“ on weekends). Counts come from the frontmatter arrays. Delete `.dateline` and the „DNESKAi ·“ prefix.
- Lead: `<a>` wrapping `<img>` 3:2 rendered at `aspect-ratio: 2/1; object-fit: cover` across 12 cols (the current hero is 1600×900, so use it; Part B switches to the 3:2 file), with `<span class="lead__band">` absolutely positioned bottom/left/right, `background: var(--band-ink)`, padding 28px 32px 32px: `.label` in `--band-label` „{section} · {time}“ (until Part B: the first mapped topic label, and no time) and `<h1>` Space Grotesk 700 `--text-lead-1`, line-height 1.02, letter-spacing −.03em, white, `max-width: 20ch`, `text-wrap: balance`. `.lead__band` and `h1` must stay in normal DOM order for the outline (h1 is the page's one h1).
- Below the image: grid 7/5: dek (Source Serif `--text-dek`, `--text-secondary`, 62ch) with `.meta` „8 zdrojů · Foto: Autor / Pexels“ under it; right, behind a 1px `--border-strong` left rule, `.label` „Proč na tom záleží“ + the article's `why_it_matters` list (Source Serif 15px). **No reading time anywhere** — delete `readingMinutes` from `LeadPackage`, `FeedRow`, `IssueMasthead`, `lib/text.ts` callers, and `common.readMinutes` / `minutesShort`.
- No image at all (legacy): typographic lead — `h1` `--text-lead-1` on paper across 8 cols, dek beside it, no box, no plate.
- Mobile (< 960): the image uses `thumbnail_path` at `aspect-ratio: 1/1` with the band (headline 28px), dek and meta below.

**A-04 Briefs + Watchlist band, completion row, week block** — `LeadPackage.tsx` (`CondensedBriefs`), `DigestRow.tsx`, `page.tsx`, `globals.css`
- Grid 8/4 under a 1px `--border-strong` rule, 40px above. Left: `.module-head` „Krátce“ + serif 14px explainer „Čtyři zprávy dne, každá s odkazem na zdroj.“; two columns of `DigestRow` without index: title `.h-serif--3` 18px, body 2-line clamp, footer line `.label--muted` 11px topic + `.meta` host „· github.com ↗“. Link target = `source_url` (external), not the article. Right, behind a column rule: „Ke sledování“ + „Odkazy bez komentáře, v původním znění.“, rows Grotesk 500 15px + `.meta` „host · přes TensorFeed“; then „Pojem dne“ (`DailyLesson`) under a 2px ink module head, serif inline „**Teplota (temperature)** — …“; then `BannerSlot` under a hairline with the `.meta` label „Vlastní projekt“. Delete `RightRail` from the front page and the `.page-with-rail` grid there.
- Completion row: 2px `--border-ink` top, hairline bottom; left `.label` with the green dot „Konec dnešního vydání“ (weekend: „Konec vydání z pátku 25. 9.“); right „Máte přehled.“ Source Serif italic 17px `--text-primary`.
- Week block: `.module-head` „Poslední týden“ (weekend „Uplynulý týden“) + action „Celý týden →“; `CoverCard` becomes a row card: 240px 3:2 image left, `.label` „{section} · úterý 22. 9.“, `.h-serif--2`, 2-line dek; two per row; a drawn `.svg` or missing hero renders the `.img-fallback` box (`#efefec`, hairline, `.meta` „bez fotografie · 22. 9. 2026“) at 3:2. `WeekAction` becomes a hairline row (no `--border-control` box).
- `isDrawnPlate()` → treat as no image everywhere; never render `hero.svg`/`thumb.svg`. Also treat `illustration.origin !== "photo"` as no image.

**A-05 Article page** — `app/[lang]/articles/[slug]/page.tsx`, `IssueMasthead.tsx`, `EditorialHighlights.tsx`, `SourceLedger.tsx`, `Dispatches.tsx`, `Wire.tsx`, `RelatedIssues.tsx`, `globals.css`, dictionary
- Masthead: `.label--section` „{section} · pátek 25. 9. 2026“ (no time until Part B), `h1` `--text-title` 20ch balance, dek `--text-dek` 62ch, then the byline block: 1px `--border-strong` rule, 2-column `dl` at 14px: `<dt>Redaktor</dt><dd class="byline__blank" aria-label="neuvedeno"></dd>` (a 180px dashed hairline, intentionally empty — owner decision), `<dt>Ověření</dt><dd>` = `generation.human_reviewed ? "Ověřeno podle {n} uvedených zdrojů, zkontroloval tým DNESKAi." : "Sestaveno z {n} uvedených zdrojů."` + `<a href="#zdroje">Zdroje ↓</a>` and `<Link href="/about#redakce">Jak vydání vzniká →</Link>`. Delete `provenanceSentence` from the article, the print masthead keeps it. Remove the topic chips row (`hero__topics`) — section label replaces it.
- Figure: grid 9/3, `<img>` 3:2 (`aspect-ratio: 3/2`) + `<figcaption>` serif 14px: alt text as caption, then `.meta` credit with the author link. No padding frame.
- Highlights: three columns under one 2px ink rule and a hairline below; `.label` headings; „Co zůstává nejisté“ label in `--status-warning`; no boxes.
- Body: `.article-body` 36em, Source Serif 19/1.7 `--text-primary` (not secondary); h2 Space Grotesk 700 24px, drop the `01` counter prefix.
- Side column (4 cols, column rule): „Dále v dnešním vydání“ module (Part A: shows the previous edition as one row with 88px square + „Předchozí vydání“ label; Part B: the day's other articles), then Krátce (title `.h-serif--3` 16px), Ke sledování, `BannerSlot`. `PracticalTip` stays above Krátce when present.
- Ledger: `#zdroje` module head „Zdroje tohoto článku“ + serif explainer „N zdrojů, u každého druh: primární (původce informace) nebo sekundární (zpravodajství a analýzy).“; two-column `ol`, rows: `.meta` index, `.h-serif--3` 16px title (lang=en when English) ↗, `.meta` „Publisher · 24. 9. 2026 · primární“ with `primární` in `--status-complete`. Replace the `<table>`; keep the „přes {aggregator}“ logic. Drop a row whose URL host does not match its registry `source_id` and `console.warn` at build (see UPSTREAM_REQUIREMENTS §4).
- End: „Další z dnešního vydání“ 3-col cards (Part A: previous and next editions + „Archiv →“), replaces `IssueNavigation`'s two-cell grid; `RelatedIssues` rail variant deleted.
- Remove from the dictionary: `article.provenanceUnreviewed/Reviewed/SourcesOne/SourcesMany` (keep `provenanceLink`), `common.readMinutes`, `common.minutesShort`. Add `article.verificationReviewed`, `article.verificationUnreviewed`, `article.editor: "Redaktor"`, `article.verification: "Ověření"`, `article.moreToday: "Další z dnešního vydání"`, `article.alsoToday: "Dále v dnešním vydání"`, `article.sources: "Zdroje tohoto článku"`.

**A-06 About `#redakce` carries the statement** — `app/[lang]/about/page.tsx`, dictionary
- Section 02 „Kdo vydání píše“ keeps the sentence that a language model writes the text from the listed sources and states whether an editor reviews it before publication (driven by the newest edition's `generation.human_reviewed`), and ends with „Za výběr zdrojů, pravidla a opravy odpovídá tým DNESKAi.“ No personal name anywhere on the site; grep for the owner's name in `lib/`, `app/`, `content/` metadata and `public/` and replace with „tým DNESKAi“. Also `llms.txt` and the print view keep the statement.

### P1

**A-07 Section pages on the topic routes** — `app/[lang]/topics/[slug]/page.tsx`, `CoverCard.tsx`, `FeedRow.tsx`
- Header grid 5/7: `h1` `--text-page` + serif scope line, hairline. Then: newest article 8 cols with the band headline (`--text-lead-2`) + dek; two next articles as 120px-square rows in 4 cols behind a column rule; module rule; three 3:2 cover cards; „Starší v rubrice“ two-column compact rows with 64px squares; footer line „Všechny články rubriky v archivu → · RSS rubriky ↗“. `FeedRow` compact variant is retired in favour of `.row-compact`.
- Titles/scope from `config/topics.yml` until Part B renames them; add the five Czech section names as `title.cs` overrides now: ai-models → „Modely“, ai-companies → „Firmy a trh“, research → „Bezpečnost“, ai-regulation → „Regulace“, developer-tools → „Vývoj“; hide `ai-platforms` and `open-source` pages behind redirects to `ai-companies` and `ai-models`.
- `/topics` index → redirect to `/archive`. Delete `.topic-grid`, `.topic-card`.

**A-08 Poslední týden and Archiv** — `app/[lang]/tyden/page.tsx`, `tyden/[week]/page.tsx`, `archive/page.tsx`
- Both: header grid as A-07; day groups as grid `200px 1fr`: left `h2` `.label` weekday + date + `.meta` count („1 článek · 4 krátce“); right the day's articles. Week: first (only, in Part A) article as a 280px 3:2 row with label, `.h-serif--1` 24px, 3-line dek. Archive: filter row of `.control` chips (Vše · sections · Krátce; „Vše“ filled ink) linking to `?rubrika=` static variants or, in Part A, to the topic pages; month `.module-head`; rows: `.h-serif--3` 18px title, `.label--muted` 11px „section · 6.05“, 56px square; „bez vydání“ stays one `.meta` line in the right column. Delete `.cover-card--row`, `.archive-list` 4:3 crop.
- No right rail on these pages; `RightRail` is deleted once A-04 moved its modules.

**A-09 Cover card, row and fallback components** — `CoverCard.tsx` → `components/editorial/Card.tsx` with variants `cover` (3:2, label, `.h-serif--2`, 2-line dek), `row` (image left 240/280px), `compact` (title + label, 1:1 square right at 96/88/64/56), `band` (image with the ink band headline); one `ImageOrFallback` helper that renders the `.img-fallback` box at the requested ratio when `heroPhoto` is null, drawn or non-photo, and always writes `width`/`height` attributes. `loading="lazy"` on everything except the lead and the article figure.

**A-10 Search control** — `SearchPalette.tsx`: trigger is `.control` with the magnifier, „Hledat“ and `<kbd>⌘K</kbd>`; icon-only in the condensed header and mobile bar; the palette's empty state suggests the five sections. Keyboard help unchanged.

### P2

**A-11 Brief topics → sections** — `lib/labels.ts`: map `dispatches[].topic` slugs to the five section labels via `SECTION_TO_TOPIC` inverse + tag mapping in DECISIONS.md; unknown → no label (existing rule).
**A-12 Delete dead styles and components** — `.hero*`, `.lead__kicker`, `.condensed .digest-row__index`, `.edition-end` mono rules, `.week-action` box, `.feed-row__thumb` 4:3 sizes, `.post-card*`, `.card-grid*`, `RightRail.tsx`, `WeekAction` box variant; update `docs/design/DESIGN_SYSTEM.md` sections „Typography“, „Spacing and layout“, „Media“, „Cover cards“ to the report's page 07 and remove „The overlay plate“.
**A-13 OG theme** — `lib/og-theme.ts`: mirror `--border-ink`; the edition share cards keep typeset-only output.
**A-14 e2e** — update `e2e/` for: no `.sidebar`, masthead present with 6 section links + „Více“, `h1` inside `.lead__band` on `/`, no „min čtení“ text anywhere, no owner name anywhere, `#redakce` contains the language-model statement, ledger rows ≤ sources count, images all carry width/height.

---

## Part B — after the upstream contract change (`edition-package/2`)

Do not start before `UPSTREAM_REQUIREMENTS.md` §1–3 are delivered and `contracts/` has the v2 schema.

**B-01 Delivery and content model** — `lib/delivery/`, `lib/content.ts`, `lib/board.ts`, `contracts/`
- Accept `edition-package/2`: board record per date with `articles[]`; article files at `content/articles/<date>/<slug>.cs.mdx`; edition file `content/editions/<date>.cs.yml` with `dispatches`, `wire`, `corrections`, `sponsor`, `practical`, `glossary_terms`. Validate: exactly one `priority: 1` per edition, `section` in the enum, `published_at` ISO with offset, `hero.webp` 3:2 ≥ 1600 px and `thumb.webp` 1:1 ≥ 800 px present, `illustration.origin === "photo"`, no photo hash reused within 60 days across editions (compute and store `illustration.hash`), ledger host ↔ `source_id` match.
- `listArticles()` returns articles with `edition_date`, `section`, `priority`, `published_at`; add `listEditions()` returning `{date, articles[], dispatches, wire, …}`; `homeEditionState` anchors on the newest edition date as today.
- Migration script: move existing `content/articles/<date>.cs.mdx` into `<date>/` folders with `priority: 1`, `section` from the DECISIONS.md rule (a one-off mapping table committed with the script), `published_at: <date>T06:00:00+02:00`; lift `dispatches`/`wire` into the edition file. URLs unchanged.

**B-02 Front page with 1–3 articles** — `page.tsx`, `LeadPackage.tsx`
- Lead = `priority 1`; secondaries ordered by `published_at`. Spans: 1 → 12 (band, 2:1, dek 7 + `why_it_matters` 5); 2 → 8 (band, 3:2, `--text-lead-2` 44px) + 4 (3:2 cover, `.h-serif--1` 26px, 4-line dek) behind a column rule; 3 → 7 (band, 40px) + 5 (second: 3:2 cover + `.h-serif--1`; third: compact row with 136px square, `.h-serif--2`, 2-line dek). Labels „{section} · {time}“ from `published_at` in `Europe/Prague` as „6.05“. Counts in the dateline from the edition. Mobile: lead 1:1 band, then the other articles as 96px-square rows.
- Photo-less lead: it may only lead if it is the day's only article; otherwise the next article with a hero takes `priority 1`'s slot and the photo-less one drops to the compact slot (build warns).

**B-03 Article ↔ day** — `articles/[slug]/page.tsx`
- „Dále v dnešním vydání“ lists the edition's other articles (88px squares, label + time); „Další z dnešního vydání“ shows them as 3:2 cards plus the previous edition's lead in the third cell; prev/next navigate by edition. Time in the masthead label. `BreadcrumbList` position 2 becomes the section.

**B-04 Section routes** — `app/[lang]/[section]/page.tsx` for the five slugs, replacing `topics/[slug]`; `config/sections.yml` (id, slug, label, scope, `minArticles: 6`, `hidden` auto-computed); redirects from every `/topics/*` and `/ai-modely`; section Atom feeds at `/<section>/feed.xml`; the masthead hides a section under the threshold and the archive filter still lists it.

**B-05 Week and archive with several articles per day** — `tyden`, `archive`: the day group renders `priority 1` as the 280px row and the others as 96px-square rows; the archive filter row becomes static per-section archive pages `/archive/<section>`; counts „3 články · 4 krátce“.

**B-06 Briefs sections** — `dispatches[].section` replaces `topic`; the label is the section name; unknown → none.

**B-07 Structured data, feeds, share pack** — `NewsArticle` per article with `articleSection`; edition JSON adds `articles[]`; `/data/share/<date>.cs.json` v3 lists all articles; sitemap and news sitemap per article; `llms.txt` per edition.

**B-08 Verify** — `pnpm verify`, `pnpm e2e`; screenshot `/` with 1, 2 and 3 articles using fixture editions in `e2e/fixtures/`, and a Saturday build; confirm no image hash appears twice on `/`.
