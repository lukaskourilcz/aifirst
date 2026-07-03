# aifirst — AI Tech Magazine

A daily static magazine where a cron job scrapes ~20 sources and Claude curates and writes one bilingual (CS/EN) feature.

- **Now:** ~$5–10/month — Anthropic API only; Vercel Hobby, GitHub Actions, and GitHub content store all on free tiers, at low personal traffic.
- **Stack:** Vercel CDN (static Next.js 15) · GitHub Actions cron (daily/weekly generation) · Anthropic Claude API (Opus 4.7 write + Sonnet 4.6 curate) · git/MDX content store · fal.ai FLUX images (off by default, `IMAGE_PROVIDER=none`).
- **First ceiling:** Vercel Hobby's non-commercial-use clause — a licensing limit, not capacity; 100 GB/mo transfer is barely touched since everything is prerendered.
- **At 100 users:** ~$5–10/month — infra unchanged (reads are static/CDN); only cost is moving off Hobby if it goes commercial: +$20/mo Vercel Pro, or $0 on Cloudflare Pages.
- **At 1,000 users:** ~$5–10/month — still no read-path changes needed (no DB, no per-request compute); CDN absorbs traffic, so no replica/cache/queue required.
- **Watch:** Anthropic API scales with publishing cadence and output length, not readers — extra issues/day or real fal.ai images (~$0.003/img) are the only usage-driven costs.
