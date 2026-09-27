import { listArticles } from "@/lib/content";
import { editionCardResponse, SHARE_FORMATS } from "@/lib/share-card";

export const runtime = "nodejs";
export const size = SHARE_FORMATS.og;
export const contentType = "image/png";
export const alt = "Vydání DNESKAi";

export async function generateStaticParams() {
  const all = await listArticles();
  return all.map((a) => ({ slug: a.slug }));
}

// Outside [lang] so the URL is /articles/<slug>/opengraph-image; the article
// page points at it explicitly when the edition has no photograph. The 4:5,
// 9:16 and 16:9 cards come from the same renderer (share/[file]/route.tsx).
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return editionCardResponse(slug, "og");
}
