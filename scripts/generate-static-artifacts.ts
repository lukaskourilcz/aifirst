#!/usr/bin/env tsx
import { getArticle, listArticles } from "../lib/content.js";
import { writeNewsletterArtifact } from "../lib/distribution/newsletter.js";
import { LOCALES } from "../lib/i18n/config.js";

// Newsletter files only. The per-edition share packs are no longer written to
// disk: app/data/share/[file]/route.ts builds them statically on every build,
// so they always match the edition and the configured site URL (issue #99).
async function main() {
  const newsletterFiles: string[] = [];

  for (const locale of LOCALES) {
    const summaries = await listArticles(locale);
    for (const summary of summaries) {
      const article = await getArticle(summary.slug, locale);
      if (!article) continue;
      if (article.frontmatter.type === "weekly") {
        newsletterFiles.push(...await writeNewsletterArtifact(article, locale));
      }
    }
  }

  console.log(JSON.stringify({
    status: "ok",
    newsletterFiles: newsletterFiles.length,
  }));
}

main().catch((error) => {
  console.error("[artifacts] FAILED:", error);
  process.exit(1);
});
