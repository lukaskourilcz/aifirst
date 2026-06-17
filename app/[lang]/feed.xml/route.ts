import { buildSiteFeed, atomResponse } from "@/lib/feeds";
import { resolveLocale } from "@/lib/i18n/config";

export const dynamic = "force-static";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  return atomResponse(await buildSiteFeed(resolveLocale(lang)));
}
