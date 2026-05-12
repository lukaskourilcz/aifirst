---
name: image-provider
description: Pluggable interface for generating daily illustrations. Use when wiring or swapping the image generation backend (fal.ai, Replicate, OpenAI images, etc).
---

# Image provider

The pipeline calls a single interface; concrete providers live behind it.

## Interface

```ts
// lib/images/provider.ts
export type ImageSize = '1024x1024' | '1024x1536' | '1536x1024';

export interface ImageProvider {
  id: string;
  generate(prompt: string, opts: {
    size: ImageSize;
    seed?: number;
  }): Promise<{ bytes: Buffer; mime: string }>;
}

export function getImageProvider(): ImageProvider {
  switch (process.env.IMAGE_PROVIDER) {
    case 'fal':       return require('./fal').default;
    case 'replicate': return require('./replicate').default;
    case 'none':      return require('./none').default; // placeholder image
    default: throw new Error('IMAGE_PROVIDER not set');
  }
}
```

## Style suffix

Every prompt is wrapped with a stable suffix before hitting the provider:

```ts
// lib/images/style.ts
export const STYLE_SUFFIX =
  ", futuristic sci-fi magazine cover illustration, deep space palette, " +
  "cyan and magenta accents, cinematic volumetric lighting, intricate " +
  "but legible composition, 35mm grain, no text, no logos, no watermark";
```

The writer step produces the *subject* prompt only; the provider
implementation concatenates the suffix. Keep the suffix in one place so
the look stays consistent across days.

## Output handling

- Always transcode to `webp` quality 82 via `sharp` before saving.
- Target file `<200KB`. Resize down to `1536x1024` max.
- Compute and store a `blurhash` next to the article frontmatter for the
  loading shimmer.

## Adding a new provider

1. Create `lib/images/<name>.ts` exporting an `ImageProvider`.
2. Add the env var name and example value to `.env.example`.
3. Add a branch to `getImageProvider()`.
4. Run `pnpm test:image -- --provider <name>` (smoke test, generates one
   placeholder image and discards it).

## Don'ts

- Don't bake provider-specific options into the pipeline. Anything
  beyond `prompt`, `size`, `seed` belongs inside the provider module.
- Don't store raw provider responses on disk — extract bytes, transcode,
  discard.
