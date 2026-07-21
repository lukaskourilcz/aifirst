import { buildSiteFeed, atomResponse } from "@/lib/feeds";

export const dynamic = "force-static";

export async function GET() {
  return atomResponse(await buildSiteFeed("en"));
}
