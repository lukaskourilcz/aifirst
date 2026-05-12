---
description: Run the daily article generation pipeline locally for today (or a given date).
argument-hint: [YYYY-MM-DD]
---

Run the curate -> write -> illustrate pipeline. Argument: $ARGUMENTS
optional date in `YYYY-MM-DD` form (defaults to today).

## Steps

1. Confirm `.env.local` has `ANTHROPIC_API_KEY` and `IMAGE_PROVIDER`
   set. If missing, point the user at `.env.example` and stop.
2. Run `pnpm generate:daily ${ARGUMENTS:-$(date -u +%F)}`.
3. Surface stderr lines that include token usage and cache stats.
4. When the script finishes, show the user:
   - the path of the generated MDX
   - the path of the generated illustration
   - a 200-char excerpt of the lede
5. Suggest opening `pnpm dev` to preview, but do not auto-start it.

If the script exits non-zero, do **not** retry blindly. Inspect the
error, identify the step that failed (curate/write/illustrate/persist),
and report it with the relevant skill linked
(`.claude/skills/article-pipeline/SKILL.md`).
