export type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";

// Parse a "WxH" size string into [width, height].
export function parseSize(size: ImageSize): [number, number] {
  return size.split("x").map((n) => parseInt(n, 10)) as [number, number];
}

export interface ImageProvider {
  id: string;
  generate(
    prompt: string,
    opts: { size: ImageSize; seed?: number },
  ): Promise<{ bytes: Buffer; mime: string }>;
}

export async function getImageProvider(): Promise<ImageProvider> {
  const which = process.env.IMAGE_PROVIDER ?? "none";
  switch (which) {
    case "fal":
      return (await import("./fal.js")).default;
    case "none":
      return (await import("./none.js")).default;
    default:
      throw new Error(`Unknown IMAGE_PROVIDER: ${which}`);
  }
}
