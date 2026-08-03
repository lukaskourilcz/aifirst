import { atomResponse, buildTopicFeed, topicFeedParams } from "@/lib/feeds";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return topicFeedParams();
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return atomResponse(await buildTopicFeed("cs", slug));
}
