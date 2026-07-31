# Caught Up product governance

Caught Up is Venture 001 of BoardlessAI by owner decision dated 2026-08-01.
BoardlessAI may deliver validated article, illustration and board-data files.
It has no write path to Caught Up code.

## Ring 1: autonomous

The board may select one daily story or record `NO_EDITION`, write bilingual
article content inside the quality gates, create deterministic social drafts,
choose the publishing rhythm within one edition a day, turn an already approved
sponsor slot on or off, and select existing BoardlessAI layout variants.

## Ring 2: human approval

A `HUMAN_APPROVAL` item is required for spend outside an envelope, dependencies,
routes, sections, design-token changes, CSP or header changes, cap or schedule
changes, accounts, credentials, OAuth scopes, autopublish, sponsors, revenue and
any Caught Up code change. The owner confirmed existing Vercel Pro coverage;
each revenue event still needs sponsor approval and brand clearance.

## Ring 3: locked

No board path may weaken security headers, the 110 kB page-entry gzip ceiling,
accessibility gates, source and cost honesty, provenance, the sanitization
boundary, human-only payments or compatibility contracts. Compatibility includes
routes, feeds, redirects, locales and the `dispatches` and `wire` storage keys.

## Delivery boundary

The delivery contract may write only:

- `content/articles/<date>.en.mdx`
- `content/articles/<date>.cs.mdx`
- `public/illustrations/<date>.webp`
- `public/data/board/<date>.json`

Every other path remains outside board authority.

The additive consumer validates `edition-package/1`, its canonical package hash,
the bilingual schema-v2 content and the same-date replay rule before it writes
those paths. Equal packages are successful no-ops; a different hash for an
existing date fails closed for human reconciliation. Public board JSON contains
only the decision rationale or NO_EDITION reason, room URL, package hash and a
measured cost when one was supplied. The reader parses it defensively at build
time and performs no runtime AI or database calls.

During the Phase 8 transition, `daily.yml` still runs the legacy generator at
06:00 UTC and adds a separate 07:00 UTC sentinel. Generation is not disabled
until a BoardlessAI delivery is proven in the cutover phase.
