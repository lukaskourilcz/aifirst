# Prompt for Claude Design — DNESKAi launch redesign

Copy everything below the line into Claude Design as one prompt. Attach or paste
`docs/redesign/README.md` (the brainstorm) if the tool accepts context files; the
prompt is self-contained without it.

---

You are designing the launch redesign of **DNESKAi**, a Czech-language daily
magazine covering AI and the technology around it. One editorial system (BoardlessAI)
ships exactly one original Czech article per day; the site is fully static, Git-native,
with no accounts, no comments, no runtime API calls. The current design is a dark
"publishing instrument" built around a single daily edition. The goal now is a
**TechCrunch-style front page and section system** — a recirculation-oriented tech-news
layout a reader scans several times a day — while keeping DNESKAi's editorial precision
and its finishing ritual („Máte přehled.").

## Layout reference — copy it, with three exceptions

Study **techcrunch.com** directly, desktop and mobile. Reproduce its layout logic:
a dominant lead-story package on top, a chronological feed of compact article rows
(category kicker in accent color, bold headline, short dek, byline/time meta, square
thumbnail), a narrow utility rail on the right, generous max-width container,
single-column collapse on mobile with a full-screen menu.

Three deliberate exceptions:

1. **Navigation lives in a fixed LEFT rail, never a top nav bar.** The current site
   already has a 244px left sidebar inside a 1360px container — keep that shell
   concept: brand lockup on top, numbered primary categories, a divider, the
   secondary section group, and the search control. **Nothing else lives in the
   rail** — no status records, no run data, no metrics of any kind.
2. **No top leaderboard ad. Ever.** The only ad unit on the site is **one square
   300×250 box in the right rail**, shipped as an empty placeholder at launch: dashed
   hairline border, mono label „Místo pro reklamu". Reserve its exact space so nothing
   shifts when a creative later fills it.
3. **Czech-only.** Every piece of UI copy is Czech. English appears only as data
   (titles of external Medium/Substack posts and podcast episodes).

## Present it as a regular magazine

DNESKAi must read like a normal online magazine run by its founder — not like an
AI-operations dashboard. The current site exposes production instrumentation to
readers; the redesign removes **all** of it, on every page (including Radar,
Témata, Archiv and O magazínu):

- The publication-data strip („Údaje o vydání": Datum vydání · Prověřené →
  citované zdroje · Naměřené náklady · signál) — gone entirely, nowhere redesigned
  back in. The hero meta row is simply date · reading minutes.
- The signal-strength meter and any sparkline/score of it — gone.
- The publication-status banner („Vydávání je částečně omezené" / „Vydávání je
  aktuální") — gone from every reader page.
- The „Jak toto vydání vzniklo" provenance block and any making-of module — gone
  from reader surfaces.
- The footer line „statický build · bez runtime volání modelů" — gone. No
  AI/tech-ops jargon anywhere: no run costs, model names, candidate counts, agent
  references or build vocabulary in reader-facing copy.

What stays, because regular magazines have them: the source ledger („Přehled
zdrojů" — plain citations), corrections, the sponsor label, and the completion
ritual. Trust here is expressed through journalism conventions, not telemetry.

## Product facts the design must be honest about

- Exactly **one original article per day** — the edition. The homepage is not fed by
  dozens of house stories; volume comes from derived surfaces: the last week of
  editions, external "talked about" links, podcast episode releases, curated events,
  a daily lesson widget, a did-you-know widget, a weekly digest, Radar (editorial
  intelligence), Topics, Archive, Search, and trust pages (sources, corrections,
  glossary).
- Some days legitimately have **no edition** — design that state honestly (no fake
  content). Some articles have **no photo** — a deterministic SVG plate or text-first
  fallback is a legitimate state, not an error.
- **No fake metrics.** There is no analytics API, so never design "Most Popular",
  view counts, or trending numbers. Recirculation modules must be honest: recent
  editions, upcoming events, the daily widgets.
- External podcast/article cards **link out**; we do not embed players or rehost
  external cover art at launch — design typographic cards that stand without images.
- Static site: no infinite scroll. Pagination is real links to static pages.

## Information architecture

Primary left-rail categories, in order (Czech label → route):

1. **Dnes** → `/` (today's edition front page)
2. **Poslední týden** → `/tyden` (last 7 publishing days)
3. **O čem se mluví** → `/o-cem-se-mluvi` (curated external Medium/Substack/blog links)
4. **AI modely** → `/ai-modely` (editions explicitly categorized as model-focused)
5. **Podcasty** → `/podcasty` (new AI/tech podcast episodes, YouTube + audio)
6. **Akce** → `/akce` (events, two scopes: „Česko" and „Svět"; manually curated)

Secondary rail group (smaller, after a divider): Radar, Témata, Týdeník, Archiv,
Lekce, O magazínu — plus the search control. The rail contains sections and
search, nothing more. The footer keeps its current link groups (Radar, Témata,
Týdeník, Archiv / O magazínu, Korekce, Glosář, Zdroje, Atom) and gains a social
row: Facebook, Instagram, Threads and X as monochrome icons — **no destinations
yet**, non-interactive placeholders with accessible names, designed so real links
drop in later without layout change.

Category logic to express visually: every new article is on **Dnes** the day it ships
and stays in **Poslední týden** for seven days; a model-focused article additionally
carries a permanent „AI modely" chip; many articles have no category chip at all —
that is normal, not a gap to fill.

## Page specifications

**1. Dnes (`/`) — the front page.** TechCrunch-style lead package: hero = today's
edition (kicker „Dnešní vydání" + date, display-size headline, dek, meta row:
date · reading minutes), hero image 21:9 when a real photo exists, SVG-plate
variant otherwise. Beside/under it, a condensed secondary column reusing today's
Briefs („Ve zkratce") and Watchlist („Na radaru") items as short headline links.
Below the lead package: the „Poslední týden" feed (row anatomy per TechCrunch). Right
rail top-to-bottom: ad placeholder box, „Denní lekce" widget (term + one-line gloss +
link to Lekce), „Víte, že…" widget, „Nejbližší akce" teaser (next 2 events, link to
Akce), subscribe/feed module. The completion mark „Máte přehled." must survive as the
ritual end of the edition content. Design the no-edition-day variant of this page.

**2. Article page.** Keep the reading structure (35em measure, serif prose,
highlights: proč to je důležité / co se změnilo / nejistota; source ledger;
corrections). Re-skin to the new system; add the category chip row; right rail
carries the ad box and related editions. Print stays black on white.

**3. Poslední týden (`/tyden`).** Feed of the last 7 publishing days. The terminal
element is a full-width action: **„Objevit předchozí týden"** — a real link to a
static per-week page (e.g. `/tyden/2026-w31`, label format „Týden 28. 7. – 3. 8.
2026"). Week pages chain backwards with the same action until the archive is
exhausted (then: quiet end-state line + link to Archiv).

**4. AI modely (`/ai-modely`).** Same feed anatomy, filtered. Design the empty state
(one honest Czech sentence — the category fills over time).

**5. O čem se mluví (`/o-cem-se-mluvi`).** External-link cards grouped by day:
source monogram badge (Medium / Substack / blog — typographic, no scraped favicons),
original title (often English), author, Czech relative date, optional one-line
summary, outbound-arrow affordance. Cards must look complete without any image.

**6. Podcasty (`/podcasty`).** Episode rows grouped by day: show name (mono
eyebrow), episode title, duration when known, date, and small labeled outbound links
per platform (YouTube / Spotify / Apple / RSS — text labels, not brand icon soup).

**7. Akce (`/akce`).** Two scopes: **Česko** and **Svět**. Choose tabs or stacked
sections with anchor navigation — justify the choice; it must work statically with
zero JavaScript. Event card: date block (day + month, mono), title, city/venue or
„online", price when known (e.g. „zdarma", „od 990 Kč"), organizer, outbound link.
Upcoming events ascending; past events muted in a collapsed „Proběhlé" group.

**8. Global states.** Empty streams (short honest line, e.g. „Dnes zatím nic
nového."), missing images, long Czech headlines (Czech wraps worse than English —
test with 90+ character headlines), correction notices, sponsor block.

## Design system decisions — yours to make, inside these rails

**Keep (non-negotiable):** zero border-radius everywhere; 1px hairline borders;
three type families with their existing jobs — Space Grotesk (display, UI, nav),
Source Serif 4 (article prose, deks), IBM Plex Mono (dates, labels, metadata, chips);
the completion ritual; calm density. **Banned:** gradients, glow, neon, terminal
cosplay, scanlines, parallax, glassmorphism, mascots, robots/brains/circuit imagery,
fake charts, testimonial blocks, infinite-feed styling, new fonts, icon libraries.

**Decide: canvas polarity.** Current site is one dark theme (canvas `#0c0d10`, panel
`#14161a`, ink `#eceef2`, metadata floor `#8d949f`). My recommendation: **flip to a
light newsroom canvas for launch** — TechCrunch-adjacent airy white/paper front page,
near-black ink, ONE vivid accent — because the product is now a daytime scanning
surface, light canvases carry ad creatives and mixed-source content better, and it
marks the relaunch visibly. You may overrule and keep the dark instrument identity if
you argue it concretely, but pick ONE theme. No theme toggle. Print stays black on
white either way.

**Accent.** Current accent is blueprint blue `#4d7cff` (tuned for dark). If you go
light, either derive an accessible blue for white surfaces (link + accent duties,
AA 4.5:1 minimum against the canvas) or propose one different accent — exactly one.
Keep the semantic status trio (complete/green, warning/amber, correction/red) re-tuned
to the chosen canvas. Category kickers in feed rows use the accent, per TechCrunch.

**Token delivery.** The implementation consumes CSS custom properties. Deliver exact
values for every one of these existing semantic names (plus the raw palette block they
reference): `--surface-page`, `--surface-reading`, `--surface-subtle`,
`--surface-emphasis`, `--surface-hover`, `--text-primary`, `--text-secondary`,
`--text-tertiary`, `--border-subtle`, `--border-strong`, `--accent-primary`,
`--accent-primary-hover`, `--status-complete`, `--status-warning`,
`--status-correction`, `--focus-ring`, `--selection-background`. Metadata text
(`--text-tertiary`) must hold ≥4.5:1 on its surface. Also deliver the matching
literal set for the static Open Graph theme (og-theme mirrors tokens as literals) and
adjusted `--text-*` / `--leading-*` scale values if you change the type scale — the
front page needs TechCrunch-scale headline impact (hero display ~clamp 2.4–4rem, feed
row headlines ~1.125–1.35rem bold).

**Grid.** Container 1360px, left rail 244px fixed. Define main-column and right-rail
(300px) behavior at 1600 / 1280–1440 / 1024 / 768 / 430 / 390 / 360 / 320 px. State
where the right rail drops (its modules reflow into the main column — specify order)
and where feed-row thumbnails shrink or drop. Below ~960px the left rail collapses:
design the mobile top bar (wordmark, menu trigger, search trigger) and a TechCrunch
mobile-style full-screen drawer holding the full nav; touch targets ≥44px. Give the
mobile content order for the front page explicitly (recommendation to react to:
hero → feed start → ad box → remaining feed → widgets → footer).

## Voice anchors (use these real strings in mockups)

Tagline „To podstatné z AI. Každý den." · Promise „Jedno vydání a máte přehled." ·
Completion „Máte přehled." · Wordmark **DNESKAi** (never translated, never restyled
per-letter). Use realistic Czech headlines in mockups (long, diacritics-heavy), never
lorem ipsum, never fabricated statistics.

## Deliverables — implementation-ready, no images required

1. **Decision summary** (≤10 lines): canvas polarity, accent, one paragraph of why.
2. **Complete token sheet**: exact hex/rem values for every custom property named
   above, the raw palette block, and the OG literal set.
3. **Layout specs** for Dnes, article, Tyden, O čem se mluví, Podcasty, Akce — at
   1280px and 390px: structured wireframes (ASCII or nested lists) with measurements,
   and the component inventory per zone.
4. **Component specs** with states (default/hover/focus/active/visited where
   relevant): nav-rail item, mobile drawer + top bar, hero package (photo and
   SVG-plate variants), feed row, category chip, external-link card, podcast row,
   event card, ad placeholder box (exact 300×250 reservation), widget module frame,
   week-boundary action, empty-state line, completion mark treatment, footer, and
   the social icon row (Facebook / Instagram / Threads / X — monochrome inline
   icons, linkless placeholders for now).
5. **Accessibility table**: contrast ratio for every text/surface pair, focus-ring
   spec, reduced-motion stance (what animates at all, what stops).
6. **OG card + print notes**: one OG composition consistent with the new tokens;
   print unchanged black-on-white.

Format everything as structured markdown with exact values, so an engineer can
implement it without seeing a single rendered image.
