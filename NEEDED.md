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
- [ ] **Supply the 300×250 rail creative when a deal exists** — the redesign ships the square slot as a „Místo pro reklamu" placeholder; a real creative needs the image under `public/images/banners/` plus config, same rules as the belt slot. [imp:1] [owner:me] [time:20m] [kind:content]
- [ ] **Provide the social profile URLs** — the footer ships Facebook, Instagram, Threads and X as linkless icons; once the accounts exist, drop their URLs into the footer social config and the icons become links. [imp:2] [owner:me] [time:10m] [kind:content]

## Product decisions

- [x] **Confirm whether technical names should stay `aifirst`** — settled 2026-08-09 with the brand unification. The publication is DNESKAi everywhere a reader or a machine meets it; the repository, package, venture id and environment variables stay `aifirst`/`caught-up` as stable identifiers, and `brand.legalName` stays Caught Up.

## Partner slot

- [ ] **Supply the devShark banner creative and its target URL** — the slot `today-partner-belt` is built and empty. It needs a 728×90 and a 320×100 image committed under `public/images/banners/`, the alt text, and the destination link; then flip `active` to `true` in `config/banner.json`. Until all of that exists the slot renders nothing, which is the correct state. [imp:2] [owner:me] [time:20m] [kind:content]

## Optional reader operations

- [ ] **Add a read-only GitHub token in Vercel only if private workflow history should appear in health** — set `GITHUB_TOKEN` with the narrowest repository read permission; the public health JSON never exposes it. [imp:2] [owner:me] [time:20m] [kind:deploy]
- [ ] **Enable semantic related-issue refresh only if tag overlap is insufficient** — create a Jina key and run `pnpm embed:refresh`; this enriches the static reader and is not an editorial fallback. [imp:1] [owner:me] [time:20m] [kind:setup]
- [ ] ~~Connect the sentinel to OwnDashboard~~ — retired. The Actions-minutes diet removed the sentinel's callback, so `OWNDASHBOARD_CRON_URL` and `OWNDASHBOARD_CRON_TOKEN` are read by no workflow and no code in this repository; setting them would do nothing. OwnDashboard integration, where it still exists, is read-side only: it polls the public health JSON and needs nothing configured here.

## Newly needed after the redesign

- [ ] **Settle the five publication days that never received a record** — `2026-08-09`, `08-10`, `08-11`, `08-17` and `08-29` have neither a Czech edition nor a NO_EDITION board record, so the daily sentinel keeps them open as issues #36, #49, #50, #52 and #53. Each needs BoardlessAI to deliver one or the other: an edition whose `package_hash` matches its board record, or a `board-context/1` record carrying a real `packageHash` and a truthful `noEditionReason`. This repository cannot close them, because writing either artifact here would mean inventing a hash and a reason for a run it has no record of. `2026-08-17` is the one that needs a judgment call rather than a re-run: it was delivered as `2026-08-17-openai-preparedness-tym-stripe-openrouter` and then reverted in `6d31084` with no reason recorded, so the choice is to reissue it or to state why it was pulled. [imp:3] [owner:me] [time:30m] [kind:content]
- [ ] **Ask BoardlessAI to re-deliver the drawn SVG cover plates in the light palette** — six delivered `hero.svg` plates are dark `#101116` panels with rounded corners and mint `#79f2c0` strokes, which is the pre-redesign theme rendered full width whenever such an edition leads. Two separate problems: `2026-08-03` is the oldest generator and also burns the headline into the artwork under a `CAUGHT UP · FRAME` kicker, so it carries the retired name; `2026-08-14`, `08-15`, `08-18`, `08-19` and `08-28` come from the current generator, which already says DNESKAi and no longer repeats the headline but still emits the dark, rounded, mint plate. The newest of them is the 2026-08-28 edition, so this is live rather than historical, and every future plate will have it until the generator's palette moves. Illustration belongs to BoardlessAI under the media boundary in `CLAUDE.md`, so this repository must not redraw them; the reader side is already safe because live text is never overlaid on an `.svg` hero. [imp:3] [owner:me] [time:30m] [kind:content]
- [ ] **Decide what to do about the blank 2026-08-08 edition** — that edition renders a headline and no body. Its delivered MDX wraps the whole body in a JSX expression, so MDX evaluates it to nothing; every other edition renders normally. It is the newest edition, so it is currently the lead on the front page. Editing a delivered edition risks the same-date replay guard, so the call is the owner's: correct the file, or reissue it upstream. [imp:5] [owner:me] [time:20m] [kind:content]
- [ ] **Point the Vercel project at the DNESKAi name where it is public-facing** — the rename moved every page title, feed title, Open Graph card and JSON `publication` field. Anything outside this repository that still says Caught Up to a reader (deployment display name, any external listing) is the owner's to update. The canonical URL itself is unaffected. [imp:2] [owner:me] [time:15m] [kind:deploy]

## Already complete

- The magazine-grade design set is built: the headline now sits on a paper
  plate inside the lead image on Today and on article pages, Today reads as a
  composed front page on one masthead and one spacing ladder, Briefs and
  Watchlist share a digest row on every surface, the article opening band and
  reading surfaces are aligned to that language, and Weekly, Archive and
  Related render through one cover card. The reader's raw ISO dates are gone
  from the article page and the archive.

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
