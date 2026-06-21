import sharp from "sharp";
import type { ImageProvider, ImageSize } from "./provider.js";
import { parseSize } from "./provider.js";

// Placeholder provider — generates a flat coloured panel so the pipeline
// can run end-to-end without a paid API. Use IMAGE_PROVIDER=fal for real.
const provider: ImageProvider = {
  id: "none",
  async generate(_prompt: string, opts: { size: ImageSize; seed?: number }) {
    const [w, h] = parseSize(opts.size);
    // Paper-toned placeholder so the cream canvas reads consistently when no
    // real provider is wired. Matches the Hashnode --color-paper token.
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
  },
};

export default provider;
