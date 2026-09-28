# Decisions — DNESKAi review, round 2 (28. 9. 2026)

One recommended answer per question. Options appear only where the owner must decide.

## Owner decisions taken during the review

These were given in chat on 28. 9. 2026 and are treated as fixed:

1. **„Archiv“ is not in the section bar.** It lives in the „Více“ menu and the footer.
2. **The owner's name appears nowhere on the site.** Footer, About `#redakce` and `brand.responsiblePerson` say **„tým DNESKAi“**.
3. **The lead headline always sits on the lead photograph**, in large bold white type on a flat ink band.
4. **Footer statement:** „Každý den vybíráme to nejdůležitější a nejzajímavější ze světa technologií a AI. Každou informaci ověřujeme u důvěryhodných zdrojů. Přehled zdrojů →“ (link to `/sources`). No sentence about a language model in the footer.
5. **Article masthead:** an empty „Redaktor“ row (no name, no avatar), then „Ověření: Ověřeno podle N uvedených zdrojů, zkontroloval tým DNESKAi.“ The sentence „Text připravil jazykový model … neprošel lidskou kontrolou“, the reading time and „článek 1 ze 3“ are removed from articles.

**What decision 5 overrides, stated plainly.** `SITE_FACTS.md` hard constraint 3 and `CLAUDE.md` („the one provenance fact it does state, plainly and once per edition, is that a language model wrote the text and whether a person reviewed it … Never hide it“) require the statement on every edition. The recommendation that keeps the site honest under the owner's decision:
- The statement moves to **O magazínu → „Kdo vydání píše“ (`#redakce`)** and stays in the print view and `llms.txt`; the article links to it from the „Ověření“ row („Jak vydání vzniká →“).
- „zkontroloval tým DNESKAi“ must be **true**. Either a review step exists upstream and `generation.human_reviewed` is `true`, or the wording must be **„Sestaveno z N uvedených zdrojů“** without the review clause. `CLAUDE_CODE_PROMPT.md` implements it as a switch on `generation.human_reviewed`: `true` → „Ověřeno podle N uvedených zdrojů, zkontroloval tým DNESKAi“; `false` → „Sestaveno z N uvedených zdrojů“. The owner can flip the flag upstream; the site never asserts a review that did not happen.
- The source ledger, corrections, sponsor labels and the photo credits stay on the article.

## Q6 · Sections in the navigation

**Recommendation: five sections plus Dnes.** Short enough for one row at 390 px, wide enough that every article since August has exactly one obvious home.

| Section | Slug | One-line scope | Existing tags that map in |
| --- | --- | --- | --- |
| **Modely** | `modely` | New models, capabilities, evaluations, open weights, what changes in practice | `ai-models`, `models`, `llm`, `gemini`, `google-gemini`, `openai` (model releases), `anthropic` (model releases), `mistral`, `open-source`, `oss`, `open-source-ai`, `umela-inteligence` (default), `ml`, `research`, `agi` |
| **Firmy a trh** | `firmy-a-trh` | Labs, funding, valuations, chips, data centres, platforms, deals | `ai-companies`, `companies`, `startups`, `datova-centra`, `amd-nvidia`, `burza`, `meta`, `microsoft`, `google-deepmind`, `platforms`, `youtube`, `creator-economy`, `monetization`, `social-media`, `advertising`, `streaming`, `socialni-site` |
| **Bezpečnost** | `bezpecnost` | Attacks, misuse, incidents, AI safety, alignment | `kyberneticka-bezpecnost`, `bezpecnost`, `bezpecnost-ai`, `bezpecnost-softwaru`, `ai-safety`, `ai-etika`, `vojenstvi` |
| **Regulace** | `regulace` | Laws, courts, policy, copyright, export control | `regulace`, `regulace-ai`, `regulation`, `policy`, `ai-policy`, `evropska-ai-politika`, `exportni-kontrola`, `autorska-prava`, `pravo-a-regulace`, `content-moderation` |
| **Vývoj** | `vyvoj` | Coding agents, developer tools, APIs, infrastructure for building | `developer-tools`, `coding`, `agents`, `ai-agenti`, `autonomni-agenti`, `releases`, `robotika` |

**What happens to the rest.**
- **Témata** (`/topics`, the card grid): retire the index page; `/topics` redirects to `/archive`; `/topics/<slug>` redirects to the section that absorbs it (`ai-models` → `/modely`, `ai-regulation` → `/regulace`, `ai-platforms` + `ai-companies` → `/firmy-a-trh`, `open-source` → `/modely`, `developer-tools` → `/vyvoj`, `research` → `/bezpecnost` for safety tags, else `/modely`). Topic Atom feeds redirect to the section feeds.
- **Poslední týden** (`/tyden`): keep the route and the page (06); out of the bar, in „Více“ and the footer; the front page carries the week block, so it is one click from Dnes.
- **Archiv**: „Více“ and footer (owner decision). Gets the section filter row.
- **Slovník, Zdroje, Opravy, O magazínu**: „Více“ menu and the footer's „Magazín“ column. Unchanged routes.
- **O čem se mluví** (79 synced posts): drop from any navigation; keep the route noindex until a curation rule exists. Its best items are already the Watchlist.
- **Podcasty** (9 episodes) and **Akce**: footer-only links under „Magazín“ once each has ≥ 10 items; until then unlinked and noindex, as today.
- **AI modely** (`/ai-modely`, 1 edition): merge into the Modely section; redirect.
- **`/weekly`**: stays noindex and unlinked until a digest ships; if it returns, it is the Saturday front page, not a nav item.

**The one-section rule (so upstream can set it).** Every article carries exactly one `section` from the enum above. Upstream assigns it from the lead story of the article, in this precedence when more than one applies: **Regulace → Bezpečnost → Modely → Vývoj → Firmy a trh**. Rationale: a law about a model is a regulation story; an attack using a model is a security story; a model release by a company is a model story; a coding-agent release is a developer story; everything about who bought, funded or hired whom is business. Tags stay as secondary metadata for search and related articles. Briefs carry the same enum in `dispatches[].section`, replacing free-text `topic`.

**Hiding thin sections.** A section appears in the bar when it holds **≥ 6 articles** (about two publishing weeks at the new cadence) and never disappears afterwards. At launch, backfilling the 30 August–September editions by the rule gives every section ≥ 6 except possibly Vývoj (about 5); if so it launches hidden and appears within a week. Hidden sections still exist as routes and in the archive filter.

## Q5 · Publishing one to three articles a day

**The day stays the edition; the article becomes the unit.** Recommended model: an *edition* is keyed by date and holds an ordered list of 1–3 *articles* plus the day's Briefs, Watchlist, corrections, sponsor and practical item. Articles carry their own identity (`slug`), section, publish time and priority. The front page leads with the priority-1 article (or, if no priority is set, the earliest published), places the second and third by publish time, and shows the day's Briefs and Watchlist once, in one place, whatever the count. Report page 02 shows all three counts and a Saturday; the layout changes span, not structure: 12/–, 8/4, 7/5.

**Article page ↔ the day's other articles.** Two links: „Dále v dnešním vydání“ at the top of the side column (the other articles with 1:1 thumbnails, time and section) and „Další z dnešního vydání“ as 3:2 cards at the end, followed by the previous edition. `IssueNavigation` (prev/next by date) becomes prev/next *edition*, not article.

**Poslední týden and the Archive.** Both group by day with a fixed 200 px date column: weekday and date on the left, the day's articles on the right; the day's priority-1 article gets the 3:2 cover in the week view, the others are compact rows with squares; the archive shows title, section, time and a 56 px square per article and keeps the one-line „bez vydání“ for empty weekdays. Weekend editions in the archive (19. 9., 13. 9., 12. 9. …) contradict the „weekends off“ rule; recommendation: publish weekend material as Monday's second or third article and stop creating weekend records.

**Data each article must carry** (exact list in `UPSTREAM_REQUIREMENTS.md`): `slug`, `edition_date`, `published_at` (Europe/Prague ISO), `section` (enum), `priority` (1 = lead; 2, 3), `title`, `dek`, `tags`, `illustration` with a 3:2 hero and a 1:1 thumbnail (paths, width/height, alt, attribution), `why_it_matters`, `what_changed`, `uncertainty`, `sources`, `generation` (incl. `human_reviewed`), `corrections`. Per edition: `date`, `articles[]` (ordered), `dispatches[]` (with `section`), `wire[]`, `sponsor`, `practical`, `glossary_terms`. Reading time is not delivered and not shown.

**Does „Máte přehled.“ still make sense?** Yes, as the end of the *day*, not of an article. The completion row closes the edition block on the front page („Konec dnešního vydání · Máte přehled.“) after the last article, Briefs and Watchlist, and on Saturday reads „Konec vydání z pátku 25. 9.“. It is not a digest and not a badge; it is the line under the day. It disappears from article pages.

## Q3 · Navigation (summary; page 03 has the specification)

Centred masthead: date left (mono 13), logotype 34 px centre, „Hledat ⌘K“ right (outlined, 40 px). 2 px ink rule. Section bar: Dnes · Modely · Firmy a trh · Bezpečnost · Regulace · Vývoj · | · Více ▾, Space Grotesk 15 px, active underlined in ink. Sticky condensed header at 52 px after the masthead scrolls out. Mobile: 56 px top bar (menu · logotype · search), ink rule, 44 px horizontally scrolling section strip; the drawer lists sections, „Více“, search, date.

## Q2 · Visual direction (summary; page 07 has the values)

Keep: paper canvas, white reading surfaces, blue #2f5ae6, zero radius, hairlines, the three typefaces, the metadata floor #5f6672. Change: (1) secondary headlines set in Source Serif 4 600, the lead and titles in Space Grotesk 700 — the serif column is what makes it read as a daily; (2) mono is demoted to dates, times, credits and hosts, lowercase, and the sixteen kicker classes become Space Grotesk 600 12 px section labels; (3) one 2 px ink rule (`--border-ink`) for the masthead and module heads, grey rules for grouping only; (4) a flat ink band (`--band-ink`) under the lead headline on photographs; (5) a 12-column, 24 px-gutter grid in the existing 1360 px container; (6) images at 3:2 and 1:1 only; the 21:9 lead, the 4:3 archive crop, the padded image frame and the copy plate go. Every text colour still meets AA; the band gives ≥ 10:1 for white regardless of the photograph.

## Q4 · Pictures (summary; `UPSTREAM_REQUIREMENTS.md` has the contract)

Slots: lead 3:2 (2:1 crop when it spans 12 columns), secondary 3:2, third slot 1:1 at 136 px, mobile lead 1:1, section covers 3:2, article figure 3:2 at 9 columns, week lead 3:2 at 280 px, compact rows 1:1 at 96/88/64/56 px. Every slot has a labelled outlined fallback at the same ratio; the lead slot never shows a fallback box — a photo-less lead becomes a typographic lead. Briefs and Watchlist stay text; a Brief photo is **not** required (an optional 1:1 is accepted for a future „Krátce“ card row but nothing in this design needs it). Upstream requirement: one distinct photograph per article, 3:2 ≥ 1600 × 1067 plus a 1:1 ≥ 800 × 800 crop of the same photo, licensed and credited, no reuse within 60 days, no generated imagery, no brains/circuits/neon.
