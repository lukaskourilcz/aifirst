import { getArticle, listArticles } from "@/lib/content";
import { createArticleDistributionPack, distributionPackFile } from "@/lib/distribution/share";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

// /data/share/<date>.cs.json (and <date>.weekly.cs.json): the per-edition share
// pack, generated at build time for every edition so a new delivery ships its
// pack without a second commit (issue #99). Frozen legacy packs from before the
// cutover (the `.en.json` files) stay as static files in public/data/share.
export const dynamic = "force-static";
export const dynamicParams = false;

async function packsByFile() {
  const files = new Map<string, Awaited<ReturnType<typeof getArticle>>>();
  for (const summary of await listArticles(DEFAULT_LOCALE)) {
    const article = await getArticle(summary.slug, DEFAULT_LOCALE);
    if (article) files.set(distributionPackFile(article, DEFAULT_LOCALE), article);
  }
  return files;
}

export async function generateStaticParams() {
  return [...(await packsByFile()).keys()].map((file) => ({ file }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const article = (await packsByFile()).get(file);
  if (!article) return new Response("Not found", { status: 404 });
  return new Response(`${JSON.stringify(createArticleDistributionPack(article, DEFAULT_LOCALE), null, 2)}\n`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
