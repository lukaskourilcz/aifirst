# NEEDED — manual owner actions for DNESKAi

DNESKAi is a static Czech reader. BoardlessAI owns source collection,
edition meetings, writing, Czech localization, illustrations, social drafts and
delivery. This file contains only actions that require the owner’s accounts,
credentials or judgment; there is no second generation setup to maintain here.

## Required for unattended BoardlessAI delivery

- [ ] **Finish the Vercel half of the credential audit** — the retired `ANTHROPIC_API_KEY` Actions secret was deleted from `lukaskourilcz/aifirst` on 2026-08-07. Still open: remove any old source, image, promotion, heartbeat or generation-report credentials from the aifirst Vercel project, and rotate keys previously pasted into chat. Do not remove Quorum’s active producer credentials. The old OwnDashboard sentinel pair can go too — nothing reads it any more. [imp:4] [owner:me] [time:15m] [kind:setup]

## Redesign hand-off

- [x] **Run the Claude Design prompt** — done 2026-08-09; the output is committed as `docs/redesign/design-spec.md` and is the authoritative design.
- [x] **Kick off the Opus build** — done 2026-08-09. The reader half is built: theme, shell, telemetry removal, data layer, ad slot, front page, article page, the six section routes, the brand unification and this documentation pass.
- [x] **Answer the brand gate on issue #47** — approved 2026-08-09: the official name is DNESKAi. Recorded on the issue; the kickoff schedules the rename right before the documentation pass.
- [ ] **Confirm the curated source registries** — approve or edit the seed list in quorum's `config/caught-up-streams.json`: three Medium tags, nine Substacks and eight podcast shows, of which eight ship disabled because their channel id could not be resolved without guessing, plus two empty slots for the Czech AI shows you pick. [imp:3] [owner:me] [time:30m] [kind:decision]
- [ ] **Create the free Podcast Index API key** — register at api.podcastindex.org and add `PODCASTINDEX_API_KEY` + `PODCASTINDEX_API_SECRET` to the quorum Actions secrets; the podcast stream falls back to YouTube-only until then. [imp:3] [owner:me] [time:15m] [kind:setup]
- [ ] **Provide the social profile URLs** — the footer ships Facebook, Instagram, Threads and X as linkless icons; once the accounts exist, drop their URLs into the footer social config and the icons become links. [imp:2] [owner:me] [time:10m] [kind:content]

## Product decisions

- [x] **Confirm whether technical names should stay `aifirst`** — settled 2026-08-09 with the brand unification. The publication is DNESKAi everywhere a reader or a machine meets it; the repository, package, venture id and environment variables stay `aifirst`/`caught-up` as stable identifiers, and `brand.legalName` stays Caught Up.
- [ ] **Pick the email provider and fill `config/subscribe.json`** — the subscribe form, the edition email and the CSP are built and inert; the file ships empty, so the rail offers Atom only. Paste the provider's form endpoint, the field name it expects the address under, any hidden fields it needs, and a consent sentence in Czech and English, and the form appears with the provider's origin added to `form-action`. Ecomail and beehiiv are hosted forms and need nothing else; Resend has no hosted form, so choosing it also means deciding where the list lives, which this repository cannot host. Prices and the architectural trade-off are in `docs/distribution-email.md`; the account itself is yours to create. [imp:3] [owner:me] [time:30m] [kind:decision]
- [ ] **Say what the consent sentence is** — it goes in `privacyNote` in `config/subscribe.json` and the form will not render without it. `/about` currently tells readers the site collects nothing about them, and that stops being true the day a list exists, so the `/about` privacy section needs the same wording. This is a legal statement and must not be drafted here. [imp:3] [owner:me] [time:20m] [kind:legal]
- [ ] **Decide the referral perk, once there is a list** — issue #89 gates it on the list existing and names three candidates: early delivery, an ad-free edition, a printed Weekly. Each is a different promise with a different cost, and the site does not advertise a perk that is not real, so nothing is built until you pick one. [imp:2] [owner:me] [time:20m] [kind:decision]

## Optional reader operations

- [ ] **Add a read-only GitHub token in Vercel only if private workflow history should appear in health** — set `GITHUB_TOKEN` with the narrowest repository read permission; the public health JSON never exposes it. [imp:2] [owner:me] [time:20m] [kind:deploy]
- [ ] **Enable semantic related-issue refresh only if tag overlap is insufficient** — create a Jina key and run `pnpm embed:refresh`; this enriches the static reader and is not an editorial fallback. [imp:1] [owner:me] [time:20m] [kind:setup]
- [ ] ~~Connect the sentinel to OwnDashboard~~ — retired. The Actions-minutes diet removed the sentinel's callback, so `OWNDASHBOARD_CRON_URL` and `OWNDASHBOARD_CRON_TOKEN` are read by no workflow and no code in this repository; setting them would do nothing. OwnDashboard integration, where it still exists, is read-side only: it polls the public health JSON and needs nothing configured here.

## Newly needed after the redesign

- [ ] **Decide whether the archive also needs `/llms-full.txt`** — `/llms.txt` and one `/articles/<slug>.md` per edition now ship. The llms.txt proposal also allows a single file with every document inlined; DNESKAi does not publish one, because concatenating the archive would be a multi-megabyte response that adds nothing over the index plus the per-edition markdown, and it grows with every edition. If an assistant vendor you care about only reads the full form, say so and it becomes a small build step. [imp:1] [owner:me] [time:10m] [kind:decision]
- [ ] **Decide how the feed reaches Seznam Newsfeed** — the Atom feeds are now valid offline (`pnpm check:feeds` runs the RFC 4287 checks the W3C Feed Validation Service reports, which itself needs a live public URL and can be run against `/feed.xml` once deployed). Two things this repository cannot settle: the Seznam Newsfeed application needs your Seznam account, and Seznam expects RSS 2.0 while DNESKAi publishes Atom only. Adding a second feed format is a distribution-contract change, so it needs your decision before anyone builds it. [imp:3] [owner:me] [time:30m] [kind:decision]
- [ ] **Register the Seznam Partner account and submit the site** — create the account on your IČO at partner.seznam.cz, add the deployed site and file the Newsfeed application. Already in place: HTTPS, a responsive layout, the `app/icon.svg` favicon and the validated feeds. Two prerequisites are not: no editorial contact address is published anywhere on the site, and Seznam's accepted feed format is the open decision above. Review takes up to 15 working days and a rejected site waits 30 days before reapplying, so settle both before filing. [imp:3] [owner:me] [time:45m] [kind:setup]
- [ ] **Say which mailbox is the editorial contact** — Seznam Newsfeed wants a visible one, and `/about` and `/partner` both have a place for it, but the address is yours to choose and this repository must not invent one. Name the mailbox and the display line and it becomes a one-line dictionary change in both locales. [imp:2] [owner:me] [time:10m] [kind:decision]
- [ ] **Ask BoardlessAI for a raster publisher logo** — the Organization node in the structured-data graph points at `/brand/completion-mark.svg`, the only brand file this repository has. Google's publisher-logo guidance wants a raster image of at least 112x112 px, and illustration belongs upstream under the media boundary, so the file has to be delivered rather than drawn here. [imp:2] [owner:me] [time:15m] [kind:content]
- [ ] **Settle the four publication days that never received a record** — `2026-08-09`, `08-10`, `08-11` and `08-29` have neither a Czech edition nor a NO_EDITION board record. `2026-08-17` is settled: the delivery bot's own ten-minute rollback was restored to `main` on 2026-08-30 after hash, validation, sentinel and render checks, and issue #52 is closed — if BoardlessAI's run log shows that rollback was for cause, revert merge `b6158d5`. The four remaining days still need BoardlessAI to deliver an edition whose `package_hash` matches its board record, or a `board-context/1` NO_EDITION record with a real `packageHash` and a truthful `noEditionReason`; their sentinel issues #36, #49, #50 and #53 are closed as not planned and say the same. This repository cannot write either artifact, because doing so would invent a hash and a reason for a run it has no record of. [imp:3] [owner:me] [time:30m] [kind:content]
- [ ] **Ask BoardlessAI to re-deliver the drawn SVG cover plates in the light palette** — seven delivered `hero.svg` plates are dark `#101116` panels with rounded corners and mint `#79f2c0` strokes, which is the pre-redesign theme rendered full width whenever such an edition leads. Two separate problems: `2026-08-03` is the oldest generator and also burns the headline into the artwork under a `CAUGHT UP · FRAME` kicker, so it carries the retired name; `2026-08-14`, `08-15`, `08-17` (restored with its edition), `08-18`, `08-19` and `08-28` come from the current generator, which already says DNESKAi and no longer repeats the headline but still emits the dark, rounded, mint plate. The newest of them is the 2026-08-28 edition, so this is live rather than historical, and every future plate will have it until the generator's palette moves. Illustration belongs to BoardlessAI under the media boundary in `CLAUDE.md`, so this repository must not redraw them; the reader side is already safe because live text is never overlaid on an `.svg` hero. [imp:3] [owner:me] [time:30m] [kind:content]
- [ ] **Resolve the 2026-08-08 source evidence** — the current build renders the body correctly (the old blank-body note was stale), but several source/claim associations are wrong. Tracked in [#72](https://github.com/lukaskourilcz/aifirst/issues/72) and quorum#518. Preserve delivery hashes and use an explicit editorial correction. [imp:5] [owner:ai] [kind:content]
- [ ] **Set the CZK prices on the partner rate card** — `/partner` is live and lists three packages: the Today belt (728×90 and 320×100), the right-rail square (300×250) and the in-edition sponsor block. Every `priceCzk` in `config/partner.json` is `null`, so the page says "cena na vyžádání" rather than inventing a number. Fill the three prices, and set `vatNote` to your wording about DPH (the page says the VAT question is unsettled until you do). EJAJ.cz sells Bronze from 2 900 CZK and Silver from 6 900 CZK; that is an anchor for the Czech market, not a price to copy. Which entity invoices is also yours to settle, because `brand.legalName` is still Caught Up while the publication is DNESKAi. [imp:3] [owner:me] [time:30m] [kind:decision]
- [ ] **Publish a partner contact** — `config/partner.json` ships `booking: { "kind": "none" }`, so `/partner` states that no contact is published yet and shows no button. Give it one and the button appears: either `{ "kind": "email", "href": "mailto:…" }` with a mailbox you read, or `{ "kind": "external", "href": "https://…" }` pointing at a storefront or a calendar (Passionfroot is free for creators and pre-schedules dates; Calendly plus an invoice works the same way). The link is a plain outbound anchor with no script, so it needs no CSP change. Nothing else in this repository has a contact address, so this is the one place a partner can reach you. [imp:3] [owner:me] [time:20m] [kind:setup]
- [ ] **Decide whether to sell the Weekly belt, and to whom** — the sponsorship inventory is now declared and capped in `config/banner.json`: `today-partner-belt` and `rail-square` carry the reciprocal MMA FILES creatives, and the third placement, `weekly-belt` on `/tyden` and `/tyden/[week]`, ships declared but unsold, so it renders nothing and reserves no space. Filling it needs a partner, a destination and a local creative, which is a sponsorship decision rather than an implementation step. Adding a fourth placement instead means raising `inventory.maxPerEdition`, and the cap is the reading promise the `/about` sponsorship section makes to readers. [imp:2] [owner:me] [time:20m] [kind:decision]
- [ ] **Point the Vercel project at the DNESKAi name where it is public-facing** — the rename moved every page title, feed title, Open Graph card and JSON `publication` field. Anything outside this repository that still says Caught Up to a reader (deployment display name, any external listing) is the owner's to update. The canonical URL itself is unaffected. [imp:2] [owner:me] [time:15m] [kind:deploy]

## Already complete

- The reciprocal MMA FILES promotion uses local 728×90, 320×100 and 300×250
  creatives from `config/banner.json`. The partner belt follows the homepage
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
- Visitor and engagement analytics are deliberately absent for this phase.
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
