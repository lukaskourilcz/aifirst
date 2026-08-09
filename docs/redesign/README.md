# DNESKAi launch redesign — brainstorm and working brief

Date: 2026-08-09 · Owner: Lukáš · Status: brief ready, implementation not started

This folder is the complete hand-off for turning DNESKAi from a single-edition
reading instrument into a TechCrunch-style Czech AI magazine, plus the engine work
in `lukaskourilcz/quorum` behind it.

How to use it:

1. Run `claude-design-prompt.md` in **Claude Design**. Save its full output as
   `docs/redesign/design-spec.md` in this repo.
2. Run `opus-implementation-prompt.md` in **Claude Code (Opus)** with both repos
   checked out. It consumes the design spec and carries a fallback token baseline,
   so it can start even before the spec lands.

## 1. Where the product stands today

- Exactly one original Czech article ships per day from BoardlessAI through
  `edition-package/1` (a no-edition day is an honest, delivered state).
- The shell is already a left rail: 244px sidebar in a 1360px container, six
  numbered nav items (Dnes, Radar, Témata, Týdeník, Archiv, O magazínu), search
  palette, and a status record (issue date, run cost, signal).
- One dark theme (`#0c0d10` canvas, blueprint blue `#4d7cff`), zero radius, 1px
  hairlines, Space Grotesk + Source Serif 4 + IBM Plex Mono.
- Daily widgets (`DailyLesson`, `DidYouKnow`) read append-only datasets in `data/`,
  picked deterministically from the newest edition's date — never a clock.
- `BannerSlot` exists (`banner-slot/1` config), currently one inactive 728×90 belt.
- Brand is split on purpose: `wordmark` DNESKAi (what readers see), `name` Caught Up
  (titles, OG, feeds, JSON). Unifying them is an owner call — see §14.
- Bundle gate: 110 kB gzip page-entry ceiling. Client JS today: search palette,
  keyboard help, modal, nav active-state, reading progress. Nothing else.

## 2. The launch thesis

Keep the edition as the spine and the „Máte přehled." ritual as the finish line, but
make the front page a **scanning surface**: a TechCrunch-style lead package, a
week-deep feed, and three new external streams that give the site daily volume
without writing more house articles. Navigation stays in the left rail (never a top
nav), there is no top leaderboard ad, and the only ad unit is one square 300×250 in
the right rail — shipped as a visible „Místo pro reklamu" placeholder that later
wires to the owner's ad deals through config only.

Czech-only remains absolute for UI and house content. External stream items
(Medium/Substack posts, podcast episodes) keep their original titles as data.

## 3. Information architecture

Primary rail (new):

| Label | Route | Fed by | Updates |
|---|---|---|---|
| Dnes | `/` | today's edition + widgets + stream teasers | daily |
| Poslední týden | `/tyden` (+ `/tyden/[week]`) | last 7 publishing days of editions | daily |
| O čem se mluví | `/o-cem-se-mluvi` | `data/talked-about.json` (Medium/Substack/blog links) | daily fetch |
| AI modely | `/ai-modely` | editions with explicit category `ai-models` | when tagged |
| Podcasty | `/podcasty` | `data/podcasts.json` (YouTube + audio releases) | daily fetch |
| Akce | `/akce` | `data/events.json`, owner-curated, scopes `cz`/`global` | manual |

Secondary rail group: Radar, Témata, Týdeník, Archiv, Lekce, Hledání.
Footer/trust: O magazínu, Zdroje, Korekce, Glosář, Puls, Atom.

All existing routes and redirects survive (`/stats`,`/trends`→`/radar`,
`/tags`→`/topics`, `/colophon`→`/about`, `/cs` legacy behavior, feeds, JSON,
print). New categories are additive; nothing indexed breaks.

## 4. Category model (the part that must not be fuzzy)

Two different mechanisms, deliberately not unified:

- **Time-derived membership** — computed at build from `frontmatter.date` against
  the newest edition's date (the same deterministic anchor the widgets use).
  Publish day → on Dnes. Days 0–6 → in Poslední týden. Day 7+ → only archive,
  topics, and any explicit category. No agent involvement, no stored state.
- **Explicit categories** — a new optional frontmatter field `categories`
  (validated enum, storage keys English, labels Czech), assigned upstream by the
  writer at edition time. Launch vocabulary: exactly `ai-models` → „AI modely".

The `ai-models` rule, verbatim for the writer prompt: assign it **only** when the
edition's primary subject is a specific model or model family — an official
release/upgrade announcement, a benchmark/eval/deep-dive centered on one model, an
official model behavior/safety report, or an analysis whose main argument is about
a specific model. Never assign it because a model is merely mentioned or used in
the story, or for company/funding/regulation/chips stories that reference models in
passing. When unsure, omit — an uncategorized article is correct more often than a
miscategorized one. Tagless articles are a normal state.

Why a new field instead of reusing `tags`: upstream tags are contractually Czech
kebab slugs, min 1 max 6, and they feed the repeated-topic publication gate — an
English category constant would pollute both. Topics (`config/topics.yml`) stay a
broad derived axis; the category is a narrow editorial commitment.

## 5. „Poslední týden" mechanics

`/tyden` lists the last 7 publishing days (rolling window from the anchor date).
The terminal element is „**Objevit předchozí týden**" — a real link to a static
per-week page (`/tyden/2026-w31`, heading „Týden 28. 7. – 3. 8. 2026"). Week pages
are generated for every historical ISO week that has at least one edition and chain
backwards with the same action; the oldest week ends with a quiet line and a link
to Archiv. No JavaScript, no infinite scroll — every "rerender" is a prerendered
page. Week math must reuse the deterministic date arithmetic style of
`lib/daily.ts` (UTC integer math on date strings; never `new Date()` / `Date.now()`).

## 6. „O čem se mluví" — sourcing research (Medium / Substack)

Findings (verified 2026-08-09, links in §15):

- **Medium has no read API anymore** — the official API is archived/unsupported.
  The supported free surface is RSS: `medium.com/feed/@author`,
  `medium.com/feed/<publication>`, `medium.com/feed/tag/<tag>` (~10 newest items,
  no engagement data).
- **Substack has no official API.** Every publication exposes `/feed` RSS —
  including custom domains (`interconnects.ai/feed`). Unofficial `/api/v1/*`
  endpoints exist but are fragile; do not build on them.
- **Apify**: Free plan $0/mo with **$5 monthly platform credit** (no card);
  Starter ~$29–39/mo. Quorum already has a quota-guarded Apify client
  (`orchestrator/src/sources/apify.ts`, reserves $1.40/run against the $5 credit)
  and an INBOX item `APIFY-ACCOUNT-001` pending for GoVIRAL.

Decision: **launch on curated RSS at $0.** A registry of feeds (Medium tags +
named Substack publications, each with an explicit hostname for the network
allowlist), polled daily by the quorum engine, deduped by URL, ranked by recency +
per-source weight, pruned to a 60-day window. Engagement-based ranking ("most
clapped") is the only thing that would need Apify; the shared free credit could
cover it later, but a paid Apify plan (~$29+) does not fit the $30 all-in cap and
would need an owner budget decision first.

Seed registry to confirm (owner edits freely): Medium tags
`artificial-intelligence`, `machine-learning`, `llm`; Substacks: Import AI,
One Useful Thing, The Algorithmic Bridge, Interconnects, ChinAI, AI Supremacy,
Latent Space, Don't Worry About the Vase, SemiAnalysis.

## 7. „Podcasty" — sourcing research (YouTube / Spotify)

- **YouTube channel RSS** — `youtube.com/feeds/videos.xml?channel_id=UC…` — free,
  keyless, 15 newest uploads per channel. Covers video podcasts entirely.
- **YouTube Data API v3** — free, 10,000 quota units/day; `playlistItems.list`
  costs 1 unit, so polling even 50 channels daily is ~50 units. Only needed if RSS
  proves insufficient (e.g. durations).
- **Spotify Web API** — free, and show/episode endpoints exist, but since
  2024-11-27 new apps are restricted, extended quota effectively requires 250k MAU
  (May 2025 policy), and community reports show catalog endpoints misbehaving for
  new dev-mode apps. **Do not build the pipeline on Spotify.** Keep Spotify as
  link-only: a static per-show Spotify URL in the curated registry.
- **Podcast Index** (podcastindex.org) — free API key; episodes by feed, recent
  episodes, search. The robust backbone for audio-first shows, and it returns feed
  metadata (durations, links). Apple links via the free keyless iTunes Lookup API.

Decision: **curated show registry at $0** — each show entry carries: name, kind
(`youtube` | `rss`), YouTube channel id or RSS/PodcastIndex feed, and optional
static platform links (Spotify/Apple). Daily poll, dedupe by episode URL/guid,
prune to 60 days. Czech AI shows get slots in the registry the owner fills in.

## 8. „Akce" and the DNESKAi engine room (quorum admin)

Events are the one **manual** category. The quorum admin already has everything
needed: an HMAC-cookie login (`ADMIN_USER`/`ADMIN_PASSWORD`), a venture-tab system
where `events` is already a legal tab name, the alias `dneskai → caught-up`, and a
proven owner-manual-capture pattern (`admin/api/fightaiq/odds` route +
`fightaiq-odds-store.ts`: auth → same-origin check → size cap → parse → atomic save
with a `persistence` result). The persistence helper (`admin-fixed-costs.ts`
pattern) writes locally **and** PUTs through the GitHub Contents API, so the
deployed Vercel admin can commit state changes.

Build: a DNESKAi engine tab set for the caught-up venture —

- **Akce manager**: list/add/edit/archive events. Fields: scope (`cz`|`global`),
  Czech title, 1–2 Czech sentences, start date, optional end date, city/venue or
  online flag, URL, optional price and organizer. Future events editable; past
  events frozen. Stored at `state/ventures/caught-up/events/events.json`; each
  save appends a receipt.
- **Engine status panel** (read-only): last edition delivery, last stream fetch
  per stream, dataset append receipts — pulled from existing state files.

Delivery to the magazine reuses the content-only GitHub App channel with a new
package kind (§9); the reader repo stays databaseless and static.

## 9. New delivery contracts (quorum → aifirst)

`boardless-dataset/1` is append-only with an anchor reveal schedule — wrong
semantics for streams (which prune) and events (which edit). Two new kinds:

| Contract | Target file | Semantics | Allowlist line (cycle.yml) |
|---|---|---|---|
| `boardless-stream/1` | `data/talked-about.json`, `data/podcasts.json` | rolling window: append new, prune >60 days, dedupe by URL/id, daily cap per stream | `^data/(talked-about\|podcasts)\.json$` |
| `boardless-events/1` | `data/events.json` | upsert by id; future events mutable, past events immutable except corrections | `^data/events\.json$` |

Receipts under `state/ventures/caught-up/streams/` and `.../events/`. The aifirst
side gates shape with unit tests exactly like `datasets.test.ts` gates the widget
datasets, and the delivery workflow keeps running the full verify suite before any
push. Existing edition and dataset allowlists stay byte-identical. This also fixes
a known doc drift: `docs/GOVERNANCE.md` still lists an outdated authorized-path
set (`public/illustrations/…`) — it gets rewritten against the real one.

## 10. The ad slot

Extend `banner-slot/1` with a second slot `rail-square` (300×250) and one new
optional field `placeholder`. Rules: with `active:false, placeholder:true` the
component renders the reserved 300×250 box — dashed hairline, mono label
„Místo pro reklamu" — so the layout never shifts; with `placeholder:false` it
stays invisible (current ship-empty behavior, and the existing belt slot is
untouched). A real creative later needs only config + a local file under
`public/images/banners/` — no scripts, no third-party hosts, CSP unchanged.

## 11. Design direction (what Claude Design decides, and inside what rails)

Keep: zero radius, hairlines, the three type families and their jobs, the
completion ritual, honest states, no fake metrics. Decide: canvas polarity —
recommendation is a **light newsroom canvas** for launch (TechCrunch-adjacent
scanning surface, carries ads and mixed-source content better, visibly marks the
relaunch), with one vivid accent (derive an accessible blue from the current
`#4d7cff`, or argue one replacement) and re-tuned status colors. One theme only,
print stays black on white, and the token **names** in `app/globals.css` +
`lib/og-theme.ts` literals are the delivery format. Mobile: top bar + full-screen
drawer (TechCrunch mobile pattern), single column, thumbnails intact, ad box after
the feed starts. Everything else is specified in `claude-design-prompt.md`.

## 12. Cost picture

| Item | Monthly cost |
|---|---|
| Medium + Substack RSS polling | $0 |
| YouTube channel RSS (or ≤50 Data API units/day) | $0 |
| Podcast Index API | $0 |
| Spotify (link-only, no API dependency) | $0 |
| Events (manual entry) | $0 |
| Stream/event delivery (existing Actions + GitHub App) | $0 |
| Model calls in any of the above | none — no LLM in these paths |
| Optional later: Apify engagement ranking | $0 within the shared $5 free credit; paid plan breaks the $30 cap → owner decision + ledger line first |
| Optional later: one-line Czech context per top pick (council model call) | draws on the $25 model share; needs a ledger line before it runs |

Fits `budget-2026-08e` unchanged: $30 all-in, $25 model/API share, $1.00 daily pace.

## 13. Rollout order

1. **Design spec** (Claude Design) → `docs/redesign/design-spec.md`.
2. **aifirst redesign** — tokens/theme, shell + drawer, front page, `/tyden` chain,
   category rendering, ad placeholder. Ships alone; new sections can be hidden
   until data exists.
3. **aifirst data surfaces** — schemas, loaders, empty states, pages for streams
   and events (render fine with empty files from day one).
4. **quorum categories** — frontmatter + writer prompt + package passthrough.
5. **quorum streams + delivery kinds** — fetchers, contracts, workflow allowlists.
6. **quorum admin (DNESKAi tab: Akce + engine status)** — last, because the reader
   renders an empty events file gracefully from step 3.

Each step leaves both repos releasable (`pnpm verify` + `pnpm e2e` green).

## 14. Open owner decisions

- **Brand unification** — moving `brand.name` Caught Up → DNESKAi renames every
  indexed title, OG card, feed and JSON `publication` field at once. Pre-launch is
  the cheapest moment it will ever be. The implementation prompt contains it as an
  explicitly gated step: it runs only if you say yes when Opus asks.
- **Canvas polarity** — light (recommended) vs staying dark; Claude Design argues,
  you sign off.
- **Source registries** — confirm/extend the Medium/Substack seed list (§6) and
  fill the podcast registry (§7), especially Czech shows.
- **Scope labels** — events render as „Česko" / „Svět" (storage `cz`/`global`);
  say the word if you prefer „Česká republika" / „Globální".
- **Apify** — leave off, or approve the shared free-credit use for engagement
  ranking later (INBOX item `APIFY-ACCOUNT-001` already tracks account creation).

## 15. Research sources

- Medium API status + RSS: [Medium Has No Article API — Use the RSS Feed Instead](https://medium.com/@jamesprivett29/05-how-to-get-article-data-from-medium-using-an-rss-feed-8f72f9df988f) · [Medium Rare: the API is archived](https://www.marktinderholt.com/social%20media/2024/12/13/medium-rare-api.html)
- Substack feeds, no official API: [Substack RSS support article](https://support.substack.com/hc/en-us/articles/360038239391-Is-there-an-RSS-feed-for-my-publication) · [substackapi.dev technical overview](https://substackapi.dev/technical-overview) · [Substack data APIs roundup 2026](https://www.netrows.com/blog/best-substack-newsletter-data-apis-2026)
- Apify pricing: [Apify pricing analysis](https://scrapegraphai.com/blog/apify-pricing) · [Apify free tier: what $5 buys](https://use-apify.com/docs/what-is-apify/apify-free-plan) · [Crawlworks Apify pricing 2026](https://crawlworks.io/blog/apify-pricing/)
- YouTube quota: [YouTube API quota limits 2026](https://www.getphyllo.com/post/youtube-api-limits-how-to-calculate-api-usage-cost-and-fix-exceeded-api-quota) · [YouTube Data API v3 guide](https://elfsight.com/blog/youtube-data-api-v3-limits-operations-resources-methods-etc/)
- Spotify restrictions: [Spotify: changes to the Web API (2024-11-27)](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api) · [Music Ally coverage](https://musically.com/2024/11/28/spotify-removes-features-from-web-api-citing-security-issues/) · [Get Show Episodes reference](https://developer.spotify.com/documentation/web-api/reference/get-a-shows-episodes)
- Podcast Index: [developer docs](https://api.podcastindex.org/developer_docs)
- TechCrunch structure: [Version Museum: TechCrunch design history](https://www.versionmuseum.com/history-of/techcrunch-website) · [work.co TechCrunch case study](https://work.co/clients/techcrunch/) (recirculation-oriented redesign) · [Rebuilding TechCrunch with modern CSS](https://ishadeed.com/article/rebuilding-techcrunch-modern-css/)
