import { buildTagFeed, tagFeedParams, atomResponse } from "@/lib/feeds";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return tagFeedParams();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tag: string }> },
) {
  const { tag } = await params;
  return atomResponse(await buildTagFeed("cs", tag));
}
