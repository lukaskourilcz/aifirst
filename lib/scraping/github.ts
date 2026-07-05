import { request } from "undici";
import type { Source, ScrapedItem } from "./types.js";
import { makeItem } from "./util.js";

type GithubRelease = {
  html_url?: string;
  name?: string | null;
  tag_name?: string;
  body?: string | null;
  draft?: boolean;
  published_at?: string;
};

export function projectReleases(
  releases: GithubRelease[],
  repo: string,
  source: Source,
): ScrapedItem[] {
  const out: ScrapedItem[] = [];
  for (const release of releases) {
    if (release.draft) continue;
    if (!release.html_url) continue;
    out.push(
      makeItem(
        release.html_url,
        {
          title: `${repo} ${release.name || release.tag_name}`,
          summary: release.body ?? undefined,
          publishedAt: new Date(release.published_at ?? Date.now()).toISOString(),
        },
        source,
      ),
    );
  }
  return out;
}

async function fetchRepoReleases(
  repo: string,
  headers: Record<string, string>,
  source: Source,
): Promise<GithubRelease[]> {
  const url = `https://api.github.com/repos/${repo}/releases?per_page=3`;
  const { statusCode, body } = await request(url, {
    signal: AbortSignal.timeout(10_000),
    headers,
  });
  if (statusCode >= 400) {
    console.warn(`[github] ${source.id}: ${repo} status ${statusCode}`);
    return [];
  }
  return (await body.json()) as GithubRelease[];
}

export async function fetchGithub(source: Source): Promise<ScrapedItem[]> {
  const repos = source.repos ?? [];
  if (repos.length === 0) {
    console.warn(`[github] ${source.id}: missing repos`);
    return [];
  }
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "aifirst-scraper",
    };
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    const results = await Promise.all(
      repos.map((repo) =>
        fetchRepoReleases(repo, headers, source)
          .then((releases) => projectReleases(releases, repo, source))
          .catch(() => []),
      ),
    );
    return results.flat();
  } catch (err) {
    console.warn(`[github] ${source.id}: ${(err as Error).message}`);
    return [];
  }
}
