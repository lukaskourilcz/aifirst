import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { PromotionGallery } from "@/components/PromotionGallery";
import { listPromotions } from "@/lib/promotion-store";

// Secret promotion console: reachable only by typing the URL directly. It is
// not linked from any page, is excluded from the sitemap, disallowed in
// robots.txt, and marked noindex here. PROMOTION_TOKEN and a matching
// ?key=<token> are required. Read at request time so a fresh daily commit shows
// up without a rebuild, and so the token check can run.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Promotion",
  robots: { index: false, follow: false },
};

export default async function PromotionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const expected = process.env.PROMOTION_TOKEN;
  if (!expected) notFound();
  const { key } = await searchParams;
  const provided = Array.isArray(key) ? key[0] : key;
  if (provided !== expected) notFound();

  const posts = await listPromotions();

  return (
    <PageShell
      kicker="internal · promotion"
      title="Promotion"
      kickerTone="warning"
      intro="IG & Threads posts generated from each daily issue. The photo is shared; captions differ per platform and language. Switch language, then copy a caption straight into Instagram or Threads."
    >
      <PromotionGallery posts={posts} />
    </PageShell>
  );
}
