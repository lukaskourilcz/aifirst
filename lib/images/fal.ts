import { request } from "undici";
import sharp from "sharp";
import type { ImageProvider, ImageSize } from "./provider.js";
import { parseSize } from "./provider.js";
import { STYLE_SUFFIX } from "./style.js";

// Minimal fal.ai (FLUX) provider. The model is overridable via FAL_MODEL_PATH
// so you can trade speed for quality without a code change — e.g.
// `fal-ai/flux/dev` or `fal-ai/flux-pro/v1.1` for richer covers, default
// `fal-ai/flux/schnell` for the fast/cheap path. Docs: https://fal.ai/models
const MODEL_PATH = process.env.FAL_MODEL_PATH ?? "fal-ai/flux/schnell";

type FalResponse = {
  images?: Array<{ url: string }>;
};

const provider: ImageProvider = {
  id: "fal",
  async generate(prompt: string, opts: { size: ImageSize; seed?: number }) {
    const key = process.env.FAL_KEY;
    if (!key) throw new Error("FAL_KEY is not set");

    const [w, h] = parseSize(opts.size);

    const submitRes = await request(`https://fal.run/${MODEL_PATH}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Key ${key}`,
      },
      body: JSON.stringify({
        prompt: prompt + STYLE_SUFFIX,
        image_size: { width: w, height: h },
        seed: opts.seed,
        num_inference_steps: 4,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (submitRes.statusCode < 200 || submitRes.statusCode >= 300) {
      const errBody = await submitRes.body.text().catch(() => "");
      throw new Error(
        `fal: submit returned ${submitRes.statusCode}: ${errBody.slice(0, 300)}`,
      );
    }
    const result = (await submitRes.body.json()) as FalResponse;
    const imageUrl = result.images?.[0]?.url;
    if (!imageUrl) throw new Error("fal: no image url in response");

    const imageRes = await request(imageUrl, {
      signal: AbortSignal.timeout(30_000),
    });
    if (imageRes.statusCode < 200 || imageRes.statusCode >= 300) {
      throw new Error(`fal: image fetch returned ${imageRes.statusCode}`);
    }
    const raw = Buffer.from(await imageRes.body.arrayBuffer());
    const webp = await sharp(raw)
      .resize(w, h, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
    return { bytes: webp, mime: "image/webp" };
  },
};

export default provider;
