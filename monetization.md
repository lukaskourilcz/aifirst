# Caught Up — monetization

A Czech technology briefing produced by BoardlessAI and served as a static
reader. Revenue depends on trust and audience; the producer boundary does not
change the need for sponsor approval, disclosure and measurable traffic.

| Option | Likelihood of income | Possible earnings | Pros | Cons |
|---|---|---|---|---|
| **Display ads (contextual, privacy-friendly)** | Medium | $0–500/mo | Passive; scales with traffic | Needs real traffic; can hurt UX |
| **Newsletter / sponsor slots** | Medium | $0–1,000/mo | High CPM; direct deals | No list exists yet; see below |
| **Paid membership / ad-free tier** | Low–Medium | $0–400/mo | Recurring; aligns with quality | Hard to convert without a moat |
| **Affiliate links (tools, courses)** | Low | $0–150/mo | Passive; fits tech content | Low conversion; disclosure needed |
| **Buy Me a Coffee / donations** | Low | $0–80/mo | Zero setup | Small and irregular |

**Recommendation:** grow the newsletter first (sponsor slots have the best
CPM), add contextual ads once traffic is real; keep a light donation link.

## The email edition

There is no list. The mechanism is built and inert: `config/subscribe.json`
ships empty, so the rail offers Atom alone and no address is collected anywhere,
while `pnpm generate:artifacts` already renders every published edition into a
provider-independent HTML and plain-text email under the gitignored
`generated/`. Filling in a provider's form endpoint and a consent sentence turns
the form on; nothing in this repository sends mail or holds a subscriber.

Until then the newsletter row above is a plan rather than an asset, and
`/partner` quotes no subscriber count for the same reason it quotes no traffic.
`docs/distribution-email.md` records the three candidate providers, what each
costs architecturally, and the decisions that are the owner's.

## The sponsorship inventory

`config/banner.json` declares the whole inventory and caps it. Three placements
exist and no fourth can be added without changing that file:

| Slot | Where | Size | State |
|---|---|---|---|
| `today-partner-belt` | Today, after the completion mark | 728×90 and 320×100 | sold to the reciprocal MMA FILES promotion |
| `rail-square` | the right rail on Today, articles and the section pages | 300×250 | sold to the same reciprocal promotion |
| `weekly-belt` | `/tyden` and `/tyden/[week]`, after the closing action | not yet set | declared and unsold, renders nothing |

The caps are three filled creatives across the configuration and two on any one
surface, which is why no page shows more than two. `pnpm check:content` fails on
a configuration that breaks either cap or that carries a slot the inventory does
not declare, so the limit is enforced rather than remembered.

## The rate card

`/partner` publishes that table as a reader-facing page: three packages (the
Today belt, the right-rail square and the in-edition sponsor block), the live
inventory with its sizes and sold state, the countable facts about the magazine,
the advertising rule, and one way to get in touch. `config/partner.json` carries
the commercial values only and `pnpm check:content` validates it.

Two fields are deliberately empty. `priceCzk` is `null` on every package, so the
page quotes "cena na vyžádání" instead of a number nobody agreed to, and
`booking` is `kind: "none"`, so the page states that no contact is published yet
instead of showing a dead button. Both are owner decisions and both are tracked
in `NEEDED.md`. EJAJ.cz sells Bronze from 2 900 CZK and Silver from 6 900 CZK,
which is a local anchor to price against rather than a price to copy.

The page quotes no traffic, no subscriber count and no open rate, because this
site measures none of them and will not guess. It offers what can be counted
instead: editions in the archive, how far back they go, sources in the registry,
curated topics and the publishing rhythm.

Filling a slot means committing a local image and a destination: no ad network,
no script, no tracking, so it stays inside the CSP and costs nothing to serve.
That is the direct-deal path in the table above, not the programmatic one, which
this repository does not permit. Scarcity is the pricing argument as well as the
reading promise, and the written rule on `/about` is part of the product: paid
placement never decides which story leads, how stories are ordered, or what
reaches Briefs and Watchlist.
