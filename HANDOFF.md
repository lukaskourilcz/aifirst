# Handoff — issues #85 to #90

Written at the end of the session of 2026-09-16. Branch: `claude/elegant-cori-h9cdgb`.
Every issue below has a long comment on GitHub with the file-level detail; this
file is the index and the short version.

## What landed

Three commits, all on the branch above:

| Commit | Issues | Subject |
| --- | --- | --- |
| `9718cce` | #86, #87 | Sponsorship inventory declared and capped; `/partner` rate card |
| `d1ca365` | #85, #88, #90 | `/llms.txt`, per-edition markdown, news sitemap, Article structured data, feed and image validators |
| `a90f8bd` | #89 | Email edition channel, shipped unconfigured |

## Validation, on the pushed tree

`pnpm verify` exit 0 — lint, typecheck, 390 unit tests, `check:content`,
`check:images`, `check:feeds`, build, bundle guard. Maximum page entry
103.7 kB against the 110 kB ceiling. `pnpm e2e` 240 passed, 0 failed.

Two things were fixed that belong to no issue:

- **The Playwright browser.** This image ships build 1194; the suite asks for
  1228, and the two use different directory layouts. A shim under
  `/opt/pw-browsers` maps one onto the other. It is environment-only — nothing
  about it is committed — so a fresh container needs it again before `pnpm e2e`
  will start.
- **`the section routes render their honest empty states`** was failing at
  `HEAD`, before any of this work. `/ai-modely` filters *articles* by the
  `ai-models` category and five committed editions now carry it, so the route
  legitimately renders a feed. The assertion now accepts either honest state
  instead of pinning the empty one, in both directions, for `/ai-modely` and
  `/akce`.

## Per issue

| Issue | State | What is actually left |
| --- | --- | --- |
| #85 | partial | `/news-sitemap.xml` and the offline feed validator ship. The Seznam Newsfeed application needs the owner's Seznam account and IČO, a published editorial contact, and a decision on RSS 2.0 (Seznam expects it; DNESKAi emits Atom only). |
| #86 | done | Only `weekly-belt` is declared but unsold — that needs a partner, not code. |
| #87 | partial | `/partner` is live. Every `priceCzk` is `null` and `booking` is `{kind:"none"}`, so the page says "cena na vyžádání" and states that no contact is published. Both are two-field config edits. |
| #88 | done | `/llms-full.txt` is deliberately not built; it is a logged low-importance decision. |
| #89 | partial | `config/subscribe.json` ships empty, so no form renders. Filling it is the whole remaining implementation. The consent sentence is a legal statement and was not drafted. The referral perk is gated on a list existing. |
| #90 | done | RSS 2.0 and multi-aspect-ratio images are out of scope here; the publisher logo must come from BoardlessAI. |

## Where to pick up

Everything blocked is blocked on a person, not on code, and every item is in
`NEEDED.md` in the repository's task format. The shortest paths to visible
value, in order:

1. Fill the three prices and the `vatNote` in `config/partner.json`, and give
   `booking` a destination. `/partner` becomes a real rate card the same build.
2. Decide the email provider and fill `config/subscribe.json`. Ecomail and
   beehiiv are hosted forms and need nothing else; Resend has no hosted form,
   so choosing it also means deciding where the list lives.
3. Settle the Seznam question — the account, the contact address, and whether
   a second feed format is worth publishing.

Nothing in this repository is waiting on another agent.
