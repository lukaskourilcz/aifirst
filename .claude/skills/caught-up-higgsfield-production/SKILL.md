---
name: caught-up-higgsfield-production
description: Evaluate, generate, optimize, integrate, and document approved Caught Up media with the actual Higgsfield MCP. Use only when a task explicitly involves Higgsfield, brand media, Topic or Weekly covers, launch/social imagery, media variants, or the Higgsfield asset manifest.
---

# Caught Up Higgsfield production

Read `docs/design/HIGGSFIELD_ART_DIRECTION.md` and `docs/design/HIGGSFIELD_ASSET_MANIFEST.md` first.

## Availability gate

The expected Codex server name is `higgsfield`, registered at
`https://mcp.higgsfield.ai/mcp`; OAuth login was completed on 2026-07-22. This
setup must be loaded by a fresh session. Inspect the callable tools and their
real schemas before doing media work—do not infer a model, command, format, or
limit from configuration alone.

If the Higgsfield MCP is absent:

- stop only the media-generation subtask;
- do not research Higgsfield, attempt a connection, wait, invent commands, or use another image model;
- do not create fake or placeholder production assets;
- record the exact deferred deliverable and continue all non-media work.

## Plan and cost gate

Before the first submit in a session, call `balance`, inspect the selected
workspace, and use `generate_image` with `get_cost: true`. The active 2026-07-22
trial rejected both Recraft V4.1 and Z Image with
`only_website_usage_on_trial_is_available`; see the asset manifest. Do not retry
other models or route around that response. Resume only after the operator
intentionally activates an MCP-capable plan. Never purchase, upgrade, enable
auto-refill, or accept a paid commitment without explicit authority.

## Production workflow

When the actual MCP is available:

1. Confirm the plan/cost gate passes and the media improves recognition or comprehension; reject filler.
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
