# OwnDashboard integration boundary

OwnDashboard is an optional read-side control plane for Caught Up. It may read
the public health contract, GitHub workflow history, commits and deployments.
It is not a producer and a dashboard outage cannot block the reader.

## Current ownership

- BoardlessAI in `lukaskourilcz/quorum` owns collection, edition production,
  budgets, meeting records, delivery status and reconciliation.
- The `boardlessai-delivery` GitHub App may write only dated article MDX, the
  matching required hero for each new article and sanitized board JSON in aifirst.
- aifirst owns independent content/build validation and the reader.
- `daily.yml` is only a 07:00 UTC missed-publication sentinel.

The former daily/weekly/regeneration dispatch controls and generation-report
callback are retired. Do not recreate them as a dashboard fallback.

## Safe read model

An OwnDashboard view may show:

- latest committed daily/weekly issue and age;
- `/api/health.json` and the daily sentinel's latest result;
- aifirst content commits and Vercel deployment state;
- BoardlessAI delivery receipts and meeting links when Quorum exposes them;
- measured edition cost from sanitized board data when present.

Unknown values remain unavailable. Do not infer provider spend from missing
data or display a fabricated zero.

## Mutations

Reader code/config changes use a normal branch, diff, CI and human merge.
Editorial replay, reconciliation and producer settings belong in Quorum.
OwnDashboard must never receive the delivery App private key, write article
bodies directly, weaken the same-date hash rule, or dispatch paid model work
through aifirst.
