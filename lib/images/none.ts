import sharp from "sharp";
import type { ImageProvider, ImageSize } from "./provider.js";
import { parseSize } from "./provider.js";

// No-cost compatibility provider used by focused adapter tests. The pipeline
// short-circuits this provider and persists no illustration path.
const provider: ImageProvider = {
  id: "none",
  async generate(_prompt: string, opts: { size: ImageSize; seed?: number }) {
    const [w, h] = parseSize(opts.size);
    // Paper-toned test output aligned with the publication reading surface.
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
