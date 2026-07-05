import fs from "node:fs/promises";
import path from "node:path";
import { getImageProvider } from "../images/provider.js";

export type IllustrationResult = {
  path: string | null; // public path, or null when the provider produced no
                       // real image (e.g. IMAGE_PROVIDER=none)
};

export async function illustrate(
  date: string,
  prompt: string,
): Promise<IllustrationResult> {
  const provider = await getImageProvider();
  // The `none` provider only makes a flat placeholder panel — skip writing
  // and let the UI fall back to og:image / text-only so we never render a
  // blank tile.
  if (provider.id === "none") return { path: null };
  const { bytes } = await provider.generate(prompt, { size: "1536x1024" });
  const filename = `${date}.webp`;
  const absPath = path.join(process.cwd(), "public", "illustrations", filename);
  await fs.mkdir(path.dirname(absPath), { recursive: true });
  await fs.writeFile(absPath, bytes);
  return { path: `/illustrations/${filename}` };
}
