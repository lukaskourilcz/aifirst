import { buildTagFeed, tagFeedParams, atomResponse } from "@/lib/feeds";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return tagFeedParams();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string; tag: string }> },
) {
  const { lang, tag } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  return atomResponse(await buildTagFeed(locale, tag));
}
