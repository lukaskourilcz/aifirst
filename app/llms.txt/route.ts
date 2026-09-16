import { buildLlmsIndex } from "@/lib/distribution/llms";

// Prerendered at build time from the committed content index. The file sits at
// the site root rather than under app/[lang]/ because middleware lets any path
// with a file extension through unrewritten, exactly as it does for /feed.xml.
export const dynamic = "force-static";

export async function GET() {
  return new Response(await buildLlmsIndex("cs"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
