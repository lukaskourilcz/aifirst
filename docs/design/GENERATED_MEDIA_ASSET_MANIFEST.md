# Generated-media asset manifest

Status: no generated-media provider is selected. Provider research is required
before production. No asset has been generated or selected.

No media was generated, substituted, selected, optimized, referenced by production code, or committed during the overhaul. This file is an integration inventory, not generation provenance. Do not add production paths until actual selected files exist.

## Required provider research record

The next media session must add a dated matrix with at least three candidates:

| Provider/model | Access path | Free quota and card requirement | Cost per usable image | Commercial rights | Ownership, training and privacy | Watermark/public gallery | Resolution and ratios | API/MCP/original download | Decision and evidence URLs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| To research | web, API, MCP or local | Verify from official source | Include failed/rejected outputs in effective cost | Must be explicit | Record upload retention and training defaults | Reject unavoidable public/watermarked output | Must support required crops | Original file required | Accept, reject or conditional with reason |

Research rules:

- Use current official pricing, terms, license/model-card and privacy sources.
- Include one local/open-source candidate when practical, one hosted free-tier
  candidate and one predictable low-cost candidate when available.
- Prefer no-card and no auto-renewal. Never buy credits, subscribe or start a
  card-backed trial without explicit operator approval.
- Reject providers whose commercial rights or provenance cannot be documented.
- Keep all selected outputs local and remove provider/runtime dependencies from
  the public read path.

## Shared production prompt

Use this foundation, then append the asset-specific material cues below:

> Premium editorial still-life photograph, top-down evidence collage for a
> calm modern European technology publication. Folded off-white newsprint,
> blank technical papers with absolutely no writing, physical technical
> artifacts, optical glass, one restrained blueprint-blue registration accent.
> Cool neutral studio daylight, clean directional shadows, subtle paper grain,
> strong asymmetry, generous uncluttered text-safe space. Precise realistic
> editorial photography with contact-sheet sensibility. No people, hands,
> faces, letters, words, numbers, logos, UI, charts, neon, purple glow, robots,
> brains, holograms, watermarks, plastic CGI, or heavy grunge.

For comparison batches, use native output of at least 1K where available and
request the palette `#F4F1E8`, `#171A1F`, `#315DFF`, `#6E7781`, `#BCEBD7`
with background `#F4F1E8`. Generate four materially distinct variants per
comparison batch. Use higher resolution or an upscale only for a selected
master whose final crop demonstrably needs it.

## Asset-specific production briefs

| Asset | First comparison | Prompt delta and safe region | Deterministic exports after selection |
| --- | --- | --- | --- |
| `launch-evidence-key-visual` | four 16:9 variants | Folded newsprint, blank technical papers, small unbranded silicon chip, optical glass and matte black cable; keep the left 42% quiet for real HTML copy | 1600×900 wide, 1200×630 social, 1080×1080 square, 1080×1920 vertical crop |
| `topic-ai-models` | four 16:9 variants | Silicon die, calibration glass, stacked blank evaluation sheets and modular matte tiles; center-right focal cluster | 1280×560 route, 960×480 compact, mobile-safe center-right crop |
| `topic-ai-regulation` | four 16:9 variants | Folded policy dossier, neutral index tabs, binder clip, blueprint ruler and one restrained rust tab; no seals or institutional logos | same Topic export set |
| `topic-open-source` | four 16:9 variants | Open binder, exposed unbranded board, transparent component tray and repeated modular fasteners; visibly open construction | same Topic export set |
| `topic-developer-tools` | four 16:9 variants | Matte caliper, cable adapters, blank keycaps and compact hardware tools; no screens or code | same Topic export set |
| `topic-research` | four 16:9 variants | Optical lens, blank contact sheet, layered paper strips and laboratory glass sample; clean evidence-desk logic | same Topic export set |
| `topic-ai-companies` | four 16:9 variants | Server components, neutral research binders, architectural glass and industrial infrastructure; no corporate marks | same Topic export set |
| `weekly-cover-foundation` | four 16:9 variants | Seven layered blank index leaves, one clipped dossier and a resolved final blue tab; keep central/right copy field quiet | 1440×720 desktop, 900×1200 mobile crop, 1200×630 newsletter/social |
| `og-social-foundation` | derive from selected launch or generate four 16:9 variants only if title contrast fails | Low-detail perimeter evidence with a broad paper center; all title/date/Topic content stays code-rendered | 1200×630 master with verified English/Czech safe zones |
| `brand-texture-library` | derive from selected masters | Crop only non-semantic paper, registration, glass and signal details; never imply article relevance | 1600×400 strip, 600×600 detail, ≤60 kB each |

The About methodology visual, newsletter header, and motion remain conditional.
Do not spend quota or money on them until the high-priority still assets are
selected and an in-context review proves a distinct benefit.

## Prepared integration points

- `Topic.cover` is optional and accepts only local paths; `TopicMedia` renders nothing when the field is absent.
- Weekly’s cover frame, publication identity, date range, and issue text are deterministic HTML/CSS, so a future background can remain decorative.
- Default and article Open Graph routes render the mark, brand, title, date, and Topic text in code; a future background may sit beneath that text without changing the contract.
- The completion-period logo and application icon are deterministic vector geometry and do not need generated output.

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

- actual provider, tool/model and generation date;
- final prompt, negative prompt, and reference inputs;
- number and type of variants reviewed, selected variant, and rejection reasons;
- source and final dimensions, responsive variants, crop-safe regions, and any poster/static fallback;
- final local file path, format, byte size, loading behavior, and route/component;
- alt-text classification and final text where informative;
- license/usage information and regeneration instructions.

Reject watermarks, generated text, fake UI/labels/logos, anatomy or perspective defects, generic AI motifs, mismatched palette, noisy compression, weak mobile crops, and any output that implies a story relationship it does not have.
