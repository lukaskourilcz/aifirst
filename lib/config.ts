// Resolves the canonical site URL and GitHub repo at build time.
//
// Why this exists: a fresh fork shouldn't need to grep through files
// to change "https://aifirst.example" everywhere. Configure once via
// environment variables and every route picks it up.
//
// Env vars (set in Vercel and locally):
//   NEXT_PUBLIC_SITE_URL  — canonical https URL, no trailing slash
//   NEXT_PUBLIC_GITHUB_REPO — owner/repo
//
// Vercel auto-injects VERCEL_URL for preview deploys; we use it as a
// fallback so preview deploys get sensible (if not canonical) URLs.

const FALLBACK_SITE = "https://aifirst.example";
const FALLBACK_REPO = "lukaskourilcz/aifirst";

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  // VERCEL_URL is set without a protocol; assume https.
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${stripTrailingSlash(vercel)}`;

  return FALLBACK_SITE;
}

export function githubRepo(): string {
  return (
    process.env.NEXT_PUBLIC_GITHUB_REPO?.trim() ||
    process.env.AIFIRST_REPO?.trim() ||
    process.env.GITHUB_REPOSITORY?.trim() ||
    FALLBACK_REPO
  );
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}
