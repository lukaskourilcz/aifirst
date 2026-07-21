import { listArticles } from "@/lib/content";
import { loadTopicsConfig, publishedTopics } from "@/lib/topics/config";
import { brand } from "@/lib/brand";

export const dynamic = "force-static";

export async function GET() {
  const [config, articles] = await Promise.all([loadTopicsConfig(), listArticles()]);
  return Response.json({
    schema_version: 1,
    publication: brand.name,
    topics: publishedTopics(config, articles).map(({ topic, articles: matches }) => ({
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      issue_count: matches.length,
      latest_issue_date: matches[0]?.date ?? null,
      feed_url: `/topics/${topic.slug}/feed.xml`,
    })),
  });
}
