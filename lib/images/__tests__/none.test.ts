import { describe, it, expect } from "vitest";
import sharp from "sharp";
import provider from "../none.js";

describe("image provider: none", () => {
  it("returns a valid WebP at the requested size", async () => {
    const { bytes, mime } = await provider.generate("ignored prompt", {
      size: "1024x1024",
    });
    expect(mime).toBe("image/webp");
    expect(bytes.byteLength).toBeGreaterThan(100);

    const meta = await sharp(bytes).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(1024);
    expect(meta.height).toBe(1024);
  });

  it("respects non-square sizes", async () => {
    const { bytes } = await provider.generate("x", { size: "1536x1024" });
    const meta = await sharp(bytes).metadata();
    expect(meta.width).toBe(1536);
    expect(meta.height).toBe(1024);
  });
});
