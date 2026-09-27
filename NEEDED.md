# NEEDED — manual owner actions for DNESKAi

DNESKAi is a static Czech reader. BoardlessAI owns source collection,
edition meetings, writing, Czech localization, illustrations, social drafts and
delivery. This file contains only actions that require the owner’s accounts,
credentials or judgment; there is no second generation setup to maintain here.

## Kickoff 2026-09-25 · after the BoardlessAI refocus

`KICKOFF-25-9-2026.md` at the repository root is the order; issues #95–#97 are the steps.

- [x] **Decide the banner slots (#97)** — decided 2026-09-25: devShark creatives in both slots, labelled as the owner's own project. [imp:2] [owner:me] [time:10m] [kind:decision]
- [ ] **Rename `lukaskourilcz/aifirst` to `lukaskourilcz/DNESKAi`** — after quorum #555–#564 and own-dashboard #75 are merged; then set `NEXT_PUBLIC_GITHUB_REPO=lukaskourilcz/DNESKAi` on the Vercel project and update local remotes. #95 does the repository side. The package name stays `aifirst`. [imp:3] [owner:me] [time:15m] [kind:setup]

## Marketing launch 2026-11-05 (issue #99)

The reader side shipped on 2026-09-28: UTM landing with Web Analytics, share
pack v2, 4:5/9:16/16:9 cards, the `practical` field, `/akce` for synced events,
news sitemap, RSS, `/llms.txt`, Markdown editions and the footer links. These
need the owner:

- [ ] **Confirm Web Analytics counts a campaign link after the deploy** — open `{site}/?utm_source=threads&utm_medium=post&utm_campaign=edition` once, then check Vercel › aifirst-zpx8 › Analytics › UTM Parameters (or the pageviews API grouped by `utmSource`). Web Analytics was off from 2026-08-01 until this release, so August–September show almost nothing. [imp:4] [owner:me] [time:10m] [kind:deploy]
- [ ] **Create the Threads profile @dneskai, then flip it on** — set `live: true` for `threads` in `brand.social` (`lib/brand.ts`); the footer links only live profiles. Before 4 Nov. [imp:3] [owner:me] [time:10m] [kind:setup]
- [ ] **Supply the operator identification and an editorial contact** — the footer and About name only the person responsible for the content. Seznam Newsfeed and good practice need the operator (name or company, IČO) and a contact e-mail; fill `about.authorshipContact` and extend the footer line with what you choose to publish. Nothing was guessed. [imp:4] [owner:me] [time:15m] [kind:legal]
- [ ] **Decide on Seznam Newsfeed after a legal read** — the code prerequisites are in place (RSS 2.0 at `/rss.xml` with 20 items and a 16:9 enclosure, favicon, the responsible person in the footer). Seznam's terms since 1 May 2026 exclude automatically generated and machine-translated text, and every DNESKAi edition is written by a language model, so applying may breach them. The feed also carries only the dek, not the full text Seznam asks for (≥ 800 characters). Do not apply until that is settled. [imp:3] [owner:me] [time:30m] [kind:legal]
- [ ] **Pick the newsletter sender before the referral perk** — Buttondown or Listmonk, price first; then a subscribe form in the rail and the referral perk. Not built: it needs a paid service decision. [imp:3] [owner:me] [time:30m] [kind:decision]
- [ ] **Submit `/news-sitemap.xml` in Google Search Console** once the production domain is final. [imp:2] [owner:me] [time:10m] [kind:setup]

## Required for unattended BoardlessAI delivery

- [ ] **Finish the Vercel half of the credential audit** — the retired `ANTHROPIC_API_KEY` Actions secret was deleted from `lukaskourilcz/aifirst` on 2026-08-07. Still open: remove any old source, image, promotion, heartbeat or generation-report credentials from the aifirst Vercel project, and rotate keys previously pasted into chat. Do not remove Quorum’s active producer credentials. The old OwnDashboard sentinel pair can go too — nothing reads it any more. [imp:4] [owner:me] [time:15m] [kind:setup]

## Redesign hand-off

- [x] **Run the Claude Design prompt** — done 2026-08-09; the output is committed as `docs/redesign/design-spec.md` and is the authoritative design.
- [x] **Kick off the Opus build** — done 2026-08-09. The reader half is built: theme, shell, telemetry removal, data layer, ad slot, front page, article page, the six section routes, the brand unification and this documentation pass.
- [x] **Answer the brand gate on issue #47** — approved 2026-08-09: the official name is DNESKAi. Recorded on the issue; the kickoff schedules the rename right before the documentation pass.
- [ ] **Confirm the curated source registries** — approve or edit the seed list in quorum's `config/caught-up-streams.json`: three Medium tags, nine Substacks and eight podcast shows, of which eight ship disabled because their channel id could not be resolved without guessing, plus two empty slots for the Czech AI shows you pick. [imp:3] [owner:me] [time:30m] [kind:decision]
- [ ] **Create the free Podcast Index API key** — register at api.podcastindex.org and add `PODCASTINDEX_API_KEY` + `PODCASTINDEX_API_SECRET` to the quorum Actions secrets; the podcast stream falls back to YouTube-only until then. [imp:3] [owner:me] [time:15m] [kind:setup]
- [x] **Provide the social profile URLs** — decided in #99 (2026-09-27): Instagram @dneskai is linked from the footer; Threads waits for its profile (above).

## Product decisions

- [x] **Confirm whether technical names should stay `aifirst`** — settled 2026-08-09 with the brand unification. The publication is DNESKAi everywhere a reader or a machine meets it; the repository, package, venture id and environment variables stay `aifirst`/`caught-up` as stable identifiers, and `brand.legalName` stays Caught Up.

## Optional reader operations

- [ ] **Add a read-only GitHub token in Vercel only if private workflow history should appear in health** — set `GITHUB_TOKEN` with the narrowest repository read permission; the public health JSON never exposes it. [imp:2] [owner:me] [time:20m] [kind:deploy]
- [ ] **Enable semantic related-issue refresh only if tag overlap is insufficient** — create a Jina key and run `pnpm embed:refresh`; this enriches the static reader and is not an editorial fallback. [imp:1] [owner:me] [time:20m] [kind:setup]
- [ ] ~~Connect the sentinel to OwnDashboard~~ — retired. The Actions-minutes diet removed the sentinel's callback, so `OWNDASHBOARD_CRON_URL` and `OWNDASHBOARD_CRON_TOKEN` are read by no workflow and no code in this repository; setting them would do nothing. OwnDashboard integration, where it still exists, is read-side only: it polls the public health JSON and needs nothing configured here.

## Pre-launch audit 2026-09 (`docs/audit-2026-09/IMPLEMENTATION_NOTES.md`)

- [ ] **Add a contact line to About › Kdo vydání píše** — fill `about.authorshipContact` in `lib/i18n/dictionaries.ts`; it renders after the responsibility sentence on `/about#redakce`. [imp:3] [owner:me] [time:5m] [kind:content]
- [ ] **Put the site on its own domain before launch** — set the production domain on the Vercel project and `siteUrl()`, and redirect `caughtup-ai.vercel.app` to it permanently. [imp:4] [owner:me] [time:30m] [kind:deploy]
- [ ] **Decide the four English May editions** — keep them (marked „anglicky"), have them rewritten in Czech upstream, or retire them. [imp:2] [owner:me] [time:10m] [kind:decision]
- [ ] **Lift `noindex` on `/weekly` when a new digest ships** — steps in the implementation notes, open decision 4. [imp:2] [owner:me] [time:10m] [kind:decision]
- [ ] **Give `docs/EDITORIAL_RULES_2026-09.md` to the BoardlessAI writer prompt** — headline and dek limits, banned phrases, weekday checks, Czech `supports`, no URL shared between Briefs and the Watchlist, Czech-first lesson terms. [imp:3] [owner:me] [time:20m] [kind:content]
- [ ] **Retire `data/ai-facts.json` upstream** — the reader no longer shows it; stop the upstream appends first, then delete the file here. [imp:1] [owner:me] [time:10m] [kind:decision]

## Newly needed after the redesign

- [ ] **Settle the four publication days that never received a record** — `2026-08-09`, `08-10`, `08-11` and `08-29` have neither a Czech edition nor a NO_EDITION board record. `2026-08-17` is settled: the delivery bot's own ten-minute rollback was restored to `main` on 2026-08-30 after hash, validation, sentinel and render checks, and issue #52 is closed — if BoardlessAI's run log shows that rollback was for cause, revert merge `b6158d5`. The four remaining days still need BoardlessAI to deliver an edition whose `package_hash` matches its board record, or a `board-context/1` NO_EDITION record with a real `packageHash` and a truthful `noEditionReason`; their sentinel issues #36, #49, #50 and #53 are closed as not planned and say the same. This repository cannot write either artifact, because doing so would invent a hash and a reason for a run it has no record of. [imp:3] [owner:me] [time:30m] [kind:content]
- [ ] **Ask BoardlessAI to re-deliver the drawn SVG cover plates in the light palette** — seven delivered `hero.svg` plates are dark `#101116` panels with rounded corners and mint `#79f2c0` strokes, which is the pre-redesign theme rendered full width whenever such an edition leads. Two separate problems: `2026-08-03` is the oldest generator and also burns the headline into the artwork under a `CAUGHT UP · FRAME` kicker, so it carries the retired name; `2026-08-14`, `08-15`, `08-17` (restored with its edition), `08-18`, `08-19` and `08-28` come from the current generator, which already says DNESKAi and no longer repeats the headline but still emits the dark, rounded, mint plate. The newest of them is the 2026-08-28 edition, so this is live rather than historical, and every future plate will have it until the generator's palette moves. Illustration belongs to BoardlessAI under the media boundary in `CLAUDE.md`, so this repository must not redraw them; the reader side is already safe because live text is never overlaid on an `.svg` hero. [imp:3] [owner:me] [time:30m] [kind:content]
- [ ] **Resolve the 2026-08-08 source evidence** — the current build renders the body correctly (the old blank-body note was stale), but several source/claim associations are wrong. Tracked in [#72](https://github.com/lukaskourilcz/aifirst/issues/72) and quorum#518. Preserve delivery hashes and use an explicit editorial correction. [imp:5] [owner:ai] [kind:content]
- [ ] **Point the Vercel project at the DNESKAi name where it is public-facing** — the rename moved every page title, feed title, Open Graph card and JSON `publication` field. Anything outside this repository that still says Caught Up to a reader (deployment display name, any external listing) is the owner's to update. The canonical URL itself is unaffected. [imp:2] [owner:me] [time:15m] [kind:deploy]

## Already complete

- The devShark house promotion uses local 728×90, 320×100 and 300×250
  creatives from `config/banner.json`, labelled as the owner's own project. The partner belt follows the homepage
  completion mark, while the square creative fills reader rails without scripts
  or third-party tracking.

- The magazine-grade design set is built: the headline now sits on a paper
  plate inside the lead image on Today and on article pages, Today reads as a
  composed front page on one masthead and one spacing ladder, Briefs and
  Watchlist share a digest row on every surface, the article opening band and
  reading surfaces are aligned to that language, and Weekly, Archive and
  Related render through one cover card. The reader shows no raw machine dates
  anywhere: articles, archive, topics, corrections, weekly ranges, listing
  rows and the daily-fact receipt all render the Czech forms.

- The repository is public, which is what restores Actions: standard runners are
  unmetered on public repositories.
- The retired `ANTHROPIC_API_KEY` Actions secret is deleted, and a history sweep
  found no committed credential.
- Vercel Pro is confirmed; production is `main` and the reader is at
  `https://caughtup-ai.vercel.app`.
- Visitor analytics: Vercel Web Analytics pageviews only, restored for the
  November launch (#99); no custom events, no Speed Insights.
- The repository contains no scraper, editorial model client, article writer,
  media generator, social console or weekly/regeneration workflow.
- `/admin` is a noindex handoff link to the protected BoardlessAI social
  archive. This repository has no operator login and no content database.
- The daily lesson and the "Víte, že…" fact now sit in the right rail, and the
  `/lekce` archive is unchanged. They need no owner action: the datasets are
  committed, the pick is deterministic from the edition date, and appends arrive
  through the existing delivery channel (`data/README.md`).
- The six sections ship with valid empty envelopes in `data/talked-about.json`,
  `data/podcasts.json` and `data/events.json`, so every route renders from day
  one. Nothing is needed here until the quorum fetchers start delivering; a
  failed sync costs a section, never a build.
- The reader shows no production instrumentation. The publication-data strip,
  signal meter, status banner, provenance and making-of blocks are gone from
  every reader route, and the About page reads as a magazine. `/health` and
  `/api/health.json` keep the operator data unchanged.
