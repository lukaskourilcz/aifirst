# DNESKAi product governance

DNESKAi is Venture 001 of BoardlessAI by owner decision dated 2026-08-01. The
venture id upstream remains `caught-up` and the repository remains `aifirst`;
both are identifiers, not the publication name.

BoardlessAI may deliver validated article, image, dataset, stream, event and
board-data files. It has no write path to reader code.

## Ring 1: autonomous

The board may select one daily story or record `NO_EDITION`, write Czech
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
routes, feeds, redirects, locales and the `dispatches`, `wire`, `ai-models`,
`cz` and `global` storage keys. Labels render Czech; the keys stay English.

## Delivery boundary

The delivery contract may write only these paths, and each delivery kind may
write only its own subset. An edition delivery can never write a dataset, and a
dataset or stream append can never touch an article or an image.

**Editions**

- `content/articles/<date>.cs.mdx` — required
- `content/articles/<date>.en.mdx` — legacy only, never required
- `public/images/editions/<slug>/hero.<webp|png|svg>`
- `public/images/editions/<slug>/thumb.<webp|png|svg>`
- `public/data/board/<date>.json`

**Datasets** (append-only, one file per commit)

- `data/ai-facts.json`
- `data/ai-lessons.json`

**Streams and events** (replaced wholesale on each sync)

- `data/talked-about.json`
- `data/podcasts.json`
- `data/events.json`

Every other path remains outside board authority. The old list named
`public/illustrations/<date>.webp`, which no delivery has written since images
moved under `public/images/editions/<slug>/`.

The additive consumer validates `edition-package/1`, its canonical package hash,
the schema-v2 content and the same-date replay rule before it writes
those paths. An equal replay succeeds only when every authorized output file is
present and byte-identical. Missing or changed siblings fail closed for human
reconciliation. Public board JSON contains only the decision rationale or
NO_EDITION reason, room URL, package hash and a measured cost when one was
supplied. The reader parses it defensively at build time and performs no runtime
AI or database calls, and it renders none of that telemetry: board JSON is an
operator record, and `/health` plus `/api/health.json` are where it surfaces.

`daily.yml` is a 07:00 UTC missed-publication sentinel. It cannot write content,
scrape sources or call an editorial provider. BoardlessAI owns the sole edition
production and delivery path.
