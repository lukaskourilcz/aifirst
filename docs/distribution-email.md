# The email edition

DNESKAi has no email list. This document records what the site already builds,
what the owner still has to decide, and what each of the three candidate
providers costs this repository architecturally rather than only in money.

Tracked in [issue #89](https://github.com/lukaskourilcz/aifirst/issues/89).

## What ships now

Two halves, both provider-independent, both inert until a provider is chosen.

**The subscribe surface.** `config/subscribe.json` is the whole configuration:
a provider name, the provider's form endpoint, the field name it expects the
address under, any hidden fields it needs, and a consent sentence in both
content languages. It ships empty, so `lib/subscribe.ts` resolves it to `null`,
`SubscribeForm` renders nothing, and the rail's subscribe module is the Atom
link alone. `lib/__tests__/subscribe.test.ts` is the gate.

The parsing is fail-closed in the same way `lib/banner.ts` is. A non-https
endpoint, an endpoint carrying credentials, a hidden field that is not a string,
and a missing consent sentence each read as no channel rather than as a partly
configured one — a broken configuration costs the form, never the build.

`privacyNote` is required rather than optional. A form that collects an address
without a stated privacy line is the one thing this surface must not render, and
making the note part of the channel means the form cannot appear without it.

**The CSP.** `next.config.mjs` re-derives the provider origin from the same
file with the same rules and appends it to `form-action`. Without that the
browser blocks the submission, and a form that silently fails is worse than no
form. While the configuration is empty the directive stays at exactly
`form-action 'self'`, which both `lib/__tests__/subscribe.test.ts` and
`e2e/smoke.spec.ts` assert. The config file cannot import a TypeScript module,
so the rules exist twice; the unit test is what keeps the two honest.

**The edition email.** `lib/distribution/newsletter.ts` renders every published
edition — not only the weekly digest, as it used to — into `email.html`,
`email.txt` and `metadata.json` under the gitignored `generated/`, through
`pnpm generate:artifacts`. The template follows the reading page: why it
matters, what changed, what stays uncertain, Briefs, Watchlist, corrections, the
labelled sponsor, the source ledger, the completion mark and the canonical link.
Every block is omitted when its field is absent. Production instrumentation
never enters it; `frontmatter.generation` is not reader-facing here either.

Nothing in this repository sends mail, holds a list or stores an address. The
artifacts are files on disk for whichever provider the owner picks.

## The three options

Prices as stated on issue #89, checked 2026-09-16. Verify them before signing
anything; none of them has been checked against the providers since.

| Provider | Price as recorded | What it costs this repository |
| --- | --- | --- |
| Ecomail | Czech, CZK billing, free up to 200 emails a month, Profi 150 CZK/month billed annually | A hosted form. Needs an endpoint URL, the field names and the CSP origin — exactly what `config/subscribe.json` holds. Nothing else changes. |
| beehiiv | Free Launch plan up to 2,500 subscribers; referral program and ad network from Scale (43 USD/month annual) | A hosted form, same shape as Ecomail. The referral program is the provider's own and lives outside this repository. |
| Resend Broadcasts | Free 3,000 transactional emails a month and 1,000 marketing contacts | Does not fit as-is. It has no hosted subscribe form, so the list has to be managed somewhere, and this repository forbids a runtime handler, per-request generation, a content database and reader records. Choosing Resend means deciding where the list lives — Quorum, or a function outside this repository — before any of it can be built. |

Ecomail and beehiiv are therefore configuration; Resend is an architecture
decision. That difference is not in the issue and is the main thing the choice
turns on.

## What the owner still decides

1. **The provider.** It determines the endpoint, the hidden fields, the CSP
   origin, and whether list management can sit outside this repository at all.
2. **The account and its list id.** No checkout can create either.
3. **The consent sentence**, in Czech and English. `/about` currently tells
   readers that the site collects nothing about them, and that claim changes the
   day a list exists. The sentence is a legal statement, so this repository must
   not draft one.
4. **Sending.** Nothing here delivers mail. The artifacts are pasted or uploaded
   into the provider by hand until the owner decides otherwise.

## The referral perk

Deferred, and gated twice. The issue itself makes the perk conditional on the
list existing, and this repository does not advertise something that is not
real. Early delivery, an ad-free edition and a printed Weekly are all mentioned
on the issue; each is a different promise with a different cost, and none of
them can be built before there is somebody to promise it to.
