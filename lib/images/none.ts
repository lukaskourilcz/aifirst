import sharp from "sharp";
import type { ImageProvider, ImageSize } from "./provider.js";

// Placeholder provider — generates a flat coloured panel so the pipeline
// can run end-to-end without a paid API. Use IMAGE_PROVIDER=fal for real.
const provider: ImageProvider = {
  id: "none",
  async generate(_prompt: string, opts: { size: ImageSize; seed?: number }) {
    const [w, h] = opts.size.split("x").map((n) => parseInt(n, 10)) as [number, number];
    const buf = await sharp({
      create: {
        width: w,
        height: h,
        channels: 4,
        background: { r: 10, g: 15, b: 31, alpha: 1 },
      },
    })
      .webp({ quality: 82 })
      .toBuffer();
    return { bytes: buf, mime: "image/webp" };
  },
};

export default provider;
