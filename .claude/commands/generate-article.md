---
description: Run the daily article generation pipeline locally for today (or a given date).
argument-hint: [YYYY-MM-DD]
---

Run the committed scrape -> curate -> write -> optional illustration -> validate -> persist pipeline. Argument: $ARGUMENTS
optional date in `YYYY-MM-DD` form (defaults to today).

## Steps

1. Read `config/editorial.yml`, `.env.example`, the article-pipeline skill,
   and the actual script options. Confirm required credentials without printing
   their values. Illustration provider `none` is valid.
2. Run `pnpm generate:daily ${ARGUMENTS:-$(date -u +%F)}`.
3. Surface structured usage, actual measured cost, quality, and source results.
4. When the script finishes, show the user:
   - the path of the generated MDX
   - the illustration result only when one was actually produced
   - a 200-char excerpt of the lede
5. Run content/config validation and preview the real edition when the task
   includes publication readiness.

If the script exits non-zero, do not retry blindly. Inspect and repair feasible
failures while preserving idempotency, locale scope, regeneration limits, and
review/publish mode. Link the relevant skill
(`.claude/skills/article-pipeline/SKILL.md`).
