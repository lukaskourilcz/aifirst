import fs from "node:fs/promises";
import path from "node:path";
import { isPromotionPost, type PromotionPost } from "./promotion";

// Filesystem read/write for promotion payloads — one JSON file per date under
// content/promotion/. Server / pipeline / script only (imports node built-ins);
// the browser-safe types live in ./promotion.

function promotionDir(): string {
  return path.join(process.cwd(), "content", "promotion");
}

function promotionFile(date: string): string {
  return path.join(promotionDir(), `${date}.json`);
}

// Write one promotion payload, creating the directory if needed. Returns the
// absolute path written. Regenerating a date overwrites its file (same as the
// article MDX), so the two stay in lock-step.
export async function writePromotionFile(post: PromotionPost): Promise<string> {
  const dir = promotionDir();
  await fs.mkdir(dir, { recursive: true });
  const file = promotionFile(post.date);
  await fs.writeFile(file, `${JSON.stringify(post, null, 2)}\n`);
  return file;
}

export async function readPromotion(
  date: string,
): Promise<PromotionPost | null> {
  try {
    const raw = await fs.readFile(promotionFile(date), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isPromotionPost(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Every promotion payload, newest first.
export async function listPromotions(): Promise<PromotionPost[]> {
  let names: string[];
  try {
    names = await fs.readdir(promotionDir());
  } catch {
    return [];
  }
  const dates = names
    .filter((n) => n.endsWith(".json"))
    .map((n) => n.replace(/\.json$/, ""));
  const posts = await Promise.all(dates.map((d) => readPromotion(d)));
  return posts
    .filter((p): p is PromotionPost => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}
