import { request } from "undici";
import sharp from "sharp";
import type { ImageProvider } from "./provider.js";
import { parseSize } from "./provider.js";

// NASA Astronomy Picture of the Day. Keyless: defaults to DEMO_KEY (30 req/hr,
// 50/day — ample for a once-daily pipeline; set NASA_API_KEY for headroom).
// APOD ignores the text prompt and returns that day's real space photograph,
// which suits the magazine's sci-fi cover aesthetic. Some days APOD is a video;
// on that (or any failure) we fall back to a flat panel so the daily job never
// breaks. Docs: https://api.nasa.gov
type ApodResponse = {
  url?: string;
  hdurl?: string;
  media_type?: string;
  title?: string;
};

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
  id: "nasa",
  async generate(_prompt, opts) {
    const [w, h] = parseSize(opts.size);
    const key = process.env.NASA_API_KEY || "DEMO_KEY";
    try {
      const apiRes = await request(
        `https://api.nasa.gov/planetary/apod?api_key=${key}`,
        { signal: AbortSignal.timeout(15_000), headers: { accept: "application/json" } },
      );
      if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
        console.warn(`[nasa] apod status ${apiRes.statusCode}`);
        return flatPanel(w, h);
      }
      const data = (await apiRes.body.json()) as ApodResponse;
      const imageUrl =
        data.media_type === "image" ? data.hdurl ?? data.url : undefined;
      if (!imageUrl) return flatPanel(w, h);

      const imgRes = await request(imageUrl, {
        signal: AbortSignal.timeout(30_000),
        maxRedirections: 3,
      });
      if (imgRes.statusCode < 200 || imgRes.statusCode >= 300) {
        return flatPanel(w, h);
      }
      const raw = Buffer.from(await imgRes.body.arrayBuffer());
      const webp = await sharp(raw)
        .resize(w, h, { fit: "cover" })
        .webp({ quality: 82 })
        .toBuffer();
      return { bytes: webp, mime: "image/webp" };
    } catch (err) {
      console.warn(`[nasa] apod failed: ${(err as Error).message}`);
      return flatPanel(w, h);
    }
  },
};

export default provider;
