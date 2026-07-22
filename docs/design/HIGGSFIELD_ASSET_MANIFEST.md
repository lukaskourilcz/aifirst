# Higgsfield asset manifest

Status: ready for production in a fresh session. The global Codex server
`higgsfield` is registered at `https://mcp.higgsfield.ai/mcp`, and OAuth login
completed on 2026-07-22. No asset has been generated or selected yet.

No media was generated, substituted, selected, optimized, referenced by production code, or committed during the overhaul. This file is an integration inventory, not generation provenance. Do not add production paths until actual selected files exist.

## Prepared integration points

- `Topic.cover` is optional and accepts only local paths; `TopicMedia` renders nothing when the field is absent.
- Weekly’s cover frame, publication identity, date range, and issue text are deterministic HTML/CSS, so a future background can remain decorative.
- Default and article Open Graph routes render the mark, brand, title, date, and Topic text in code; a future background may sit beneath that text without changing the contract.
- The completion-period logo and application icon are deterministic vector geometry and do not need Higgsfield output.

## Queued asset inventory

| Asset ID | Priority | Description and purpose | Intended integration | Required variants | Alt classification | Performance target |
| --- | --- | --- | --- | --- | --- | --- |
| `launch-evidence-key-visual` | high | Editorial Evidence Collage launch image for recognition outside the core reading arc | About/launch communication, repository documentation where useful, and social promotion | wide desktop, landscape social, square campaign/avatar, vertical story | descriptive when editorial; decorative when paired with equivalent copy | responsive AVIF/WebP; no single page-load variant above 250 kB without measured justification |
| `topic-ai-models` | high | Physical research/model artifacts, distinguishable without labels | optional `cover` for AI Models in `config/topics.yml` after a local asset exists | landscape master plus mobile-safe crop | decorative; Topic name remains HTML | preferred ≤120 kB rendered variant |
| `topic-ai-regulation` | high | Policy papers, index tabs, institutional material | optional Topic cover | landscape master plus mobile-safe crop | decorative | preferred ≤120 kB rendered variant |
| `topic-open-source` | high | Open technical materials, components, reproducible research cues | optional Topic cover | landscape master plus mobile-safe crop | decorative | preferred ≤120 kB rendered variant |
| `topic-developer-tools` | high | Real tools, cables, hardware, and technical working materials | optional Topic cover | landscape master plus mobile-safe crop | decorative | preferred ≤120 kB rendered variant |
| `topic-research` | high | Printed papers, optical glass, annotations, and contact-sheet logic | optional Topic cover | landscape master plus mobile-safe crop | decorative | preferred ≤120 kB rendered variant |
| `topic-ai-companies` | high | Infrastructure, corporate research artifacts, and industrial technology without logos | optional Topic cover | landscape master plus mobile-safe crop | decorative | preferred ≤120 kB rendered variant |
| `weekly-cover-foundation` | high | Recurring restrained cover background that makes Weekly recognizable without baking in issue copy | behind the existing code-rendered Weekly cover | desktop, social/newsletter, mobile crop | decorative | preferred ≤180 kB rendered variant |
| `og-social-foundation` | high | Neutral evidence-collage background for deterministic Open Graph composition | locale and article Open Graph routes; all important text stays code-rendered | 1200×630 master and safe crop map | decorative | optimized local image appropriate to generated OG output |
| `brand-texture-library` | medium | Small paper, registration-detail, restrained signal-line, and neutral photographic fragments | sparing CSS/OG/social composition, never a full-site overlay | modular wide, square, and detail crops as justified | decorative | each fragment preferably ≤60 kB |
| `about-methodology-visual` | conditional | Explain editorial selection/evidence without fake UI | About methodology section only if comprehension improves | desktop and mobile crop | descriptive with concise alt | preferred ≤180 kB |
| `newsletter-header` | conditional | Static recognition for exported newsletter presentation | future newsletter template integration | email-safe landscape and retina export | decorative | email-appropriate compressed output |
| `launch-motion` | conditional | Slow, restrained evidence-collage drift for launch communication | launch/social only, never behind reading text | short video plus poster/static fallback | transcript/caption only if it conveys information | set after real tool/output review; must not enter core route load |

The optional items must be rejected if a later in-context review cannot show a comprehension or recognition benefit.

## Required record after generation

For each actual selected output, replace its queued row or add a record containing:

- actual Higgsfield tool/model and generation date;
- final prompt, negative prompt, and reference inputs;
- number and type of variants reviewed, selected variant, and rejection reasons;
- source and final dimensions, responsive variants, crop-safe regions, and any poster/static fallback;
- final local file path, format, byte size, loading behavior, and route/component;
- alt-text classification and final text where informative;
- license/usage information and regeneration instructions.

Reject watermarks, generated text, fake UI/labels/logos, anatomy or perspective defects, generic AI motifs, mismatched palette, noisy compression, weak mobile crops, and any output that implies a story relationship it does not have.
