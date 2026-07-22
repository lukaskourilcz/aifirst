---
name: caught-up-media-production
description: Research, evaluate, generate, optimize, integrate, and document approved Caught Up media with a verified free or low-cost provider. Use when a task involves generated brand media, Topic or Weekly covers, launch/social imagery, media variants, provider selection, or the media manifest.
---

# Caught Up generated-media production

Read `docs/design/GENERATIVE_MEDIA_ART_DIRECTION.md` and
`docs/design/GENERATED_MEDIA_ASSET_MANIFEST.md` first.

## Provider selection gate

No generated-media provider is selected. Search the current web before
generation or deferral. Use official pricing, terms/license/model-card, and
privacy sources. Compare at least three candidates, including local/open-source,
hosted free-tier, and predictable low-cost options when they genuinely exist.

Record for each candidate:

- exact provider/model and access path;
- free quota, card/signup requirement, rate limit and credit expiry;
- price per image and estimated cost per accepted production asset;
- commercial-use/ownership rights and attribution requirements;
- upload retention, training reuse and privacy controls;
- watermark, mandatory public-gallery and original-download behavior;
- available resolution, aspect ratios, reference inputs and consistency tools;
- API/MCP/local/manual workflow and evidence URLs;
- accept/reject/conditional decision with reason.

Prefer a commercially clear, private, watermark-free, no-card option. A manual
web provider is acceptable when the user can return original files and the
manifest records that workflow. Never use screenshots. If no candidate passes,
commit the comparison and defer without filler.

Before the first submit, inspect the selected provider's real controls, quota,
cost, and output terms. Never infer capabilities from marketing copy or a
stale integration. Never purchase, upgrade, enable auto-refill, or accept a
paid commitment without explicit authority.

## Production workflow

When a provider has passed the research, rights and cost gates:

1. Confirm the provider, rights, and cost gates pass and the media improves recognition or comprehension; reject filler.
2. Define route, purpose, aspect ratios, text-safe region, mobile crop, performance target, and alt-text class.
3. Use the Editorial Evidence Collage direction in the art-direction document.
4. Generate several materially different variants; never select the first usable output automatically.
5. Reject text artifacts, fake UI, logos, watermarks, anatomy/perspective defects, generic AI motifs, or mismatched color.
6. Refine the strongest direction and produce required responsive/static variants.
7. Optimize locally to SVG for deterministic vectors or AVIF/WebP for photographic media; include dimensions and lazy-loading behavior.
8. Integrate through existing optional media hooks. Keep titles, dates, labels, and product UI rendered by code.
9. Validate all crops, accessibility, reduced motion, repository weight, and the 110 kB JS guard.
10. Record the actual tool/model, date, prompts, comparisons, dimensions, path, usage terms, and regeneration steps in the manifest.

Never generate screenshots, charts, source logos, contributors, testimonials, users, or metrics. Authentic product UI must come from the real implementation.
