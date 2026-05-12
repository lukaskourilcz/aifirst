import fs from "node:fs/promises";
import path from "node:path";
import { getImageProvider } from "../images/provider.js";

export type IllustrationResult = {
  path: string; // public path
  absPath: string; // filesystem path
};

export async function illustrate(
  date: string,
  prompt: string,
): Promise<IllustrationResult> {
  const provider = await getImageProvider();
  const { bytes } = await provider.generate(prompt, { size: "1536x1024" });
  const filename = `${date}.webp`;
  const absPath = path.join(process.cwd(), "public", "illustrations", filename);
  await fs.mkdir(path.dirname(absPath), { recursive: true });
  await fs.writeFile(absPath, bytes);
  return { path: `/illustrations/${filename}`, absPath };
}
