import { buildNewsSitemap, xmlResponse } from "@/lib/feeds";

// Prerendered at build time from the committed content index, like /feed.xml.
// The file sits at the site root rather than under app/[lang]/ because
// middleware lets any path with a file extension through unrewritten.
export const dynamic = "force-static";

export async function GET() {
  return xmlResponse(await buildNewsSitemap("cs"));
}
