import { buildTagFeed, tagFeedParams, atomResponse } from "@/lib/feeds";
import { resolveLocale } from "@/lib/i18n/config";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return tagFeedParams();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string; tag: string }> },
) {
  const { lang, tag } = await params;
  return atomResponse(await buildTagFeed(resolveLocale(lang), tag));
}
