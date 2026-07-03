import { createHash } from "node:crypto";
import { request } from "undici";
import sharp from "sharp";
import type { ImageProvider } from "./provider.js";
import { parseSize } from "./provider.js";

// Lorem Picsum — keyless, no signup. Returns a real (Unsplash-sourced) photo
// for a given seed at an exact size. We derive the seed from the prompt so a
// given day's cover is stable across pipeline re-runs. Strictly a zero-cost
// fallback for when no real image provider (fal/nasa) is configured — nicer
// than the flat `none` panel. Falls back to a flat panel on any failure so the
// daily job never breaks. Docs: https://picsum.photos
function seedFor(prompt: string, seed?: number): string {
  if (typeof seed === "number") return String(seed);
  return createHash("sha1").update(prompt).digest("hex").slice(0, 12);
}

async function flatPanel(
  w: number,
  h: number,
): Promise<{ bytes: Buffer; mime: string }> {
  const buf = await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: { r: 244, g: 245, b: 247, alpha: 1 },
    },
  })
    .webp({ quality: 82 })
    .toBuffer();
  return { bytes: buf, mime: "image/webp" };
}

const provider: ImageProvider = {
  id: "picsum",
  async generate(prompt, opts) {
    const [w, h] = parseSize(opts.size);
    const seed = seedFor(prompt, opts.seed);
    try {
      // picsum.photos 302-redirects to a CDN host, so allow redirections.
      const res = await request(
        `https://picsum.photos/seed/${seed}/${w}/${h}`,
        { signal: AbortSignal.timeout(30_000), maxRedirections: 5 },
      );
      if (res.statusCode < 200 || res.statusCode >= 300) {
        console.warn(`[picsum] status ${res.statusCode}`);
        return flatPanel(w, h);
      }
      const raw = Buffer.from(await res.body.arrayBuffer());
      const webp = await sharp(raw)
        .resize(w, h, { fit: "cover" })
        .webp({ quality: 82 })
        .toBuffer();
      return { bytes: webp, mime: "image/webp" };
    } catch (err) {
      console.warn(`[picsum] failed: ${(err as Error).message}`);
      return flatPanel(w, h);
    }
  },
};

export default provider;
