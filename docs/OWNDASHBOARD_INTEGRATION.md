# OwnDashboard integration contract

OwnDashboard is an optional operator control plane for Caught Up. GitHub
Actions performs all repository mutations, Git and MDX remain canonical, and a
dashboard outage never blocks the scheduled daily or weekly workflows.

## Versioned run-report callback

The pipeline writes `GenerationRunReport` schema version 1 under
`generated/run-reports/` and uploads it as a private Actions artifact. When both
variables below are set, it also sends the same JSON with an eight-second
timeout and at most two attempts:

- `OWNDASHBOARD_RUN_REPORT_URL`
- `OWNDASHBOARD_RUN_REPORT_TOKEN`

Request:

```http
POST /configured/path
Authorization: Bearer <token>
Content-Type: application/json
Idempotency-Key: <runId>
```

The receiver must validate `schemaVersion`, use `runId` as an idempotency key,
return a 2xx response only after durable storage, and treat a repeated run ID as
success. Callback failure is a warning; it never removes a valid edition.

The authoritative TypeScript contract is `lib/telemetry/types.ts`; a sample is
in `examples/generation-run-report.v1.json`.

Recommended dashboard tables store telemetry and references, not article bodies:

- `ai_generation_runs`: report header, status, issue reference and totals
- `ai_generation_stages`: one row per timed pipeline stage
- `ai_usage_lines`: provider/model/token/cost lines
- `source_run_results`: per-source status, duration, candidate count and bounded error metadata
- `ai_generation_events`: structured warning/event codes for alerting; free-form warning strings remain for schema-v1 compatibility

## Triggering workflows

Trigger `.github/workflows/daily.yml`, `weekly.yml`, or `regenerate.yml` with the
GitHub Actions `workflow_dispatch` API. Inputs are:

- `date`: `YYYY-MM-DD` (optional for daily/weekly, required for regenerate)
- `kind`: `daily|weekly` on regenerate
- `language`: `all|en|cs`
- `publish_mode`: `auto|pull_request|dry_run`
- `image_provider`: `none|fal|nasa|picsum`
- `model_profile`: committed profile name
- `force`: explicit duplicate override
- `skip_embeddings`: disable the optional Jina pass

Use a GitHub App where possible. Minimum permissions are Actions read/write,
Contents read/write for generated branches, Pull requests read/write for review
mode, and Metadata read. The dashboard should record the returned workflow run
ID and poll GitHub for status with bounded backoff. Artifact, commit and PR URLs
come from GitHub; canonical issue URLs come from the static share pack.

Before a paid dispatch, show the resolved date, issue kind, language, duplicate
warning, model profile, image provider, publish mode and estimated cost. Label
the estimate clearly; only callback usage lines are actual cost.

## Command-center read model

The dashboard page should derive or store:

- Latest daily/weekly issue and age
- Sanitized `/api/health.json` state
- Next daily/weekly cron occurrence in UTC and Europe/Prague
- Active, last successful and last failed generation runs
- Spend today/month, projected month-end spend and failed-run spend
- Source degradation alerts
- Committed model profile, image provider, publish mode and language settings
- Links to issue, Actions run, commit, PR, deployment and artifact

Controls map to workflow dispatches: generate daily, generate weekly,
regenerate, dry-run, no-illustration, language/model selection, review PR,
force, validation/redeploy, and recovery actions. “Republish” must only rebuild
committed content; “Regenerate” invokes paid model work.

## Source and configuration changes

`sources.yml` and `config/editorial.yml` remain executable truth. Dashboard
editing uses this sequence:

1. Read the committed file through GitHub.
2. Validate proposed YAML using the same schema semantics.
3. Show the operator a diff.
4. Create a branch and commit.
5. Open a pull request.
6. Let CI run `pnpm verify`.
7. Merge explicitly.

Source testing should reuse the existing adapter/source validation behavior;
one failure never auto-disables a source.

Schedule edits follow the same PR flow against workflow YAML. GitHub cron is in
UTC; display several future UTC and Europe/Prague occurrences so daylight-saving
changes are visible. Do not keep a second permanent schedule in Supabase.

## Review and recovery

For `pull_request` mode, show headline, dek, image, Why it matters, What
changed, Briefs, Watchlist, source ledger, signal, measured cost, validation and
diff. Link to GitHub for prose edits and approval rather than building a CMS.

Recovery controls should distinguish: redeploy committed content, rerun
validation, regenerate illustration, regenerate an edition, revert a generated
commit, switch to review mode, disable translation/illustration, and select a
fallback model profile. Every mutation requires explicit operator intent.

Provider readiness may expose only booleans/categories—never secret values—and
must not make billable calls.

## Alerts and circuit breakers

Create structured dashboard events for stale content, consecutive failures,
low source success, validation/build/deployment failures, duplicate attempts,
provider unavailability, translation drift and cost thresholds. Committed
`config/editorial.yml` supplies local hard limits even when OwnDashboard is
offline. Quality enforcement starts in `report_only`. When changed to
`enforce`, the committed `failureAction` is applied locally: ordinary quality
failures switch the run to a review pull request or skip it, while hard-cost
failures always fail closed before persistence.
