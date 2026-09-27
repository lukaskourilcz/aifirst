import { listArticles } from "@/lib/content";
import { editionCardResponse, isShareImageFile, SHARE_IMAGE_FILES } from "@/lib/share-card";

// Per-edition cards, drawn at build time by one renderer:
// /articles/<slug>/share/og.png (1200x630 Open Graph), feed.png (4:5),
// story.png (9:16) and wide.png (16:9).
// The extension keeps them outside the locale rewrite in middleware.ts.
export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await listArticles();
  return all.flatMap((a) => Object.keys(SHARE_IMAGE_FILES).map((file) => ({ slug: a.slug, file })));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; file: string }> }) {
  const { slug, file } = await params;
  if (!isShareImageFile(file)) return new Response("Not found", { status: 404 });
  return editionCardResponse(slug, SHARE_IMAGE_FILES[file]);
}
