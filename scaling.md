# Caught Up — cost & scaling

A GitHub-Actions publishing pipeline plus a static Vercel reader. The stack is in `about-project.md`; prices checked 2026-07-21.

## What it costs

- **Current committed config:** ~$0/month — image provider `none`, embeddings/promotion/newsletter off, no runtime database.
- **Main variable cost is AI** once editions run (Anthropic per-token). Set generation budgets in `config/editorial.yml`.

## When to scale

- Enabling illustrations (fal), embeddings (Jina), or promotion adds per-run spend — turn each on deliberately.
- Reader traffic is static on Vercel — effectively free until Hobby limits; go Pro for commercial use.

## Keep costs down

Keep the daily default lean, set per-run and monthly cost caps, and watch Actions minutes.
