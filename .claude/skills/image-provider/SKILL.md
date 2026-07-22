---
name: image-provider
description: Maintain the optional daily-illustration provider interface and local image-processing path. Use for lib/images/*, IMAGE_PROVIDER behavior, provider adapters, optimization, or article illustration persistence; do not use it as a substitute for explicitly requested brand-media production.
---

# Image provider

Inspect `lib/images/provider.ts`, `lib/images/style.ts`, current adapters/tests, `config/editorial.yml`, and `.env.example`.

- Preserve the narrow `ImageProvider.generate(prompt, { size, seed })` contract.
- Keep provider-specific options inside adapters and provider imports server-only/dynamic.
- Treat `none` as the safe default; it may produce a pipeline compatibility output, not a public-facing claim that real media exists.
- Keep subject matter separate from the stable calm editorial style suffix. Important text, logos, UI, charts, and claims must never be generated.
- Transcode/resize through Sharp, store only selected local output, record intrinsic dimensions, and keep reader pages free of remote runtime media calls.
- Add credentials/config only when a real adapter is implemented. Never print or commit secrets, raw responses, rejected outputs, or caches.
- Do not enable paid generation or change defaults as part of visual work.

For generated brand, Topic, Weekly, social, or campaign media, use
`caught-up-media-production`. Follow that skill's mandatory current provider
research instead of silently routing through an arbitrary adapter. Do not
change scheduled article illustration defaults as a side effect of brand-media
production.

Run existing focused image tests and `pnpm check:content`; add a test only for behavior the repository actually supports.
