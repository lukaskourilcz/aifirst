# Upstream requirements for BoardlessAI — DNESKAi design, round 2

Owner of this contract: the BoardlessAI repository. This file states exactly what the round-2 design needs delivered into `lukaskourilcz/aifirst`. Nothing here is implemented on the site side until `lib/delivery/` and `lib/content.ts` accept the new package; `CLAUDE_CODE_PROMPT.md` Part B lists that work.

## 1 · Edition and article identity

Today: one board record and one `content/articles/<date>.cs.mdx` per date. Required: an **edition per date** that holds **1–3 articles**.

- Package: `edition-package/2`. One board record per `date`, with `articles: [<slug>, …]` in display order.
- Article file: `content/articles/<date>/<slug>.cs.mdx`, where `slug` = `<date>-<kebab-title>` and is unique across the archive. A one-article day is the same shape with one file (the current files can be migrated by moving them into a date folder; URLs `/articles/<slug>` do not change).
- Briefs (`dispatches`), Watchlist (`wire`), `corrections`, `sponsor`, `practical`, `glossary_terms` belong to the **edition**, not to an article: `content/editions/<date>.cs.yml` (or the board record). They are shown once per day.
- Same-date idempotency: re-delivering an edition replaces all of its articles; a package hash covers the whole edition.
- Weekends: no edition records on Saturday and Sunday. Weekend material is delivered as Monday's second or third article.

## 2 · Article fields the layout reads

Required unless marked optional. Existing schema-v2 fields keep their names.

| Field | Type | Rule |
| --- | --- | --- |
| `slug` | string | `<date>-<kebab>`, unique |
| `edition_date` | `YYYY-MM-DD` | Prague publishing day; equals the folder |
| `published_at` | ISO 8601 with offset | Europe/Prague; shown as „6.05“ beside the section; also orders articles 2 and 3 |
| `section` | enum | one of `modely`, `firmy-a-trh`, `bezpecnost`, `regulace`, `vyvoj`; assigned by the precedence rule in DECISIONS.md Q6 |
| `priority` | 1 · 2 · 3 | exactly one article per edition has `1`; it is the lead. If absent, the earliest `published_at` leads |
| `title` | string | ≤ 70 characters, one sentence, no full stop (EDITORIAL_RULES) — the lead headline is set at 60 px on the photo and must fit 3 lines at 20 ch |
| `dek` | string | ≤ 25 words, one sentence |
| `tags` | string[] | registry slugs only; secondary metadata |
| `illustration` | object | see §3 — **required** for every article |
| `why_it_matters`, `what_changed`, `uncertainty` | string[] | as today; the front page shows `why_it_matters` when the day has one article |
| `sources` | array | as today, plus the integrity rule in §4 |
| `generation` | object | as today; `human_reviewed` drives the „Ověření“ wording (DECISIONS.md) |
| `corrections` | array, optional | as today |
| `alternative_headlines`, `social_copy`, `signal_strength` | optional | not rendered |

Not delivered, not shown: reading time, author name, avatar (owner decision).

Per edition: `date`, `articles[]` (ordered slugs), `dispatches[]` (each: `title`, `body`, `source_url`, **`section`** from the same enum instead of free-text `topic`), `wire[]` (as today), `sponsor`, `practical`, `glossary_terms`, `corrections`.

## 3 · Image slots and sizes

Every article: **one photograph, two crops of it**, both licensed, credited and delivered under `public/images/editions/<slug>/`.

| File | Ratio | Minimum | Used at |
| --- | --- | --- | --- |
| `hero.webp` | **3:2** | **1600 × 1067** (2400 × 1600 preferred) | lead 8/7 cols, article figure 9 cols, section covers, week lead row, „Další z vydání“ cards; **cropped to 2:1 by the site** when the lead spans 12 cols |
| `thumb.webp` | **1:1** | **800 × 800** | third front-page slot 136 px, mobile lead full width, side rows 120/96/88 px, compact rows 64 px, archive 56 px |

Composition rules, because the headline sits on the photo:
- The subject must sit in the **upper 55 %** of the 3:2 frame; the lower 45 % is covered by the ink band on the front page. Photos whose meaning is in the bottom third (captions, screens, hands at the bottom edge) are unusable as leads.
- The 1:1 crop is chosen upstream, not centre-cropped by the site, so the subject survives the square.
- `alt` in Czech, ≤ 140 characters, describing what is seen, not the story. `attribution.author`, `.license`, `.source_url` required; the site prints „Foto: Autor / Host“.

Quality rules (these are the P0 findings in the review):
- **One distinct photograph per article.** No photograph may be reused within **60 days** and never twice in one edition. Today the same Pexels motherboard is the hero of 5 of the last 30 editions.
- **No generated imagery of any kind**, including `origin: illustration` (9. 9. 2026) — the site treats `origin` other than `photo` as „no image“.
- **No drawn SVG plates.** The neon bar-chart plates violate the design rules (fake chart, neon, black surfaces). When no licensed photo can be found, deliver **no image** and set `illustration: null`; the site renders its own typographic fallback (§5). A plate is a failure state, not a deliverable.
- **Subject rules:** no brains, circuit-board brains, robots, neural webs, holograms, glowing abstractions; prefer places, objects, people at work, documents, buildings, hardware in context. Avoid the generic „motherboard macro“ family.
- Briefs and Watchlist items carry **no image**. An optional `dispatches[].image` (1:1 ≥ 800 px, same licensing) is accepted and ignored until a Briefs card layout exists.

## 4 · Source integrity

- `sources[].title` must be the title of the page at `sources[].url`, and `source_id` must match the URL host in `sources.yml`. On 13. 9. 2026 two ledger rows were titled with a Variety and a Verge entertainment story while the URL and `supports` described RubyGems and Amodei. The site will drop a row whose host does not match its `source_id` and log it; better that it never arrives.
- `supports` stays unrendered until it is Czech.

## 5 · How the site degrades when something is missing

| Missing | Front page | Section / week / archive | Article |
| --- | --- | --- | --- |
| `thumb.webp` | 1:1 slots use a centre crop of `hero.webp` (subject may be cut) | same | — |
| `hero.webp` but `thumb.webp` present | article cannot lead; the next article with a hero leads; this one takes a compact slot | 3:2 slots show the labelled fallback box, 1:1 slots the thumb | figure omitted; caption omitted |
| both images | article cannot lead unless it is the only one; then **typographic lead**: 60 px headline on paper across 8 cols, dek beside it, no box | fallback boxes at the slot's ratio: `#efefec`, hairline, mono „bez fotografie · datum“ | no figure |
| `priority` | earliest `published_at` leads | — | — |
| `section` | article renders under „Dnes“ only, is excluded from section pages, appears in the archive without a label; build warns | same | label omitted |
| `published_at` | falls back to 06:00 Prague; time not shown | same | time omitted |
| `dispatches[].section` | Brief renders without a label | — | — |
| whole edition on a weekday | one quiet line „čtvrtek 24. 9. 2026 · bez vydání“ in the week and archive; the front page leads with the newest edition (existing behaviour) | — | — |

Nothing is ever filled with stock, generated or repeated imagery by the site.
