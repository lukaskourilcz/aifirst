import { request } from "undici";
import sharp from "sharp";
import type { ImageProvider, ImageSize } from "./provider.js";
import { STYLE_SUFFIX } from "./style.js";

// Minimal fal.ai (FLUX) provider. Replace the model id / endpoint to taste.
// Docs: https://fal.ai/models — typical path is `fal-ai/flux/schnell`.
const MODEL_PATH = "fal-ai/flux/schnell";

type FalResponse = {
  images?: Array<{ url: string }>;
};

const provider: ImageProvider = {
  id: "fal",
  async generate(prompt: string, opts: { size: ImageSize; seed?: number }) {
    const key = process.env.FAL_KEY;
    if (!key) throw new Error("FAL_KEY is not set");

    const [w, h] = opts.size.split("x").map((n) => parseInt(n, 10)) as [number, number];

    const { body: submitBody } = await request(
      `https://fal.run/${MODEL_PATH}`,
      {
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
      },
    );
    const result = (await submitBody.json()) as FalResponse;
    const imageUrl = result.images?.[0]?.url;
    if (!imageUrl) throw new Error("fal: no image url in response");

    const { body: imageBody } = await request(imageUrl, {
      signal: AbortSignal.timeout(30_000),
    });
    const raw = Buffer.from(await imageBody.arrayBuffer());
    const webp = await sharp(raw)
      .resize(w, h, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
    return { bytes: webp, mime: "image/webp" };
  },
};

export default provider;
