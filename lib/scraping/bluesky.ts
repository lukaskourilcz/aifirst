import { request } from "undici";
import type { Source, ScrapedItem } from "./types.js";
import { makeItem } from "./util.js";

// Bluesky's AppView is read-only and unauthenticated. The search endpoint
// takes a Lucene-ish query, returns the top matching posts.
// Docs: https://docs.bsky.app/docs/api/app-bsky-feed-search-posts
const ENDPOINT = "https://api.bsky.app/xrpc/app.bsky.feed.searchPosts";
const LIMIT = 25;

type BskyPost = {
  uri: string;
  cid: string;
  author?: { handle?: string; displayName?: string };
  record?: { text?: string; createdAt?: string };
  indexedAt?: string;
};

type BskySearchResponse = {
  posts?: BskyPost[];
};

// at://did:plc:.../app.bsky.feed.post/<rkey> → <rkey>
function rkeyFromUri(uri: string): string | null {
  const parts = uri.split("/");
  const last = parts[parts.length - 1];
  return last || null;
}

function postUrl(post: BskyPost): string | null {
  const handle = post.author?.handle;
  const rkey = rkeyFromUri(post.uri);
  if (!handle || !rkey) return null;
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

// Bluesky posts are short — the first line works as a title, the full
// record body as the summary.
function postTitle(text: string): string {
  const firstLine = text.split("\n")[0]?.trim() ?? text.trim();
  const compact = firstLine.replace(/\s+/g, " ");
  return compact.length > 140 ? compact.slice(0, 139) + "…" : compact;
}

export async function fetchBluesky(source: Source): Promise<ScrapedItem[]> {
  if (!source.query) {
    console.warn(`[bluesky] ${source.id}: missing query`);
    return [];
  }
  const url = `${ENDPOINT}?q=${encodeURIComponent(source.query)}&sort=top&limit=${LIMIT}`;
  try {
    const { statusCode, body } = await request(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { accept: "application/json" },
    });
    if (statusCode >= 400) {
      console.warn(`[bluesky] ${source.id}: status ${statusCode}`);
      return [];
    }
    const data = (await body.json()) as BskySearchResponse;
    const out: ScrapedItem[] = [];
    for (const post of data.posts ?? []) {
      const text = post.record?.text?.trim();
      const link = postUrl(post);
      if (!text || !link) continue;
      out.push(
        makeItem(
          link,
          {
            title: postTitle(text),
            summary: text,
            publishedAt:
              post.record?.createdAt ?? post.indexedAt ?? new Date().toISOString(),
          },
          source,
        ),
      );
    }
    return out;
  } catch (err) {
    console.warn(`[bluesky] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
