# Implementation notes: pre-launch audit, 2026-09

Branch `claude/audit-2026-09`. One commit per numbered item, message prefix `audit <item>:`. Every commit passed `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm check:content` and `pnpm build`. At the end `pnpm verify` (with the bundle guard) and `pnpm e2e` (207 tests across desktop, tablet and mobile) passed, and the home and article pages were checked in a browser at 1440 and 390 px. The bundle guard's largest page entry dropped from 103.9 kB on `main` to 103.4 kB.

## What was done

### Shared building blocks

- **S1** `lib/labels.ts`: `topicLabel` covers every tag present in the MDX plus the legacy English tags (about 130 slugs). Free-text dispatch topics that are already Czech pass through; known English labels such as „Cybersecurity“ are translated; an unknown slug returns `null`. `sourceName` resolves the feed map, then the registry, then free text, then the host. Also `topicLabels`, `classificationLabel`, `photoCreditParts`, `sourceClass`, `monogram` and `provenanceSentence`.
- **S2** Evidence class maps to primární/sekundární/neurčeno. The photo credit is rebuilt as „Foto: autor / Pexels“ with the link on the name. `supports`, `source_type`, `attribution.text` and `noEditionReason` no longer render.
- **S3** `czechWeekdayDate`, `czechMonthLabel` and, as a follow-up, `czechDatesInText` for delivered alt text. No ISO date is left in a text node of the built HTML; the only matches are `/articles/<date>-…` paths in the print footers.
- **S4** `--kicker-size` and `--kicker-tracking`, one `.kicker` rule shared by the sixteen listed classes, one `.chip` with evidence modifiers.
- **S5** `lib/typography.ts`: quote pairing, one-letter-word NBSP, number–unit NBSP, number ranges, dashes, double spaces. Camel-case joins are reported by `typographyCandidates` and never rewritten.

### P0

- **P0-01** `homeEditionState` in `lib/board.ts`. A `no_edition` record counts as a missed day only on a weekday. On Saturday 26. 9. the build leads with „Poslední vydání · pátek 25. 9. 2026“ and the dateline reads „DNESKAi · sobota 26. září 2026“. Tests cover Saturday, Sunday, a missed Wednesday and a normal weekday.
- **P0-02** The archive system row is one line: „24. září 2026 · bez vydání“.
- **P0-03** The ledger has three columns. An aggregator row shows the real host and „· přes TensorFeed“.
- **P0-04** About gains „02 Kdo vydání píše“ (`#redakce`). The masthead and the print view carry the provenance sentence.
- **P0-05** `/weekly` is unlinked and noindex, has no W or FeedActions, uses an en-dash range and Czech topic labels.
- **P0-06** The subscribe module is deleted.
- **P0-07** AI Pulse, Sparkline, `lib/pulse.ts`, the refresh script, `pulse.json` and the `pulse:refresh` script are deleted. `/pulse` redirects.
- **P0-08** A source is cited when `source_id` or `id` matches, or when the article host equals the registry host (with `www.`, `feeds.` and `rss.` stripped). Checked against the 25. 9. edition: The Verge 3, The Register 2, Google Research 1, Platformer 1, TensorFeed 1. The card counts **editions** (once per edition), so The Verge shows „21 vydání · naposledy 25. 9. 2026“. Registry entries never cited dropped from 27 of 35 to 9 of 35.
- **P0-09** All the listed copy is replaced; the repository link is gone from the empty home state.
- **P0-10** Typography applies on read in `lib/content.ts` (Czech files only, so the committed MDX and every hash stay byte-identical), to the MDX body through a remark plugin in `components/Mdx.tsx`, to lesson glosses, and to the whole Czech dictionary.

### P1

- **P1-11** The rail is 4 + 4. `g r` is removed. `g g` opens `/lekce`, the page the rail calls Slovník (it used to open `/glossary`).
- **P1-12** Labels are in place at every listed site. Radar bars and topic entities are not labelled because P1-20 and P1-21 delete them.
- **P1-13** FeedActions is deleted. The footer has „RSS ↗“ and each topic page has „RSS tohoto tématu ↗“.
- **P1-14** The completion row appears on Today only.
- **P1-15** The partner belt is gone. The label comes from the new `label` field in `banner.json`. AdPlaceholder and the placeholder logic in `lib/banner.ts` are deleted; `placeholder: false` stays in the config as the audit asked, but nothing reads it now.
- **P1-16** DidYouKnow and `lib/facts.ts` are deleted, and so is the lesson strip variant. The link reads „Celé heslo →“ with one arrow.
- **P1-17** The eyebrow reads „Vydání · pátek 25. 9. 2026“. The print link is gone; the route remains.
- **P1-18** `watchlistWithoutBriefs` normalises URLs and drops duplicates. On 25. 9. the Watchlist goes from 6 items to 3.
- **P1-19** `docs/EDITORIAL_RULES_2026-09.md`.
- **P1-20** `/radar`, `/stats`, `/trends` and `/pulse` redirect to `/topics`. `lib/radar.ts` and `/api/radar.json` are deleted.
- **P1-21** Czech slugs are added to every topic and `minimumIssues` is 3. All seven topics publish, with 5 to 34 editions each. A topic page is one list plus related glossary terms. `/tags` and `/tags/[tag]` are noindex. The source profile page no longer links its tags to `/tags/`.
- **P1-22** The archive row kicker is the long date plus „týdenní souhrn“ or „anglicky“. English titles carry `lang="en"`.
- **P1-23** `/search` redirects to `/archive`. The palette's empty state suggests the published topics. The search-page strings (`introAfter`, `fullIndex`, the ⌘K / Ctrl K line) were deleted with the page instead of being reworded.
- **P1-24** The Slovník AI copy is in. The „· Dnes“ marker is hidden once `count >= total`.
- **P1-25** Three groups, the new card anatomy, and a letters-only monogram. The source profile page also lost its weight and its `type · id` intro.
- **P1-26** Health measures freshness in publishing days against the newest board record. There is no build clock and no age row.
- **P1-27** The OG images moved out of `[lang]`: `app/opengraph-image.tsx` and `app/(print)/articles/[slug]/opengraph-image.tsx`, with a middleware pass-through. A photo-less article points at its own card explicitly. The built article now has `twitter:title` equal to its headline. `brand.description` is Czech.
- **P1-28** Two footer columns; SocialRow is deleted.
- **P1-29** Done mostly in S4. The ledger and lesson table headers, the week-action kicker and the day-group label joined the shared rule.
- **P1-30** Everything on the list is done. Unused keys went with it (`dispatchesHeading`, `discoverPreviousWeek`, `sections.today/yesterday`, the Dispatches `default` variant).

### P2

- **P2-31** ReadingProgress is deleted.
- **P2-32** The drop cap, the dashed system row and the 4px status stripe are gone.
- **P2-33** IssueRow and TagChip are deleted; `FeedRow compact` replaces them. There is one `.empty-line`. A missed weekday is now a line above the newest edition instead of a headline. Inline styles moved into classes, and the `--color-*` and `--ink-*` aliases were folded into the semantic tokens with the same hex values. This commit's cleanup regex also removed the shared kicker font rule and the mobile `.def-row` rule; the screenshot check caught it and a separate `fix:` commit restored both.
- **P2-34** Czech-first terms render for 28 of the 60 lessons, for example „Strojové učení (machine learning)“.
- **P2-35** The colophon, stats, trends, pulse and admin namespaces and the unused `home.*` keys are deleted. 404 and 500 use ← and „kód chyby“.
- **P2-36** `color-scheme: light`.
- **P2-37** No signal-strength copy is left in the dictionary (it went with the colophon and stats namespaces), and nothing renders the field.

## Deliberately not done, or done differently

- **`data/ai-facts.json` was not deleted (P1-16).** `docs/GOVERNANCE.md` lists it as an authorized upstream delivery path. Deleting it here would break the next append, or come back with it. The widget and its loader are gone, and the dataset test still gates the file. Retire it upstream first, then delete it.
- **`data/ai-lessons.json` was not edited (P2-34).** `data/README.md` says existing entries are never edited. Czech-first terms and typography are applied when the file is read. The upstream writer should adopt the terms for new entries.
- **`/ai-modely` is not empty.** It has one categorised edition. It stays noindex and unlinked because one edition is too thin for a section; the comment in the page says when to lift it. The e2e empty-state test now accepts either state for `/ai-modely`, `/o-cem-se-mluvi` and `/podcasty`, whose streams now carry synced items.
- **The masthead category chip was removed.** It linked to `/ai-modely`, which is now unlinked. The `categories` field and `FeedRow`'s category kicker remain.
- **The unused banner creatives** `devshark-728x90.svg` and `devshark-320x100.svg` stay in `public/images/banners/`. They are cheap, and a later placement may want them.
- **`/api/health.json` still uses the build clock.** It is operator telemetry, not a reader surface, and the audit did not list it.
- **`lib/trends.ts`** is dead code now (only its test uses it). The audit did not list it, so it is left alone.
- **Legacy `/cs/*` Open Graph URLs** no longer exist. Anything that cached one gets a 404 instead of the old redirect.
- **The lesson terms in brackets** (for example „(machine learning)“) are not marked `lang="en"`.

## Open decisions for the owner

1. **Contact line in About.** `about.authorshipContact` in `lib/i18n/dictionaries.ts` is empty, and `#redakce` renders without it. Add an e-mail or another contact and it appears after the responsibility sentence.
2. **Custom domain before launch.** `siteUrl()` still resolves to the Vercel host (built metadata shows `aifirst.example` locally). Set the production domain, and make `dneskai.vercel.app` redirect to it permanently so canonicals, OG images and feeds carry one host.
3. **The four English May editions.** They stay reachable, marked „anglicky“ in the archive and `lang="en"` on their titles. Keep, translate upstream, or retire them.
4. **When to lift `noindex` on `/weekly`.** Once a new digest ships: delete `robots: { index: false }` in `app/[lang]/weekly/page.tsx`, return `/weekly` to `app/sitemap.ts`, and decide whether it goes back into the rail or the footer.
5. **Signal strength.** `signal_strength` stays in frontmatter and is not rendered. Whether readers ever see it is a product decision for after launch.
6. **Merging `/lekce` and `/glossary`.** Both are „slovník“ now: `/lekce` in the rail and footer, `/glossary` behind the issue glossary blocks. Merging them is a follow-up and was not attempted.
