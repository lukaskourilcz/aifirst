import { atomResponse, buildTopicFeed, topicFeedParams } from "@/lib/feeds";
import { resolveLocale } from "@/lib/i18n/config";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return topicFeedParams();
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  return atomResponse(await buildTopicFeed(resolveLocale(lang), slug));
}
