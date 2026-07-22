---
name: article-pipeline
description: Maintain Caught Up's scrape-to-publication pipeline, Anthropic structured outputs, bilingual schema-v2 MDX, evidence, usage telemetry, optional illustration, quality gates, idempotency, and legacy compatibility. Use for lib/pipeline/*, lib/anthropic/*, scripts/generate-daily.ts, or article frontmatter changes.
---

# Article pipeline

Read `config/editorial.yml`, `lib/anthropic/models.ts`, `lib/content.ts`, `lib/editorial/validation.ts`, and the affected pipeline tests before editing.

## Preserve the stages

Keep configuration → isolated scrape → guardrails → structured curation → structured writing → optional illustration → validation → MDX/static artifacts/private report → optional bounded OwnDashboard callback. Reader requests never run these stages.

- Use `modelFor(role)` and committed profiles; do not duplicate model IDs.
- Keep stable system prompts cacheable and variable source material outside cached blocks.
- Require Anthropic tool use for structured curation/writing outputs.
- Preserve requested locales, the unprefixed English and `/cs` publication model, and actual translation linkage.
- Build source references only from input items. Preserve evidence classification and supported-claim metadata.
- Record provider usage and measured cost only when complete; never estimate it into provenance.
- Keep per-source failure isolation, idempotency, regeneration budgets, publish/review modes, and report-only quality defaults.

## Content contract

Schema v2 uses the canonical legacy storage keys plus structured fields: `why_it_matters`, `what_changed`, `uncertainty`, evidence-aware `sources`, `generation`, `corrections`, `translation_of`, optional `sponsor`, `alternative_headlines`, `dispatches`, and `wire`. Reader labels are Briefs and Watchlist; do not migrate storage keys merely for copy consistency. Legacy MDX remains valid.

Writing follows the committed editorial target, is calm and specific, links only supplied URLs, distinguishes claims from analysis, and does not invent certainty. Illustration is optional and provider `none` is valid.

## Validation

Add focused unit/fixture tests, run `pnpm check:content`, and use a dry run only with safe fixtures/credentials. Never make paid calls, enable media, expand locales, or tighten enforcement without explicit operational scope. Inspect persisted MDX and telemetry before reporting completion.
